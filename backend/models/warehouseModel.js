const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Warehouse = sequelize.define("Warehouse", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  country_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: { model: 'country', key: 'id' }
  },
  state_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: { model: 'state', key: 'id' }
  },
  city_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: { model: 'city', key: 'id' }
  },
  pincode: { type: DataTypes.STRING(20), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  lat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  lng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  contact_person: { type: DataTypes.STRING, allowNull: true },
  contact_phone: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.TINYINT(1), defaultValue: 1 },
}, {
  tableName: "warehouses",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Warehouse;
