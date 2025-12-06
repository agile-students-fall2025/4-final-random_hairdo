import express from 'express'
import { Goal, User } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// ----------------------
// CREATE GOAL
// POST /api/goals
// ----------------------
router.post(
  '/',
  authenticate,
  [
    body('goal')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Goal title is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: errors.array()[0].msg,
          errors: errors.array()
        })
      }

      const { goal } = req.body
      const userId = req.user.id

      // Prevent duplicates
      const existingGoal = await Goal.findOne({ userId, goal })
      if (existingGoal) {
        return res.status(400).json({ success: false, error: 'Goal already exists' })
      }

      const newGoal = await Goal.create({ userId, goal, progress: 0 })

      // Update user's goals array
      await User.findByIdAndUpdate(userId, { $push: { goals: goal } })

      res.status(201).json(newGoal)
    } catch (err) {
      console.error('Create Goal Error:', err)
      res.status(500).json({ success: false, error: 'Failed to create goal' })
    }
  }
)

// ----------------------
// GET ALL USER GOALS
// GET /api/goals
// ----------------------
router.get('/', authenticate, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json(goals)
  } catch (err) {
    console.error('Fetch Goals Error:', err)
    res.status(500).json({ success: false, error: 'Failed to fetch goals' })
  }
})

// ----------------------
// UPDATE A GOAL
// PUT /api/goals/:id
// ----------------------
router.put(
  '/:id',
  authenticate,
  [body('goal').optional().trim().isLength({ min: 1 }).withMessage('Goal title is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: errors.array()[0].msg
        })
      }

      const updates = req.body
      const goal = await Goal.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        updates,
        { new: true }
      )

      if (!goal) {
        return res.status(404).json({ success: false, error: 'Goal not found or unauthorized' })
      }

      // Sync user's goals array if title changed
      if (updates.goal) {
        const user = await User.findById(req.user.id);
        const oldGoalTitle = await Goal.findById(req.params.id).then(g => g.goal);
        const idx = user.goals.indexOf(oldGoalTitle);
        if (idx !== -1) {
          user.goals[idx] = updates.goal;
          await user.save();
        }
      }

      res.json(goal)
    } catch (err) {
      console.error('Update Goal Error:', err)
      res.status(500).json({ success: false, error: 'Failed to update goal' })
    }
  }
)

// ----------------------
// DELETE A GOAL
// DELETE /api/goals/:id
// ----------------------
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' })

    // Remove from user's goals array
    await User.findByIdAndUpdate(req.user.id, { $pull: { goals: goal.goal } })

    const remainingGoals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json({ message: 'Goal deleted successfully', remainingGoals })
  } catch (err) {
    console.error('Delete Goal Error:', err)
    res.status(500).json({ success: false, error: 'Failed to delete goal' })
  }
})

// ----------------------
// CLEAR ALL GOALS
// DELETE /api/goals
// ----------------------
router.delete('/', authenticate, async (req, res) => {
  try {
    await Goal.deleteMany({ userId: req.user.id })
    await User.findByIdAndUpdate(req.user.id, { $set: { goals: [] } })
    res.json({ message: 'All goals cleared', remainingGoals: [] })
  } catch (err) {
    console.error('Clear Goals Error:', err)
    res.status(500).json({ success: false, error: 'Failed to clear goals' })
  }
})

export default router
