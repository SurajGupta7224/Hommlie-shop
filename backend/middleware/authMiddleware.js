const jwt = require("jsonwebtoken");
const { User, Role, Permission } = require("../models/index");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token provided. Access denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Inject full user metadata into the request
    const user = await User.findByPk(decoded.id, {
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

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: "User account suspended or missing." });
    }

    req.user = user;
    req.userPermissions = user.role?.permissions?.map(p => p.permission_name) || [];

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
