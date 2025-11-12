import express from 'express'
import { notifications, findByUserId } from '../utils/mockData.js'

const router = express.Router()

/**
 * GET /api/notifications
 * Get all notifications (admin / debugging)
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: notifications,
    message: 'All notifications retrieved successfully'
  })
})

/**
 * GET /api/notifications/user/:userId
 * Get notifications for a specific user
 * Used by: Notifications page (Settings > Notifications)
 */
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params

  const userNotifications = findByUserId(notifications, userId)

  // Optional: sort newest first
  userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.json({
    success: true,
    data: userNotifications,
    message: 'User notifications retrieved successfully'
  })
})

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 * Front-end: called when the user clicks a notification box
 */
router.put('/:id/read', (req, res) => {
  const notificationId = parseInt(req.params.id)
  const notification = notifications.find(n => n.id === notificationId)

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    })
  }

  // Mark as read (for the UI: switch from highlighted to gray)
  notification.isRead = true

  res.json({
    success: true,
    data: notification,
    message: 'Notification marked as read'
  })
})

export default router
