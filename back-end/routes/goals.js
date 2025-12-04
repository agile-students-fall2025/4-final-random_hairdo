import express from 'express'
import { Goal } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// ----------------------
// CREATE GOAL
// POST /api/goals
// ----------------------
router.post('/', authenticate, async (req, res) => {
  try {
    console.log('CREATE GOAL - req.user:', req.user)
    console.log('CREATE GOAL - req.body:', req.body)

    const { goal } = req.body
    if (!goal) {
      return res.status(400).json({ error: 'Goal title is required' })
    }

    // Prevent duplicate goals for the same user
    const existingGoal = await Goal.findOne({ userId: req.user.id, goal })
    if (existingGoal) {
      return res.status(400).json({ error: 'Goal already exists' })
    }

    const newGoal = await Goal.create({
      userId: req.user.id,
      goal,
      progress: 0, // always initialize progress
    })

    console.log('CREATE GOAL - newGoal:', newGoal)
    res.status(201).json(newGoal)
  } catch (err) {
    console.error('Create Goal Error:', err)
    res.status(500).json({ error: 'Failed to create goal' })
  }
})

// ----------------------
// GET ALL USER GOALS
// GET /api/goals
// ----------------------
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('FETCH GOALS - req.user.id:', req.user.id)

    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 })
    console.log('FETCH GOALS - goals:', goals)

    res.json(goals)
  } catch (err) {
    console.error('Fetch Goals Error:', err)
    res.status(500).json({ error: 'Failed to fetch goals' })
  }
})

// ----------------------
// UPDATE A GOAL
// PUT /api/goals/:id
// ----------------------
router.put('/:id', authenticate, async (req, res) => {
  try {
    console.log('UPDATE GOAL - req.params.id:', req.params.id)
    console.log('UPDATE GOAL - req.user.id:', req.user.id)
    console.log('UPDATE GOAL - updates:', req.body)

    const updates = req.body

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    )

    if (!updatedGoal) {
      console.log('UPDATE GOAL - Goal not found or unauthorized')
      return res.status(404).json({ error: 'Goal not found or unauthorized' })
    }

    console.log('UPDATE GOAL - updatedGoal:', updatedGoal)
    res.json(updatedGoal)
  } catch (err) {
    console.error('Update Goal Error:', err)
    res.status(500).json({ error: 'Failed to update goal' })
  }
})

// ----------------------
// DELETE A GOAL
// DELETE /api/goals/:id
// ----------------------
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    console.log('DELETE GOAL - deletedGoal:', deletedGoal)

    if (!deletedGoal) {
      return res.status(404).json({ error: 'Goal not found or unauthorized' })
    }

    // Return the updated list after deletion
    const remainingGoals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 })
    console.log('DELETE GOAL - remainingGoals in DB:', remainingGoals)

    res.json({ 
      message: 'Goal deleted successfully', 
      remainingGoals 
    })
  } catch (err) {
    console.error('Delete Goal Error:', err)
    res.status(500).json({ error: 'Failed to delete goal' })
  }
})

// ----------------------
// CLEAR ALL GOALS
// DELETE /api/goals
// ----------------------
router.delete('/', authenticate, async (req, res) => {
  try {
    await Goal.deleteMany({ userId: req.user.id })
    console.log('CLEAR ALL GOALS - userId:', req.user.id)
    res.json({ message: 'All goals cleared successfully', remainingGoals: [] })
  } catch (err) {
    console.error('Clear All Goals Error:', err)
    res.status(500).json({ error: 'Failed to clear goals' })
  }
})

export default router
