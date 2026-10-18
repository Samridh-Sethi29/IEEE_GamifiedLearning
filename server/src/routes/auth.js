const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  sanitizeString,
  validateEmail,
  validateUsername,
  validatePassword,
} = require("../utils/validator");

const router = express.Router();

function createToken(userId) {
  const secret = process.env.JWT_SECRET || "super_secret_jwt_key_change_in_production";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  // Payload includes ONLY userId as required
  return jwt.sign({ userId }, secret, { expiresIn });
}

// POST /api/auth/register
router.post("/register", authLimiter, async (req, res) => {
  try {
    const rawUsername = sanitizeString(req.body.username);
    const rawEmail = sanitizeString(req.body.email).toLowerCase();
    const rawPassword = typeof req.body.password === "string" ? req.body.password : "";

    // Validations
    if (!validateUsername(rawUsername)) {
      return res.status(400).json({
        error: "Username must be 3-30 characters long and can contain letters, numbers, hyphens, and underscores.",
      });
    }

    if (!validateEmail(rawEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    if (!validatePassword(rawPassword)) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long.",
      });
    }

    // Check existing email and username (strictly sanitized string values to prevent injection)
    const existingEmail = await User.findOne({ email: { $eq: rawEmail } }).lean();
    if (existingEmail) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const existingUsername = await User.findOne({ username: { $eq: rawUsername } }).lean();
    if (existingUsername) {
      return res.status(409).json({
        error: "That username is already taken. Try another one!",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const user = new User({
      username: rawUsername,
      email: rawEmail,
      passwordHash,
    });

    await user.save();

    const token = createToken(user._id.toString());

    return res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[Register Error]:", error);
    return res.status(500).json({
      error: "Something went wrong creating your account. Please try again.",
    });
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, async (req, res) => {
  try {
    const rawEmail = sanitizeString(req.body.email).toLowerCase();
    const rawPassword = typeof req.body.password === "string" ? req.body.password : "";

    if (!rawEmail || !rawPassword) {
      return res.status(400).json({
        error: "Please provide both email and password.",
      });
    }

    // Generic error helper to avoid leaking account existence
    const genericAuthError = () =>
      res.status(401).json({
        error: "Invalid email or password. Please try again.",
      });

    // Query using $eq to prevent NoSQL injection
    const user = await User.findOne({ email: { $eq: rawEmail } });
    if (!user) {
      return genericAuthError();
    }

    const isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
    if (!isMatch) {
      return genericAuthError();
    }

    const token = createToken(user._id.toString());

    return res.json({
      message: "Welcome back!",
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[Login Error]:", error);
    return res.status(500).json({
      error: "Something went wrong logging in. Please try again.",
    });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  return res.json({
    user: {
      id: req.user.userId,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

module.exports = router;
