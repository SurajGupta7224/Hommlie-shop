const express = require("express");
const router = express.Router();
const { getHomepageData } = require("../controllers/Api/HomepageController");
const { getAllProducts, getProductsByCategory, searchProducts, getProductDetail, getAllCategories } = require("../controllers/Api/ProductController");
const { registerOrLogin, verifyOtp, reSendOtp, updateProfile } = require("../controllers/Api/AuthController");
const { addToCart, getCart, updateQuantity, removeFromCart, clearCart } = require("../controllers/Api/CartController");
const { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = require("../controllers/Api/AddressController");
const { placeOrder, getMyOrders, getOrderDetail, cancelOrder } = require("../controllers/Api/OrderController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Optional auth: attaches req.user if a valid token is present, but does not block guests
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next(); // No token — continue as guest

  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { User, Customer } = require("../models/index");

    // Try finding in User table first
    let user = await User.findByPk(decoded.id);
    let userType = 'user';

    if (!user) {
      user = await Customer.findByPk(decoded.id);
      userType = 'customer';
    }

    if (user) {
      // Check status
      const isActive = userType === 'user' ? user.status === 'active' : user.status == 1;
      if (isActive) {
        req.user = user;
        req.userType = userType;
      }
    }
    
    next();
  } catch (err) {
    // Token invalid or expired — proceed as guest
    next();
  }
};

// Homepage data route
router.get("/homepage", getHomepageData);

// Category routes
router.get("/categories", getAllCategories);

// Product routes
router.get("/products", getAllProducts);
router.get("/products/category/:slug", getProductsByCategory);
router.get("/products/search", searchProducts);
router.get("/products/:slug", getProductDetail);

// Auth routes
router.post("/auth/login", registerOrLogin);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/resend-otp", reSendOtp);
router.post("/auth/update-profile", upload.single('profile_pic'), updateProfile);

// Cart routes
router.post("/cart/add", optionalAuth, addToCart);
router.get("/cart", optionalAuth, getCart);
router.post("/cart/update", optionalAuth, updateQuantity);
router.post("/cart/remove", optionalAuth, removeFromCart);
router.post("/cart/clear", optionalAuth, clearCart);

// Address routes (Protected)
router.get("/addresses", verifyToken, getAddresses);
router.post("/addresses/add", verifyToken, addAddress);
router.post("/addresses/update/:id", verifyToken, updateAddress);
router.post("/addresses/delete/:id", verifyToken, deleteAddress);
router.post("/addresses/set-default/:id", verifyToken, setDefaultAddress);

// Order routes
router.post("/orders/place", optionalAuth, placeOrder);
router.get("/orders/my", optionalAuth, getMyOrders);
router.get("/orders/detail/:orderNumber", optionalAuth, getOrderDetail);
router.post("/orders/cancel", optionalAuth, cancelOrder);

module.exports = router;
