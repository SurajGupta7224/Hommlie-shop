const { Cart, Product, ProductVariation, WarehouseInventory } = require("../models/index");

// GET /api/cart/:session_id — get cart with product/price info
const getCart = async (req, res) => {
  const { customer_id } = req.query;
  const user_id = req.user.id;
  try {
    const where = { user_id };
    if (customer_id) where.customer_id = customer_id;

    const items = await Cart.findAll({
      where,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"]
        },
        {
          model: ProductVariation,
          as: "variation",
          attributes: ["id", "variation_name", "sku", "unit", "weight"]
        }
      ]
    });

    // Enrich each item with inventory price
    const enriched = await Promise.all(items.map(async (item) => {
      const inv = await WarehouseInventory.findOne({
        where: { variation_id: item.variation_id, status: 1 },
        order: [["id", "ASC"]]
      });

      return {
        ...item.toJSON(),
        unit_price: inv ? parseFloat(inv.discount_price || inv.price) : 0,
        total_price: inv ? parseFloat(inv.discount_price || inv.price) * item.quantity : 0,
        stock: inv ? inv.stock : 0,
        delivery_charge: inv ? parseFloat(inv.delivery_charge) : 0,
        tax_percent: inv ? parseFloat(inv.tax_percent) : 0,
        warehouse_id: inv ? inv.warehouse_id : null,
      };
    }));

    return res.status(200).json({ items: enriched });
  } catch (err) {
    console.error("getCart error:", err);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// POST /api/cart — add to cart or update qty
const addToCart = async (req, res) => {
  const { session_id, product_id, variation_id, quantity, customer_id } = req.body;
  const user_id = req.user.id;

  if (!product_id || !variation_id || !quantity) {
    return res.status(400).json({ message: "product_id, variation_id, quantity are required" });
  }

  try {
    const where = { user_id, variation_id };
    if (customer_id) where.customer_id = customer_id;
    else where.session_id = session_id;

    const existing = await Cart.findOne({ where });
    if (existing) {
      await existing.update({ quantity: existing.quantity + parseInt(quantity) });
      return res.status(200).json({ message: "Cart updated", item: existing });
    }

    const item = await Cart.create({ 
      session_id, 
      product_id, 
      variation_id, 
      quantity: parseInt(quantity),
      user_id,
      customer_id: customer_id || null
    });
    return res.status(201).json({ message: "Added to cart", item });
  } catch (err) {
    console.error("addToCart error:", err);
    return res.status(500).json({ message: "Failed to add to cart" });
  }
};

// PUT /api/cart/:id — update quantity
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  try {
    const item = await Cart.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    if (parseInt(quantity) <= 0) {
      await item.destroy();
      return res.status(200).json({ message: "Item removed from cart" });
    }

    await item.update({ quantity: parseInt(quantity) });
    return res.status(200).json({ message: "Cart updated", item });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update cart" });
  }
};

// DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
  try {
    const item = await Cart.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    await item.destroy();
    return res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to remove from cart" });
  }
};

// DELETE /api/cart/session/:session_id — clear entire cart
const clearCart = async (req, res) => {
  const { customer_id } = req.query;
  const user_id = req.user.id;
  try {
    const where = { user_id };
    if (customer_id) where.customer_id = customer_id;
    
    await Cart.destroy({ where });
    return res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
