import express from 'express'
import { facilities } from '../utils/mockData.js'

const router = express.Router()

/**
 * GET /api/facilities
 * Get all gym facilities
 * Returns: List of available facilities with addresses
 * Used by: Facilities page
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: facilities,
    message: 'Facilities retrieved successfully'
  })
})

/**
 * GET /api/facilities/:id
 * Get specific facility details
 * Returns: Facility name, address, capacity
 */
router.get('/:id', (req, res) => {
  const facilityId = parseInt(req.params.id)
  const facility = facilities.find(f => f.id === facilityId)
  
  if (!facility) {
    return res.status(404).json({
      success: false,
      error: 'Facility not found'
    })
  }
  
  res.json({
    success: true,
    data: facility
  })
})

export default router
