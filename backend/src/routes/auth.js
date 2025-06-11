const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

// Ensure JWT_SECRET is available
const JWT_SECRET = process.env.JWT_SECRET || "ozarx_job_portal_secret_key_2024";

// @route   GET api/auth/users
// @desc    Get all registered users
// @access  Public
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      success: true,
      count: users.length,
      users: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please include a valid email").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("name").notEmpty().withMessage("Name is required").trim(),
    body("role").optional().isIn(["admin", "employer", "candidate"]).withMessage("Invalid role"),
    body("company").optional().trim(),
  ],
  async (req, res) => {
    try {
      console.log("Registration request body:", req.body);

      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          errors: errors.array().map((err) => ({
            field: err.param,
            message: err.msg,
          })),
        });
      }

      const { name, email, password, role, company } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        console.log("User already exists:", email);
        return res.status(400).json({
          success: false,
          message: "User already exists with this email address.",
          errors: [{ field: "email", message: "Email already registered" }],
        });
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
        role: role || "candidate",
        company: company || "",
      });

      await user.save();
      console.log("User created successfully:", email);

      // Create JWT token
      const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: "24h" });

      res.json({
        success: true,
        message: "Registration successful! Welcome to Job Portal.",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      });
    } catch (err) {
      console.error("Registration error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      console.log("Login request body:", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          errors: errors.array().map((err) => ({
            field: err.param,
            message: err.msg,
          })),
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found:", email);
        return res.status(400).json({
          success: false,
          message: "No user found with this email address.",
          errors: [{ field: "email", message: "Email not registered" }],
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log("Invalid password for user:", email);
        return res.status(400).json({
          success: false,
          message: "Invalid password. Please try again.",
          errors: [{ field: "password", message: "Invalid password" }],
        });
      }

      // Create JWT token
      const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: "24h" });

      res.json({
        success: true,
        message: "Login successful! Welcome back.",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      });
    } catch (err) {
      console.error("Login error:", err.message);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current user data
// @access  Private
router.get("/me", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided. Please log in.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please try logging in again.",
      });
    }

    res.json({
      success: true,
      message: "User data retrieved successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (err) {
    console.error("Error fetching user data:", err.message);
    res.status(401).json({
      success: false,
      message: "Invalid authentication token. Please log in again.",
    });
  }
});

module.exports = router;
