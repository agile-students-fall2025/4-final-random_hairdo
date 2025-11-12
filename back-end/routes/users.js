// routes/users.js
// User profile and authentication routes
// Sprint 2: Mock authentication (no JWT/bcrypt yet)

import express from 'express'
import { users, findById, getNextId } from '../mock-data/mockData.js'

const router = express.Router()

// ============================================
// POST /api/users/register
// ============================================
// Register a new user account
// Sprint 2: Mock registration - stores in-memory, no password hashing yet

router.post('/register', (req, res) => {
  const { name, email, password, year, major, fitnessLevel, preferredGym } = req.body
  
  // Validation: Required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'name, email, and password are required'
    })
  }
  
  // Validation: Email format
  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
      message: 'Email must contain @ symbol'
    })
  }
  
  // Validation: Password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Invalid password',
      message: 'Password must be at least 6 characters long'
    })
  }
  
  // Check if email already exists
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'Email already registered',
      message: 'An account with this email already exists'
    })
  }
  
  // Create new user
  // Sprint 2: Password stored as plain text (will hash in Sprint 3)
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
    password,  // WARNING: Plain text for now - will hash in Sprint 3
    year: year || 'Not specified',
    major: major || 'Not specified',
    fitnessLevel: fitnessLevel || 'Beginner',
    preferredGym: preferredGym || 'Palladium',
    bio: '',
    password, // in real app you'd hash this
    goals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  users.push(newUser)
  
  // Return user data (exclude password)
  const { password: _, ...userWithoutPassword } = newUser
  
  res.status(201).json({
    success: true,
    data: userWithoutPassword,
    message: 'User registered successfully'
    // Sprint 3 will add: token: '...'
  })
})

// ============================================
// POST /api/users/login
// ============================================
// Login existing user
// Sprint 2: Mock login - no token yet, just validates credentials

router.post('/login', (req, res) => {
  const { email, password } = req.body
  
  // Validation: Required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'email and password are required'
    })
  }
  
  // Find user by email (case-insensitive)
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    })
  }
  
  // Check password
  // Sprint 2: Plain text comparison (IMPORTANT: Comparison of passwords not protected - will do in Sprint 3)
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    })
  }
  
  // Login successful
  // Return user data (exclude password)
  const { password: _, ...userWithoutPassword } = user
  
  res.json({
    success: true,
    data: userWithoutPassword,
    message: 'Login successful'
    // Sprint 3 will add: token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET)
  })
})

// ============================================
// GET /api/users/:id
// ============================================
// Get user profile by ID
// From Sprint 1: Profile page fetches and displays user data

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
  
  // Return user data (exclude password)
  const { password, ...userWithoutPassword } = user
  
  res.json({
    success: true,
    data: userWithoutPassword
  })
})

// ============================================
// PUT /api/users/:id
// ============================================
// Update user profile
// From Sprint 1: Edit Profile form updates user information

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
  
  // Check if new email already exists (if changing email)
  if (updates.email && updates.email !== user.email) {
    const existingUser = users.find(u => 
      u.email.toLowerCase() === updates.email.toLowerCase() && u.id !== user.id
    )
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use',
        message: 'Another account is using this email address'
      })
    }
  }
  
  // Don't allow ID or password to be changed via this route
  delete updates.id
  delete updates.password  // Password change should have separate route
  
  // Update user (merge with existing data)
  Object.assign(user, updates)
  user.updatedAt = new Date().toISOString()
  
  // Return updated user (exclude password)
  const { password, ...userWithoutPassword } = user
  
  res.json({
    success: true,
    data: userWithoutPassword,
    message: 'Profile updated successfully'
  })
})

// ============================================
// GET /api/users (Get all users - for testing/admin)
// ============================================

router.get('/', (req, res) => {
  // Return all users without passwords
  const usersWithoutPasswords = users.map(({ password, ...user }) => user)
  
  res.json({
    success: true,
    data: usersWithoutPasswords,
    count: users.length
  })
})

export default router

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
