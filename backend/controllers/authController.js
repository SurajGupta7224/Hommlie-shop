const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Role, Permission } = require("../models/index");

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({
      where: { email, status: "active" },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["permission_name"],
              through: { attributes: [] }
            }
          ]
        }
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Support plain-text (test data) and bcrypt hashed passwords
    let passwordMatch = false;
    if (user.password && user.password.startsWith("$2")) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = password === user.password;
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Extract an array of permission strings like ["MANAGE_USERS", "VIEW_DASHBOARD"]
    const permissionsInfo = user.role?.permissions?.map(p => p.permission_name) || [];

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        status: user.status,
        profile_photo: user.profile_photo,
        role: user.role,
        permissions: permissionsInfo
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = { login };
