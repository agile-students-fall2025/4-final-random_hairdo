import express from 'express'
import { Zone } from '../db.js'
import mongoose from 'mongoose'

const router = express.Router()

// ============================================
// GET ALL ZONES (with optional facility filter)
// ============================================
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
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(facilityId)) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid facility ID format - must be a valid ObjectId'
        })
      }
      query.facilityId = facilityId
    }
    
    // Populate facility data and sort alphabetically
    const zones = await Zone.find(query)
      .populate('facilityId')
      .sort({ name: 1 })
    
    // Return 200 with empty array if no zones found - this is not an error
    res.json({
      success: true,
      data: zones,
      count: zones.length,
      message: zones.length === 0 ? 'No zones found' : undefined
    })
  } catch (error) {
    console.error('Error in GET /api/zones:', error)
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    })
  }
})

// ============================================
// GET SINGLE ZONE BY ID
// ============================================
/**
 * GET /api/zones/:id
 * Get specific zone details
 * Returns: Detailed zone information including current queue status
 * Used by: Zone details page, Queue confirmation
 */
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid zone ID format - must be a valid ObjectId'
      })
    }
    
    // Populate facility data
    const zone = await Zone.findById(req.params.id).populate('facilityId')
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Zone not found'
      })
    }
    
    res.json({
      success: true,
      data: zone
    })
  } catch (error) {
    console.error('Error in GET /api/zones/:id:', error)
    
    // Handle mongoose cast errors
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Zone not found'
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