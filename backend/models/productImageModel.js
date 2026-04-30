const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProductImage = sequelize.define("ProductImage", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  alt_text: { type: DataTypes.STRING, allowNull: true },
  meta_title: { type: DataTypes.STRING, allowNull: true },
  meta_description: { type: DataTypes.TEXT, allowNull: true },
  is_primary: { type: DataTypes.TINYINT(1), defaultValue: 0 },
}, {
  tableName: "product_images",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = ProductImage;
