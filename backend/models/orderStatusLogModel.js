const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OrderStatusLog = sequelize.define("OrderStatusLog", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'orders', key: 'id' }
  },
  old_status: { type: DataTypes.STRING, allowNull: true },
  new_status: { type: DataTypes.STRING, allowNull: false },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  note: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: "order_status_logs",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
});

module.exports = OrderStatusLog;
