// routes/users.js
// User profile and authentication routes
// Migrated to MongoDB + JWT for Sprint 3

import express from 'express'
import { User } from '../db.js' // Mongoose User model
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

// ============================================
// POST /api/users/register
// ============================================
router.post('/register', async (req, res) => {
  try {
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

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
        message: 'An account with this email already exists'
      })
    }

    const newUser = new User({
      name,
      email,
      password,
      year: year || 'Not specified',
      major: major || 'Not specified',
      fitnessLevel: fitnessLevel || 'Beginner',
      preferredGym: preferredGym || 'Palladium',
      bio: '',
      goals: []
    })

    await newUser.save()

    const token = generateToken(newUser)

    res.status(201).json({
      success: true,
      data: newUser.toSafeObject(),
      token,
      message: 'User registered successfully'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ============================================
// POST /api/users/login
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'email and password are required'
      })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      })
    }

    const token = generateToken(user)

    res.json({
      success: true,
      data: user.toSafeObject(),
      token,
      message: 'Login successful'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ============================================
// GET /api/users/:id
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    res.json({ success: true, data: user.toSafeObject() })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ============================================
// PUT /api/users/:id
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email })
      if (existingUser) return res.status(409).json({ success: false, error: 'Email already in use' })
    }

    // Prevent overriding password/id directly
    delete updates.password
    delete updates._id

    // Sync goals if provided
    if (updates.goals && Array.isArray(updates.goals)) {
      user.goals = updates.goals.map(goal => ({ goal, progress: 0 }))
      delete updates.goals
    }

    Object.assign(user, updates)
    await user.save()

    res.json({ success: true, data: user.toSafeObject(), message: 'Profile updated successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ============================================
// PUT /api/users/:id/password
// ============================================
router.put('/:id/password', async (req, res) => {
  try {
    const { newPassword } = req.body
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' })
    }

    const user = await User.findById(req.params.id).select('+password')
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// ============================================
// GET /api/users (all users)
// ============================================
router.get('/', async (req, res) => {
  try {
    const allUsers = await User.find()
    res.json({
      success: true,
      data: allUsers.map(u => u.toSafeObject()),
      count: allUsers.length
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router
