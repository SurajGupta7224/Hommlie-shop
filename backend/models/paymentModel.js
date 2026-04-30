const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "orders", key: "id" },
  },
  payment_method: {
    type: DataTypes.ENUM("COD", "UPI", "Card", "Net Banking"),
    allowNull: false,
    defaultValue: "COD",
  },
  transaction_id: { type: DataTypes.STRING(255), allowNull: true },
  payment_gateway: { type: DataTypes.STRING(100), allowNull: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
    allowNull: false,
    defaultValue: "pending",
  },
  paid_at: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  recorded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "users", key: "id" },
  },
}, {
  tableName: "payments",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Payment;
