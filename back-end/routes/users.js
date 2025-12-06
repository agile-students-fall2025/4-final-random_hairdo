// routes/users.js
// User profile routes - Sprint 3: MongoDB + JWT authentication
import express from 'express'
import { User, Goal } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { body, param, validationResult } from 'express-validator'

const router = express.Router()

// ============================================
// NOTE: Register and Login are now in auth.js
// These routes were moved to /api/auth/register and /api/auth/login
// ============================================

// ============================================
// GET /api/users (all users)
// Get all users - Admin only (for now, just protected)
// ============================================
router.get('/', authenticate, async (req, res) => {
  try {
    // Find all users - password excluded by default
    const users = await User.find()
    
    // Convert to safe objects (no passwords)
    const usersWithoutPasswords = users.map(u => u.toSafeObject())
    
    res.json({
      success: true,
      data: usersWithoutPasswords,
      count: users.length
    })
  } catch (error) {
    console.error('Get all users error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

// ============================================
// GET /api/users/:id
// Get user profile by ID
// ============================================
router.get('/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid user ID')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: errors.array()[0].msg
        })
      }

      // Find user by ID - password excluded by default (select: false in schema)
      const user = await User.findById(req.params.id)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }
      
      // Authorization check - users can only view their own profile
      if (req.user.id !== req.params.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own profile'
        })
      }
      
      res.json({
        success: true,
        data: user.toSafeObject()
      })
    } catch (error) {
      console.error('Get user error:', error)
      
      // Handle invalid ObjectId format
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID format'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message
      })
    }
  }
)

// ============================================
// PUT /api/users/:id
// Update user profile
// ============================================
router.put('/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email')
      .normalizeEmail(),
    body('goals')
      .optional()
      .isArray()
      .withMessage('Goals must be an array'),
    body('goals.*')
      .optional()
      .isString()
      .withMessage('Each goal must be a string')
  ],
  async (req, res) => {
    try {
      // Check validation errors first
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: errors.array()[0].msg,
          errors: errors.array()
        })
      }

      // Find user by ID
      const user = await User.findById(req.params.id)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }
      
      // Check authorization - users can only update their own profile
      if (req.user.id !== req.params.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only update your own profile'
        })
      }
      
      const updates = req.body
      
      // Validate updates exist
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No updates provided'
        })
      }
      
      // Check for duplicate email - Sprint 2 logic preserved
      if (updates.email && updates.email !== user.email) {
        const existingUser = await User.findOne({ 
          email: updates.email.toLowerCase(),
          _id: { $ne: user._id }  // Exclude current user
        })
        
        if (existingUser) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: 'Email already in use'
          })
        }
      }
      
      // Protect sensitive fields - Sprint 2 logic preserved
      delete updates._id
      delete updates.password
      delete updates.createdAt
      delete updates.updatedAt
      
      // ============================================
      // GOALS SYNCHRONIZATION - Sprint 2 feature preserved
      // ============================================
      if (updates.goals && Array.isArray(updates.goals)) {
        // Remove all existing goals for this user from Goals collection
        await Goal.deleteMany({ userId: user._id })
        
        // Create new goals in Goals collection
        const goalPromises = updates.goals.map(goalText => {
          return Goal.create({
            userId: user._id,
            goal: goalText.trim(),
            progress: 0
          })
        })
        
        await Promise.all(goalPromises)
      }
      // ============================================
      
      // Update user fields
      Object.assign(user, updates)
      
      // Save user (triggers updatedAt timestamp automatically)
      await user.save()
      
      res.json({
        success: true,
        data: user.toSafeObject(),
        message: 'Profile updated successfully'
      })
    } catch (error) {
      console.error('Update user error:', error)
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: error.message
        })
      }
      
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID format'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message
      })
    }
  }
)

// ============================================
// PUT /api/users/:id/password
// Change user password
// ============================================
router.put('/:id/password',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: errors.array()[0].msg,
          errors: errors.array()
        })
      }

      const { currentPassword, newPassword } = req.body
      
      // Check authorization
      if (req.user.id !== req.params.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only change your own password'
        })
      }
      
      // Find user WITH password field (normally excluded)
      const user = await User.findById(req.params.id).select('+password')
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }
      
      // Verify current password
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Current password is incorrect'
        })
      }
      
      // Set new password (will be hashed by pre-save hook)
      user.password = newPassword
      
      // Save user (triggers password hashing)
      await user.save()
      
      res.json({
        success: true,
        message: 'Password updated successfully'
      })
    } catch (error) {
      console.error('Change password error:', error)
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID format'
        })
      }
      
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message
      })
    }
  }
)

export default router