const express = require("express");
const router = express.Router();
const { getHomepageData } = require("../controllers/Api/HomepageController");
const { getProductsByCategory, searchProducts, getProductDetail, getAllCategories } = require("../controllers/Api/ProductController");

// Homepage data route
router.get("/homepage", getHomepageData);

// Category routes
router.get("/categories", getAllCategories);

// Product routes
router.get("/products/category/:slug", getProductsByCategory);
router.get("/products/search", searchProducts);
router.get("/products/:slug", getProductDetail);

module.exports = router;
