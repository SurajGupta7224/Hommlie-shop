const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProductVariation = sequelize.define("ProductVariation", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  variation_name: { type: DataTypes.STRING, allowNull: false },
  sku: { type: DataTypes.STRING, allowNull: false, unique: true },
  unit: { type: DataTypes.STRING, allowNull: true },
  weight: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.TINYINT(1), defaultValue: 1 },
}, {
  tableName: "product_variations",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = ProductVariation;
