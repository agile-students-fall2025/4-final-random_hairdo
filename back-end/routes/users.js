// routes/users.js
import express from 'express'
import {
  users,
  getNextId,
  findById
} from '../utils/mockData.js'

const router = express.Router()

/**
 * GET /api/users
 * Get all users (admin / debugging)
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: users,
    message: 'Users retrieved successfully'
  })
})

/**
 * GET /api/users/:id
 * Get a single user profile
 * Used by: Profile page
 */
router.get('/:id', (req, res) => {
  const user = findById(users, req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }

  res.json({
    success: true,
    data: user
  })
})

/**
 * POST /api/users
 * Register a new user account
 * Body: { name, email, password }
 * Used by: Register page
 */
router.post('/', (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'name, email, and password are required'
    })
  }

  const newUser = {
    id: getNextId(users),
    name,
    email,
    password, // in real app you'd hash this
    goals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  users.push(newUser)

  res.status(201).json({
    success: true,
    data: newUser,
    message: 'User registered successfully'
  })
})

/**
 * PUT /api/users/:id
 * Update user profile (name, email, goals)
 * Body: { name?, email?, goals? }
 * Used by: Edit Profile / Goals pages
 */
router.put('/:id', (req, res) => {
  const user = findById(users, req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }

  const { name, email, goals } = req.body

  if (name) user.name = name
  if (email) user.email = email
  if (goals) user.goals = goals

  user.updatedAt = new Date().toISOString()

  res.json({
    success: true,
    data: user,
    message: 'User profile updated successfully'
  })
})

/**
 * PUT /api/users/:id/password
 * Change user password
 * Body: { newPassword }
 * Used by: Settings → Change Password page
 */
router.put('/:id/password', (req, res) => {
  const userId = parseInt(req.params.id, 10)
  const { newPassword } = req.body

  if (!newPassword || newPassword.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'newPassword is required'
    })
  }

  // simple length check for demo purposes
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    })
  }

  const user = users.find(u => u.id === userId)

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }

  // In a real app you would hash the password.
  // For mock data we just store it directly.
  user.password = newPassword
  user.updatedAt = new Date().toISOString()

  res.json({
    success: true,
    message: 'Password updated successfully',
    data: {
      id: user.id,
      email: user.email,
      updatedAt: user.updatedAt
    }
  })
})

export default router
