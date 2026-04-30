const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PaymentLog = sequelize.define("PaymentLog", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "payments", key: "id" },
  },
  old_status: { type: DataTypes.STRING(50), allowNull: true },
  new_status: { type: DataTypes.STRING(50), allowNull: false },
  action: { type: DataTypes.STRING(100), allowNull: false },
  note: { type: DataTypes.TEXT, allowNull: true },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "users", key: "id" },
  },
}, {
  tableName: "payment_logs",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
});

module.exports = PaymentLog;
