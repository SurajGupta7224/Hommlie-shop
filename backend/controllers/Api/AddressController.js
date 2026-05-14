const { CustomerAddress } = require("../../models/index");

// Get all addresses for the authenticated customer
exports.getAddresses = async (req, res) => {
  try {
    const customerId = req.user.id;

    const addresses = await CustomerAddress.findAll({
      where: { customer_id: customerId },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    return res.status(200).json({
      status: 1,
      message: "Addresses fetched successfully",
      data: addresses
    });
  } catch (error) {
    console.error("getAddresses error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to fetch addresses",
      error: error.message
    });
  }
};

// Add a new address
exports.addAddress = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { address_line, landmark, pincode, pincode_id, city, state, country, lat, lng, is_default } = req.body;

    if (!address_line || !pincode) {
      return res.status(200).json({
        status: 0,
        message: "Address line and pincode are required"
      });
    }

    // If this is set as default, unset other default addresses for this customer
    if (is_default == 1) {
      await CustomerAddress.update(
        { is_default: 0 },
        { where: { customer_id: customerId } }
      );
    }

    // If no addresses exist, make this one default automatically
    const existingAddressesCount = await CustomerAddress.count({ where: { customer_id: customerId } });
    const finalIsDefault = existingAddressesCount === 0 ? 1 : (is_default || 0);

    const newAddress = await CustomerAddress.create({
      customer_id: customerId,
      address_line,
      landmark,
      pincode,
      pincode_id,
      city,
      state,
      country,
      lat,
      lng,
      is_default: finalIsDefault
    });

    return res.status(201).json({
      status: 1,
      message: "Address added successfully",
      data: newAddress
    });
  } catch (error) {
    console.error("addAddress error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to add address",
      error: error.message
    });
  }
};

// Update an existing address
exports.updateAddress = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;
    const { address_line, landmark, pincode, pincode_id, city, state, country, lat, lng, is_default } = req.body;

    const address = await CustomerAddress.findOne({
      where: { id, customer_id: customerId }
    });

    if (!address) {
      return res.status(200).json({
        status: 0,
        message: "Address not found"
      });
    }

    // If this is being set as default, unset other default addresses
    if (is_default == 1) {
      await CustomerAddress.update(
        { is_default: 0 },
        { where: { customer_id: customerId } }
      );
    }

    await address.update({
      address_line: address_line || address.address_line,
      landmark: landmark !== undefined ? landmark : address.landmark,
      pincode: pincode || address.pincode,
      pincode_id: pincode_id !== undefined ? pincode_id : address.pincode_id,
      city: city || address.city,
      state: state || address.state,
      country: country || address.country,
      lat: lat !== undefined ? lat : address.lat,
      lng: lng !== undefined ? lng : address.lng,
      is_default: is_default !== undefined ? is_default : address.is_default
    });

    return res.status(200).json({
      status: 1,
      message: "Address updated successfully",
      data: address
    });
  } catch (error) {
    console.error("updateAddress error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to update address",
      error: error.message
    });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    const address = await CustomerAddress.findOne({
      where: { id, customer_id: customerId }
    });

    if (!address) {
      return res.status(200).json({
        status: 0,
        message: "Address not found"
      });
    }

    const wasDefault = address.is_default;
    await address.destroy();

    // If we deleted the default address, set another one as default if any exist
    if (wasDefault == 1) {
      const nextAddress = await CustomerAddress.findOne({
        where: { customer_id: customerId },
        order: [['created_at', 'DESC']]
      });

      if (nextAddress) {
        await nextAddress.update({ is_default: 1 });
      }
    }

    return res.status(200).json({
      status: 1,
      message: "Address deleted successfully"
    });
  } catch (error) {
    console.error("deleteAddress error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to delete address",
      error: error.message
    });
  }
};

// Set an address as default
exports.setDefaultAddress = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    const address = await CustomerAddress.findOne({
      where: { id, customer_id: customerId }
    });

    if (!address) {
      return res.status(200).json({
        status: 0,
        message: "Address not found"
      });
    }

    // Unset all other default addresses
    await CustomerAddress.update(
      { is_default: 0 },
      { where: { customer_id: customerId } }
    );

    // Set this one as default
    await address.update({ is_default: 1 });

    return res.status(200).json({
      status: 1,
      message: "Default address updated successfully",
      data: address
    });
  } catch (error) {
    console.error("setDefaultAddress error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to set default address",
      error: error.message
    });
  }
};
