import express from 'express'
import { body, validationResult } from 'express-validator'
import { Queue, Notification } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * POST /api/queues
 * Join a queue for equipment
 * Body: { userId, zoneId, facilityId?, position?, estimatedWait? }
 * Returns: Queue entry with ID and confirmation details
 * Used by: Zones page to Queue Confirmation flow
 */
router.post('/', [
  authenticate,
  body('userId').notEmpty().withMessage('userId is required'),
  body('zoneId').notEmpty().withMessage('zoneId is required')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    })
  }
  
  try {
    const { userId, zoneId, facilityId, position, estimatedWait } = req.body
    
    // Check if user already has an active queue
    const existingQueue = await Queue.findOne({
      userId,
      status: 'active'
    })
    
    if (existingQueue) {
      return res.status(409).json({
        success: false,
        error: 'User already has an active queue',
        data: existingQueue
      })
    }
    
    const newQueue = new Queue({
      userId,
      zoneId,
      facilityId: facilityId || null,
      position: position || 1,
      estimatedWait: estimatedWait || 10,
      status: 'active',
      joinedAt: new Date(),
      completedAt: null
    })
    
    await newQueue.save()
    
    // Populate references for response
    await newQueue.populate(['userId', 'zoneId', 'facilityId'])
    
    // Create a notification for joining the queue
    try {
      const notification = new Notification({
        userId: userId,
        type: 'queue_update',
        title: 'Queue Joined',
        message: `You joined the ${newQueue.zoneId.name} queue at position #${position}. Estimated wait: ${estimatedWait} minutes`,
        isRead: false,
        priority: 'medium',
        relatedId: newQueue._id,
        relatedType: 'queue'
      })
      await notification.save()
    } catch (notifError) {
      console.error('Error creating notification:', notifError)
      // Don't fail the queue join if notification fails
    }
    
    res.status(201).json({
      success: true,
      data: newQueue,
      message: 'Successfully joined queue'
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
 * GET /api/queues/:id
 * Get specific queue entry details
 * Returns: Queue position, estimated wait time, status
 * Used by: Confirmed Queue page (for real-time updates)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id)
      .populate('userId')
      .populate('zoneId')
      .populate('facilityId')
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue entry not found'
      })
    }
    
    res.json({
      success: true,
      data: queue
    })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Queue entry not found'
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

/**
 * GET /api/queues/user/:userId
 * Get all queues for a user
 * Returns: List of active and past queue entries
 * Used by: Home page (Dashboard), History page
 */
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { status } = req.query
    
    let query = { userId: req.params.userId }
    if (status) {
      query.status = status
    }
    
    const userQueues = await Queue.find(query)
      .populate('userId')
      .populate('zoneId')
      .populate('facilityId')
      .sort({ joinedAt: -1 })
    
    res.json({
      success: true,
      data: userQueues,
      count: userQueues.length
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
 * PUT /api/queues/:id
 * Update queue position or status
 * Body: { position?, estimatedWait?, status? }
 * Used by: Queue page
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id)
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue entry not found'
      })
    }
    
    const { position, estimatedWait, status } = req.body
    
    if (position !== undefined) {
      queue.position = position
      
      if (position === 0) {
        queue.estimatedWait = 0
        queue.status = 'completed'
        queue.completedAt = new Date()
      } else {
        const waitMinutes = position * 7
        queue.estimatedWait = waitMinutes
      }
    }
    
    if (estimatedWait !== undefined) {
      queue.estimatedWait = estimatedWait
    }
    
    if (status !== undefined) {
      queue.status = status
      if (status === 'completed' || status === 'cancelled') {
        queue.completedAt = new Date()
      }
    }
    
    await queue.save()
    
    // Populate references for response
    await queue.populate(['userId', 'zoneId', 'facilityId'])
    
    res.json({
      success: true,
      data: queue,
      message: 'Queue updated successfully'
    })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Queue entry not found'
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

/**
 * DELETE /api/queues/:id
 * Leave a queue
 * Used by: Confirmed Queue page (cancel button)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id)
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue entry not found'
      })
    }
    
    // Verify ownership
    if (queue.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this queue entry'
      })
    }
    
    await Queue.findByIdAndDelete(req.params.id)
    
    res.json({
      success: true,
      data: queue,
      message: 'Successfully left queue'
    })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Queue entry not found'
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
