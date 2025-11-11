// routes/users.js
// User profile routes matching 1 Profile and Edit Profile pages

import express from 'express'
import { users, findById } from '../mock-data/mockData.js'

const router = express.Router()

// ============================================
// GET /api/users/:id
// ============================================
// From Sprint 1: Profile page fetches and displays user data
// Returns: Complete user profile information

router.get('/:id', (req, res) => {
  const { id } = req.params
  
  // Use helper function 
  const user = findById(users, id)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      message: `No user exists with ID: ${id}`
    })
  }
  
  // Return user data (exclude password in real implementation)
  res.json({
    success: true,
    data: user
  })
})

// ============================================
// PUT /api/users/:id
// ============================================
// From Sprint 1: Edit Profile form updates user information
// Accepts: Partial user updates (name, email)

router.put('/:id', (req, res) => {
  const { id } = req.params
  const updates = req.body
  
  // Use helper function
  const user = findById(users, id)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      message: `No user exists with ID: ${id}`
    })
  }
  
  // Validate that at least one field is being updated
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No updates provided',
      message: 'Request body must contain at least one field to update'
    })
  }
  
  // Validate email format if email is being updated
  if (updates.email && !updates.email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
      message: 'Email must contain @ symbol'
    })
  }
  
  // Don't allow ID to be changed
  if (updates.id) {
    delete updates.id
  }
  
  // Update user (merge with existing data)
  Object.assign(user, updates)
  user.updatedAt = new Date().toISOString()
  
  res.json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  })
})

// ============================================
// GET /api/users (Get all users - for testing/admin)
// ============================================

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: users,
    count: users.length
  })
})

export default router