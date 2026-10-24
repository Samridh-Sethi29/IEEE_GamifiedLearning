const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication token required. Please log in.",
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "super_secret_jwt_key_change_in_production";

  try {
    const decoded = jwt.verify(token, secret);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Invalid token payload.",
      });
    }

    // Optional user verification to ensure user hasn't been deleted
    const user = await User.findById(decoded.userId).select("-passwordHash").lean();
    if (!user) {
      return res.status(401).json({
        error: "Account not found or session has expired.",
      });
    }

    req.user = {
      _id: user._id.toString(),
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Your session has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      error: "Invalid authentication token.",
    });
  }
};

module.exports = authMiddleware;
