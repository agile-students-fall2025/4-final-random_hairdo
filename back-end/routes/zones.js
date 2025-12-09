import express from 'express'
import mongoose from 'mongoose'
import { param, query, validationResult } from 'express-validator'
import { Zone, Queue } from '../db.js'

const router = express.Router()

/**
* GET /api/zones
* Get all equipment zones
* Query params: ?facilityId=<id> to filter by facility
* Returns: Zone name, queue length, wait time, capacity
* Used by: Zones page
*/
router.get('/',
[
query('facilityId').optional().isMongoId().withMessage('Invalid facility ID format')
],
async (req, res) => {
// Check validation errors
const errors = validationResult(req)
if (!errors.isEmpty()) {
return res.status(400).json({
success: false,
error: 'Validation failed',
message: errors.array()[0].msg
})
}

try {
const { facilityId } = req.query

let queryObj = {}
if (facilityId) {
queryObj.facilityId = facilityId
}

const zones = await Zone.find(queryObj).populate('facilityId')

if (facilityId && zones.length === 0) {
return res.status(404).json({
success: false,
error: `No zones found for facility ID ${facilityId}`
})
}

// Add real-time queue data to each zone
const zonesWithQueueData = await Promise.all(
zones.map(async (zone) => {
const queueLength = await Queue.countDocuments({
zoneId: zone._id,
status: 'active'
})

// Calculate average wait time based on queue length
const averageWaitTime = queueLength * 7 // 7 minutes per person

return {
...zone.toObject(),
queueLength,
averageWaitTime
}
})
)

res.json({
success: true,
data: zonesWithQueueData,
count: zonesWithQueueData.length
})
} catch (error) {
res.status(500).json({
success: false,
error: 'Server error',
message: error.message
})
}
}
)

/**
* GET /api/zones/:id
* Get specific zone details
* Returns: Detailed zone information including current queue status
*/
router.get('/:id',
[
param('id').isMongoId().withMessage('Invalid zone ID format')
],
async (req, res) => {
// Check validation errors
const errors = validationResult(req)
if (!errors.isEmpty()) {
return res.status(400).json({
success: false,
error: 'Validation failed',
message: errors.array()[0].msg
})
}

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
res.status(500).json({
success: false,
error: 'Server error',
message: error.message
})
}
}
)

export default router