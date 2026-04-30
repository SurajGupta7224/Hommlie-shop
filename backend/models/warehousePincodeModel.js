const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const WarehousePincode = sequelize.define("WarehousePincode", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'warehouses', key: 'id' },
    onDelete: 'CASCADE'
  },
  pincode_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'pincodes', key: 'id' },
    onDelete: 'CASCADE'
  },
  status: { type: DataTypes.TINYINT(1), defaultValue: 1 },
}, {
  tableName: "warehouse_pincodes",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = WarehousePincode;
