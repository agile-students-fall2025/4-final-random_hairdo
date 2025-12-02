import express from 'express'
import { Notification } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/notifications
 * Get all notifications (admin / debugging)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const allNotifications = await Notification.find()
      .populate('userId')
      .sort({ createdAt: -1 })
    
    res.json({
      success: true,
      data: allNotifications,
      message: 'All notifications retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

/**
 * GET /api/notifications/user/:userId
 * Get notifications for a specific user
 * Used by: Notifications page (Settings > Notifications)
 */
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params
    
    const userNotifications = await Notification.find({ userId })
      .populate('userId')
      .sort({ createdAt: -1 })
    
    res.json({
      success: true,
      data: userNotifications,
      message: 'User notifications retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 * Front-end: called when the user clicks a notification box
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      })
    }
    
    notification.isRead = true
    await notification.save()
    
    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

export default router
