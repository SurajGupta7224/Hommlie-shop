const {
  Cart, Product, ProductVariation, ProductImage, WarehouseInventory,
  Order, OrderItem, CustomerAddress, Customer
} = require("../../models/index");
const sequelize = require("../../config/db");

// ─── Helper: generate unique sequential order number ──────────────────────────
const generateParentOrderNumber = async () => {
  const totalOrders = await Order.count();
  const seq = String(totalOrders + 1).padStart(4, '0');
  return `ORD-${seq}`;
};

// ─── Helper: generate sub-order number per vendor ────────────────────────────
const generateSubOrderNumber = (parentNumber, vendorIndex) => {
  return `${parentNumber}-V${vendorIndex}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/checkout/place-order
// Groups cart items by vendor → creates one sub-order per vendor
// ─────────────────────────────────────────────────────────────────────────────
exports.placeOrder = async (req, res) => {
  const { address_id, payment_method = 'COD', notes = '' } = req.body;

  // Identify the customer
  let customerId = (req.user && req.userType === 'customer') ? req.user.id : null;
  if (!customerId) {
    const headerCustomerId = req.headers['x-customer-id'];
    if (headerCustomerId && !req.headers['authorization']) {
      customerId = headerCustomerId;
    }
  }

  if (!customerId) {
    return res.status(200).json({ status: 0, message: "Authentication required" });
  }
  if (!address_id) {
    return res.status(200).json({ status: 0, message: "Delivery address is required" });
  }

  const t = await sequelize.transaction();

  try {
    // ── Step 1: Fetch all cart items with product + variation ──────────────
    const cartItems = await Cart.findAll({
      where: { customer_id: customerId },
      include: [
        { model: Product, as: "product" },
        { model: ProductVariation, as: "variation" }
      ]
    });

    if (cartItems.length === 0) {
      await t.rollback();
      return res.status(200).json({ status: 0, message: "Cart is empty" });
    }

    // ── Step 2: Enrich each cart item with inventory data ─────────────────
    const enrichedItems = [];
    for (const item of cartItems) {
      const inventory = await WarehouseInventory.findOne({
        where: {
          product_id: item.product_id,
          variation_id: item.variation_id
        },
        transaction: t
      });

      if (!inventory || inventory.stock < item.quantity) {
        await t.rollback();
        return res.status(200).json({
          status: 0,
          message: `"${item.product?.name}" is out of stock or has insufficient quantity.`
        });
      }

      // vendor_id is stored in cart's user_id column (set during addToCart from product.user_id)
      const vendorId = item.user_id || item.product?.user_id;

      enrichedItems.push({
        cartItem: item,
        inventory,
        vendorId,
        warehouseId: inventory.warehouse_id,
        price: parseFloat(inventory.discount_price || inventory.price),
        deliveryCharge: parseFloat(inventory.delivery_charge || 0),
        handlingCharge: parseFloat(inventory.handling_charge || 0),
        taxPercent: parseFloat(inventory.tax_percent || 0),
      });
    }

    // ── Step 3: Group items by vendorId ───────────────────────────────────
    const vendorGroups = {};
    for (const enriched of enrichedItems) {
      const key = enriched.vendorId || 'unknown';
      if (!vendorGroups[key]) vendorGroups[key] = [];
      vendorGroups[key].push(enriched);
    }

    const vendorIds = Object.keys(vendorGroups);

    // ── Step 4: Generate parent order number (shared across all sub-orders) ─
    const parentOrderNumber = await generateParentOrderNumber();

    // ── Step 5: Create one sub-order per vendor ───────────────────────────
    const createdOrders = [];
    let vendorIndex = 1;

    for (const vendorId of vendorIds) {
      const items = vendorGroups[vendorId];

      // Compute totals for this vendor's items only
      let subtotal = 0;
      let vendorDeliveryCharge = 0;
      let vendorHandlingTotal = 0;
      let vendorTaxTotal = 0;

      const orderItemsData = [];

      for (const enriched of items) {
        const { cartItem, inventory, price, deliveryCharge, handlingCharge, taxPercent } = enriched;
        const itemTotal = price * cartItem.quantity;
        const itemHandling = handlingCharge * cartItem.quantity;
        const itemTax = (itemTotal * taxPercent) / 100;

        subtotal += itemTotal;
        vendorDeliveryCharge += deliveryCharge;
        vendorHandlingTotal += itemHandling;
        vendorTaxTotal += itemTax;

        orderItemsData.push({
          product_id: cartItem.product_id,
          variation_id: cartItem.variation_id,
          quantity: cartItem.quantity,
          unit_price: price,
          total_price: parseFloat(itemTotal.toFixed(2)),
          // We'll deduct stock using this inventory reference
          _inventoryId: inventory.id,
          _warehouseId: enriched.warehouseId,
        });
      }

      const finalAmount = parseFloat(
        (subtotal + vendorDeliveryCharge + vendorHandlingTotal + vendorTaxTotal).toFixed(2)
      );

      const subOrderNumber = generateSubOrderNumber(parentOrderNumber, vendorIndex);

      // Create the sub-order
      const order = await Order.create({
        order_number: subOrderNumber,
        parent_order_number: parentOrderNumber,
        customer_id: customerId,
        warehouse_id: items[0].warehouseId || 1,
        address_id: address_id,
        user_id: parseInt(vendorId) || 1,
        items_total: parseFloat(subtotal.toFixed(2)),
        delivery_charge: parseFloat(vendorDeliveryCharge.toFixed(2)),
        tax_total: parseFloat(vendorTaxTotal.toFixed(2)),
        handling_total: parseFloat(vendorHandlingTotal.toFixed(2)),
        final_amount: finalAmount,
        payment_method: payment_method,
        payment_status: 'pending',
        status: 'pending',
        order_source: 'online',
        notes: notes,
      }, { transaction: t });

      // Create order items + deduct stock
      for (const itemData of orderItemsData) {
        const { _inventoryId, _warehouseId, ...cleanItem } = itemData;

        await OrderItem.create({
          ...cleanItem,
          order_id: order.id
        }, { transaction: t });

        // Deduct stock from this vendor's warehouse
        await WarehouseInventory.decrement('stock', {
          by: itemData.quantity,
          where: {
            id: _inventoryId,
            warehouse_id: _warehouseId
          },
          transaction: t
        });
      }

      createdOrders.push({
        order_id: order.id,
        order_number: order.order_number,
        vendor_id: parseInt(vendorId),
        items_count: items.length,
        final_amount: order.final_amount,
      });

      vendorIndex++;
    }

    // ── Step 6: Clear cart ────────────────────────────────────────────────
    await Cart.destroy({
      where: { customer_id: customerId },
      transaction: t
    });

    await t.commit();

    return res.status(200).json({
      status: 1,
      message: `Order placed successfully${vendorIds.length > 1 ? ` across ${vendorIds.length} vendors` : ''}`,
      data: {
        parent_order_number: parentOrderNumber,
        total_sub_orders: createdOrders.length,
        orders: createdOrders,
        total_amount: createdOrders.reduce((sum, o) => sum + parseFloat(o.final_amount), 0).toFixed(2)
      }
    });

  } catch (error) {
    await t.rollback();
    console.error("placeOrder error:", error);
    return res.status(500).json({
      status: 0,
      message: error.message || "Failed to place order"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/checkout/orders — Customer's own orders
// Returns all sub-orders for this customer, grouped by parent_order_number
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  let customerId = (req.user && req.userType === 'customer') ? req.user.id : null;
  if (!customerId && !req.headers['authorization']) {
    customerId = req.headers['x-customer-id'] || null;
  }

  if (!customerId) {
    return res.status(200).json({ status: 0, message: "Authentication required" });
  }

  try {
    const orders = await Order.findAll({
      where: { customer_id: customerId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            { 
              model: Product, 
              as: "product", 
              attributes: ["id", "name", "slug"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  attributes: ["image"],
                  where: { is_primary: 1 },
                  required: false
                }
              ]
            },
            { model: ProductVariation, as: "variation", attributes: ["id", "variation_name", "sku", "unit"] }
          ]
        },
        {
          model: CustomerAddress,
          as: "address"
        }
      ],
      order: [["created_at", "DESC"]]
    });

    // Helper for images
    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const uploadUrl = `${baseUrl}/uploads/ProductImages/`;

    // Group sub-orders by parent_order_number for customer view
    const grouped = {};
    for (const order of orders) {
      const plainOrder = order.get({ plain: true });
      
      // Format product thumbnails
      if (plainOrder.items) {
        plainOrder.items = plainOrder.items.map(item => {
          if (item.product) {
            // Get thumbnail from images array
            const primaryImage = item.product.images && item.product.images.length > 0 
              ? item.product.images[0].image 
              : null;
              
            if (primaryImage) {
              item.product.thumbnail = `${uploadUrl}${primaryImage}`;
            } else {
              item.product.thumbnail = null;
            }
          }
          return item;
        });
      }

      const key = plainOrder.parent_order_number || plainOrder.order_number;
      if (!grouped[key]) {
        grouped[key] = {
          parent_order_number: key,
          status: plainOrder.status,
          payment_status: plainOrder.payment_status,
          payment_method: plainOrder.payment_method,
          created_at: plainOrder.created_at,
          sub_orders: []
        };
      }
      grouped[key].sub_orders.push(plainOrder);
    }

    return res.status(200).json({
      status: 1,
      message: "Orders fetched successfully",
      data: Object.values(grouped)
    });

  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({ status: 0, message: "Failed to fetch orders" });
  }
};

// GET /api/orders/detail/:orderNumber
exports.getOrderDetail = async (req, res) => {
  const { orderNumber } = req.params;
  let customerId = (req.user && req.userType === 'customer') ? req.user.id : null;
  if (!customerId && !req.headers['authorization']) {
    customerId = req.headers['x-customer-id'] || null;
  }

  if (!customerId) {
    return res.status(200).json({ status: 0, message: "Authentication required" });
  }

  try {
    const orders = await Order.findAll({
      where: { 
        [sequelize.Sequelize.Op.or]: [
          { order_number: orderNumber },
          { parent_order_number: orderNumber }
        ],
        customer_id: customerId 
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            { 
              model: Product, 
              as: "product", 
              attributes: ["id", "name", "slug"],
              include: [{ model: ProductImage, as: "images", attributes: ["image"], where: { is_primary: 1 }, required: false }]
            },
            { model: ProductVariation, as: "variation" }
          ]
        },
        { model: CustomerAddress, as: "address" },
        { model: Customer, as: "customer", attributes: ["name", "mobile", "email", "profile_pic"] }
      ]
    });

    if (orders.length === 0) {
      return res.status(200).json({ status: 0, message: "Order not found" });
    }

    // Helper for images
    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const uploadUrl = `${baseUrl}/uploads/ProductImages/`;

    const formattedOrders = orders.map(order => {
      const plain = order.get({ plain: true });
      if (plain.items) {
        plain.items = plain.items.map(item => {
          if (item.product) {
            const primaryImage = item.product.images && item.product.images.length > 0 ? item.product.images[0].image : null;
            item.product.thumbnail = primaryImage ? `${uploadUrl}${primaryImage}` : null;
          }
          return item;
        });
      }
      return plain;
    });

    // If orderNumber matches a sub-order exactly, we focus on that.
    // Otherwise, we take the first one (which would be the parent or only sub-order)
    const targetOrder = formattedOrders.find(o => o.order_number === orderNumber) || formattedOrders[0];

    const result = {
      order_number: targetOrder.order_number,
      parent_order_number: targetOrder.parent_order_number,
      status: targetOrder.status,
      payment_status: targetOrder.payment_status,
      payment_method: targetOrder.payment_method,
      created_at: targetOrder.created_at,
      address: targetOrder.address,
      items_total: targetOrder.items_total,
      delivery_charge: targetOrder.delivery_charge,
      tax_total: targetOrder.tax_total,
      handling_total: targetOrder.handling_total,
      final_amount: targetOrder.final_amount,
      items: targetOrder.items,
      customer: targetOrder.customer
    };

    return res.status(200).json({
      status: 1,
      message: "Order details fetched successfully",
      data: result
    });

  } catch (error) {
    console.error("getOrderDetail error:", error);
    return res.status(500).json({ status: 0, message: "Failed to fetch order details" });
  }
};

// POST /api/orders/cancel
exports.cancelOrder = async (req, res) => {
  const { order_number } = req.body;
  let customerId = (req.user && req.userType === 'customer') ? req.user.id : null;
  if (!customerId && !req.headers['authorization']) {
    customerId = req.headers['x-customer-id'] || null;
  }

  if (!customerId) {
    return res.status(200).json({ status: 0, message: "Authentication required" });
  }

  const t = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: { order_number: order_number, customer_id: customerId },
      include: [{ model: OrderItem, as: "items" }],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(200).json({ status: 0, message: "Order not found" });
    }

    if (order.status !== 'pending') {
      await t.rollback();
      return res.status(200).json({ status: 0, message: "Only pending orders can be cancelled" });
    }

    // Update order status
    await order.update({ status: 'cancelled' }, { transaction: t });

    // Restore stock
    for (const item of order.items) {
      await WarehouseInventory.increment('stock', {
        by: item.quantity,
        where: {
          product_id: item.product_id,
          variation_id: item.variation_id,
          warehouse_id: order.warehouse_id
        },
        transaction: t
      });
    }

    await t.commit();

    return res.status(200).json({
      status: 1,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    await t.rollback();
    console.error("cancelOrder error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to cancel order",
      error: error.message
    });
  }
};
