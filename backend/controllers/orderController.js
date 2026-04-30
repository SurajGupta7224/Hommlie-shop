const sequelize = require("../config/db");
const { Op } = require("sequelize");
const {
  Order, OrderItem, Cart, WarehouseInventory,
  WarehousePincode, Pincode, Customer, CustomerAddress,
  Warehouse, Product, ProductVariation, OrderStatusLog, User, Payment
} = require("../models/index");

// --- Helper: generate unique order number ---
const generateOrderNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Order.count();
  return `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

// GET /api/orders/serviceability?pincode=XXXXXX
const checkServiceability = async (req, res) => {
  const { pincode } = req.query;
  if (!pincode) return res.status(400).json({ message: "Pincode is required" });

  try {
    // Find the pincode record
    const pincodeRecord = await Pincode.findOne({ where: { pincode } });
    if (!pincodeRecord) {
      return res.status(200).json({ available: false, message: "Pincode not found in system" });
    }

    const warehouseWhere = { status: 1, user_id: req.user.id };

    // Check if any active warehouse serves this pincode
    const mapping = await WarehousePincode.findOne({
      where: { pincode_id: pincodeRecord.id },
      include: [{
        model: Warehouse,
        as: "warehouse",
        where: warehouseWhere
      }]
    });

    if (!mapping) {
      return res.status(200).json({
        available: false,
        message: "Service not available in this area. We don't deliver to this pincode yet."
      });
    }

    return res.status(200).json({
      available: true,
      warehouse_id: mapping.warehouse_id,
      warehouse_name: mapping.warehouse?.name,
      pincode_id: pincodeRecord.id
    });
  } catch (err) {
    console.error("checkServiceability error:", err);
    return res.status(500).json({ message: "Failed to check serviceability" });
  }
};

// POST /api/orders/check-stock
// Body: { warehouse_id, items: [{variation_id, quantity}] }
const checkStock = async (req, res) => {
  const { warehouse_id, items } = req.body;
  console.log(`[DEBUG] Checking stock for Warehouse: ${warehouse_id}, Items:`, JSON.stringify(items));
  if (!warehouse_id || !items?.length) {
    return res.status(400).json({ message: "warehouse_id and items are required" });
  }

  try {
    const results = await Promise.all(items.map(async (item) => {
      const inv = await WarehouseInventory.findOne({
        where: { warehouse_id, variation_id: item.variation_id, status: 1 }
      });


      // If out of stock, find where it IS available
      let alternateWarehouses = [];
      if (!inv || inv.stock < item.quantity) {
        const others = await WarehouseInventory.findAll({
          where: { variation_id: item.variation_id, stock: { [Op.gte]: item.quantity }, status: 1 },
          include: [{ model: Warehouse, as: 'warehouse', attributes: ['name'] }]
        });
        alternateWarehouses = others.map(o => o.warehouse?.name);
      }

      return {
        variation_id: item.variation_id,
        requested: item.quantity,
        available: inv ? inv.stock : 0,
        ok: inv ? inv.stock >= item.quantity : false,
        price: inv ? parseFloat(inv.discount_price || inv.price) : 0,
        delivery_charge: inv ? parseFloat(inv.delivery_charge) : 0,
        tax_percent: inv ? parseFloat(inv.tax_percent) : 0,
        alternateWarehouses
      };
    }));

    const allOk = results.every(r => r.ok);
    return res.status(200).json({ allOk, results });
  } catch (err) {
    console.error("checkStock error:", err);
    return res.status(500).json({ message: "Failed to check stock" });
  }
};

// POST /api/orders — PLACE ORDER (atomic transaction)
// Body: { session_id, customer_id, warehouse_id, address_id, items, payment_method, notes }
const placeOrder = async (req, res) => {
  const { session_id, customer_id, warehouse_id, address_id, items, payment_method = 'COD', notes } = req.body;

  if (!customer_id || !warehouse_id || !address_id || !items?.length) {
    return res.status(400).json({ message: "customer_id, warehouse_id, address_id, and items are required" });
  }

    const t = await sequelize.transaction();
  try {
    // Validate that the warehouse belongs to the current user
    const warehouse = await Warehouse.findByPk(warehouse_id, { transaction: t });
    if (!warehouse) {
      await t.rollback();
      return res.status(404).json({ message: "Warehouse not found." });
    }
    if (warehouse.user_id !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ message: "Forbidden: You cannot book an order for another user's warehouse." });
    }

    // Verify stock for all items
    for (const item of items) {
      const inv = await WarehouseInventory.findOne({
        where: { warehouse_id, variation_id: item.variation_id, status: 1 },
        transaction: t
      });

      if (!inv || inv.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for one or more items. Please check availability.` 
        });
      }
    }

    // Compute totals from items
    let items_total = 0, delivery_charge = 0, tax_total = 0;

    for (const item of items) {
      items_total += item.unit_price * item.quantity;
      delivery_charge = Math.max(delivery_charge, item.delivery_charge || 0);
      tax_total += ((item.unit_price * item.quantity) * (item.tax_percent || 0)) / 100;
    }

    const final_amount = parseFloat((items_total + delivery_charge + tax_total).toFixed(2));
    const order_number = await generateOrderNumber();

    // 1. Create order
    const order = await Order.create({
      order_number, customer_id, warehouse_id, address_id,
      items_total: items_total.toFixed(2),
      delivery_charge: delivery_charge.toFixed(2),
      tax_total: tax_total.toFixed(2),
      final_amount,
      payment_method,
      payment_status: 'pending',
      status: 'confirmed',
      order_source: 'manual',
      notes: notes || null,
      created_by: req.user.id,
      user_id: req.user.id
    }, { transaction: t });

    // 2. Create order items + deduct stock
    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        variation_id: item.variation_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: (item.unit_price * item.quantity).toFixed(2)
      }, { transaction: t });

      // Deduct stock
      await WarehouseInventory.decrement('stock', {
        by: item.quantity,
        where: { warehouse_id, variation_id: item.variation_id },
        transaction: t
      });
    }

    // 3. Clear cart
    if (req.body.cart_item_ids && req.body.cart_item_ids.length > 0) {
      await Cart.destroy({ where: { id: { [Op.in]: req.body.cart_item_ids } }, transaction: t });
    } else if (session_id) {
      await Cart.destroy({ where: { session_id }, transaction: t });
    } else if (customer_id) {
      await Cart.destroy({ where: { customer_id, user_id: req.user.id }, transaction: t });
    }

    await t.commit();
    return res.status(201).json({
      message: "Order placed successfully!",
      order_id: order.id,
      order_number: order.order_number,
      final_amount: order.final_amount
    });
  } catch (err) {
    await t.rollback();
    console.error("placeOrder error:", err);
    return res.status(500).json({ message: "Failed to place order. Please try again." });
  }
};

// GET /api/orders — list orders with filters
const getOrders = async (req, res) => {
  const { page = 1, limit = 20, status = '', search = '', warehouse_id = '', date = '' } = req.query;
  const offset = (page - 1) * limit;

  const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');
  const where = isAdmin ? {} : { user_id: req.user.id };
  if (status) where.status = status;
  if (warehouse_id) where.warehouse_id = warehouse_id;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.created_at = { [Op.between]: [start, end] };
  }

  const customerWhere = {};
  if (search) {
    customerWhere[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { mobile: { [Op.like]: `%${search}%` } }
    ];
  }

  try {
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Customer, as: "customer", attributes: ["id", "name", "mobile"], where: search ? customerWhere : undefined, required: !!search },
        { model: Warehouse, as: "warehouse", attributes: ["id", "name"] },
        { model: CustomerAddress, as: "address", attributes: ["id", "address_line", "city", "pincode"] },
        { model: OrderItem, as: "items", attributes: ["id", "quantity", "unit_price"] },
        { model: User, as: "user", attributes: ["id", "name", "email", "phone", "status"] }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    return res.status(200).json({
      orders: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getOrders error:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// GET /api/orders/:id — full order detail
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: Warehouse, as: "warehouse", attributes: ["id", "name", "address", "contact_person", "contact_phone"] },
        { model: CustomerAddress, as: "address" },
        { model: User, as: "createdBy", attributes: ["id", "name"] },
        {
          model: OrderItem, as: "items",
          include: [
            { model: Product, as: "product", attributes: ["id", "name"] },
            { model: ProductVariation, as: "variation", attributes: ["id", "variation_name", "sku", "unit"] }
          ]
        },
        { model: Payment, as: "payments" },
        {
          model: OrderStatusLog, as: "statusLogs",
          include: [{ model: User, as: "changedBy", attributes: ["id", "name"] }],
          order: [["created_at", "ASC"]]
        }
      ]
    });

    const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.user_id !== req.user.id && !isAdmin) {
        return res.status(403).json({ message: "Forbidden: you can only access your own orders" });
    }
    return res.status(200).json({ order });
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t
    });
    if (!order) { await t.rollback(); return res.status(404).json({ message: "Order not found" }); }

    const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');
    if (order.user_id !== req.user.id && !isAdmin) {
        await t.rollback();
        return res.status(403).json({ message: "Forbidden: you can only update your own orders" });
    }

    const oldStatus = order.status;

    // Restore stock if cancelling
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        await WarehouseInventory.increment('stock', {
          by: item.quantity,
          where: { warehouse_id: order.warehouse_id, variation_id: item.variation_id },
          transaction: t
        });
      }
    }

    await order.update({ status }, { transaction: t });

    // Log the status change
    await OrderStatusLog.create({
        order_id: order.id,
        old_status: oldStatus,
        new_status: status,
        changed_by: req.user?.id || null,
        note: note || null
    }, { transaction: t });
    await t.commit();
    return res.status(200).json({ message: "Order status updated", status, old_status: oldStatus });
  } catch (err) {
    await t.rollback();
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({ message: "Failed to update order status" });
  }
};

module.exports = {
  checkServiceability, checkStock, placeOrder,
  getOrders, getOrderById, updateOrderStatus
};
