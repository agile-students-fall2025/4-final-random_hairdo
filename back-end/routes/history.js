// routes/history.js
// Sprint 3: MongoDB + JWT authentication for workout history

import express from 'express'
import { History } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import mongoose from 'mongoose'

const router = express.Router()

// ============================================
// GET /api/history/user/:userId
// ============================================
// Get all workouts for a user with filtering and stats
// Protected route - requires JWT authentication

router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params
    
    // Build query object for database filtering
    const query = { userId: userId }
    
    // Extract query parameters for filtering
    const { location, startDate, endDate, type } = req.query
    
    // Apply database-level filters
    if (location) {
      query.zoneName = { $regex: location, $options: 'i' }
    }
    
    if (startDate || endDate) {
      query.date = {}
      if (startDate) {
        query.date.$gte = new Date(startDate)
      }
      if (endDate) {
        query.date.$lte = new Date(endDate)
      }
    }
    
    if (type) {
      query.type = { $regex: `^${type}$`, $options: 'i' }
    }
    
    // Fetch workouts with filters applied
    const workouts = await History.find(query)
      .sort({ date: -1 })
      .lean()
    
    // Calculate summary statistics
    const stats = {
      totalWorkouts: workouts.length,
      totalMinutes: workouts.reduce((sum, w) => sum + w.duration, 0),
      totalCalories: workouts.reduce((sum, w) => sum + w.caloriesBurned, 0),
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
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        message: 'The provided workout ID is not valid'
      })
    }
    
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
    
    // Authorization check - users can only log their own workouts
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only log workouts for yourself'
      })
    }
    
    // Create workout
    const newWorkout = await History.create({
      userId,
      facilityId,
      zoneId,
      zoneName: zoneName || '',
      date: new Date(),
      duration: parseInt(duration),
      type,
      exercises: exercises || [],
      caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : 0,
      notes: notes || ''
    })
    
    res.status(201).json({
      success: true,
      data: newWorkout,
      message: 'Workout logged successfully'
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
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
// Helper Functions
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
  
  // Count all exercises across all workouts
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