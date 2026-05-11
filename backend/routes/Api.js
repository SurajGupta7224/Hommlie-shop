const express = require("express");
const router = express.Router();
const { getHomepageData } = require("../controllers/Api/HomepageController");
const { getAllProducts, getProductsByCategory, searchProducts, getProductDetail, getAllCategories } = require("../controllers/Api/ProductController");
const { registerOrLogin, verifyOtp, reSendOtp, updateProfile } = require("../controllers/Api/AuthController");
const { addToCart, getCart, updateQuantity, removeFromCart, clearCart } = require("../controllers/Api/CartController");

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
router.post("/cart/add", addToCart);
router.get("/cart", getCart);
router.post("/cart/update", updateQuantity);
router.post("/cart/remove", removeFromCart);
router.post("/cart/clear", clearCart);

module.exports = router;
