// test/users.test.js - Sprint 3: MongoDB + JWT Authentication
import request from 'supertest'
import { expect } from 'chai'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import { User, Goal } from '../db.js'

// Load environment variables
dotenv.config()

describe('Users API Tests - Sprint 3', () => {
  let authToken
  let testUserId
  let testUser2Id
  let testUser2Token

  // ============================================
  // Setup: Connect to TEST database
  // ============================================
  before(async function() {
    this.timeout(10000)
    
    // Use TEST database (not production!)
    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/smartfit_test'
    
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
    
    // Clear users and goals collections
    await User.deleteMany({})
    await Goal.deleteMany({})
    
    // Create test user 1 and get token
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@nyu.edu',
        password: 'password123'
      })
    
    authToken = registerRes.body.token
    testUserId = registerRes.body.data._id
    
    // Create test user 2
    const register2Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User 2',
        email: 'test2@nyu.edu',
        password: 'password456'
      })
    
    testUser2Token = register2Res.body.token
    testUser2Id = register2Res.body.data._id
  })

  // ============================================
  // Teardown: Close database after all tests
  // ============================================
  after(async function() {
    this.timeout(5000)
    await mongoose.connection.close()
  })

  // ============================================
  // GET /api/users (All Users) - PROTECTED
  // ============================================
  describe('GET /api/users', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/users')
      
      expect(res.status).to.equal(401)
    })

    it('should return all users with valid token', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body.data).to.be.an('array')
    })
    
    it('should return correct count', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.body.count).to.equal(res.body.data.length)
      expect(res.body.count).to.equal(2)  // Test User + Test User 2
    })
    
    it('should not include passwords in response', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
      
      res.body.data.forEach(user => {
        expect(user).to.not.have.property('password')
      })
    })
  })
  
  // ============================================
  // GET /api/users/:id (Single User) - PROTECTED
  // ============================================
  describe('GET /api/users/:id', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get(`/api/users/${testUserId}`)
      
      expect(res.status).to.equal(401)
    })

    it('should return user by valid ID with auth', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data).to.have.property('_id', testUserId)
    })
    
    it('should return user with correct structure', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      const user = res.body.data
      expect(user).to.have.property('_id')
      expect(user).to.have.property('name')
      expect(user).to.have.property('email')
      expect(user).to.have.property('createdAt')
      expect(user).to.have.property('updatedAt')
    })
    
    it('should not include password in response', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.body.data).to.not.have.property('password')
    })
    
    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
    })

    it('should return 403 when accessing another user profile', async () => {
      const res = await request(app)
        .get(`/api/users/${testUser2Id}`)
        .set('Authorization', `Bearer ${authToken}`)  // Using User 1's token
      
      expect(res.status).to.equal(403)
      expect(res.body).to.have.property('success', false)
      expect(res.body.message).to.include('own profile')
    })
  })
  
  // ============================================
  // POST /api/auth/register
  // ============================================
  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@nyu.edu',
          password: 'test123'
        })
      
      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('token')
      expect(res.body.data).to.have.property('_id')
      expect(res.body.data.email).to.equal('newuser@nyu.edu')
    })
    
    it('should return user data on registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User2',
          email: 'user2test@nyu.edu',
          password: 'pass123'
        })
      
      expect(res.status).to.equal(201)
      expect(res.body.data).to.have.property('name', 'User2')
      expect(res.body.data).to.have.property('email', 'user2test@nyu.edu')
    })
    
    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test3@nyu.edu', password: 'test123' })
      
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
    })

    it('should return 400 for non-NYU email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'test@gmail.com', password: 'test123' })
      
      expect(res.status).to.equal(400)
      expect(res.body.message).to.include('@nyu.edu')
    })
    
    it('should return 409 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User2', email: 'test@nyu.edu', password: 'pass456' })
      
      expect(res.status).to.equal(409)
      expect(res.body.message).to.include('already exists')
    })

    it('should not return password in registration response', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User3',
          email: 'user3@nyu.edu',
          password: 'password123'
        })
      
      expect(res.body.data).to.not.have.property('password')
    })
  })
  
  // ============================================
  // POST /api/auth/login
  // ============================================
  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@nyu.edu', password: 'password123' })
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('token')
      expect(res.body.data).to.have.property('email', 'test@nyu.edu')
    })
    
    it('should not return password in login response', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@nyu.edu', password: 'password123' })
      
      expect(res.body.data).to.not.have.property('password')
    })
    
    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@nyu.edu', password: 'wrong' })
      
      expect(res.status).to.equal(401)
      expect(res.body).to.have.property('success', false)
    })
    
    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'none@nyu.edu', password: 'pass123' })
      
      expect(res.status).to.equal(401)
    })
    
    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pass123' })
      
      expect(res.status).to.equal(400)
    })

    it('should be case-insensitive for email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'TEST@NYU.EDU', password: 'password123' })
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('token')
    })
  })
  
  // ============================================
  // PUT /api/users/:id (Update Profile) - PROTECTED
  // ============================================
  describe('PUT /api/users/:id', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .send({ name: 'Updated Name' })
      
      expect(res.status).to.equal(401)
    })

    it('should update user profile with valid auth', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data.name).to.equal('Updated Name')
    })
    
    it('should update multiple fields', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          name: 'New Name',
          goals: ['Weight Loss', 'Muscle Gain']
        })
      
      expect(res.body.data.name).to.equal('New Name')
      expect(res.body.data.goals).to.be.an('array')
      expect(res.body.data.goals).to.include('Weight Loss')
    })
    
    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
      
      expect(res.status).to.equal(404)
    })
    
    it('should return 400 with empty body', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
      
      expect(res.status).to.equal(400)
      expect(res.body.error).to.include('No updates')
    })
    
    it('should validate email format', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
      
      expect(res.status).to.equal(400)
      expect(res.body.message).to.include('valid email')
    })

    it('should return 409 for duplicate email', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'test2@nyu.edu' })  // User 2's email
      
      expect(res.status).to.equal(409)
      expect(res.body.message).to.include('already in use')
    })

    it('should return 403 when trying to update another user', async () => {
      const res = await request(app)
        .put(`/api/users/${testUser2Id}`)
        .set('Authorization', `Bearer ${authToken}`)  // User 1 trying to update User 2
        .send({ name: 'Hacked' })
      
      expect(res.status).to.equal(403)
    })

    it('should sync goals to Goals collection', async () => {
      await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ goals: ['Run 5K', 'Lose 10 pounds'] })
      
      // Check that goals were created in Goals collection
      const goals = await Goal.find({ userId: testUserId })
      expect(goals).to.have.lengthOf(2)
      expect(goals[0].goal).to.be.oneOf(['Run 5K', 'Lose 10 pounds'])
    })
  })

  // ============================================
  // PUT /api/users/:id/password (Change Password) - PROTECTED
  // ============================================
  describe('PUT /api/users/:id/password', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}/password`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpass456'
        })
      
      expect(res.status).to.equal(401)
    })

    it('should change password with correct current password', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpass456'
        })
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body.message).to.include('Password updated')
    })

    it('should allow login with new password after change', async () => {
      // Change password
      await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpass456'
        })
      
      // Try logging in with new password
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@nyu.edu', password: 'newpass456' })
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('token')
    })

    it('should return 401 for wrong current password', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpass456'
        })
      
      expect(res.status).to.equal(401)
      expect(res.body.message).to.include('Current password is incorrect')
    })

    it('should return 400 for short new password', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: '123'  // Too short
        })
      
      expect(res.status).to.equal(400)
      expect(res.body.message).to.include('at least 6 characters')
    })

    it('should return 400 when currentPassword is missing', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          newPassword: 'newpass456'
        })
      
      expect(res.status).to.equal(400)
      expect(res.body.message).to.include('Current password is required')
    })

    it('should return 403 when trying to change another user password', async () => {
      const res = await request(app)
        .put(`/api/users/${testUser2Id}/password`)
        .set('Authorization', `Bearer ${authToken}`)  // User 1 trying to change User 2's password
        .send({
          currentPassword: 'password456',
          newPassword: 'hacked123'
        })
      
      expect(res.status).to.equal(403)
    })
  })
  
  // ============================================
  // Data Integrity Tests
  // ============================================
  describe('Data Integrity', () => {
    it('should have unique user IDs', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
      
      const ids = res.body.data.map(u => u._id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).to.equal(uniqueIds.length)
    })
    
    it('should have all users with non-empty names', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
      
      res.body.data.forEach(user => {
        expect(user.name).to.be.a('string')
        expect(user.name.length).to.be.greaterThan(0)
      })
    })
    
    it('should have valid data types', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      const user = res.body.data
      expect(user._id).to.be.a('string')
      expect(user.name).to.be.a('string')
      expect(user.email).to.be.a('string')
    })

    it('should have timestamps on all users', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      const user = res.body.data
      expect(user).to.have.property('createdAt')
      expect(user).to.have.property('updatedAt')
      expect(new Date(user.createdAt)).to.be.instanceOf(Date)
    })
  })
  
  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should return JSON content type', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.headers['content-type']).to.match(/json/)
    })
    
    it('should handle invalid ObjectId gracefully', async () => {
      const res = await request(app)
        .get('/api/users/not-a-valid-id')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
    })

    it('should handle expired/invalid token', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
      
      expect(res.status).to.equal(401)
    })
  })
})