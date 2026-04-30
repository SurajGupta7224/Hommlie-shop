const sequelize = require("../config/db");
const { Op } = require("sequelize");
const {
  Payment, PaymentLog, Order, Customer, User
} = require("../models/index");

// ─── Helpers ────────────────────────────────────────────────────────────────

const logPaymentAction = async (payment_id, old_status, new_status, action, note, changed_by, t) => {
  await PaymentLog.create(
    { payment_id, old_status, new_status, action, note: note || null, changed_by },
    { transaction: t }
  );
};

const syncOrderPaymentStatus = async (order_id, payment_status, payment_method, t) => {
  await Order.update(
    { payment_status, payment_method },
    { where: { id: order_id }, transaction: t }
  );
};

// ─── GET /api/payments  (list with filters + search) ────────────────────────
const getAllPayments = async (req, res) => {
  const {
    page = 1, limit = 20,
    status = "", method = "", date = "", search = ""
  } = req.query;
  const offset = (page - 1) * limit;

  const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');

  const where = {};
  if (!isAdmin) {
    where.recorded_by = req.user.id;
  }
  
  if (status) where.status = status;
  if (method) where.payment_method = method;
  if (date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);
    where.created_at = { [Op.between]: [start, end] };
  }

  // Search by order_number — handled via include where
  const orderWhere = {};
  if (search) orderWhere.order_number = { [Op.like]: `%${search}%` };

  try {
    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number", "final_amount", "payment_status", "status"],
          where: search ? orderWhere : undefined,
          required: !!search,
          include: [
            { model: Customer, as: "customer", attributes: ["id", "name", "mobile"] }
          ]
        },
        { model: User, as: "recordedBy", attributes: ["id", "name"] }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    return res.status(200).json({
      payments: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getAllPayments error:", err);
    return res.status(500).json({ message: "Failed to fetch payments" });
  }
};

// ─── GET /api/payments/:id  (details + logs) ────────────────────────────────
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number", "final_amount", "status", "payment_status"],
          include: [
            { model: Customer, as: "customer", attributes: ["id", "name", "mobile", "email"] }
          ]
        },
        { model: User, as: "recordedBy", attributes: ["id", "name"] },
        {
          model: PaymentLog, as: "logs",
          include: [{ model: User, as: "changedBy", attributes: ["id", "name"] }],
          order: [["created_at", "ASC"]]
        }
      ]
    });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');
    if (!isAdmin && payment.recorded_by !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: you can only access your own payments" });
    }

    return res.status(200).json({ payment });
  } catch (err) {
    console.error("getPaymentById error:", err);
    return res.status(500).json({ message: "Failed to fetch payment details" });
  }
};

// ─── POST /api/payments  (Manual Add Payment) ───────────────────────────────
const addPayment = async (req, res) => {
  const { order_id, payment_method, transaction_id, payment_gateway, amount, notes } = req.body;

  if (!order_id || !payment_method || !amount) {
    return res.status(400).json({ message: "order_id, payment_method, and amount are required" });
  }

  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(order_id, { transaction: t });
    if (!order) { await t.rollback(); return res.status(404).json({ message: "Order not found" }); }

    // Determine initial status: COD starts pending, Online starts pending too
    const status = "pending";

    const payment = await Payment.create({
      order_id,
      payment_method,
      transaction_id: transaction_id || null,
      payment_gateway: payment_gateway || null,
      amount,
      status,
      notes: notes || null,
      recorded_by: req.user.id
    }, { transaction: t });

    // Sync order
    await syncOrderPaymentStatus(order_id, status, payment_method, t);

    await logPaymentAction(
      payment.id, null, status,
      "Payment record created manually",
      `Method: ${payment_method}`,
      req.user.id, t
    );

    await t.commit();
    return res.status(201).json({ message: "Payment added successfully", payment });
  } catch (err) {
    await t.rollback();
    console.error("addPayment error:", err);
    return res.status(500).json({ message: "Failed to add payment" });
  }
};

// ─── PATCH /api/payments/:id/mark-paid  (COD: Mark as Paid) ─────────────────
const markAsPaid = async (req, res) => {
  const { note } = req.body;
  const t = await sequelize.transaction();
  try {
    const payment = await Payment.findByPk(req.params.id, { transaction: t });
    if (!payment) { await t.rollback(); return res.status(404).json({ message: "Payment not found" }); }

    if (payment.payment_method !== "COD") {
      await t.rollback();
      return res.status(400).json({ message: "Mark as Paid is only for COD payments" });
    }

    const oldStatus = payment.status;
    await payment.update({ status: "success", paid_at: new Date() }, { transaction: t });
    await syncOrderPaymentStatus(payment.order_id, "paid", payment.payment_method, t);
    await logPaymentAction(payment.id, oldStatus, "success", "Marked as Paid (COD)", note, req.user.id, t);

    await t.commit();
    return res.status(200).json({ message: "Payment marked as paid" });
  } catch (err) {
    await t.rollback();
    console.error("markAsPaid error:", err);
    return res.status(500).json({ message: "Failed to mark payment as paid" });
  }
};

// ─── PATCH /api/payments/:id/verify  (Online: Verify Payment) ───────────────
const verifyPayment = async (req, res) => {
  const { transaction_id, payment_gateway, note } = req.body;
  const t = await sequelize.transaction();
  try {
    const payment = await Payment.findByPk(req.params.id, { transaction: t });
    if (!payment) { await t.rollback(); return res.status(404).json({ message: "Payment not found" }); }

    if (payment.payment_method === "COD") {
      await t.rollback();
      return res.status(400).json({ message: "Verify is only for Online payments" });
    }

    const oldStatus = payment.status;
    await payment.update({
      status: "success",
      paid_at: new Date(),
      transaction_id: transaction_id || payment.transaction_id,
      payment_gateway: payment_gateway || payment.payment_gateway
    }, { transaction: t });

    await syncOrderPaymentStatus(payment.order_id, "paid", payment.payment_method, t);
    await logPaymentAction(payment.id, oldStatus, "success", "Payment Verified", note, req.user.id, t);

    await t.commit();
    return res.status(200).json({ message: "Payment verified successfully" });
  } catch (err) {
    await t.rollback();
    console.error("verifyPayment error:", err);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
};

// ─── PATCH /api/payments/:id/mark-failed  ───────────────────────────────────
const markAsFailed = async (req, res) => {
  const { note } = req.body;
  const t = await sequelize.transaction();
  try {
    const payment = await Payment.findByPk(req.params.id, { transaction: t });
    if (!payment) { await t.rollback(); return res.status(404).json({ message: "Payment not found" }); }

    const oldStatus = payment.status;
    await payment.update({ status: "failed" }, { transaction: t });
    await syncOrderPaymentStatus(payment.order_id, "failed", payment.payment_method, t);
    await logPaymentAction(payment.id, oldStatus, "failed", "Marked as Failed", note, req.user.id, t);

    await t.commit();
    return res.status(200).json({ message: "Payment marked as failed" });
  } catch (err) {
    await t.rollback();
    console.error("markAsFailed error:", err);
    return res.status(500).json({ message: "Failed to update payment status" });
  }
};

// ─── PATCH /api/payments/:id/refund  ────────────────────────────────────────
const refundPayment = async (req, res) => {
  const { note } = req.body;
  const t = await sequelize.transaction();
  try {
    const payment = await Payment.findByPk(req.params.id, { transaction: t });
    if (!payment) { await t.rollback(); return res.status(404).json({ message: "Payment not found" }); }

    if (payment.status !== "success") {
      await t.rollback();
      return res.status(400).json({ message: "Only successful payments can be refunded" });
    }
    if (payment.payment_method === "COD") {
      await t.rollback();
      return res.status(400).json({ message: "COD payments cannot be refunded via this system" });
    }

    const oldStatus = payment.status;
    await payment.update({ status: "refunded" }, { transaction: t });
    await syncOrderPaymentStatus(payment.order_id, "refunded", payment.payment_method, t);
    await logPaymentAction(payment.id, oldStatus, "refunded", "Refund Initiated", note, req.user.id, t);

    await t.commit();
    return res.status(200).json({ message: "Refund initiated successfully" });
  } catch (err) {
    await t.rollback();
    console.error("refundPayment error:", err);
    return res.status(500).json({ message: "Failed to initiate refund" });
  }
};

// ─── GET /api/payments/reports/summary  ─────────────────────────────────────
const getPaymentSummary = async (req, res) => {
  try {
    const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');
    const userFilter = isAdmin ? "" : `AND recorded_by = ${req.user.id}`;

    const [totalRevenue] = await sequelize.query(
      `SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status = 'success' ${userFilter}`
    );
    const [codVsOnline] = await sequelize.query(
      `SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total
       FROM payments WHERE status = 'success' ${userFilter}
       GROUP BY payment_method`
    );
    const [failedPayments] = await sequelize.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM payments WHERE status = 'failed' ${userFilter}`
    );
    const [refundAmount] = await sequelize.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM payments WHERE status = 'refunded' ${userFilter}`
    );
    const [pendingCOD] = await sequelize.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM payments WHERE status = 'pending' AND payment_method = 'COD' ${userFilter}`
    );

    return res.status(200).json({
      total_revenue: parseFloat(totalRevenue[0]?.total || 0),
      cod_vs_online: codVsOnline,
      failed_payments: failedPayments[0],
      refund_amount: refundAmount[0],
      pending_cod: pendingCOD[0]
    });
  } catch (err) {
    console.error("getPaymentSummary error:", err);
    return res.status(500).json({ message: "Failed to load payment summary" });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  addPayment,
  markAsPaid,
  verifyPayment,
  markAsFailed,
  refundPayment,
  getPaymentSummary
};
