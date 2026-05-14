const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Customer = sequelize.define("Customer", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: true },
  mobile: { type: DataTypes.STRING(15), allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: true },
  profile_pic: { type: DataTypes.STRING, allowNull: true },
  token: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.TINYINT(1), defaultValue: 1 },
  is_verified: { type: DataTypes.TINYINT(1), defaultValue: 0 },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
}, {
  tableName: "customers",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Customer;
