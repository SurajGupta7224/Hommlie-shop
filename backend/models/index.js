// Central place to define all model associations
const User = require("./userModel");
const Role = require("./roleModel");
const Permission = require("./permissionModel");
const RolePermission = require("./rolePermissionModel");
const Country = require("./countryModel");
const Customer = require("./customerModel");
const CustomerAddress = require("./customerAddressModel");
const Cart = require("./cartModel");
const Order = require("./orderModel");
const OrderItem = require("./orderItemModel");
const State = require("./stateModel");
const City = require("./cityModel");
const Pincode = require("./pincodeModel");
const Category = require("./categoryModel");
const SubCategory = require("./subCategoryModel");
const Product = require("./productModel");
const ProductVariation = require("./productVariationModel");
const ProductImage = require("./productImageModel");
const Warehouse = require("./warehouseModel");
const WarehousePincode = require("./warehousePincodeModel");
const WarehouseInventory = require("./warehouseInventoryModel");
const OrderStatusLog = require("./orderStatusLogModel");
const Payment = require("./paymentModel");
const PaymentLog = require("./paymentLogModel");

// User ↔ Role
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

// Role ↔ Permission (Many-to-Many via RolePermission)
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "role_id", as: "permissions" });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permission_id", as: "roles" });

// Country ↔ State
Country.hasMany(State, { foreignKey: "country_id", as: "states" });
State.belongsTo(Country, { foreignKey: "country_id", as: "country" });

// State ↔ City
State.hasMany(City, { foreignKey: "state_id", as: "cities" });
City.belongsTo(State, { foreignKey: "state_id", as: "state" });

// User Locations
User.belongsTo(Country, { foreignKey: "country_id", as: "country" });
User.belongsTo(State, { foreignKey: "state_id", as: "state" });
User.belongsTo(City, { foreignKey: "city_id", as: "city" });

// Pincode Locations
Pincode.belongsTo(Country, { foreignKey: "country_id", as: "country" });
Pincode.belongsTo(State, { foreignKey: "state_id", as: "state" });
Pincode.belongsTo(City, { foreignKey: "city_id", as: "city" });

// Category ↔ SubCategory
Category.hasMany(SubCategory, { foreignKey: "category_id", as: "subCategories" });
SubCategory.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// Ownership Associations
Category.belongsTo(User, { foreignKey: "user_id", as: "user" });
SubCategory.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Category, { foreignKey: "user_id", as: "categories" });
User.hasMany(SubCategory, { foreignKey: "user_id", as: "subCategories" });

// Category / SubCategory ↔ Product
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
SubCategory.hasMany(Product, { foreignKey: "subcategory_id", as: "products" });
Product.belongsTo(SubCategory, { foreignKey: "subcategory_id", as: "subCategory" });

// Product ↔ Variations
Product.hasMany(ProductVariation, { foreignKey: "product_id", as: "variations" });
ProductVariation.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Product ↔ Images
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Warehouse ↔ Locations
Warehouse.belongsTo(Country, { foreignKey: "country_id", as: "country" });
Warehouse.belongsTo(State, { foreignKey: "state_id", as: "state" });
Warehouse.belongsTo(City, { foreignKey: "city_id", as: "city" });
Warehouse.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Warehouse ↔ WarehousePincode ↔ Pincode
Warehouse.hasMany(WarehousePincode, { foreignKey: "warehouse_id", as: "warehousePincodes" });
WarehousePincode.belongsTo(Warehouse, { foreignKey: "warehouse_id", as: "warehouse" });
Pincode.hasMany(WarehousePincode, { foreignKey: "pincode_id", as: "warehouseMappings" });
WarehousePincode.belongsTo(Pincode, { foreignKey: "pincode_id", as: "pincode" });

// Warehouse ↔ WarehouseInventory ↔ Product/Variation
Warehouse.hasMany(WarehouseInventory, { foreignKey: "warehouse_id", as: "inventory" });
WarehouseInventory.belongsTo(Warehouse, { foreignKey: "warehouse_id", as: "warehouse" });
Product.hasMany(WarehouseInventory, { foreignKey: "product_id", as: "warehouseInventory" });
WarehouseInventory.belongsTo(Product, { foreignKey: "product_id", as: "product" });
ProductVariation.hasMany(WarehouseInventory, { foreignKey: "variation_id", as: "warehouseInventory" });
WarehouseInventory.belongsTo(ProductVariation, { foreignKey: "variation_id", as: "variation" });

// Customer ↔ Address
Customer.hasMany(CustomerAddress, { foreignKey: "customer_id", as: "addresses" });
CustomerAddress.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

// Customer ↔ Orders
Customer.hasMany(Order, { foreignKey: "customer_id", as: "orders" });
Order.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

// Order ↔ Warehouse, Address
Order.belongsTo(Warehouse, { foreignKey: "warehouse_id", as: "warehouse" });
Order.belongsTo(CustomerAddress, { foreignKey: "address_id", as: "address" });
Order.belongsTo(User, { foreignKey: "created_by", as: "createdBy" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Order ↔ OrderItems
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
OrderItem.belongsTo(ProductVariation, { foreignKey: "variation_id", as: "variation" });

// Order ↔ StatusLog
Order.hasMany(OrderStatusLog, { foreignKey: "order_id", as: "statusLogs" });
OrderStatusLog.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderStatusLog.belongsTo(User, { foreignKey: "changed_by", as: "changedBy" });

// Cart ↔ Product/Variation/Customer/User
Cart.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Cart.belongsTo(ProductVariation, { foreignKey: "variation_id", as: "variation" });
Cart.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Payment ↔ Order
Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// Payment ↔ User (recorded by)
Payment.belongsTo(User, { foreignKey: "recorded_by", as: "recordedBy" });

// Payment ↔ PaymentLog
Payment.hasMany(PaymentLog, { foreignKey: "payment_id", as: "logs" });
PaymentLog.belongsTo(Payment, { foreignKey: "payment_id", as: "payment" });
PaymentLog.belongsTo(User, { foreignKey: "changed_by", as: "changedBy" });

module.exports = { 
  User, Role, Permission, RolePermission,
  Country, State, City, Pincode, Category, SubCategory,
  Product, ProductVariation, ProductImage,
  Warehouse, WarehousePincode, WarehouseInventory,
  Customer, CustomerAddress, Cart, Order, OrderItem, OrderStatusLog,
  Payment, PaymentLog
};
