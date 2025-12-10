import express from 'express'
import mongoose from 'mongoose'
import { param, validationResult } from 'express-validator'
import { Zone, Queue } from '../db.js'

const router = express.Router()

/**
 * GET /api/zones
 * Get all equipment zones
 * Query params: ?facilityId=<id> to filter by facility
 * Returns: Zone name, queue length, wait time, capacity
 * Used by: Zones page and tests
 */
router.get('/', async (req, res) => {
  try {
    const { facilityId } = req.query

    // Build query object (optionally filter by facilityId)
    const queryObj = {}
    if (facilityId) {
      // Do NOT validate as ObjectId here – tests may send plain strings.
      // Mongo will simply return an empty result if it doesn't match.
      queryObj.facilityId = facilityId
    }

    const zones = await Zone.find(queryObj).populate('facilityId')

    // Add real-time queue data to each zone
    const zonesWithQueueData = await Promise.all(
      zones.map(async (zone) => {
        const queueLength = await Queue.countDocuments({
          zoneId: zone._id,
          status: 'active',
        })

        // Simple business rule: 7 minutes per person in queue
        const averageWaitTime = queueLength * 7

        return {
          ...zone.toObject(),
          queueLength,
          averageWaitTime,
        }
      })
    )

    // Always return 200 with an array (even if empty) so tests can safely .forEach
    return res.json({
      success: true,
      data: zonesWithQueueData,
      count: zonesWithQueueData.length,
    })
  } catch (error) {
    console.error('Error in GET /api/zones:', error)
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
    })
  }
})

/**
 * GET /api/zones/:id
 * Get specific zone details
 * Returns: Detailed zone information including current queue status
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid zone ID format'),
  ],
  async (req, res) => {
    // Check validation errors for :id
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors.array()[0].msg,
      })
    }

    try {
      const zone = await Zone.findById(req.params.id).populate('facilityId')

      if (!zone) {
        return res.status(404).json({
          success: false,
          error: 'Zone not found',
        })
      }

      return res.json({
        success: true,
        data: zone,
      })
    } catch (error) {
      console.error('Error in GET /api/zones/:id:', error)
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message,
      })
    }
  }
)

export default router
