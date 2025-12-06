// routes/history.js
// Workout history routes - Sprint 3: MongoDB + JWT authentication
import express from 'express'
import { History } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// ============================================
// GET /api/history/user/:userId
// ============================================
// Get all workouts for a user with optional filtering and statistics
// Supports query parameters: location, startDate, endDate, type

router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params
    
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
})

// ============================================
// GET /api/history/:id
// ============================================
// Get a specific workout by ID
// Protected route - requires JWT authentication

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    
    const workout = await History.findById(id)
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found',
        message: `No workout exists with ID: ${id}`
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
})

// ============================================
// POST /api/history
// ============================================
// Log a new workout
// Protected route - requires JWT authentication

router.post('/', authenticate, async (req, res) => {
  try {
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
    
    // Validation
    if (!userId || !facilityId || !zoneId || !duration || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'userId, facilityId, zoneId, duration, and type are required'
      })
    }
    
    // Validate exercises is an array if provided
    if (exercises && !Array.isArray(exercises)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid exercises format',
        message: 'exercises must be an array of strings'
      })
    }
    
    // Authorization check - user can only log workouts for themselves
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
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
})

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
