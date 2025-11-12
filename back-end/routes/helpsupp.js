// routes/helpsupp.js
import express from 'express'
import {
  faqs,
  supportIssues,
  getNextId,
  findByUserId
} from '../utils/mockData.js'

const router = express.Router()

/**
 * GET /api/support/faqs
 * Get FAQ content for the Help & Support page
 * Optional query: ?category=Account (filters by FAQ category)
 * Used by: Help & Support page (FAQ accordion)
 */
router.get('/faqs', (req, res) => {
  const { category } = req.query

  let results = faqs

  if (category) {
    results = results.filter(
      f => f.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Sort by display order
  results = [...results].sort((a, b) => a.order - b.order)

  res.json({
    success: true,
    data: results,
    message: 'FAQs retrieved successfully'
  })
})

/**
 * GET /api/support/issues/user/:userId
 * Get previously submitted support issues for a specific user
 * (Optional - handy for debugging or a "My tickets" page later)
 */
router.get('/issues/user/:userId', (req, res) => {
  const { userId } = req.params
  const userIssues = findByUserId(supportIssues, userId)

  res.json({
    success: true,
    data: userIssues,
    message: 'User support issues retrieved successfully'
  })
})

/**
 * POST /api/support/issues
 * Submit a support issue from the Help & Support form
 * Expected body:
 *   { userId, message, subject?, category?, priority? }
 * For now, front-end can just send { userId: 1, message: "text..." }
 * Used by: Help & Support page → "Report an Issue" form
 */
router.post('/issues', (req, res) => {
  const { userId, message, subject, category, priority } = req.body

  // Basic validation
  if (!userId || !message) {
    return res.status(400).json({
      success: false,
      error: 'userId and message are required'
    })
  }

  const numericUserId = parseInt(userId, 10)
  if (Number.isNaN(numericUserId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid userId'
    })
  }

  const now = new Date().toISOString()

  const newIssue = {
    id: getNextId(supportIssues),
    userId: numericUserId,
    subject: subject || 'Support request',
    description: message,
    category: category || 'General',
    status: 'open',
    priority: priority || 'medium',
    createdAt: now,
    updatedAt: now,
    resolvedAt: null
  }

  // Mock “saving” in memory
  supportIssues.push(newIssue)

  res.status(201).json({
    success: true,
    data: newIssue,
    message: 'Support issue submitted successfully'
  })
})

export default router
