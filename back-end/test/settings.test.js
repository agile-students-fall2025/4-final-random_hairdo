// test/settings.test.js - Sprint 3: MongoDB + JWT Authentication
import request from 'supertest'
import { expect } from 'chai'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import { User, Queue, Goal, History, Notification, SupportIssue } from '../db.js'
import jwt from 'jsonwebtoken'

// Load environment variables
dotenv.config()

describe('Settings API Tests (MongoDB + JWT)', () => {
let testUser
let testToken

// ============================================
// Setup: Connect to TEST database before all tests
// ============================================
before(async function() {
this.timeout(10000)

// Use TEST database
const testDbUri = process.env.MONGODB_UNIT_TEST_URI

if (!testDbUri) {
throw new Error('MONGODB_UNIT_TEST_URI not set in .env file')
}

// Close existing connection if any
if (mongoose.connection.readyState !== 0) {
await mongoose.connection.close()
}

// Connect to test database
await mongoose.connect(testDbUri)
console.log('✅ Connected to TEST database:', mongoose.connection.name)
})

// ============================================
// Cleanup: Clear database before each test
// ============================================
let testFacility
let testZone

beforeEach(async function() {
this.timeout(5000)

// Import models
const { Facility, Zone } = await import('../db.js')

// Clear all collections
await User.deleteMany({})
await Queue.deleteMany({})
await Goal.deleteMany({})
await History.deleteMany({})
await Notification.deleteMany({})
await SupportIssue.deleteMany({})
await Facility.deleteMany({})
await Zone.deleteMany({})

// Create test user and token
testUser = await User.create({
name: 'Settings Test User',
email: 'settings@nyu.edu',
password: 'password123'
})

testToken = jwt.sign(
{ id: testUser._id.toString() },
process.env.JWT_SECRET,
{ expiresIn: '7d' }
)

// Create test facility and zone for Queue creation
testFacility = await Facility.create({
name: 'Test Facility',
address: '123 Test St',
hours: { open: '6:00 AM', close: '11:00 PM' },
amenities: ['Locker rooms'],
capacity: 100
})

testZone = await Zone.create({
facilityId: testFacility._id,
name: 'Test Zone',
equipment: ['Treadmills'],
capacity: 20,
currentOccupancy: 5,
queueLength: 0,
averageWaitTime: 0,
status: 'available'
})
})

// ============================================
// Teardown: Disconnect after all tests
// ============================================
after(async function() {
this.timeout(5000)
await mongoose.connection.close()
})

// ============================================
// GET /api/settings
// ============================================
describe('GET /api/settings', () => {
it('should return a health check message', async () => {
const res = await request(app)
.get('/api/settings')
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(200)
expect(res.body).to.have.property('success', true)
expect(res.body).to.have.property('message')
})

it('should work without authentication', async () => {
const res = await request(app).get('/api/settings')

expect(res.status).to.equal(200)
expect(res.body).to.have.property('success', true)
})
})

// ============================================
// DELETE /api/settings/account/:userId
// ============================================
describe('DELETE /api/settings/account/:userId', () => {
beforeEach(async () => {
// Create related records for test user with proper ObjectIds
await Queue.create({
userId: testUser._id,
zoneId: testZone._id,
facilityId: testFacility._id,
position: 1,
status: 'active'
})

await Goal.create({
userId: testUser._id,
goal: 'Lose weight',
progress: 50
})

await History.create({
userId: testUser._id,
facilityId: testFacility._id,
zoneId: testZone._id,
zoneName: 'Cardio Zone',
exercises: ['Treadmill'],
date: new Date(),
duration: 30,
type: 'Cardio',
caloriesBurned: 300
})

await Notification.create({
userId: testUser._id,
title: 'Test Notification',
message: 'Test message',
type: 'queue_update'
})

await SupportIssue.create({
userId: testUser._id,
subject: 'Test Issue',
description: 'Test description',
category: 'Technical', // Required field - enum: Technical, Queue, Account, Feature Request, Other
status: 'open'
})
})

it('should delete a user account and related records', async () => {
// Verify records exist
const queueCount = await Queue.countDocuments({ userId: testUser._id })
const goalCount = await Goal.countDocuments({ userId: testUser._id })
expect(queueCount).to.be.greaterThan(0)
expect(goalCount).to.be.greaterThan(0)

const res = await request(app)
.delete(`/api/settings/account/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(200)
expect(res.body).to.have.property('success', true)
expect(res.body).to.have.property('message', 'Account deleted successfully')
expect(res.body.data).to.have.property('user')
// Route returns 'id' not '_id'
expect(res.body.data.user.id).to.equal(testUser._id.toString())

// Verify removal counts
const removed = res.body.data.removedRecords
expect(removed).to.have.property('queues')
expect(removed).to.have.property('goals')
expect(removed).to.have.property('history')
expect(removed).to.have.property('notifications')
expect(removed).to.have.property('supportIssues')
expect(removed.queues).to.be.at.least(1)
expect(removed.goals).to.be.at.least(1)

// Verify user and related records are gone
const deletedUser = await User.findById(testUser._id)
expect(deletedUser).to.be.null

const remainingQueues = await Queue.countDocuments({ userId: testUser._id })
const remainingGoals = await Goal.countDocuments({ userId: testUser._id })
const remainingHistory = await History.countDocuments({ userId: testUser._id })
const remainingNotifications = await Notification.countDocuments({ userId: testUser._id })
const remainingSupportIssues = await SupportIssue.countDocuments({ userId: testUser._id })

expect(remainingQueues).to.equal(0)
expect(remainingGoals).to.equal(0)
expect(remainingHistory).to.equal(0)
expect(remainingNotifications).to.equal(0)
expect(remainingSupportIssues).to.equal(0)
})

it('should return 404 when deleting a non-existent user', async () => {
const fakeId = new mongoose.Types.ObjectId()
const res = await request(app)
.delete(`/api/settings/account/${fakeId}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(404)
expect(res.body).to.have.property('success', false)
expect(res.body).to.have.property('error', 'User not found')
})

it('should respond with JSON for delete endpoint', async () => {
const res = await request(app)
.delete(`/api/settings/account/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.headers['content-type']).to.match(/json/)
})

it('should work without authentication token', async () => {
const res = await request(app)
.delete(`/api/settings/account/${testUser._id}`)

// Route doesn't require authentication (though it probably should)
expect(res.status).to.equal(200)
expect(res.body).to.have.property('success', true)
})

it('should handle user with no related records', async () => {
// Create new user with no related data
const emptyUser = await User.create({
name: 'Empty User',
email: 'empty@nyu.edu',
password: 'password123'
})

const emptyToken = jwt.sign(
{ id: emptyUser._id.toString() },
process.env.JWT_SECRET,
{ expiresIn: '7d' }
)

const res = await request(app)
.delete(`/api/settings/account/${emptyUser._id}`)
.set('Authorization', `Bearer ${emptyToken}`)

expect(res.status).to.equal(200)
expect(res.body.data.removedRecords.queues).to.equal(0)
expect(res.body.data.removedRecords.goals).to.equal(0)
})

it('should delete user even with multiple related records', async () => {
// Create additional zones for multiple queue entries
const { Zone } = await import('../db.js')
const zone2 = await Zone.create({
facilityId: testFacility._id,
name: 'Zone 2',
equipment: ['Equipment'],
capacity: 20,
currentOccupancy: 0,
queueLength: 0,
averageWaitTime: 0,
status: 'available'
})

const zone3 = await Zone.create({
facilityId: testFacility._id,
name: 'Zone 3',
equipment: ['Equipment'],
capacity: 20,
currentOccupancy: 0,
queueLength: 0,
averageWaitTime: 0,
status: 'available'
})

// Create multiple related records with proper ObjectIds
// Note: beforeEach already created 1 Queue with testZone, so we only create 2 more
await Queue.create([
{ userId: testUser._id, zoneId: zone2._id, facilityId: testFacility._id, position: 2, status: 'active' },
{ userId: testUser._id, zoneId: zone3._id, facilityId: testFacility._id, position: 3, status: 'active' }
])

await Goal.create([
{ userId: testUser._id, goal: 'Goal 1', progress: 10 },
{ userId: testUser._id, goal: 'Goal 2', progress: 20 }
])

const res = await request(app)
.delete(`/api/settings/account/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(200)
expect(res.body.data.removedRecords.queues).to.be.at.least(3)
expect(res.body.data.removedRecords.goals).to.be.at.least(2)

// Verify all are deleted
const remainingQueues = await Queue.countDocuments({ userId: testUser._id })
expect(remainingQueues).to.equal(0)
})
})

// ============================================
// Edge Cases
// ============================================
describe('Edge Cases', () => {
it('should handle invalid MongoDB ObjectId format', async () => {
const res = await request(app)
.delete('/api/settings/account/invalid-id')
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.be.oneOf([400, 404])
expect(res.body).to.have.property('success', false)
})

it('should not delete other users when deleting one account', async () => {
// Create another user
const otherUser = await User.create({
name: 'Other User',
email: 'other@nyu.edu',
password: 'password123'
})

await Queue.create({
userId: otherUser._id,
zoneId: testZone._id,
facilityId: testFacility._id,
position: 1
})

// Delete first user
await request(app)
.delete(`/api/settings/account/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

// Verify other user still exists
const stillExists = await User.findById(otherUser._id)
expect(stillExists).to.not.be.null
expect(stillExists.email).to.equal('other@nyu.edu')

// Verify other user's queue still exists
const otherQueue = await Queue.findOne({ userId: otherUser._id })
expect(otherQueue).to.not.be.null
})

it('should return proper counts for partially populated records', async () => {
// Only create queues and goals, no history/notifications/support
await Queue.create({
userId: testUser._id,
zoneId: testZone._id,
facilityId: testFacility._id,
position: 1
})
await Goal.create({ userId: testUser._id, goal: 'Test goal', progress: 0 })

const res = await request(app)
.delete(`/api/settings/account/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(200)
expect(res.body.data.removedRecords.queues).to.equal(1)
expect(res.body.data.removedRecords.goals).to.equal(1)
expect(res.body.data.removedRecords.history).to.equal(0)
expect(res.body.data.removedRecords.notifications).to.equal(0)
expect(res.body.data.removedRecords.supportIssues).to.equal(0)
})
})

// ============================================
// Data Integrity
// ============================================
describe('Data Integrity', () => {
it('should maintain referential integrity during deletion', async () => {
// Create records with references to user
const queue = await Queue.create({
userId: testUser._id,
zoneId: testZone._id,
facilityId: testFacility._id,
position: 1
})

// Delete user
await request(app)
.delete(`/api/settings/account/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

// Verify queue is also deleted (cascade delete)
const orphanedQueue = await Queue.findById(queue._id)
expect(orphanedQueue).to.be.null
})

it('should be idempotent - deleting twice returns 404 second time', async () => {
// First deletion
const res1 = await request(app)
.delete(`/api/settings/account/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res1.status).to.equal(200)

// Second deletion should fail
const res2 = await request(app)
.delete(`/api/settings/account/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res2.status).to.equal(404)
})
})
})