const { Warehouse, WarehousePincode, WarehouseInventory, Country, State, City, Pincode, Product, ProductVariation, User } = require("../models/index");
const { Op } = require("sequelize");

// --- WAREHOUSE SETUP ---

const getAllWarehouses = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '' } = req.query;
  const offset = (page - 1) * limit;
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { code: { [Op.like]: `%${search}%` } }
    ];
  }
  if (status !== '') where.status = status;
  const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');
  if (!isAdmin) {
    where.user_id = req.user.id; // Only fetch current user's warehouses if not admin
  }

  try {
    const { count, rows } = await Warehouse.findAndCountAll({
      where,
      include: [
        { model: Country, as: "country", attributes: ["id", "country_name"] },
        { model: State, as: "state", attributes: ["id", "state_name"] },
        { model: City, as: "city", attributes: ["id", "city_name"] },
        { model: User, as: "user", attributes: ["id", "name", "phone"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });
    return res.status(200).json({
      warehouses: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("getAllWarehouses error:", err);
    return res.status(500).json({ message: "Failed to fetch warehouses" });
  }
};

const createWarehouse = async (req, res) => {
  const { name, code, pincode, country_id, state_id, city_id, address, lat, lng, contact_person, contact_phone, email, status } = req.body;
  
  if (!name || !code) return res.status(400).json({ message: "Name and code are required" });

  try {
    const warehouse = await Warehouse.create({
      name, user_id: req.user.id, code, pincode, country_id, state_id, city_id, address, lat, lng, contact_person, contact_phone, email, status
    });
    return res.status(201).json({ message: "Warehouse created", warehouse });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ message: "Warehouse code must be unique" });
    console.error("createWarehouse error:", err);
    return res.status(500).json({ message: "Failed to create warehouse" });
  }
};

const updateWarehouse = async (req, res) => {
  const { id } = req.params;
  const { name, code, pincode, country_id, state_id, city_id, address, lat, lng, contact_person, contact_phone, email, status } = req.body;

  try {
    const warehouse = await Warehouse.findByPk(id);
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

    await warehouse.update({
      name, code, pincode, country_id, state_id, city_id, address, lat, lng, contact_person, contact_phone, email, status
    });
    return res.status(200).json({ message: "Warehouse updated", warehouse });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ message: "Warehouse code must be unique" });
    console.error("updateWarehouse error:", err);
    return res.status(500).json({ message: "Failed to update warehouse" });
  }
};

const toggleWarehouseStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const warehouse = await Warehouse.findByPk(id);
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
    await warehouse.update({ status });
    return res.status(200).json({ message: "Status updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update status" });
  }
};

const deleteWarehouse = async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse = await Warehouse.findByPk(id);
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
    await warehouse.update({ status: 0 }); // Soft delete
    return res.status(200).json({ message: "Warehouse deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete warehouse" });
  }
};

// --- PINCODE MAPPING ---

const getWarehousePincodes = async (req, res) => {
  const { id } = req.params;
  try {
    const mappings = await WarehousePincode.findAll({
      where: { warehouse_id: id },
      include: [{ model: Pincode, as: "pincode" }]
    });
    return res.status(200).json({ mappings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch mappings" });
  }
};

const assignPincodes = async (req, res) => {
  const { id } = req.params;
  const { pincode_ids } = req.body; // Expecting array of pincode IDs
  
  if (!Array.isArray(pincode_ids)) return res.status(400).json({ message: "pincode_ids must be an array" });

  try {
    // Basic replace all logic for simplicity
    await WarehousePincode.destroy({ where: { warehouse_id: id } });
    
    const newMappings = pincode_ids.map(pid => ({
      warehouse_id: id,
      pincode_id: pid
    }));
    
    await WarehousePincode.bulkCreate(newMappings);
    return res.status(200).json({ message: "Pincodes successfully assigned" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to assign pincodes" });
  }
};

// --- PRODUCT ALLOCATION & INVENTORY ---

const getInventory = async (req, res) => {
  const { warehouse_id, product_id, page = 1, limit = 20, alert_only } = req.query;
  const offset = (page - 1) * limit;
  const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');
  
  const where = {};
  if (warehouse_id) where.warehouse_id = warehouse_id;
  if (product_id) where.product_id = product_id;
  if (alert_only === 'true') where.stock = { [Op.lt]: 10 };

  try {
    const { count, rows } = await WarehouseInventory.findAndCountAll({
      where,
      include: [
        { 
          model: Warehouse, 
          as: "warehouse", 
          attributes: ["id", "name", "code"],
          where: isAdmin ? {} : { user_id: req.user.id } // Only from user's warehouses if not admin
        },
        { model: Product, as: "product", attributes: ["id", "name", "slug"] },
        { model: ProductVariation, as: "variation", attributes: ["id", "variation_name", "sku"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });
    
    return res.status(200).json({
      inventory: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

const allocateProduct = async (req, res) => {
  const { warehouse_id, product_id, variation_id, stock, price, discount_price, tax_percent, delivery_charge, handling_charge, status } = req.body;
  
  if (!warehouse_id || !product_id || !variation_id || price === undefined) {
    return res.status(400).json({ message: "Warehouse, Product, Variation, and Price are required" });
  }

  try {
    // Check if allocation already exists
    const existing = await WarehouseInventory.findOne({
      where: { warehouse_id, product_id, variation_id }
    });

    if (existing) {
      // Update existing allocation
      await existing.update({
        stock: parseInt(stock) || existing.stock,
        price, discount_price, tax_percent, delivery_charge, handling_charge, status
      });
      return res.status(200).json({ message: "Allocation updated", inventory: existing });
    } else {
      // Create new allocation
      const inventory = await WarehouseInventory.create({
        warehouse_id, product_id, variation_id,
        stock: parseInt(stock) || 0,
        price, discount_price, tax_percent, delivery_charge, handling_charge, status
      });
      return res.status(201).json({ message: "Product allocated to warehouse", inventory });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to allocate product" });
  }
};

const updateStock = async (req, res) => {
  const { id } = req.params;
  const { adjustment } = req.body; // e.g., +5 or -3
  
  if (adjustment === undefined) return res.status(400).json({ message: "Adjustment value required" });

  try {
    const inventoryItem = await WarehouseInventory.findByPk(id);
    if (!inventoryItem) return res.status(404).json({ message: "Inventory record not found" });

    const newStock = inventoryItem.stock + parseInt(adjustment);
    if (newStock < 0) return res.status(400).json({ message: "Stock cannot be negative" });

    await inventoryItem.update({ stock: newStock });
    return res.status(200).json({ message: "Stock updated", stock: newStock });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update stock" });
  }
};

const getMappingReport = async (req, res) => {
  const { warehouse_id, pincode, city, area, district, state, country, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');

  const wherePincode = {};
  if (pincode) wherePincode.pincode = { [Op.like]: `%${pincode}%` };

  const whereCity = {};
  if (city) whereCity.city_name = { [Op.like]: `%${city}%` };
  if (area) whereCity.area = { [Op.like]: `%${area}%` };
  if (district) whereCity.district = { [Op.like]: `%${district}%` };

  const whereState = {};
  if (state) whereState.state_name = { [Op.like]: `%${state}%` };

  const whereCountry = {};
  if (country) whereCountry.country_name = { [Op.like]: `%${country}%` };

  const whereMapping = {};
  if (warehouse_id) whereMapping.warehouse_id = warehouse_id;

  try {
    const { count, rows } = await WarehousePincode.findAndCountAll({
      where: whereMapping,
      include: [
        { 
          model: Warehouse, 
          as: "warehouse", 
          attributes: ["id", "name", "code"],
          where: isAdmin ? {} : { user_id: req.user.id } // Only user's warehouses if not admin
        },
        {
          model: Pincode,
          as: "pincode",
          where: wherePincode,
          include: [
            { model: Country, as: "country", where: Object.keys(whereCountry).length ? whereCountry : undefined, attributes: ["id", "country_name"] },
            { model: State, as: "state", where: Object.keys(whereState).length ? whereState : undefined, attributes: ["id", "state_name"] },
            { model: City, as: "city", where: Object.keys(whereCity).length ? whereCity : undefined, attributes: ["id", "city_name", "area", "region", "district"] }
          ].filter(inc => inc.where !== undefined || (inc.attributes && inc.attributes.length > 0))
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]]
    });

    return res.status(200).json({
      mappings: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getMappingReport error:", err);
    return res.status(500).json({ message: "Failed to fetch mapping report" });
  }
};

module.exports = {
  getAllWarehouses, createWarehouse, updateWarehouse, toggleWarehouseStatus, deleteWarehouse,
  getWarehousePincodes, assignPincodes,
  getInventory, allocateProduct, updateStock,
  getMappingReport
};
