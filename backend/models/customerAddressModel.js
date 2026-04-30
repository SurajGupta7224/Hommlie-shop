const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CustomerAddress = sequelize.define("CustomerAddress", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'customers', key: 'id' },
    onDelete: 'CASCADE'
  },
  address_line: { type: DataTypes.TEXT, allowNull: false },
  landmark: { type: DataTypes.STRING, allowNull: true },
  pincode: { type: DataTypes.STRING(10), allowNull: false },
  pincode_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'pincodes', key: 'id' }
  },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  lat: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  lng: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  is_default: { type: DataTypes.TINYINT(1), defaultValue: 0 },
}, {
  tableName: "customer_addresses",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = CustomerAddress;
