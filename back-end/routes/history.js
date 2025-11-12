// routes/history.js
// Workout history routes matching Sprint 1 History page

import express from 'express'
import { 
  history, 
  findByUserId,
  findById,
  getNextId
} from '../utils/mockData.js'

const router = express.Router()

// ============================================
// GET /api/history/user/:userId
// ============================================
// From Sprint 1: History page displays workout data with exercises
// Supports query parameters for filtering 

router.get('/user/:userId', (req, res) => {
  const { userId } = req.params
  
  // Use helper function - it handles parseInt() internally
  let workouts = findByUserId(history, userId)
  
  // Extract query parameters for filtering
  const { location, startDate, endDate, type } = req.query
  
  // Apply filters
  if (location) {
    workouts = workouts.filter(w => 
      w.gym && w.gym.toLowerCase().includes(location.toLowerCase())
    )
  }
  
  if (startDate) {
    workouts = workouts.filter(w => 
      new Date(w.date) >= new Date(startDate)
    )
  }
  
  if (endDate) {
    workouts = workouts.filter(w => 
      new Date(w.date) <= new Date(endDate)
    )
  }
  
  if (type) {
    workouts = workouts.filter(w => 
      w.type.toLowerCase() === type.toLowerCase()
    )
  }
  
  // Sort by date (newest first)
  workouts.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  // Calculate summary statistics
  const stats = {
    totalWorkouts: workouts.length,
    totalMinutes: workouts.reduce((sum, w) => sum + w.duration, 0),
    totalCalories: workouts.reduce((sum, w) => sum + w.caloriesBurned, 0),
    mostFrequentGym: getMostFrequentGym(workouts),
    mostFrequentExercise: getMostFrequentExercise(workouts),  // ← NEW
    workoutTypeBreakdown: getWorkoutTypeBreakdown(workouts)
  }
  
  res.json({
    success: true,
    data: workouts,
    stats: stats,
    count: workouts.length
  })
})

// ============================================
// GET /api/history/:id
// ============================================
// Get a specific workout by ID

router.get('/:id', (req, res) => {
  const { id } = req.params
  
  // Use helper function - it handles parseInt() internally
  const workout = findById(history, id)
  
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
})

// ============================================
// POST /api/history
// ============================================
// Log a new workout with exercises

router.post('/', (req, res) => {
  const { 
    userId, 
    gym, 
    gymLocation,
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
  if (!userId || !gym || !duration || !type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'userId, gym, duration, and type are required'
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
  
  // Create workout with number IDs
  const newWorkout = {
    id: getNextId(history),
    userId: parseInt(userId),
    facilityId: facilityId ? parseInt(facilityId) : null,
    zoneId: zoneId ? parseInt(zoneId) : null,
    zoneName: zoneName || null,
    gym,
    gymLocation: gymLocation || '',
    date: new Date().toISOString(),
    duration: parseInt(duration),
    type,
    exercises: exercises || [],  // ← CRITICAL: Store exercises array
    caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : 0,
    notes: notes || '',
    createdAt: new Date().toISOString()
  }
  
  history.push(newWorkout)
  
  res.status(201).json({
    success: true,
    data: newWorkout,
    message: 'Workout logged successfully'
  })
})

// ============================================
// Helper Functions
// ============================================

function getMostFrequentGym(workouts) {
  if (workouts.length === 0) return null
  
  const gymCounts = {}
  workouts.forEach(w => {
    if (w.gym) {
      gymCounts[w.gym] = (gymCounts[w.gym] || 0) + 1
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