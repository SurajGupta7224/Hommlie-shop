const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'customers', key: 'id' }
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'warehouses', key: 'id' }
  },
  address_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'customer_addresses', key: 'id' }
  },
  items_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  delivery_charge: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  tax_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  final_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  payment_method: {
    type: DataTypes.ENUM('COD', 'Online'),
    allowNull: false,
    defaultValue: 'COD'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  order_source: {
    type: DataTypes.ENUM('manual', 'online'),
    allowNull: false,
    defaultValue: 'manual'
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
}, {
  tableName: "orders",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Order;
