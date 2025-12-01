// routes/helpsupp.js
import express from 'express'
import { body, validationResult } from 'express-validator'
import { FAQ, SupportIssue } from '../db.js'

const router = express.Router()

/**
 * GET /api/support/faqs
 * Get FAQ content for the Help & Support page
 * Optional query: ?category=Account (filters by FAQ category, case-insensitive)
 * Used by: Help & Support page (FAQ accordion)
 */
router.get('/faqs', async (req, res) => {
  try {
    const { category } = req.query

    const query = {}
    if (category) {
      // case-insensitive match
      query.category = new RegExp(`^${category}$`, 'i')
    }

    // sort by order ascending (same as before)
    const faqs = await FAQ.find(query).sort({ order: 1 })

    res.json({
      success: true,
      data: faqs,
      message: 'FAQs retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

/**
 * GET /api/support/issues/user/:userId
 * Get previously submitted support issues for a specific user
 * (Optional - handy for debugging or a "My tickets" page later)
 */
router.get('/issues/user/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const issues = await SupportIssue
      .find({ userId })
      .sort({ createdAt: -1 }) // newest first

    res.json({
      success: true,
      data: issues,
      message: 'User support issues retrieved successfully'
    })
  } catch (error) {
    // CastError if userId is not a valid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId'
      })
    }

    console.error('Error fetching support issues:', error)
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

/**
 * POST /api/support/issues
 * Submit a support issue from the Help & Support form
 * Expected body:
 *   { userId, message, subject?, category?, priority? }
 * Used by: Help & Support page → "Report an Issue" form
 */
router.post(
  '/issues',
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('message').trim().notEmpty().withMessage('message is required'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('priority must be low, medium, or high'),
    body('category')
      .optional()
      .isString()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    try {
      const { userId, message, subject, category, priority } = req.body

      // Match your SupportIssue schema enums
      const allowedCategories = ['Technical', 'Queue', 'Account', 'Feature Request', 'Other']
      const allowedPriorities = ['low', 'medium', 'high']

      const safeCategory = allowedCategories.includes(category)
        ? category
        : 'Other'

      const safePriority = allowedPriorities.includes(priority)
        ? priority
        : 'medium'

      const now = new Date()

      const newIssue = new SupportIssue({
        userId,                                           // ObjectId string from front-end
        subject: subject || 'Support request',
        description: message,
        category: safeCategory,
        status: 'open',
        priority: safePriority,
        createdAt: now,
        updatedAt: now
      })

      await newIssue.save()

      res.status(201).json({
        success: true,
        data: newIssue,
        message: 'Support issue submitted successfully'
      })
    } catch (error) {
      // invalid ObjectId for userId, etc.
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid userId'
        })
      }

      console.error('Error creating support issue:', error)
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message
      })
    }
  }
)

export default router
