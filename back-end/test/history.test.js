// test/history.test.js
// Sprint 3: MongoDB + JWT authentication tests - MASTER BRANCH VERSION
import request from 'supertest'
import { expect } from 'chai'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'  // Import app directly (already calls connectDB)
import { User, History, Facility, Zone } from '../db.js'

// Load environment variables
dotenv.config()

describe('History API Tests (MongoDB + JWT)', () => {
  let authToken
  let testUserId
  let testFacilityId
  let testZoneId
  let testWorkoutId
  
  // ============================================
  // Setup: Connect to TEST database before all tests
  // ============================================
  before(async function() {
    this.timeout(10000)
    
    // Use TEST database (not production!)
    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb+srv://db_user:8GCeLYMHSQGczvty@cluster0.t8py52w.mongodb.net/smartfit_test'
    
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
    }
    
    // Connect to test database
    await mongoose.connect(testDbUri)
    console.log('✅ Connected to TEST database:', testDbUri)
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
    
    // Register user to get token (MUST use @nyu.edu email!)
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@nyu.edu',  // Must be @nyu.edu
        password: 'password123'
      })
    
    authToken = registerRes.body.token
    testUserId = registerRes.body.data._id
    
    // Create test workout (added mood)
    const testWorkout = await History.create({
      userId: testUserId,
      facilityId: testFacilityId,
      zoneId: testZoneId,
      zoneName: 'Cardio Zone',
      date: new Date('2024-11-20T10:00:00Z'),
      duration: 45,
      type: 'Cardio',
      exercises: ['Treadmill', 'Elliptical'],
      mood: 8,  //Schema has mood (1-10)
      notes: 'Great workout!'
    })
    testWorkoutId = testWorkout._id.toString()
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
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body).to.have.property('stats')
      expect(res.body).to.have.property('count')
    })
    
    it('should return an array of workouts', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.be.greaterThan(0)
    })
    
    it('should return workouts with correct structure', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
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
      expect(workout).to.have.property('mood')  // ADDED: Check mood field
    })
    
    it('should include exercises array in workouts', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      const workout = res.body.data[0]
      expect(workout.exercises).to.be.an('array')
      expect(workout.exercises).to.deep.equal(['Treadmill', 'Elliptical'])
    })
    
    // Check averageMood 
    it('should return statistics object with averageMood', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.body.stats).to.be.an('object')
      expect(res.body.stats).to.have.property('totalWorkouts', 1)
      expect(res.body.stats).to.have.property('totalMinutes', 45)
      expect(res.body.stats).to.have.property('averageMood')  
      expect(res.body.stats.averageMood).to.equal(8)
      expect(res.body.stats).to.have.property('mostFrequentGym', 'Cardio Zone')
      expect(res.body.stats).to.have.property('mostFrequentExercise', 'Treadmill')
    })
    
    // Test populate() functionality
    it('should populate facilityId with name', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      const workout = res.body.data[0]
      expect(workout.facilityId).to.be.an('object')
      expect(workout.facilityId).to.have.property('name', 'Test Gym')
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
        mood: 7
      })
      
      const res = await request(app)
        .get(`/api/history/user/${testUserId}?type=Cardio`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      expect(res.body.data.length).to.equal(1)
      expect(res.body.data[0].type).to.equal('Cardio')
    })
    
    it('should filter workouts by date range', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId}?startDate=2024-11-01&endDate=2024-11-30`)
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
        .get(`/api/history/user/${testUserId}?location=Cardio`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      res.body.data.forEach(workout => {
        expect(workout.zoneName.toLowerCase()).to.include('cardio')
      })
    })
    
    it('should return empty array for user with no workouts', async () => {
      // Clear all workouts for testUser
      await History.deleteMany({ userId: testUserId })
      
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.equal(0)
      expect(res.body.stats.totalWorkouts).to.equal(0)
      expect(res.body.stats.averageMood).to.equal(0)  
    })
    
    it('should return 403 when accessing another user history', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .get(`/api/history/user/${fakeId.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(403)
      expect(res.body).to.have.property('success', false)
      expect(res.body.message).to.include('own workout history')
    })
    
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
      
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
    
    // Test mood field
    it('should return workout with mood field', async () => {
      const res = await request(app)
        .get(`/api/history/${testWorkoutId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.body.data).to.have.property('mood', 8)
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

    it('should return 403 when accessing another user workout', async () => {
      // Create another user and their workout
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@nyu.edu',  // @nyu.edu
        password: 'other123'
      })
      
      const otherWorkout = await History.create({
        userId: otherUser._id,
        facilityId: testFacilityId,
        zoneId: testZoneId,
        zoneName: 'Test Zone',
        date: new Date(),
        duration: 30,
        type: 'Cardio',
        exercises: [],
        mood: 6
      })
      
      const res = await request(app)
        .get(`/api/history/${otherWorkout._id.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(403)
      expect(res.body.message).to.include('own workouts')
    })
  })
  
  // ============================================
  // POST /api/history
  // ============================================
  
  describe('POST /api/history', () => {
    // added mood
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
          mood: 7,  
          notes: 'Good workout'
        })
      
      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data).to.have.property('_id')
      expect(res.body.data.exercises).to.deep.equal(['Treadmill', 'Bike'])
      expect(res.body.data).to.have.property('mood', 7)  
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
          mood: 9
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
          exercises: []
        })
      
      expect(res.status).to.equal(201)
      expect(res.body.data.exercises).to.be.an('array')
      expect(res.body.data.exercises).to.have.lengthOf(0)
    })
    
    // mood validation
    it('should accept valid mood value (1-10)', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId.toString(),
          facilityId: testFacilityId.toString(),
          zoneId: testZoneId.toString(),
          duration: 30,
          type: 'Cardio',
          mood: 5
        })
      
      expect(res.status).to.equal(201)
      expect(res.body.data.mood).to.equal(5)
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
        email: 'other@nyu.edu',  
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
        exercises: [],
        mood: 6
      })
      
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      const ids = res.body.data.map(w => w._id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).to.equal(uniqueIds.length)
    })
    
    it('should have all workouts with valid userId', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      res.body.data.forEach(workout => {
        expect(workout.userId.toString()).to.equal(testUserId.toString())
      })
    })
    
    it('should have all workouts with positive duration', async () => {
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
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
        exercises: [],
        mood: 7
      })
      
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      for (let i = 0; i < res.body.data.length - 1; i++) {
        const date1 = new Date(res.body.data[i].date)
        const date2 = new Date(res.body.data[i + 1].date)
        expect(date1.getTime()).to.be.at.least(date2.getTime())
      }
    })
    
    // Test averageMood calculation with multiple workouts
    it('should calculate averageMood correctly', async () => {
      await History.create({
        userId: testUserId,
        facilityId: testFacilityId,
        zoneId: testZoneId,
        zoneName: 'Zone 2',
        date: new Date(),
        duration: 30,
        type: 'Cardio',
        exercises: [],
        mood: 6  // First workout has mood 8, this one has 6
      })
      
      const res = await request(app)
        .get(`/api/history/user/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      // Average of 8 and 6 = 7.0
      expect(res.body.stats.averageMood).to.equal(7.0)
    })
  })
})
