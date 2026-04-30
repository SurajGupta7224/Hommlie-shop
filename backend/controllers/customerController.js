const { Customer, CustomerAddress, Pincode } = require("../models/index");
const { Op } = require("sequelize");

// GET /api/customers/check?mobile=XXXXXXXXXX
const checkCustomer = async (req, res) => {
  const { mobile } = req.query;
  if (!mobile) return res.status(400).json({ message: "Mobile number is required" });

  try {
    const customer = await Customer.findOne({
      where: { mobile },
      include: [{ model: CustomerAddress, as: "addresses" }]
    });

    if (customer) {
      return res.status(200).json({ found: true, customer });
    } else {
      return res.status(200).json({ found: false, customer: null });
    }
  } catch (err) {
    console.error("checkCustomer error:", err);
    return res.status(500).json({ message: "Failed to check customer" });
  }
};

// POST /api/customers
const createCustomer = async (req, res) => {
  const { name, mobile, email } = req.body;
  if (!name || !mobile) return res.status(400).json({ message: "Name and mobile are required" });

  try {
    const existing = await Customer.findOne({ where: { mobile } });
    if (existing) return res.status(409).json({ message: "Customer with this mobile already exists" });

    const customer = await Customer.create({
      name, mobile, email: email || null,
      created_by: req.user.id
    });

    return res.status(201).json({ message: "Customer created successfully", customer });
  } catch (err) {
    console.error("createCustomer error:", err);
    return res.status(500).json({ message: "Failed to create customer" });
  }
};

// GET /api/customers/:id/addresses
const getCustomerAddresses = async (req, res) => {
  try {
    const addresses = await CustomerAddress.findAll({
      where: { customer_id: req.params.id },
      order: [["is_default", "DESC"], ["id", "DESC"]]
    });
    return res.status(200).json({ addresses });
  } catch (err) {
    console.error("getCustomerAddresses error:", err);
    return res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

// POST /api/customers/:id/addresses
const addCustomerAddress = async (req, res) => {
  const { address_line, landmark, pincode, city, state, country, pincode_id, lat, lng } = req.body;

  if (!address_line || !pincode) {
    return res.status(400).json({ message: "Address line and pincode are required" });
  }

  try {
    // If this is the first address, set as default
    const existingCount = await CustomerAddress.count({ where: { customer_id: req.params.id } });

    const address = await CustomerAddress.create({
      customer_id: req.params.id,
      address_line, landmark, pincode, city, state, country,
      pincode_id: pincode_id || null,
      lat: lat || null,
      lng: lng || null,
      is_default: existingCount === 0 ? 1 : 0
    });

    return res.status(201).json({ message: "Address saved successfully", address });
  } catch (err) {
    console.error("addCustomerAddress error:", err);
    return res.status(500).json({ message: "Failed to save address" });
  }
};

// PATCH /api/customers/addresses/:id/default
const setDefaultAddress = async (req, res) => {
  const { id } = req.params;
  try {
    const address = await CustomerAddress.findByPk(id);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // Unset all, then set this one
    await CustomerAddress.update({ is_default: 0 }, { where: { customer_id: address.customer_id } });
    await address.update({ is_default: 1 });

    return res.status(200).json({ message: "Default address updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update default address" });
  }
};

module.exports = { checkCustomer, createCustomer, getCustomerAddresses, addCustomerAddress, setDefaultAddress };
