// test/history.test.js
// Sprint 3: MongoDB + JWT authentication tests
import request from 'supertest'
import { expect } from 'chai'
import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from '../db.js'
import { User, History, Facility, Zone } from '../db.js'
import historyRouter from '../routes/history.js'
import authRouter from '../routes/auth.js'

// Load environment variables
dotenv.config()

// Create isolated test app
const app = express()
app.use(express.json())
app.use('/api/history', historyRouter)
app.use('/api/auth', authRouter)

describe('History API Tests (MongoDB + JWT)', () => {
  let authToken
  let testUserId
  let testFacilityId
  let testZoneId
  let testWorkoutId
  
  // ============================================
  // Setup: Connect to database before all tests
  // ============================================
  before(async function() {
    this.timeout(10000)
    await connectDB()
  })
  
  // ============================================
  // Cleanup: Clear database before each test
  // ============================================
  beforeEach(async function() {
    this.timeout(5000)
    // Clear collections
    await User.deleteMany({})
    await History.deleteMany({})
    await Facility.deleteMany({})
    await Zone.deleteMany({})
    
    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123',
      goals: []
    })
    testUserId = testUser._id  // Keep as ObjectId
    
    // Create test facility
    const testFacility = await Facility.create({
      name: 'Test Gym',
      address: '123 Test St',
      capacity: 100,
      hours: { weekdays: '6AM-10PM', weekends: '8AM-8PM' },
      amenities: ['Lockers', 'Showers']
    })
    testFacilityId = testFacility._id
    
    // Create test zone
    const testZone = await Zone.create({
      facilityId: testFacilityId,
      name: 'Cardio Zone',
      equipment: ['Treadmill', 'Elliptical'],
      capacity: 20,
      currentOccupancy: 5
    })
    testZoneId = testZone._id
    
    // Create test workout
    const testWorkout = await History.create({
      userId: testUserId,
      facilityId: testFacilityId,
      zoneId: testZoneId,
      zoneName: 'Cardio Zone',
      date: new Date('2024-11-20T10:00:00Z'),
      duration: 45,
      type: 'Cardio',
      exercises: ['Treadmill', 'Elliptical'],
      caloriesBurned: 350,
      notes: 'Great workout!'
    })
    testWorkoutId = testWorkout._id.toString()
    
    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'test123'
      })
    
    authToken = loginRes.body.token
  })
  
  // ============================================
  // Teardown: Close database after all tests
  // ============================================
  after(async function() {
    this.timeout(5000)
    await mongoose.connection.close()
  })
  
  // ============================================
  // GET /api/history/user/:userId
  // ============================================
  
  describe('GET /api/history/user/:userId', () => {
    it('should return workout history with success status', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body).to.have.property('stats')
      expect(res.body).to.have.property('count')
    })
    
    it('should return an array of workouts', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.be.greaterThan(0)
    })
    
    it('should return workouts with correct structure', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      const workout = res.body.data[0]
      expect(workout).to.have.property('_id')
      expect(workout).to.have.property('userId')
      expect(workout).to.have.property('facilityId')
      expect(workout).to.have.property('zoneId')
      expect(workout).to.have.property('zoneName')
      expect(workout).to.have.property('date')
      expect(workout).to.have.property('duration')
      expect(workout).to.have.property('type')
      expect(workout).to.have.property('exercises')
    })
    
    it('should include exercises array in workouts', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      const workout = res.body.data[0]
      expect(workout.exercises).to.be.an('array')
      expect(workout.exercises).to.deep.equal(['Treadmill', 'Elliptical'])
    })
    
    it('should return statistics object', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.body.stats).to.be.an('object')
      expect(res.body.stats).to.have.property('totalWorkouts', 1)
      expect(res.body.stats).to.have.property('totalMinutes', 45)
      expect(res.body.stats).to.have.property('totalCalories', 350)
      expect(res.body.stats).to.have.property('mostFrequentGym', 'Cardio Zone')
      expect(res.body.stats).to.have.property('mostFrequentExercise', 'Treadmill')
    })
    
    it('should filter workouts by type', async () => {
      await History.create({
        userId: testUserId,
        facilityId: testFacilityId,
        zoneId: testZoneId,
        zoneName: 'Strength Zone',
        date: new Date(),
        duration: 60,
        type: 'Strength',
        exercises: ['Bench Press'],
        caloriesBurned: 300
      })
      
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}?type=Cardio`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      expect(res.body.data.length).to.equal(1)
      expect(res.body.data[0].type).to.equal('Cardio')
    })
    
    it('should filter workouts by date range', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}?startDate=2024-11-01&endDate=2024-11-30`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      res.body.data.forEach(workout => {
        const workoutDate = new Date(workout.date)
        expect(workoutDate).to.be.at.least(new Date('2024-11-01'))
        expect(workoutDate).to.be.at.most(new Date('2024-11-30'))
      })
    })
    
    it('should filter workouts by location (zoneName)', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}?location=Cardio`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      res.body.data.forEach(workout => {
        expect(workout.zoneName.toLowerCase()).to.include('cardio')
      })
    })
    
    it('should return empty array for user with no workouts', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res = await request(app)
        .get(`/api/history/user/${fakeId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.equal(0)
    })
    
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
      
      expect(res.status).to.equal(401)
    })
  })
  
  // ============================================
  // GET /api/history/:id
  // ============================================
  
  describe('GET /api/history/:id', () => {
    it('should return specific workout by ID', async () => {
      const res = await request(app)
        .get(`/api/history/${testWorkoutId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data).to.have.property('_id', testWorkoutId)
    })
    
    it('should return workout with exercises array', async () => {
      const res = await request(app)
        .get(`/api/history/${testWorkoutId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.body.data.exercises).to.be.an('array')
      expect(res.body.data.exercises).to.deep.equal(['Treadmill', 'Elliptical'])
    })
    
    it('should return 404 for non-existent workout', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res = await request(app)
        .get(`/api/history/${fakeId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })
    
    it('should return 400 for invalid ObjectId', async () => {
      const res = await request(app)
        .get('/api/history/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(400)
    })
  })
  
  // ============================================
  // POST /api/history
  // ============================================
  
  describe('POST /api/history', () => {
    it('should create new workout with valid data', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId.toString(),
          facilityId: testFacilityId.toString(),
          zoneId: testZoneId.toString(),
          zoneName: 'Test Zone',
          duration: 30,
          type: 'Cardio',
          exercises: ['Treadmill', 'Bike'],
          caloriesBurned: 250
        })
      
      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data).to.have.property('_id')
      expect(res.body.data.exercises).to.deep.equal(['Treadmill', 'Bike'])
    })
    
    it('should store exercises array correctly', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId.toString(),
          facilityId: testFacilityId.toString(),
          zoneId: testZoneId.toString(),
          zoneName: 'Strength Zone',
          duration: 45,
          type: 'Strength',
          exercises: ['Bench Press', 'Squats', 'Deadlifts'],
          caloriesBurned: 400
        })
      
      expect(res.status).to.equal(201)
      expect(res.body.data.exercises).to.deep.equal(['Bench Press', 'Squats', 'Deadlifts'])
    })
    
    it('should handle workout with empty exercises array', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId.toString(),
          facilityId: testFacilityId.toString(),
          zoneId: testZoneId.toString(),
          zoneName: 'Cardio Zone',
          duration: 30,
          type: 'Cardio',
          exercises: [],
          caloriesBurned: 200
        })
      
      expect(res.status).to.equal(201)
      expect(res.body.data.exercises).to.be.an('array')
      expect(res.body.data.exercises).to.have.lengthOf(0)
    })
    
    it('should return 400 when userId is missing', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          facilityId: testFacilityId.toString(),
          zoneId: testZoneId.toString(),
          duration: 30,
          type: 'Cardio'
        })
      
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
    })
    
    it('should return 400 when duration is missing', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId.toString(),
          facilityId: testFacilityId.toString(),
          zoneId: testZoneId.toString(),
          type: 'Cardio'
        })
      
      expect(res.status).to.equal(400)
    })
    
    it('should reject invalid exercises format', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId.toString(),
          facilityId: testFacilityId.toString(),
          zoneId: testZoneId.toString(),
          duration: 30,
          type: 'Cardio',
          exercises: 'Treadmill'  // String instead of array
        })
      
      expect(res.status).to.equal(400)
    })
    
    it('should return 403 when logging workout for another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@test.com',
        password: 'other123'
      })
      
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: otherUser._id.toString(),
          facilityId: testFacilityId.toString(),
          zoneId: testZoneId.toString(),
          duration: 30,
          type: 'Cardio'
        })
      
      expect(res.status).to.equal(403)
    })
    
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/history')
        .send({
          userId: testUserId.toString(),
          facilityId: testFacilityId.toString(),
          zoneId: testZoneId.toString(),
          duration: 30,
          type: 'Cardio'
        })
      
      expect(res.status).to.equal(401)
    })
  })
  
  // ============================================
  // Data Integrity Tests
  // ============================================
  
  describe('Data Integrity', () => {
    it('should have unique workout IDs', async () => {
      await History.create({
        userId: testUserId,
        facilityId: testFacilityId,
        zoneId: testZoneId,
        zoneName: 'Zone 2',
        date: new Date(),
        duration: 30,
        type: 'Cardio',
        exercises: []
      })
      
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      const ids = res.body.data.map(w => w._id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).to.equal(uniqueIds.length)
    })
    
    it('should have all workouts with valid userId', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      res.body.data.forEach(workout => {
        expect(workout.userId.toString()).to.equal(testUserId.toString())
      })
    })
    
    it('should have all workouts with positive duration', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      res.body.data.forEach(workout => {
        expect(workout.duration).to.be.a('number')
        expect(workout.duration).to.be.greaterThan(0)
      })
    })
    
    it('should sort workouts by date (newest first)', async () => {
      await History.create({
        userId: testUserId,
        facilityId: testFacilityId,
        zoneId: testZoneId,
        zoneName: 'Zone 2',
        date: new Date('2024-11-25T10:00:00Z'),
        duration: 30,
        type: 'Cardio',
        exercises: []
      })
      
      const res = await request(app)
        .get(`/api/history/user/${testUserId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      for (let i = 0; i < res.body.data.length - 1; i++) {
        const date1 = new Date(res.body.data[i].date)
        const date2 = new Date(res.body.data[i + 1].date)
        expect(date1.getTime()).to.be.at.least(date2.getTime())
      }
    })
  })
})
