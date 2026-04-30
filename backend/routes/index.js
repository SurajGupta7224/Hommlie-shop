const express = require("express");
const router = express.Router();
console.log("DEBUG: Loading API routes from routes/index.js");

const { login } = require("../controllers/authController");
const { getAllUsers, createUser, updateUser, updateUserStatus, deleteUser, getRoles } = require("../controllers/userController");
const roleController = require("../controllers/roleController");
const permissionController = require("../controllers/permissionController");
const locationController = require("../controllers/locationController");
const profileController = require("../controllers/profileController");
const categoryController = require("../controllers/categoryController");
const subCategoryController = require("../controllers/subCategoryController");
const productController = require("../controllers/productController");
const warehouseController = require("../controllers/warehouseController");
const { verifyToken, requirePermission } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const customerController = require("../controllers/customerController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const paymentController = require("../controllers/paymentController");
const dashboardController = require("../controllers/dashboardController");

// Setup file upload fields configuration
const userUploads = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'pan_card_file', maxCount: 1 },
  { name: 'aadhaar_card_file', maxCount: 1 },
  { name: 'gst_file', maxCount: 1 }
]);

const categoryUploads = upload.fields([
  { name: 'category_image', maxCount: 1 }
]);

const subCategoryUploads = upload.fields([
  { name: 'subcategory_image', maxCount: 1 }
]);

const productUploads = upload.fields([
  { name: 'product_images', maxCount: 10 }
]);

// Auth routes (public)
router.post("/auth/login", login);

// Profile routes
router.get("/profile", verifyToken, requirePermission('profile'), profileController.getProfile);
router.put("/profile", verifyToken, requirePermission('profile'), userUploads, profileController.updateProfile);

// Category routes
router.get("/categories", verifyToken, requirePermission('category_management'), categoryController.getAllCategories);
router.post("/categories", verifyToken, requirePermission('category_management'), categoryUploads, categoryController.createCategory);
router.put("/categories/:id", verifyToken, requirePermission('category_management'), categoryUploads, categoryController.updateCategory);
router.patch("/categories/:id/status", verifyToken, requirePermission('category_management'), categoryController.toggleCategoryStatus);
router.delete("/categories/:id", verifyToken, requirePermission('category_management'), categoryController.deleteCategory);

// Sub-Category routes
router.get("/sub-categories", verifyToken, requirePermission('sub_category_management'), subCategoryController.getAllSubCategories);
router.post("/sub-categories", verifyToken, requirePermission('sub_category_management'), subCategoryUploads, subCategoryController.createSubCategory);
router.put("/sub-categories/:id", verifyToken, requirePermission('sub_category_management'), subCategoryUploads, subCategoryController.updateSubCategory);
router.patch("/sub-categories/:id/status", verifyToken, requirePermission('sub_category_management'), subCategoryController.toggleSubCategoryStatus);
router.delete("/sub-categories/:id", verifyToken, requirePermission('sub_category_management'), subCategoryController.deleteSubCategory);

// Product routes
router.get("/products", verifyToken, requirePermission('product_management'), productController.getAllProducts);
router.get("/products/:id", verifyToken, requirePermission('product_management'), productController.getProductById);
router.get("/products/:id/variations", verifyToken, requirePermission('product_management'), productController.getProductVariations);
router.post("/products", verifyToken, requirePermission('product_management'), productUploads, productController.createProduct);
router.put("/products/:id", verifyToken, requirePermission('product_management'), productUploads, productController.updateProduct);
router.patch("/products/:id/status", verifyToken, requirePermission('product_management'), productController.toggleProductStatus);
router.delete("/products/:id", verifyToken, requirePermission('product_management'), productController.deleteProduct);

// User routes (protected)
// Uses user_management permission
router.get("/users/roles", verifyToken, requirePermission('user_management'), getRoles);
router.get("/users", verifyToken, requirePermission('user_management'), getAllUsers);
router.get("/users/:id", verifyToken, requirePermission('user_management'), require('../controllers/userController').getUserById);
router.post("/users", verifyToken, requirePermission('user_management'), userUploads, createUser);
router.put("/users/:id", verifyToken, requirePermission('user_management'), userUploads, updateUser);
router.patch("/users/:id/status", verifyToken, requirePermission('user_management'), updateUserStatus);
router.delete("/users/:id", verifyToken, requirePermission('user_management'), deleteUser);

// Roles - Uses role_management
router.get("/roles", verifyToken, requirePermission('role_management'), roleController.getAllRoles);
router.post("/roles", verifyToken, requirePermission('role_management'), roleController.createRole);
router.put("/roles/:id", verifyToken, requirePermission('role_management'), roleController.updateRole);
router.delete("/roles/:id", verifyToken, requirePermission('role_management'), roleController.deleteRole);

// Permissions - Uses permission
router.get("/permissions", verifyToken, requirePermission('permission'), permissionController.getAllPermissions);
router.post("/permissions", verifyToken, requirePermission('permission'), permissionController.createPermission);
router.put("/permissions/:id", verifyToken, requirePermission('permission'), permissionController.updatePermission);
router.delete("/permissions/:id", verifyToken, requirePermission('permission'), permissionController.deletePermission);

// Location routes
router.get("/locations/countries", locationController.getCountries);
router.get("/locations/states/:country_id", locationController.getStates);
router.get("/locations/cities/:state_id", locationController.getCities);
router.get("/locations/pincode/:pincode", locationController.getPincodeDetails);
router.get("/locations/pincodes", verifyToken, requirePermission('warehouse_management'), locationController.getAllPincodes);
router.get("/locations/pincodes/city/:city_id", verifyToken, requirePermission('warehouse_management'), locationController.getPincodesByCity);
router.get("/locations/suggestions", verifyToken, requirePermission('warehouse_management'), locationController.getSuggestions);

// Warehouse Setup routes
router.get("/warehouses", verifyToken, requirePermission('warehouse_management'), warehouseController.getAllWarehouses);
router.post("/warehouses", verifyToken, requirePermission('warehouse_management'), warehouseController.createWarehouse);
router.put("/warehouses/:id", verifyToken, requirePermission('warehouse_management'), warehouseController.updateWarehouse);
router.patch("/warehouses/:id/status", verifyToken, requirePermission('warehouse_management'), warehouseController.toggleWarehouseStatus);
router.delete("/warehouses/:id", verifyToken, requirePermission('warehouse_management'), warehouseController.deleteWarehouse);

// Warehouse Pincode Mapping routes
router.get("/warehouses/mappings/report", verifyToken, requirePermission('warehouse_management'), warehouseController.getMappingReport);
router.get("/warehouses/:id/pincodes", verifyToken, requirePermission('warehouse_management'), warehouseController.getWarehousePincodes);
router.post("/warehouses/:id/pincodes", verifyToken, requirePermission('warehouse_management'), warehouseController.assignPincodes);

// Warehouse Inventory routes
router.get("/warehouse-inventory", verifyToken, requirePermission('warehouse_management'), warehouseController.getInventory);
router.post("/warehouse-inventory", verifyToken, requirePermission('warehouse_management'), warehouseController.allocateProduct);
router.patch("/warehouse-inventory/:id/stock", verifyToken, requirePermission('warehouse_management'), warehouseController.updateStock);

// Customer routes (for order booking)
router.get("/customers/check", verifyToken, requirePermission('order_management'), customerController.checkCustomer);
router.post("/customers", verifyToken, requirePermission('order_management'), customerController.createCustomer);
router.get("/customers/:id/addresses", verifyToken, requirePermission('order_management'), customerController.getCustomerAddresses);
router.post("/customers/:id/addresses", verifyToken, requirePermission('order_management'), customerController.addCustomerAddress);
router.patch("/customers/addresses/:id/default", verifyToken, requirePermission('order_management'), customerController.setDefaultAddress);

// Cart routes
router.get("/cart", verifyToken, requirePermission('order_management'), cartController.getCart);
router.post("/cart", verifyToken, requirePermission('order_management'), cartController.addToCart);
router.put("/cart/:id", verifyToken, requirePermission('order_management'), cartController.updateCartItem);
router.delete("/cart/:id", verifyToken, requirePermission('order_management'), cartController.removeFromCart);
router.delete("/cart", verifyToken, requirePermission('order_management'), cartController.clearCart);

// Order routes
router.get("/orders/serviceability", verifyToken, requirePermission('order_management'), orderController.checkServiceability);
router.post("/orders/check-stock", verifyToken, requirePermission('order_management'), orderController.checkStock);
router.get("/orders", verifyToken, requirePermission('order_management'), orderController.getOrders);
router.get("/orders/:id", verifyToken, requirePermission('order_management'), orderController.getOrderById);
router.post("/orders", verifyToken, requirePermission('order_management'), orderController.placeOrder);
router.patch("/orders/:id/status", verifyToken, requirePermission('order_management'), orderController.updateOrderStatus);

// Payment routes
router.get("/payments/reports/summary", verifyToken, requirePermission('order_management'), paymentController.getPaymentSummary);
router.get("/payments", verifyToken, requirePermission('order_management'), paymentController.getAllPayments);
router.get("/payments/:id", verifyToken, requirePermission('order_management'), paymentController.getPaymentById);
router.post("/payments", verifyToken, requirePermission('order_management'), paymentController.addPayment);
router.patch("/payments/:id/mark-paid", verifyToken, requirePermission('order_management'), paymentController.markAsPaid);
router.patch("/payments/:id/verify", verifyToken, requirePermission('order_management'), paymentController.verifyPayment);
router.patch("/payments/:id/mark-failed", verifyToken, requirePermission('order_management'), paymentController.markAsFailed);
router.patch("/payments/:id/refund", verifyToken, requirePermission('order_management'), paymentController.refundPayment);

// Dashboard routes
router.get("/dashboard/stats", verifyToken, dashboardController.getDashboardStats);

module.exports = router;
