// routes/settings.js
import express from 'express'
import {
  User,
  Queue,
  Goal,
  History,
  Notification,
  SupportIssue
} from '../db.js'

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
 * Deletes a user account and associated data from MongoDB.
 * Used by: Settings page → "Delete Account" button
 */
router.delete('/account/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    // 1. Find the user first (so we can return their info)
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Copy what we want to return before deletion
    const deletedUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    }

    // 2. Delete user and all related records
    const [
      userResult,
      queueResult,
      goalResult,
      historyResult,
      notificationResult,
      supportIssueResult
    ] = await Promise.all([
      User.deleteOne({ _id: userId }),
      Queue.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      History.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      SupportIssue.deleteMany({ userId })
    ])

    // userResult.deletedCount should be 1 if deletion succeeded
    if (userResult.deletedCount === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      })
    }

    res.json({
      success: true,
      message: 'Account deleted successfully',
      data: {
        user: deletedUser,
        removedRecords: {
          queues: queueResult.deletedCount || 0,
          goals: goalResult.deletedCount || 0,
          history: historyResult.deletedCount || 0,
          notifications: notificationResult.deletedCount || 0,
          supportIssues: supportIssueResult.deletedCount || 0
        }
      }
    })
  } catch (error) {
    // Invalid ObjectId (e.g. random string) → 400
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId'
      })
    }

    console.error('Error deleting account:', error)
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

export default router
