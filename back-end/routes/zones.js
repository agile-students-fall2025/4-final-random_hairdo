import express from 'express'
import { Zone } from '../db.js'

const router = express.Router()

/**
 * GET /api/zones
 * Get all equipment zones
 * Query params: ?facilityId=<id> to filter by facility
 * Returns: Zone name, queue length, wait time, capacity
 * Used by: Zones page
 */
router.get('/', async (req, res) => {
  try {
    const { facilityId } = req.query
    
    let query = {}
    if (facilityId) {
      query.facilityId = facilityId
    }
    
    const zones = await Zone.find(query).populate('facilityId')
    
    if (facilityId && zones.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No zones found for facility ID ${facilityId}`
      })
    }
    
    res.json({
      success: true,
      data: zones,
      count: zones.length
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
 * GET /api/zones/:id
 * Get specific zone details
 * Returns: Detailed zone information including current queue status
 */
router.get('/:id', async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id).populate('facilityId')
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found'
      })
    }
    
    res.json({
      success: true,
      data: zone
    })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Zone not found'
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
