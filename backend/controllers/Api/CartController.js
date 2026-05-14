const { Cart, Product, ProductVariation, ProductImage, WarehouseInventory } = require("../../models/index");

const getUploadUrl = () => {
  const baseUrl = process.env.APP_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads`;
};

// Helper to get cart identifier (session or customer)
const getCartWhere = (req) => {
  const { session_id } = req.body;
  const customerId = req.headers['x-customer-id'] || null;
  
  if (customerId) {
    return { customer_id: customerId };
  }
  if (session_id) {
    return { session_id };
  }
  return null;
};

// Helper to format cart item with product details
const formatCartItem = async (item) => {
  const uploadUrl = getUploadUrl();
  const product = item.product;
  const variation = item.variation;
  
  // Get product images
  const images = await ProductImage.findAll({
    where: { product_id: product.id },
    limit: 1
  });
  
  const imageUrl = images.length > 0 
    ? `${uploadUrl}/ProductImages/${images[0].image}` 
    : null;

  // Get inventory price
  const inventory = await WarehouseInventory.findOne({
    where: { 
      product_id: product.id,
      variation_id: variation.id
    }
  });

  const price = inventory ? parseFloat(inventory.price) : 0;
  const discountPrice = inventory && inventory.discount_price 
    ? parseFloat(inventory.discount_price) 
    : null;

  return {
    id: item.id,
    quantity: item.quantity,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: imageUrl
    },
    variation: {
      id: variation.id,
      name: variation.variation_name,
      sku: variation.sku,
      unit: variation.unit,
      weight: variation.weight
    },
    price: price,
    discount_price: discountPrice,
    delivery_charge: inventory ? parseFloat(inventory.delivery_charge || 0) : 0,
    handling_charge: inventory ? parseFloat(inventory.handling_charge || 0) : 0,
    tax_percent: inventory ? parseFloat(inventory.tax_percent || 0) : 0,
    total: discountPrice ? discountPrice * item.quantity : price * item.quantity
  };
};

// Add to Cart
exports.addToCart = async (req, res) => {
  const { session_id, product_id, variation_id, quantity = 1, user_id } = req.body;
  
  // Identify the customer
  // Prioritize verified user from token
  let customerId = (req.user && req.userType === 'customer') ? req.user.id : null;
  
  // If no verified user, but header is present, we need to be careful.
  // In a truly optional auth scenario, if the token was invalid, we should probably 
  // NOT trust the x-customer-id header as it might be stale.
  if (!customerId) {
    const headerCustomerId = req.headers['x-customer-id'];
    if (headerCustomerId) {
      // If we have a token but it's invalid (req.user is null), 
      // then this header is likely stale. We proceed as guest.
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        customerId = headerCustomerId;
      }
    }
  }
  
  // Identify the seller (user_id from product data)
  const sellerId = user_id || null;

  if (!product_id || !variation_id) {
    return res.status(200).json({
      status: 0,
      message: "Product ID and Variation ID are required"
    });
  }

  try {
    // Check if product and variation exist
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(200).json({ status: 0, message: "Product not found" });
    }

    const variation = await ProductVariation.findByPk(variation_id);
    if (!variation) {
      return res.status(200).json({ status: 0, message: "Variation not found" });
    }

    // Check stock availability
    const inventory = await WarehouseInventory.findOne({
      where: { product_id, variation_id }
    });

    if (!inventory || inventory.stock < quantity) {
      return res.status(200).json({
        status: 0,
        message: "Insufficient stock",
        available_stock: inventory ? inventory.stock : 0
      });
    }

    // Use product.user_id as the source of truth for the seller
    const finalSellerId = product.user_id || sellerId;

    // Build where clause for finding existing cart item
    const whereClause = { product_id, variation_id };
    if (customerId) {
      whereClause.customer_id = customerId;
    } else if (session_id) {
      whereClause.session_id = session_id;
    } else {
      return res.status(200).json({
        status: 0,
        message: "Session ID or Customer ID is required"
      });
    }

    // Check if item already exists in cart
    let cartItem = await Cart.findOne({ where: whereClause });

    if (cartItem) {
      // Update quantity
      const newQuantity = cartItem.quantity + parseInt(quantity);
      if (inventory.stock < newQuantity) {
        return res.status(200).json({
          status: 0,
          message: "Insufficient stock",
          available_stock: inventory.stock
        });
      }
      cartItem.quantity = newQuantity;
      cartItem.user_id = finalSellerId; // Ensure seller ID is updated/set
      if (customerId) {
        cartItem.customer_id = customerId;
      }
      await cartItem.save();
    } else {
      // Create new cart item
      const createData = {
        product_id,
        variation_id,
        quantity: parseInt(quantity),
        user_id: finalSellerId,
        customer_id: customerId,
        session_id: session_id
      };

      if (customerId && !session_id) {
        createData.session_id = `cust_${customerId}`;
      }

      cartItem = await Cart.create(createData);
    }

    // Get formatted cart item
    const cartItemWithProduct = await Cart.findByPk(cartItem.id, {
      include: [
        { model: Product, as: "product" },
        { model: ProductVariation, as: "variation" }
      ]
    });

    const formattedItem = await formatCartItem(cartItemWithProduct);

    return res.status(200).json({
      status: 1,
      message: "Item added to cart",
      data: formattedItem
    });

  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to add item to cart",
      error: error.message
    });
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  const { session_id } = req.query;
  
  // Prioritize verified user from token
  let customerId = (req.user && req.userType === 'customer') ? req.user.id : null;
  if (!customerId && !req.headers["authorization"]) {
    customerId = req.headers['x-customer-id'] || null;
  }

  try {
    const whereClause = {};
    if (customerId) {
      whereClause.customer_id = customerId;
    } else if (session_id) {
      whereClause.session_id = session_id;
    } else {
      return res.status(200).json({
        status: 0,
        message: "Session ID or Customer ID is required"
      });
    }

    const cartItems = await Cart.findAll({
      where: whereClause,
      include: [
        { model: Product, as: "product" },
        { model: ProductVariation, as: "variation" }
      ]
    });

    let subtotal = 0;
    let totalDeliveryCharge = 0;
    let totalItemHandlingCharge = 0;
    let totalTaxAmount = 0;
    let totalItems = 0;
    const formattedItems = [];

    for (const item of cartItems) {
      const formatted = await formatCartItem(item);
      formattedItems.push(formatted);
      subtotal += formatted.total;
      totalDeliveryCharge += formatted.delivery_charge;
      totalItemHandlingCharge += (formatted.handling_charge || 0) * item.quantity;
      
      // Calculate tax on total for this item
      const itemTax = (formatted.total * (formatted.tax_percent || 0)) / 100;
      totalTaxAmount += itemTax;
      
      totalItems += item.quantity;
    }

    const totalHandlingFee = totalItemHandlingCharge;
    
    const discount = subtotal > 1000 ? 100 : 0; 
    const total = subtotal + totalDeliveryCharge + totalHandlingFee + totalTaxAmount - discount;

    return res.status(200).json({
      status: 1,
      message: "Cart fetched successfully",
      data: {
        items: formattedItems,
        summary: {
          total_items: totalItems,
          subtotal: subtotal.toFixed(2),
          delivery_charge: totalDeliveryCharge.toFixed(2),
          handling_fee: totalHandlingFee.toFixed(2),
          tax: totalTaxAmount.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2)
        }
      }
    });

  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to fetch cart",
      error: error.message
    });
  }
};

// Update Cart Quantity
exports.updateQuantity = async (req, res) => {
  const { cart_item_id, quantity, session_id } = req.body;
  
  // Prioritize verified user from token
  let customerId = (req.user && req.userType === 'customer') ? req.user.id : null;
  if (!customerId && !req.headers["authorization"]) {
    customerId = req.headers['x-customer-id'] || null;
  }

  if (!cart_item_id || !quantity || quantity < 1) {
    return res.status(200).json({
      status: 0,
      message: "Cart item ID and valid quantity are required"
    });
  }

  try {
    const cartItem = await Cart.findByPk(cart_item_id, {
      include: [
        { model: Product, as: "product" },
        { model: ProductVariation, as: "variation" }
      ]
    });

    if (!cartItem) {
      return res.status(200).json({ status: 0, message: "Cart item not found" });
    }

    // Ownership check
    if (customerId) {
      if (cartItem.customer_id != customerId) {
        return res.status(200).json({ status: 0, message: "Unauthorized access to cart item" });
      }
    } else if (session_id) {
      if (cartItem.session_id !== session_id) {
        return res.status(200).json({ status: 0, message: "Unauthorized access to cart item" });
      }
    } else {
      return res.status(200).json({ status: 0, message: "Authentication required" });
    }

    // Check stock
    const inventory = await WarehouseInventory.findOne({
      where: { 
        product_id: cartItem.product_id,
        variation_id: cartItem.variation_id
      }
    });

    if (!inventory || inventory.stock < quantity) {
      return res.status(200).json({
        status: 0,
        message: "Insufficient stock",
        available_stock: inventory ? inventory.stock : 0
      });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    const formattedItem = await formatCartItem(cartItem);

    return res.status(200).json({
      status: 1,
      message: "Quantity updated",
      data: formattedItem
    });

  } catch (error) {
    console.error("updateQuantity error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to update quantity",
      error: error.message
    });
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  const { cart_item_id, session_id } = req.body;
  
  // Prioritize verified user from token
  let customerId = (req.user && req.userType === 'customer') ? req.user.id : null;
  if (!customerId && !req.headers["authorization"]) {
    customerId = req.headers['x-customer-id'] || null;
  }

  if (!cart_item_id) {
    return res.status(200).json({
      status: 0,
      message: "Cart item ID is required"
    });
  }

  try {
    const cartItem = await Cart.findByPk(cart_item_id);
    if (!cartItem) {
      return res.status(200).json({ status: 0, message: "Cart item not found" });
    }

    // Ownership check
    if (customerId) {
      if (cartItem.customer_id != customerId) {
        return res.status(200).json({ status: 0, message: "Unauthorized access to cart item" });
      }
    } else if (session_id) {
      if (cartItem.session_id !== session_id) {
        return res.status(200).json({ status: 0, message: "Unauthorized access to cart item" });
      }
    } else {
      return res.status(200).json({ status: 0, message: "Authentication required" });
    }

    await cartItem.destroy();

    return res.status(200).json({
      status: 1,
      message: "Item removed from cart"
    });

  } catch (error) {
    console.error("removeFromCart error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to remove item",
      error: error.message
    });
  }
};

// Clear Cart
exports.clearCart = async (req, res) => {
  const { session_id } = req.body;
  
  // Prioritize verified user from token
  let customerId = (req.user && req.userType === 'customer') ? req.user.id : null;
  if (!customerId && !req.headers["authorization"]) {
    customerId = req.headers['x-customer-id'] || null;
  }

  try {
    const whereClause = {};
    if (customerId) {
      whereClause.customer_id = customerId;
    } else if (session_id) {
      whereClause.session_id = session_id;
    } else {
      return res.status(200).json({
        status: 0,
        message: "Session ID or Customer ID is required"
      });
    }

    await Cart.destroy({ where: whereClause });

    return res.status(200).json({
      status: 1,
      message: "Cart cleared"
    });

  } catch (error) {
    console.error("clearCart error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to clear cart",
      error: error.message
    });
  }
};
