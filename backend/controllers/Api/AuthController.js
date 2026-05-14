const jwt = require("jsonwebtoken");
const axios = require("axios");
const { Customer } = require("../../models/index");

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || "403754ASWGpJz366b09ec2P1";
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID || "67d0065ad6fc055648017574";
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

exports.registerOrLogin = async (req, res) => {
  const { mobile } = req.body;

  try {
    if (!mobile) {
      return res.status(200).json({
        status: 0,
        message: "Mobile is required"
      });
    }

    let user = await Customer.findOne({ where: { mobile } });

    // Add +91 country code for MSG91 API
    const mobileWithCountry = mobile.startsWith('+') ? mobile : `+91${mobile}`;

    // Check if user is deactivated
    if (user && user.status === 0) {
      return res.status(403).json({
        status: 0,
        message: "Your account is deactivated. Please contact support."
      });
    }

    const options = {
      method: "POST",
      url: "https://control.msg91.com/api/v5/otp",
      params: {
        otp_expiry: "3",
        template_id: MSG91_TEMPLATE_ID,
        mobile: mobileWithCountry,
        authkey: MSG91_AUTH_KEY,
        realTimeResponse: "1",
      },
      headers: { "Content-Type": "application/JSON" },
    };

    const response = await axios.request(options);

    if (response.data.type === "success") {
      return res.status(200).json({
        status: 1,
        message: response.data,
        mobile: mobile,
        user_name: user ? user.name : null,
      });
    } else {
      // Handle specific MSG91 errors
      let errorMsg = response.data.message;
      if (errorMsg?.includes('last_otp_request') || errorMsg?.includes('invalid')) {
        errorMsg = "Please wait 1-3 minutes before requesting another OTP";
      }
      return res.status(200).json({
        status: 0,
        message: errorMsg || "Failed to send OTP"
      });
    }

  } catch (error) {
    console.error("registerOrLogin error:", error);
    return res.status(500).json({
      status: 0,
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { mobile, otp, name, app_token, session_id } = req.body;

  if (!mobile || !otp) {
    return res.status(200).json({
      status: 0,
      message: "Mobile and OTP are required"
    });
  }

  // Add +91 country code for MSG91 API
  const mobileWithCountry = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  try {
    let user = await Customer.findOne({ where: { mobile } });

    // Create user if not exists
    if (!user) {
      user = await Customer.create({
        name: name || null,
        mobile,
        is_verified: 1,
        token: app_token || null,
        status: 1
      });
    }

    // Update token
    if (app_token) {
      await Customer.update({ token: app_token }, { where: { id: user.id } });
    }

    const options = {
      method: "GET",
      url: "https://control.msg91.com/api/v5/otp/verify",
      params: {
        otp: otp,
        mobile: mobileWithCountry
      },
      headers: {
        authkey: MSG91_AUTH_KEY
      },
    };

    const response = await axios.request(options);

    if (response.data.type === "success") {
      // MERGE CART: If session_id is provided, associate guest cart items with this user
      if (session_id) {
        const { Cart } = require("../../models/index");
        await Cart.update(
          { customer_id: user.id },
          { where: { session_id: session_id, customer_id: null } }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          mobile: user.mobile,
          name: user.name
        },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      const baseUrl = process.env.APP_URL || 'http://localhost:5000';
      const profilePicUrl = user.profile_pic ? `${baseUrl}/uploads/ProfilePics/${user.profile_pic}` : null;

      return res.status(200).json({
        status: 1,
        message: response.data.message,
        token,
        user_id: user.id,
        user_name: user.name,
        mobile: user.mobile,
        email: user.email,
        profile_pic: profilePicUrl
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: response.data.message
      });
    }
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({
      status: 0,
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.reSendOtp = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(200).json({
      status: 0,
      message: "Mobile number is required"
    });
  }

  try {
    const options = {
      method: "GET",
      url: "https://control.msg91.com/api/v5/otp/retry",
      params: {
        authkey: MSG91_AUTH_KEY,
        retrytype: "text",
        mobile: mobile,
      },
    };

    const response = await axios.request(options);

    if (response.data.type === "success") {
      return res.status(200).json({
        status: 1,
        message: response.data.message,
        mobile: mobile,
      });
    } else {
      return res.status(200).json({
        status: 0,
        message: response.data.message
      });
    }
  } catch (error) {
    console.error("reSendOtp error:", error);
    return res.status(500).json({
      status: 0,
      message: "OTP resend failed",
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  const { user_id, name, email, session_id } = req.body;

  if (!user_id || !name) {
    return res.status(200).json({
      status: 0,
      message: "User ID and name are required"
    });
  }

  try {
    const updateData = { name };
    if (email !== undefined) {
      updateData.email = email;
    }
    
    if (req.file) {
      updateData.profile_pic = req.file.filename;
    }
    
    await Customer.update(updateData, { where: { id: user_id } });

    // MERGE CART: If session_id is provided, associate guest cart items with this user
    if (session_id) {
      const { Cart } = require("../../models/index");
      await Cart.update(
        { customer_id: user_id },
        { where: { session_id: session_id, customer_id: null } }
      );
    }
    
    const user = await Customer.findOne({ where: { id: user_id } });

    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const profilePicUrl = user.profile_pic ? `${baseUrl}/uploads/ProfilePics/${user.profile_pic}` : null;

    return res.status(200).json({
      status: 1,
      message: "Profile updated successfully",
      user_name: user.name,
      user_id: user.id,
      mobile: user.mobile,
      email: user.email,
      profile_pic: profilePicUrl
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to update profile",
      error: error.message
    });
  }
};
