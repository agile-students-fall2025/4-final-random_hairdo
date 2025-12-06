// routes/history.js
// Workout history routes - Sprint 3: MongoDB + JWT authentication
import express from 'express'
import { History } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { body, param, validationResult } from 'express-validator'

const router = express.Router()

// ============================================
// IMPORTANT: Route order matters!
// /user/:userId must come BEFORE /:id
// Otherwise /user/123 would match /:id with id="user"
// ============================================

// ============================================
// GET /api/history/user/:userId
// ============================================
// Get all workouts for a user with optional filtering and statistics
// Supports query parameters: location, startDate, endDate, type

router.get('/user/:userId',
  authenticate,
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
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

      const { userId } = req.params
      
      // Authorization check - users can only view their own history
      if (req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own workout history'
        })
      }
      
      // Build query object
      const query = { userId }
      
      // Extract and apply query parameter filters
      const { location, startDate, endDate, type } = req.query
      
      // Filter by location (zoneName)
      if (location) {
        query.zoneName = { $regex: location, $options: 'i' }  // Case-insensitive search
      }
      
      // Filter by date range
      if (startDate || endDate) {
        query.date = {}
        if (startDate) {
          query.date.$gte = new Date(startDate)
        }
        if (endDate) {
          query.date.$lte = new Date(endDate)
        }
      }
      
      // Filter by workout type
      if (type) {
        query.type = { $regex: `^${type}$`, $options: 'i' }  // Case-insensitive exact match
      }
      
      // Find workouts and sort by date (newest first)
      const workouts = await History.find(query)
        .sort({ date: -1 })  // -1 for descending (newest first)
        .lean()  // Convert to plain JavaScript objects for better performance
      
      // Calculate summary statistics - Sprint 2 logic preserved
      const stats = {
        totalWorkouts: workouts.length,
        totalMinutes: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        mostFrequentGym: getMostFrequentGym(workouts),
        mostFrequentExercise: getMostFrequentExercise(workouts),
        workoutTypeBreakdown: getWorkoutTypeBreakdown(workouts)
      }
      
      res.json({
        success: true,
        data: workouts,
        stats: stats,
        count: workouts.length
      })
    } catch (error) {
      console.error('Get user history error:', error)
      
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
// GET /api/history/:id
// ============================================
// Get a specific workout by ID
// Protected route - requires JWT authentication

router.get('/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid workout ID')
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

      const { id } = req.params
      
      const workout = await History.findById(id)
      
      if (!workout) {
        return res.status(404).json({
          success: false,
          error: 'Workout not found',
          message: `No workout exists with ID: ${id}`
        })
      }
      
      // Authorization check - users can only view their own workouts
      if (workout.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own workouts'
        })
      }
      
      res.json({
        success: true,
        data: workout
      })
    } catch (error) {
      console.error('Get workout error:', error)
      
      // Handle invalid ObjectId format
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid workout ID format',
          message: `No workout exists with ID: ${req.params.id}`
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
// POST /api/history
// ============================================
// Log a new workout
// Protected route - requires JWT authentication

router.post('/',
  authenticate,
  [
    body('userId').isMongoId().withMessage('Invalid user ID'),
    body('facilityId').isMongoId().withMessage('Invalid facility ID'),
    body('zoneId').isMongoId().withMessage('Invalid zone ID'),
    body('zoneName').optional().trim().notEmpty().withMessage('Zone name cannot be empty'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('exercises').optional().isArray().withMessage('Exercises must be an array'),
    body('caloriesBurned').optional().isInt({ min: 0 }).withMessage('Calories must be non-negative'),
    body('notes').optional().trim()
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

      const { 
        userId, 
        facilityId,
        zoneId,
        zoneName,
        duration, 
        type, 
        exercises,     
        caloriesBurned, 
        notes 
      } = req.body
      
      // Authorization check - user can only log workouts for themselves
      if (req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only log workouts for yourself'
        })
      }
      
      // Create new workout
      const newWorkout = await History.create({
        userId,
        facilityId,
        zoneId,
        zoneName: zoneName || 'Unknown Zone',
        date: new Date(),  // Current date/time
        duration,
        type,
        exercises: exercises || [],  // Sprint 2 feature: exercises array
        caloriesBurned: caloriesBurned || 0,
        notes: notes || ''
      })
      
      res.status(201).json({
        success: true,
        data: newWorkout,
        message: 'Workout logged successfully'
      })
    } catch (error) {
      console.error('Log workout error:', error)
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: error.message
        })
      }
      
      // Handle invalid ObjectId references
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID format',
          message: 'One or more IDs are in invalid format'
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
// Helper Functions - Sprint 2 logic preserved
// ============================================

function getMostFrequentGym(workouts) {
  if (workouts.length === 0) return null
  
  const gymCounts = {}
  workouts.forEach(w => {
    if (w.zoneName) {
      gymCounts[w.zoneName] = (gymCounts[w.zoneName] || 0) + 1
    }
  })
  
  if (Object.keys(gymCounts).length === 0) return null
  
  return Object.entries(gymCounts)
    .sort((a, b) => b[1] - a[1])[0][0]
}

function getMostFrequentExercise(workouts) {
  if (workouts.length === 0) return null
  
  const exerciseCounts = {}
  
  // Count all exercises across all workouts - Sprint 2 feature preserved
  workouts.forEach(w => {
    if (w.exercises && Array.isArray(w.exercises)) {
      w.exercises.forEach(exercise => {
        exerciseCounts[exercise] = (exerciseCounts[exercise] || 0) + 1
      })
    }
  })
  
  if (Object.keys(exerciseCounts).length === 0) return null
  
  return Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])[0][0]
}

function getWorkoutTypeBreakdown(workouts) {
  if (workouts.length === 0) return {}
  
  const typeBreakdown = {}
  workouts.forEach(w => {
    typeBreakdown[w.type] = (typeBreakdown[w.type] || 0) + 1
  })
  
  return typeBreakdown
}

export default router
