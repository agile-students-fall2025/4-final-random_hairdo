// routes/users.js
// User profile and authentication routes
// Sprint 2: Mock authentication (no JWT/bcrypt yet - Sprint 3)

import express from 'express'
import { users, goals, getNextId, findById } from '../utils/mockData.js'

const router = express.Router()

// ============================================
// POST /api/users/register
// ============================================
router.post('/register', (req, res) => {
  const { name, email, password, year, major, fitnessLevel, preferredGym } = req.body
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'name, email, and password are required'
    })
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
      message: 'Email must contain @ symbol'
    })
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Invalid password',
      message: 'Password must be at least 6 characters long'
    })
  }
  
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'Email already registered',
      message: 'An account with this email already exists'
    })
  }
  
  const newUser = {
    id: getNextId(users),
    name,
    email,
    password,
    year: year || 'Not specified',
    major: major || 'Not specified',
    fitnessLevel: fitnessLevel || 'Beginner',
    preferredGym: preferredGym || 'Palladium',
    bio: '',
    goals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  users.push(newUser)
  
  const { password: _, ...userWithoutPassword } = newUser
  
  res.status(201).json({
    success: true,
    data: userWithoutPassword,
    message: 'User registered successfully'
  })
})

// ============================================
// POST /api/users/login
// ============================================
router.post('/login', (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'email and password are required'
    })
  }
  
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    })
  }
  
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    })
  }
  
  const { password: _, ...userWithoutPassword } = user
  
  res.json({
    success: true,
    data: userWithoutPassword,
    message: 'Login successful'
  })
})

// ============================================
// GET /api/users/:id
// ============================================
router.get('/:id', (req, res) => {
  const user = findById(users, req.params.id)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }
  
  const { password, ...userWithoutPassword } = user
  
  res.json({
    success: true,
    data: userWithoutPassword
  })
})

// ============================================
// PUT /api/users/:id
// ============================================
router.put('/:id', (req, res) => {
  const user = findById(users, req.params.id)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }
  
  const updates = req.body
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No updates provided'
    })
  }
  
  if (updates.email && !updates.email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    })
  }
  
  if (updates.email && updates.email !== user.email) {
    const existingUser = users.find(u => 
      u.email.toLowerCase() === updates.email.toLowerCase() && u.id !== user.id
    )
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use'
      })
    }
  }
  
  delete updates.id
  delete updates.password
  
  // ============================================
  // NEW: Sync goals array with Goals API
  // ============================================
  if (updates.goals && Array.isArray(updates.goals)) {
    // Remove all existing goals for this user
    const existingGoalIndices = []
    goals.forEach((g, index) => {
      if (g.userId === user.id) {
        existingGoalIndices.push(index)
      }
    })
    // Remove in reverse order to avoid index issues
    existingGoalIndices.reverse().forEach(index => {
      goals.splice(index, 1)
    })
    
    // Add new goals from profile to Goals API
    updates.goals.forEach(goalText => {
      goals.push({
        id: getNextId(goals),
        userId: user.id,
        goal: goalText,
        progress: 0
      })
    })
  }
  // ============================================
  
  Object.assign(user, updates)
  user.updatedAt = new Date().toISOString()
  
  const { password, ...userWithoutPassword } = user
  
  res.json({
    success: true,
    data: userWithoutPassword,
    message: 'Profile updated successfully'
  })
})

// ============================================
// PUT /api/users/:id/password
// ============================================
router.put('/:id/password', (req, res) => {
  const { newPassword } = req.body
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    })
  }
  
  const user = findById(users, req.params.id)
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }
  
  user.password = newPassword
  user.updatedAt = new Date().toISOString()
  
  res.json({
    success: true,
    message: 'Password updated successfully'
  })
})

// ============================================
// GET /api/users (all users)
// ============================================
router.get('/', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user)
  
  res.json({
    success: true,
    data: usersWithoutPasswords,
    count: users.length
  })
})

export default router