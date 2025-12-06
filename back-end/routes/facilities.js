import express from 'express'
import mongoose from 'mongoose'
import { param, validationResult } from 'express-validator'
import { Facility } from '../db.js'

const router = express.Router()

/**
* GET /api/facilities
* Get all gym facilities
* Returns: List of available facilities with addresses
* Used by: Facilities page
*/
router.get('/', async (req, res) => {
try {
const facilities = await Facility.find().sort({ name: 1 })

res.json({
success: true,
data: facilities,
message: 'Facilities retrieved successfully'
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
* GET /api/facilities/:id
* Get specific facility details
* Returns: Facility name, address, capacity
*/
router.get('/:id',
[
param('id').isMongoId().withMessage('Invalid facility ID format')
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
const facility = await Facility.findById(req.params.id)

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