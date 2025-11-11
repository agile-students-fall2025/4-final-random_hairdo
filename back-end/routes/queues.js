import express from 'express'
import { queues, getNextId } from '../utils/mockData.js'

const router = express.Router()

/**
 * POST /api/queues
 * Join a queue for equipment
 * Body: { userId, zoneId, position?, estimatedWait? }
 * Returns: Queue entry with ID and confirmation details
 * Used by: Zones page to Queue Confirmation flow
 */
router.post('/', (req, res) => {
  const { userId, zoneId, position, estimatedWait } = req.body
  
  if (!userId || !zoneId) {
    return res.status(400).json({
      success: false,
      error: 'userId and zoneId are required'
    })
  }
  
  const existingQueue = queues.find(
    q => q.userId === userId && q.status === 'active'
  )
  
  if (existingQueue) {
    return res.status(409).json({
      success: false,
      error: 'User already has an active queue',
      data: existingQueue
    })
  }
  
  const newQueue = {
    id: getNextId(queues),
    userId: parseInt(userId),
    zoneId: parseInt(zoneId),
    facilityId: req.body.facilityId || null,
    position: position || 1,
    estimatedWait: estimatedWait || 10,
    status: 'active',
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  }
  
  queues.push(newQueue)
  
  res.status(201).json({
    success: true,
    data: newQueue,
    message: 'Successfully joined queue'
  })
})

/**
 * GET /api/queues/:id
 * Get specific queue entry details
 * Returns: Queue position, estimated wait time, status
 * Used by: Confirmed Queue page (for real-time updates)
 */
router.get('/:id', (req, res) => {
  const queueId = parseInt(req.params.id)
  const queue = queues.find(q => q.id === queueId)
  
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
})

/**
 * GET /api/queues/user/:userId
 * Get all queues for a user
 * Returns: List of active and past queue entries
 * Used by: Home page (Dashboard), History page
 */
router.get('/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId)
  const { status } = req.query
  
  let userQueues = queues.filter(q => q.userId === userId)
  
  if (status) {
    userQueues = userQueues.filter(q => q.status === status)
  }
  
  userQueues.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
  
  res.json({
    success: true,
    data: userQueues,
    count: userQueues.length
  })
})

/**
 * PUT /api/queues/:id
 * Update queue position or status
 * Body: { position?, estimatedWait?, status? }
 * Used by: Queue page
 */
router.put('/:id', (req, res) => {
  const queueId = parseInt(req.params.id)
  const queueIndex = queues.findIndex(q => q.id === queueId)
  
  if (queueIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Queue entry not found'
    })
  }
  
  const { position, estimatedWait, status } = req.body
  
  if (position !== undefined) {
    queues[queueIndex].position = position
    
    if (position === 0) {
      queues[queueIndex].estimatedWait = 0
      queues[queueIndex].status = 'completed'
      queues[queueIndex].completedAt = new Date().toISOString()
    } else {
      const waitMinutes = position * 7
      queues[queueIndex].estimatedWait = waitMinutes
    }
  }
  
  if (estimatedWait !== undefined) {
    queues[queueIndex].estimatedWait = estimatedWait
  }
  
  if (status !== undefined) {
    queues[queueIndex].status = status
    if (status === 'completed' || status === 'cancelled') {
      queues[queueIndex].completedAt = new Date().toISOString()
    }
  }
  
  queues[queueIndex].updatedAt = new Date().toISOString()
  
  res.json({
    success: true,
    data: queues[queueIndex],
    message: 'Queue updated successfully'
  })
})

/**
 * DELETE /api/queues/:id
 * Leave a queue
 * Used by: Confirmed Queue page (cancel button)
 */
router.delete('/:id', (req, res) => {
  const queueId = parseInt(req.params.id)
  const queueIndex = queues.findIndex(q => q.id === queueId)
  
  if (queueIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Queue entry not found'
    })
  }
  
  const deletedQueue = queues.splice(queueIndex, 1)[0]
  
  res.json({
    success: true,
    data: deletedQueue,
    message: 'Successfully left queue'
  })
})

export default router
