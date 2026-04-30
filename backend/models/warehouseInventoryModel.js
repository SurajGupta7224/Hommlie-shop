const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const WarehouseInventory = sequelize.define("WarehouseInventory", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'warehouses', key: 'id' },
    onDelete: 'CASCADE'
  },
  product_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'products', key: 'id' },
    onDelete: 'CASCADE'
  },
  variation_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'product_variations', key: 'id' },
    onDelete: 'CASCADE'
  },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  tax_percent: { type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0 },
  delivery_charge: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
  handling_charge: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
  status: { type: DataTypes.TINYINT(1), defaultValue: 1 },
}, {
  tableName: "warehouse_inventory",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = WarehouseInventory;
