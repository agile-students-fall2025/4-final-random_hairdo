// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../db.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// REGISTER
router.post("/register", 
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { name, email, password, goals } = req.body;

      // Check if user exists (case-insensitive)
      const existingUser = await User.findOne({ 
        email: email.toLowerCase() 
      });
      
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: "User already exists with this email" 
        });
      }

      // Create user
      const newUser = await User.create({ 
        name, 
        email: email.toLowerCase(), 
        password,
        goals: goals || []
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          user: {
            id: newUser._id.toString(),
            email: newUser.email
          }
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      );

      // Respond with safe object (no password) and token
      res.status(201).json({ 
        success: true, 
        data: newUser.toSafeObject(),
        token: token
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Server error during registration" 
      });
    }
  }
);

// LOGIN
router.post("/login",
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Find user & select password explicitly (case-insensitive email)
      const user = await User.findOne({ 
        email: email.toLowerCase() 
      }).select("+password");
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Generate JWT - FIXED: Match middleware's expected payload structure
      const token = jwt.sign(
        { 
          user: {
            id: user._id.toString(),
            email: user.email
          }
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      );

      res.json({ 
        success: true, 
        data: user.toSafeObject(),
        token: token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during login" 
      });
    }
  }
);

export default router;