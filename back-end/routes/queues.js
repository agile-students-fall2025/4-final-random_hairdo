import express from 'express'
import { body, param, validationResult } from 'express-validator'
import { Queue, Notification, Zone, History } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * POST /api/queues
 * Join a queue for equipment
 * Body: { userId, zoneId, facilityId?, position?, estimatedWait? }
 * Returns: Queue entry with ID and confirmation details
 */
router.post('/', [
  authenticate,
  body('userId').isMongoId().withMessage('Invalid userId format'),
  body('zoneId').isMongoId().withMessage('Invalid zoneId format'),
  body('facilityId').optional().isMongoId().withMessage('Invalid facilityId format')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const { userId, zoneId, facilityId } = req.body

    // Verify userId matches authenticated user
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create queue for another user'
      })
    }

    // BLOCK: already active or in_use in THIS zone
    const existingQueueSameZone = await Queue.findOne({
      userId,
      zoneId,
      status: { $in: ['active', 'in_use'] }
    })

    if (existingQueueSameZone) {
      return res.status(409).json({
        success: false,
        error: 'You already have an active or in-progress session in this zone.',
        data: existingQueueSameZone
      })
    }

    // Calculate position & wait in this zone
    const currentQueueCount = await Queue.countDocuments({
      zoneId,
      status: 'active'
    })
    const actualPosition = currentQueueCount + 1
    const calculatedWait = actualPosition * 7

    const newQueue = new Queue({
      userId,
      zoneId,
      facilityId: facilityId || null,
      position: actualPosition,
      estimatedWait: calculatedWait,
      status: 'active',
      joinedAt: new Date(),
      completedAt: null
    })

    await newQueue.save()
    await newQueue.populate(['userId', 'zoneId', 'facilityId'])

    const io = req.app.get('io')
    if (io) {
      io.to(`zone:${zoneId}`).emit('zone:update', {
        zoneId,
        action: 'queue_joined',
        queueLength: await Queue.countDocuments({ zoneId, status: 'active' })
      })

      if (facilityId) {
        io.to(`facility-zones:${facilityId}`).emit('facility-zones:update', {
          zoneId,
          facilityId,
          action: 'queue_joined'
        })
      }
    }

    // Notification
    try {
      const notificationType = actualPosition === 1 ? 'queue_ready' : 'queue_update'
      const notificationPriority = actualPosition === 1 ? 'high' : 'medium'
      const notificationTitle = actualPosition === 1 ? "You're Next!" : 'Queue Joined'
      const notificationMessage = actualPosition === 1
        ? `You're now #1 in the ${newQueue.zoneId.name} queue! Equipment is ready for you.`
        : `You joined the ${newQueue.zoneId.name} queue at position #${actualPosition}. Estimated wait: ${calculatedWait} minutes`

      const notification = new Notification({
        userId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        isRead: false,
        priority: notificationPriority,
        relatedId: newQueue._id,
        relatedType: 'queue'
      })
      await notification.save()

      if (io) {
        io.to(`notifications:${userId}`).emit('notification:new', notification)
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError)
    }

    res.status(201).json({
      success: true,
      data: newQueue,
      message: 'Successfully joined queue'
    })
  } catch (error) {
    // Handle unique index duplicate (user, zone, active/in_use)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'You already have an active or in-progress session in this zone.'
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
 * GET /api/queues/me/status
 * Summary of current user's workout + active queues
 * Used by: Home page
 *
 * Returns: {
 *   currentWorkout: Queue | null,   // status 'in_use'
 *   activeQueues:  Queue[]          // status 'active'
 * }
 *
 * IMPORTANT: This route MUST be before any "/:id" route.
 */
router.get('/me/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id

    const currentWorkout = await Queue.findOne({
      userId,
      status: 'in_use'
    })
      .populate('zoneId')
      .populate('facilityId')

    const activeQueues = await Queue.find({
      userId,
      status: 'active'
    })
      .populate('zoneId')
      .populate('facilityId')
      .sort({ joinedAt: 1 })

    res.json({
      success: true,
      data: {
        currentWorkout,
        activeQueues
      }
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
 */
router.get('/:id', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid queue ID format')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const queue = await Queue.findById(req.params.id)
      .populate('userId')
      .populate('zoneId')
      .populate('facilityId')

    if (!queue) {
      return res.status(404).json({ success: false, error: 'Queue entry not found' })
    }

    if (queue.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this queue entry' })
    }

    res.json({ success: true, data: queue })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Queue entry not found' })
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
 */
router.get('/user/:userId', [
  authenticate,
  param('userId').isMongoId().withMessage('Invalid userId format')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view queues for another user'
      })
    }

    const { status } = req.query
    const query = { userId: req.params.userId }
    if (status) query.status = status

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
 */
router.put('/:id', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid queue ID format')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const queue = await Queue.findById(req.params.id)

    if (!queue) {
      return res.status(404).json({ success: false, error: 'Queue entry not found' })
    }

    if (queue.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this queue entry'
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
    await queue.populate(['userId', 'zoneId', 'facilityId'])

    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${req.params.id}`).emit('queue:update', {
        queueId: req.params.id,
        position: queue.position,
        estimatedWait: queue.estimatedWait,
        status: queue.status
      })

      io.to(`zone:${queue.zoneId._id}`).emit('zone:update', {
        zoneId: queue.zoneId._id,
        action: 'queue_updated'
      })
    }

    res.json({
      success: true,
      data: queue,
      message: 'Queue updated successfully'
    })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Queue entry not found' })
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

/**
 * POST /api/queues/:id/start
 */
router.post('/:id/start', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid queue ID format')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const queue = await Queue.findById(req.params.id)

    if (!queue) {
      return res.status(404).json({ success: false, error: 'Queue entry not found' })
    }

    if (queue.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to start this queue entry'
      })
    }

    if (queue.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Only active queue entries can start a workout'
      })
    }

    if (queue.position !== 1) {
      return res.status(400).json({
        success: false,
        error: 'Only the first person in the queue can start a workout'
      })
    }

    const otherInUse = await Queue.findOne({
      _id: { $ne: queue._id },
      userId: queue.userId,
      zoneId: queue.zoneId,
      status: 'in_use'
    })

    if (otherInUse) {
      return res.status(409).json({
        success: false,
        error: 'You already have an in-progress workout in this zone.',
        data: otherInUse
      })
    }

    const zoneId = queue.zoneId
    const facilityId = queue.facilityId

    const zone = await Zone.findById(zoneId)
    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found for this queue entry'
      })
    }

    if (zone.currentOccupancy >= zone.capacity) {
      return res.status(400).json({
        success: false,
        error: 'Zone is already at capacity'
      })
    }

    zone.currentOccupancy = (zone.currentOccupancy || 0) + 1
    await zone.save()

    const leavingPosition = queue.position
    queue.status = 'in_use'
    queue.position = 0
    queue.estimatedWait = 0
    queue.startedAt = new Date()
    await queue.save()

    // shift others up, send notifications – unchanged from your version
    try {
      const updatedQueues = await Queue.find({
        zoneId,
        facilityId,
        status: 'active',
        position: { $gt: leavingPosition }
      })

      await Queue.updateMany(
        {
          zoneId,
          facilityId,
          status: 'active',
          position: { $gt: leavingPosition }
        },
        { $inc: { position: -1 } }
      )

      const io = req.app.get('io')
      if (io) {
        for (const updatedQueue of updatedQueues) {
          const newPosition = updatedQueue.position - 1

          io.to(`queue:${updatedQueue._id}`).emit('queue:update', {
            queueId: updatedQueue._id.toString(),
            position: newPosition,
            estimatedWait: newPosition * 7,
            status: updatedQueue.status
          })

          if (newPosition === 1) {
            try {
              await updatedQueue.populate('zoneId')
              const userIdString = updatedQueue.userId.toString()

              const notification = new Notification({
                userId: updatedQueue.userId,
                type: 'queue_ready',
                title: "You're Next!",
                message: `You're now #1 in the ${updatedQueue.zoneId.name} queue! Equipment is ready for you.`,
                isRead: false,
                priority: 'high',
                relatedId: updatedQueue._id,
                relatedType: 'queue'
              })

              const savedNotification = await notification.save()
              io.to(`notifications:${userIdString}`).emit('notification:new', savedNotification.toObject())
            } catch (notifError) {
              console.error('Error creating position #1 notification (start):', notifError)
            }
          }
        }

        io.to(`zone:${zoneId}`).emit('zone:update', {
          zoneId: zoneId.toString(),
          action: 'workout_started',
          queueLength: await Queue.countDocuments({ zoneId, status: 'active' })
        })

        if (facilityId) {
          io.to(`facility-zones:${facilityId}`).emit('facility-zones:update', {
            zoneId: zoneId.toString(),
            facilityId: facilityId.toString(),
            action: 'workout_started'
          })
        }
      }
    } catch (updateError) {
      console.error('Error updating queue positions on start:', updateError)
    }

    res.json({
      success: true,
      data: queue,
      message: 'Workout started; user is now using the zone'
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
 * POST /api/queues/:id/stop
 */
router.post('/:id/stop', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid queue ID format')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const queue = await Queue.findById(req.params.id)

    if (!queue) {
      return res.status(404).json({ success: false, error: 'Queue entry not found' })
    }

    if (queue.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to stop this queue entry'
      })
    }

    if (queue.status !== 'in_use') {
      return res.status(400).json({
        success: false,
        error: 'Only in-use queue entries can be stopped'
      })
    }

    const zoneId = queue.zoneId
    const facilityId = queue.facilityId

    const zone = await Zone.findById(zoneId)
    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found for this queue entry'
      })
    }

    zone.currentOccupancy = Math.max(0, (zone.currentOccupancy || 0) - 1)
    await zone.save()

    queue.status = 'completed'
    queue.completedAt = new Date()
    await queue.save()

    // Create history log
    try {
      const startTime = queue.startedAt || queue.joinedAt
      const workoutDurationMs = queue.completedAt - startTime
      const workoutDurationMinutes = Math.round(workoutDurationMs / (1000 * 60))

      const { mood, notes } = req.body

      const historyEntry = new History({
        userId: queue.userId,
        facilityId: facilityId,
        zoneId: zoneId,
        zoneName: zone.name,
        date: queue.completedAt,
        duration: workoutDurationMinutes > 0 ? workoutDurationMinutes : 1,
        type: 'Workout',
        exercises: [],
        notes: notes || '',
        mood: mood || null
      })
      await historyEntry.save()
      console.log('History log created:', historyEntry._id)
    } catch (historyError) {
      console.error('Error creating history log:', historyError)
      // Don't fail the stop request if history creation fails
    }

    const io = req.app.get('io')
    if (io) {
      io.to(`queue:${queue._id}`).emit('queue:update', {
        queueId: queue._id.toString(),
        position: queue.position,
        estimatedWait: queue.estimatedWait,
        status: queue.status
      })

      io.to(`zone:${zoneId}`).emit('zone:update', {
        zoneId: zoneId.toString(),
        action: 'workout_stopped',
        queueLength: await Queue.countDocuments({ zoneId, status: 'active' })
      })

      if (facilityId) {
        io.to(`facility-zones:${facilityId}`).emit('facility-zones:update', {
          zoneId: zoneId.toString(),
          facilityId: facilityId.toString(),
          action: 'workout_stopped'
        })
      }
    }

    res.json({
      success: true,
      data: queue,
      message: 'Workout ended; user has left the zone'
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
 * DELETE /api/queues/:id
 */
router.delete('/:id', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid queue ID format')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const queue = await Queue.findById(req.params.id)

    if (!queue) {
      return res.status(404).json({ success: false, error: 'Queue entry not found' })
    }

    if (queue.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this queue entry'
      })
    }

    const leavingPosition = queue.position
    const zoneId = queue.zoneId
    const facilityId = queue.facilityId

    await Queue.findByIdAndDelete(req.params.id)

    try {
      const updatedQueues = await Queue.find({
        zoneId,
        facilityId,
        status: 'active',
        position: { $gt: leavingPosition }
      })

      await Queue.updateMany(
        {
          zoneId,
          facilityId,
          status: 'active',
          position: { $gt: leavingPosition }
        },
        { $inc: { position: -1 } }
      )

      const io = req.app.get('io')
      if (io) {
        for (const updatedQueue of updatedQueues) {
          const newPosition = updatedQueue.position - 1
          io.to(`queue:${updatedQueue._id}`).emit('queue:update', {
            queueId: updatedQueue._id.toString(),
            position: newPosition,
            estimatedWait: newPosition * 7,
            status: updatedQueue.status
          })

          if (newPosition === 1) {
            try {
              await updatedQueue.populate('zoneId')
              const userIdString = updatedQueue.userId.toString()

              const notification = new Notification({
                userId: updatedQueue.userId,
                type: 'queue_ready',
                title: "You're Next!",
                message: `You're now #1 in the ${updatedQueue.zoneId.name} queue! Equipment is ready for you.`,
                isRead: false,
                priority: 'high',
                relatedId: updatedQueue._id,
                relatedType: 'queue'
              })

              const savedNotification = await notification.save()
              io.to(`notifications:${userIdString}`).emit('notification:new', savedNotification.toObject())
            } catch (notifError) {
              console.error('Error creating position #1 notification:', notifError)
            }
          }
        }

        io.to(`zone:${zoneId}`).emit('zone:update', {
          zoneId: zoneId.toString(),
          action: 'queue_left',
          queueLength: await Queue.countDocuments({ zoneId, status: 'active' })
        })

        if (facilityId) {
          io.to(`facility-zones:${facilityId}`).emit('facility-zones:update', {
            zoneId: zoneId.toString(),
            facilityId: facilityId.toString(),
            action: 'queue_left'
          })
        }
      }
    } catch (updateError) {
      console.error('Error updating queue positions:', updateError)
    }

    res.json({
      success: true,
      data: queue,
      message: 'Successfully left queue'
    })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Queue entry not found' })
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

export default router
