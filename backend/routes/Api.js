const express = require("express");
const router = express.Router();
const { getHomepageData } = require("../controllers/Api/HomepageController");
const { getAllProducts, getProductsByCategory, searchProducts, getProductDetail, getAllCategories } = require("../controllers/Api/ProductController");
const { registerOrLogin, verifyOtp, reSendOtp, updateProfile } = require("../controllers/Api/AuthController");
const { addToCart, getCart, updateQuantity, removeFromCart, clearCart } = require("../controllers/Api/CartController");
const { verifyToken } = require("../middleware/authMiddleware");

// Optional auth: attaches req.user if a valid token is present, but does not block guests
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) return next(); // No token — continue as guest
  
  // Try to verify, but don't block if it fails (just treat as guest)
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Call verifyToken but handle errors to prevent blocking guests
    await verifyToken(req, res, (err) => {
      // Even if verifyToken found an issue (account suspended etc), 
      // we just proceed as guest for optional routes
      next();
    });
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
router.post("/auth/update-profile", updateProfile);

// Cart routes
router.post("/cart/add", optionalAuth, addToCart);
router.get("/cart", optionalAuth, getCart);
router.post("/cart/update", optionalAuth, updateQuantity);
router.post("/cart/remove", optionalAuth, removeFromCart);
router.post("/cart/clear", optionalAuth, clearCart);

module.exports = router;
