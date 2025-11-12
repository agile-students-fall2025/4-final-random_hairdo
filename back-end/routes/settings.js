import express from 'express'
import {
  users,
  queues,
  goals,
  history,
  notifications,
  supportIssues
} from '../utils/mockData.js'

const router = express.Router()

// Optional: simple root route for sanity checks
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Settings API is running'
  })
})

/**
 * DELETE /api/settings/account/:userId
 * Deletes a user account and associated data from mock storage.
 * Used by: Settings page → "Delete Account" button
 */
router.delete('/account/:userId', (req, res) => {
  const userId = parseInt(req.params.userId)

  // 1. Remove user
  const userIndex = users.findIndex(u => u.id === userId)
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }

  const deletedUser = users[userIndex]
  users.splice(userIndex, 1)

  // Helper to remove items with matching userId from an array
  const deleteByUserId = (arr) => {
    let removed = 0
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].userId === userId) {
        arr.splice(i, 1)
        removed++
      }
    }
    return removed
  }

  const removedQueues = deleteByUserId(queues)
  const removedGoals = deleteByUserId(goals)
  const removedHistory = deleteByUserId(history)
  const removedNotifications = deleteByUserId(notifications)
  const removedSupportIssues = deleteByUserId(supportIssues)

  res.json({
    success: true,
    message: 'Account deleted successfully',
    data: {
      user: { id: deletedUser.id, email: deletedUser.email, name: deletedUser.name },
      removedRecords: {
        queues: removedQueues,
        goals: removedGoals,
        history: removedHistory,
        notifications: removedNotifications,
        supportIssues: removedSupportIssues
      }
    }
  })
})

export default router
