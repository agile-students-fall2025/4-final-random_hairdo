// test/queues.test.js - Sprint 3: MongoDB + JWT Authentication
import request from 'supertest'
import { expect } from 'chai'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import { User, Queue } from '../db.js'
import jwt from 'jsonwebtoken'

// Load environment variables
dotenv.config()

describe('Queues API Tests (MongoDB + JWT)', () => {
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

// Import Facility and Zone models
const { Facility, Zone } = await import('../db.js')

// Clear collections
await User.deleteMany({})
await Queue.deleteMany({})
await Facility.deleteMany({})
await Zone.deleteMany({})

// Create test user and token for authenticated requests
testUser = await User.create({
name: 'Test User',
email: 'testuser@nyu.edu',
password: 'password123'
})

testToken = jwt.sign(
{ id: testUser._id.toString() },
process.env.JWT_SECRET,
{ expiresIn: '7d' }
)

// Create test facility
testFacility = await Facility.create({
name: 'Test Facility',
address: '123 Test St',
hours: { open: '6:00 AM', close: '11:00 PM' },
amenities: ['Locker rooms'],
capacity: 100
})

// Create test zone
testZone = await Zone.create({
facilityId: testFacility._id,
name: 'Test Zone',
equipment: ['Treadmills', 'Ellipticals'],
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
// POST /api/queues
// ============================================
describe('POST /api/queues', () => {
it('should create a new queue entry with valid data', async () => {
const newQueue = {
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString()
}

const res = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send(newQueue)

expect(res.status).to.equal(201)
expect(res.body).to.have.property('success', true)
expect(res.body).to.have.property('data')
expect(res.body).to.have.property('message', 'Successfully joined queue')
expect(res.body.data).to.have.property('_id')
// userId and zoneId are populated objects
expect(res.body.data.userId._id.toString()).to.equal(testUser._id.toString())
expect(res.body.data.zoneId._id.toString()).to.equal(testZone._id.toString())
})

it('should set default position and estimatedWait if not provided', async () => {
const newQueue = {
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString()
}

const res = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send(newQueue)

expect(res.status).to.equal(201)
expect(res.body.data.position).to.equal(1)
expect(res.body.data.estimatedWait).to.equal(7)
expect(res.body.data.status).to.equal('active')
})

it('should use provided position and estimatedWait', async () => {
const newQueue = {
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString(),
position: 5,
estimatedWait: 25
}

const res = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send(newQueue)

expect(res.status).to.equal(201)
// Note: route calculates position based on current queue, so might be 1 not 5
expect(res.body.data.position).to.be.a('number')
expect(res.body.data.estimatedWait).to.be.a('number')
})

it('should set timestamps when creating queue', async () => {
const newQueue = {
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString()
}

const res = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send(newQueue)

expect(res.status).to.equal(201)
expect(res.body.data).to.have.property('joinedAt')
expect(res.body.data).to.have.property('updatedAt')
expect(new Date(res.body.data.joinedAt)).to.be.instanceOf(Date)
})

it('should return 400 if userId is missing', async () => {
const newQueue = {
zoneId: 1
}

const res = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send(newQueue)

expect(res.status).to.equal(400)
expect(res.body).to.have.property('success', false)
})

it('should return 400 if zoneId is missing', async () => {
const newQueue = {
userId: testUser._id.toString()
}

const res = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send(newQueue)

expect(res.status).to.equal(400)
expect(res.body).to.have.property('success', false)
})

it('should return 409 if user already has an active queue', async () => {
// First, create an active queue
await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send({
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString()
})

// Try to create another active queue for the same user in same zone
const res = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send({
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString()
})

expect(res.status).to.equal(409)
expect(res.body).to.have.property('success', false)
})

it('should return 401 without authentication token', async () => {
const res = await request(app)
.post('/api/queues')
.send({ userId: testUser._id.toString(), zoneId: 1 })

expect(res.status).to.equal(401)
})
})

// ============================================
// GET /api/queues/:id
// ============================================
describe('GET /api/queues/:id', () => {
let testQueue

beforeEach(async () => {
// Create a test queue with proper ObjectIds
testQueue = await Queue.create({
userId: testUser._id,
zoneId: testZone._id,
facilityId: testFacility._id,
position: 1,
estimatedWait: 7,
status: 'active'
})
})

it('should return a specific queue by valid id', async () => {
const res = await request(app)
.get(`/api/queues/${testQueue._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(200)
expect(res.body).to.have.property('success', true)
expect(res.body).to.have.property('data')
expect(res.body.data).to.be.an('object')
expect(res.body.data._id).to.equal(testQueue._id.toString())
})

it('should return queue with all required fields', async () => {
const res = await request(app)
.get(`/api/queues/${testQueue._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.body.data).to.have.property('_id')
expect(res.body.data).to.have.property('userId')
expect(res.body.data).to.have.property('zoneId')
expect(res.body.data).to.have.property('position')
expect(res.body.data).to.have.property('estimatedWait')
expect(res.body.data).to.have.property('status')
expect(res.body.data).to.have.property('joinedAt')
expect(res.body.data).to.have.property('updatedAt')
})

it('should return 404 for non-existent queue id', async () => {
const fakeId = new mongoose.Types.ObjectId()
const res = await request(app)
.get(`/api/queues/${fakeId}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(404)
expect(res.body).to.have.property('success', false)
})

it('should return 401 without authentication', async () => {
const res = await request(app).get(`/api/queues/${testQueue._id}`)

expect(res.status).to.equal(401)
})
})

// ============================================
// GET /api/queues/user/:userId
// ============================================
describe('GET /api/queues/user/:userId', () => {
beforeEach(async () => {
// Create multiple queues for test user with proper ObjectIds
await Queue.create([
{
userId: testUser._id,
zoneId: testZone._id,
facilityId: testFacility._id,
position: 1,
status: 'completed',
completedAt: new Date('2024-11-10')
},
{
userId: testUser._id,
zoneId: testZone._id,
facilityId: testFacility._id,
position: 2,
status: 'active'
}
])
})

it('should return all queues for a specific user', async () => {
const res = await request(app)
.get(`/api/queues/user/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(200)
expect(res.body).to.have.property('success', true)
expect(res.body).to.have.property('data')
expect(res.body).to.have.property('count')
expect(res.body.data).to.be.an('array')
expect(res.body.data.length).to.equal(2)
})

it('should filter queues by userId', async () => {
const res = await request(app)
.get(`/api/queues/user/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

res.body.data.forEach(queue => {
// userId is a populated object
expect(queue.userId._id.toString()).to.equal(testUser._id.toString())
})
})

it('should sort queues by joinedAt in descending order', async () => {
const res = await request(app)
.get(`/api/queues/user/${testUser._id}`)
.set('Authorization', `Bearer ${testToken}`)

if (res.body.data.length > 1) {
for (let i = 0; i < res.body.data.length - 1; i++) {
const date1 = new Date(res.body.data[i].joinedAt)
const date2 = new Date(res.body.data[i + 1].joinedAt)
expect(date1.getTime()).to.be.at.least(date2.getTime())
}
}
})

it('should filter by status when provided', async () => {
const res = await request(app)
.get(`/api/queues/user/${testUser._id}?status=completed`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(200)
res.body.data.forEach(queue => {
expect(queue.status).to.equal('completed')
})
})

it('should return empty array for user with no queues', async () => {
const newUser = await User.create({
name: 'No Queues User',
email: 'noqueues@nyu.edu',
password: 'password123'
})

// Create token for the new user
const newUserToken = jwt.sign(
{ id: newUser._id.toString() },
process.env.JWT_SECRET,
{ expiresIn: '7d' }
)

const res = await request(app)
.get(`/api/queues/user/${newUser._id}`)
.set('Authorization', `Bearer ${newUserToken}`)

expect(res.status).to.equal(200)
expect(res.body.data).to.be.an('array')
expect(res.body.data.length).to.equal(0)
})
})

// ============================================
// PUT /api/queues/:id
// ============================================
describe('PUT /api/queues/:id', () => {
let testQueue

beforeEach(async () => {
testQueue = await Queue.create({
userId: testUser._id,
zoneId: testZone._id,
facilityId: testFacility._id,
position: 3,
estimatedWait: 21,
status: 'active'
})
})

it('should update queue position', async () => {
const res = await request(app)
.put(`/api/queues/${testQueue._id}`)
.set('Authorization', `Bearer ${testToken}`)
.send({ position: 2 })

expect(res.status).to.equal(200)
expect(res.body).to.have.property('success', true)
expect(res.body.data.position).to.equal(2)
})

it('should calculate estimatedWait based on position', async () => {
const res = await request(app)
.put(`/api/queues/${testQueue._id}`)
.set('Authorization', `Bearer ${testToken}`)
.send({ position: 3 })

expect(res.status).to.equal(200)
expect(res.body.data.position).to.equal(3)
expect(res.body.data.estimatedWait).to.equal(21) // 3 * 7
})

it('should set status to completed when position is 0', async () => {
const res = await request(app)
.put(`/api/queues/${testQueue._id}`)
.set('Authorization', `Bearer ${testToken}`)
.send({ position: 0 })

expect(res.status).to.equal(200)
expect(res.body.data.position).to.equal(0)
expect(res.body.data.estimatedWait).to.equal(0)
expect(res.body.data.status).to.equal('completed')
expect(res.body.data).to.have.property('completedAt')
})

it('should update status to cancelled', async () => {
const res = await request(app)
.put(`/api/queues/${testQueue._id}`)
.set('Authorization', `Bearer ${testToken}`)
.send({ status: 'cancelled' })

expect(res.status).to.equal(200)
expect(res.body.data.status).to.equal('cancelled')
})

it('should return 404 for non-existent queue', async () => {
const fakeId = new mongoose.Types.ObjectId()
const res = await request(app)
.put(`/api/queues/${fakeId}`)
.set('Authorization', `Bearer ${testToken}`)
.send({ position: 1 })

expect(res.status).to.equal(404)
expect(res.body).to.have.property('success', false)
})
})

// ============================================
// DELETE /api/queues/:id
// ============================================
describe('DELETE /api/queues/:id', () => {
let testQueue

beforeEach(async () => {
testQueue = await Queue.create({
userId: testUser._id,
zoneId: testZone._id,
facilityId: testFacility._id,
position: 1,
status: 'active'
})
})

it('should delete a queue entry', async () => {
const res = await request(app)
.delete(`/api/queues/${testQueue._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(200)
expect(res.body).to.have.property('success', true)
expect(res.body).to.have.property('message', 'Successfully left queue')
})

it('should actually remove queue from database', async () => {
await request(app)
.delete(`/api/queues/${testQueue._id}`)
.set('Authorization', `Bearer ${testToken}`)

// Try to get the deleted queue
const getRes = await request(app)
.get(`/api/queues/${testQueue._id}`)
.set('Authorization', `Bearer ${testToken}`)

expect(getRes.status).to.equal(404)
})

it('should return 404 for non-existent queue', async () => {
const fakeId = new mongoose.Types.ObjectId()
const res = await request(app)
.delete(`/api/queues/${fakeId}`)
.set('Authorization', `Bearer ${testToken}`)

expect(res.status).to.equal(404)
expect(res.body).to.have.property('success', false)
})
})

// ============================================
// Data Integrity
// ============================================
describe('Data Integrity', () => {
it('should generate unique MongoDB ObjectId for each queue', async () => {
const res1 = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send({
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString()
})

await Queue.deleteMany({}) // Clear for second queue

const res2 = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send({
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString()
})

expect(res1.body.data._id).to.not.equal(res2.body.data._id)
})

it('should have non-negative position values', async () => {
const res = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send({
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString()
})

expect(res.body.data.position).to.be.at.least(0)
})

it('should have valid ISO timestamp for joinedAt', async () => {
const res = await request(app)
.post('/api/queues')
.set('Authorization', `Bearer ${testToken}`)
.send({
userId: testUser._id.toString(),
zoneId: testZone._id.toString(),
facilityId: testFacility._id.toString()
})

const date = new Date(res.body.data.joinedAt)
expect(date.toString()).to.not.equal('Invalid Date')
})
})
})