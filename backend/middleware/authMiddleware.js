const jwt = require("jsonwebtoken");
const { User, Role, Permission, Customer } = require("../models/index");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token provided. Access denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try finding in User table first (Admin/Seller)
    let user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: "role",
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["permission_name"],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    let userType = 'user';

    // If not found in User, try Customer table (Storefront)
    if (!user) {
      user = await Customer.findByPk(decoded.id);
      userType = 'customer';
    }

    if (!user) {
      return res.status(401).json({ message: "User account missing." });
    }

    // Check status (handle both 'active' string for User and 1 for Customer)
    const isActive = userType === 'user' ? user.status === 'active' : user.status == 1;
    if (!isActive) {
      return res.status(401).json({ message: "User account suspended." });
    }

    req.user = user;
    req.userType = userType;
    req.userPermissions = userType === 'user' ? (user.role?.permissions?.map(p => p.permission_name) || []) : [];

    next();
  } catch (err) {
    console.error("verifyToken auth block err", err);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Returns a middleware configured for a specific permission block
const requirePermission = (requiredPermissionString) => {
  return (req, res, next) => {
    // Strict permission check, no automatic role bypasses
    if (!req.userPermissions.includes(requiredPermissionString)) {
      return res.status(403).json({ 
        message: "Forbidden Interface: You do not have the required permissions.",
        required: requiredPermissionString
      });
    }

    next();
  };
};

module.exports = { verifyToken, requirePermission };
