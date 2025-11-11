import express from 'express'
import { zones } from '../utils/mockData.js' 

const router = express.Router()

/**
 * GET /api/zones
 * Get all equipment zones
 * Query params: ?facilityId=<id> to filter by facility
 * Returns: Zone name, queue length, wait time, capacity
 * Used by: Zones page
 */
router.get('/', (req, res) => {
  const { facilityId } = req.query
  
  let filteredZones = zones
  
  if (facilityId) {
    const facId = parseInt(facilityId)
    filteredZones = zones.filter(z => z.facilityId === facId)
    
    if (filteredZones.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No zones found for facility ID ${facilityId}`
      })
    }
  }
  
  res.json({
    success: true,
    data: filteredZones,
    count: filteredZones.length
  })
})

/**
 * GET /api/zones/:id
 * Get specific zone details
 * Returns: Detailed zone information including current queue status
 */
router.get('/:id', (req, res) => {
  const zoneId = parseInt(req.params.id)
  const zone = zones.find(z => z.id === zoneId)
  
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
})

export default router
