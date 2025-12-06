// ============================================
// AUTHENTICATION ROUTES
// ============================================
import express from "express"
import jwt from "jsonwebtoken"
import rateLimit from "express-rate-limit"
import { User } from "../db.js"
import { body, validationResult } from "express-validator"

const router = express.Router()

// ============================================
// RATE LIMITING (Security)
// ============================================
// Limit auth attempts to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window per IP
  message: {
    success: false,
    error: 'Too many attempts',
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// ============================================
// REGISTER NEW USER
// ============================================
/**
 * POST /api/auth/register
 * Register a new user account
 * Body: { name, email, password, goals? }
 * Returns: User data (without password) and JWT token
 * Used by: Register page
 */
router.post("/register", 
  authLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .matches(/@nyu\.edu$/i)
      .withMessage('Must be an @nyu.edu email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          error: 'Validation failed',
          message: errors.array()[0].msg, // First error message
          errors: errors.array() // All errors for debugging
        })
      }

      const { name, email, password, goals } = req.body

      // Check if user exists (case-insensitive)
      const existingUser = await User.findOne({ 
        email: email.toLowerCase() 
      })
      
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          error: 'Conflict',
          message: "An account with this email already exists" 
        })
      }

      // Create user (password will be hashed by pre-save hook)
      const newUser = await User.create({ 
        name, 
        email: email.toLowerCase(), 
        password,
        goals: goals || []
      })

      // Generate JWT token with user info
      const token = jwt.sign(
        { 
          user: {
            id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.name  // Added: Frontend needs this for display
          }
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      )

      // Respond with safe user object (no password) and token
      res.status(201).json({ 
        success: true, 
        data: newUser.toSafeObject(),
        token: token,
        message: "Registration successful"
      })

    } catch (error) {
      console.error('Registration error:', error)
      console.error('Stack trace:', error.stack)
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          success: false,
          error: 'Validation error',
          message: error.message 
        })
      }
      
      // Handle duplicate key errors (shouldn't happen due to check above, but just in case)
      if (error.code === 11000) {
        return res.status(409).json({ 
          success: false,
          error: 'Conflict',
          message: "An account with this email already exists" 
        })
      }
      
      // Generic server error
      res.status(500).json({ 
        success: false,
        error: 'Server error',
        message: "Server error during registration" 
      })
    }
  }
)

// ============================================
// LOGIN EXISTING USER
// ============================================
/**
 * POST /api/auth/login
 * Authenticate existing user
 * Body: { email, password }
 * Returns: User data (without password) and JWT token
 * Used by: Login page
 */
router.post("/login",
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          error: 'Validation failed',
          message: errors.array()[0].msg, // First error message
          errors: errors.array() // All errors for debugging
        })
      }

      const { email, password } = req.body

      // Find user & select password explicitly (case-insensitive email)
      const user = await User.findOne({ 
        email: email.toLowerCase() 
      }).select("+password")
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: 'Unauthorized',
          message: "Invalid email or password" // Generic message (don't reveal which is wrong)
        })
      }

      // Compare password using bcrypt
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          error: 'Unauthorized',
          message: "Invalid email or password" // Generic message (don't reveal which is wrong)
        })
      }

      // Generate JWT token with user info
      const token = jwt.sign(
        { 
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name  // Added: Frontend needs this for display
          }
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      )

      // Respond with safe user object (no password) and token
      res.json({ 
        success: true, 
        data: user.toSafeObject(),
        token: token,
        message: "Login successful"
      })

    } catch (error) {
      console.error('Login error:', error)
      console.error('Stack trace:', error.stack)
      
      res.status(500).json({ 
        success: false,
        error: 'Server error',
        message: "Server error during login" 
      })
    }
  }
)

export default router
