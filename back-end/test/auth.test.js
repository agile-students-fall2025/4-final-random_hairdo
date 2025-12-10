// test/auth.test.js - Sprint 3: MongoDB + JWT Authentication
import request from 'supertest'
import { expect } from 'chai'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import { User } from '../db.js'
import jwt from 'jsonwebtoken'

// Load environment variables
dotenv.config()

describe('Auth API Tests - Sprint 3', () => {
  // ============================================
  // Setup: Connect to TEST database before all tests
  // ============================================
  before(async function() {
    this.timeout(10000)
    
    // Use TEST database (not production!)
    const testDbUri = process.env.MONGODB_TEST_URI
    
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
    
    // Clear users collection before each test
    await User.deleteMany({})
  })

  // ============================================
  // Teardown: Disconnect after all tests
  // ============================================
  after(async function() {
    this.timeout(5000)
    await mongoose.connection.close()
  })

  // ============================================
  // POST /api/auth/register
  // ============================================
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'testuser@nyu.edu',
          password: 'password123'
        })

      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('token')
      expect(res.body.data).to.have.property('_id')
      expect(res.body.data).to.have.property('name', 'Test User')
      expect(res.body.data).to.have.property('email', 'testuser@nyu.edu')
    })

    it('should not return password in response', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@nyu.edu',
          password: 'password123'
        })

      expect(res.body.data).to.not.have.property('password')
    })

    it('should return valid JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'jwt@nyu.edu',
          password: 'password123'
        })

      expect(res.body.token).to.be.a('string')
      expect(res.body.token.split('.')).to.have.lengthOf(3)  // JWT has 3 parts
      
      // Verify JWT is valid
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET)
      expect(decoded).to.have.property('user')
      expect(decoded.user).to.have.property('id')
      expect(decoded.user.id).to.equal(res.body.data._id)
    })

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@nyu.edu',
          password: 'password123'
        })

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
      expect(res.body.message).to.include('Name')
    })

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          password: 'password123'
        })

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
      expect(res.body.message).to.include('valid email')
    })

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@nyu.edu'
        })

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
      expect(res.body.message).to.include('Password')
    })

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'not-an-email',
          password: 'password123'
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.include('valid email')
    })

    it('should return 400 for non-NYU email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@gmail.com',
          password: 'password123'
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.include('@nyu.edu')
    })

    it('should return 400 for password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@nyu.edu',
          password: '12345'  // Only 5 characters
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.include('at least 6')
    })

    it('should return 409 for duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@nyu.edu',
          password: 'password123'
        })

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@nyu.edu',
          password: 'password456'
        })

      expect(res.status).to.equal(409)
      expect(res.body).to.have.property('success', false)
      expect(res.body.message).to.include('already exists')
    })

    it('should be case-insensitive for duplicate email check', async () => {
      // Register with lowercase
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: 'test@nyu.edu',
          password: 'password123'
        })

      // Try uppercase
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'TEST@NYU.EDU',
          password: 'password456'
        })

      expect(res.status).to.equal(409)
    })

    it('should hash password in database', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'hash@nyu.edu',
          password: 'password123'
        })

      // Fetch user from database with password field
      const user = await User.findById(res.body.data._id).select('+password')
      
      expect(user.password).to.not.equal('password123')  // Should be hashed
      expect(user.password).to.have.lengthOf.at.least(30)  // Bcrypt hash is long
      expect(user.password).to.match(/^\$2[aby]\$/)  // Bcrypt format
    })

    it('should normalize email to lowercase', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'CAPS@NYU.EDU',
          password: 'password123'
        })

      expect(res.body.data.email).to.equal('caps@nyu.edu')
      
      // Check database
      const user = await User.findById(res.body.data._id)
      expect(user.email).to.equal('caps@nyu.edu')
    })

    it('should create user with default empty arrays', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'defaults@nyu.edu',
          password: 'password123'
        })

      expect(res.body.data.goals).to.be.an('array').that.is.empty
      expect(res.body.data.focusTags).to.be.an('array').that.is.empty
    })

    it('should set timestamps on creation', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'timestamp@nyu.edu',
          password: 'password123'
        })

      expect(res.body.data).to.have.property('createdAt')
      expect(res.body.data).to.have.property('updatedAt')
      expect(new Date(res.body.data.createdAt)).to.be.instanceOf(Date)
    })
  })

  // ============================================
  // POST /api/auth/login
  // ============================================
  describe('POST /api/auth/login', () => {
    // Create a test user before login tests
    beforeEach(async function() {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test User',
          email: 'logintest@nyu.edu',
          password: 'password123'
        })
    })

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@nyu.edu',
          password: 'password123'
        })

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('token')
      expect(res.body.data).to.have.property('_id')
      expect(res.body.data).to.have.property('email', 'logintest@nyu.edu')
    })

    it('should not return password in login response', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@nyu.edu',
          password: 'password123'
        })

      expect(res.body.data).to.not.have.property('password')
    })

    it('should return valid JWT token on login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@nyu.edu',
          password: 'password123'
        })

      expect(res.body.token).to.be.a('string')
      
      // Verify JWT is valid
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET)
      expect(decoded).to.have.property('user')
      expect(decoded.user).to.have.property('id')
      expect(decoded.user.id).to.equal(res.body.data._id)
    })

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@nyu.edu',
          password: 'wrongpassword'
        })

      expect(res.status).to.equal(401)
      expect(res.body).to.have.property('success', false)
      expect(res.body.message).to.equal('Invalid email or password')
    })

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@nyu.edu',
          password: 'password123'
        })

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Invalid email or password')
    })

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        })

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
    })

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@nyu.edu'
        })

      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
    })

    it('should be case-insensitive for email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'LOGINTEST@NYU.EDU',  // Uppercase
          password: 'password123'
        })

      expect(res.status).to.equal(200)
      expect(res.body.data.email).to.equal('logintest@nyu.edu')  // Stored as lowercase
    })

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password123'
        })

      expect(res.status).to.equal(400)
    })

    it('should work with email that has special characters', async () => {
      // Register user with special chars
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Special User',
          email: 'test.user+tag@nyu.edu',
          password: 'password123'
        })

      // Login with same email
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.user+tag@nyu.edu',
          password: 'password123'
        })

      expect(res.status).to.equal(200)
    })
  })

  // ============================================
  // Token Generation & Verification
  // ============================================
  describe('JWT Token Tests', () => {
    it('should generate different tokens for different users', async () => {
      const res1 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 1', email: 'user1@nyu.edu', password: 'pass123' })

      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 2', email: 'user2@nyu.edu', password: 'pass123' })

      expect(res1.body.token).to.not.equal(res2.body.token)
    })

    it('should generate different tokens for same user on multiple logins', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@nyu.edu', password: 'pass123' })

      const login1 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@nyu.edu', password: 'pass123' })

      // Add small delay to ensure different iat timestamp
      await new Promise(resolve => setTimeout(resolve, 1000))

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@nyu.edu', password: 'pass123' })

      // Tokens should be different (different iat timestamps)
      expect(login1.body.token).to.not.equal(login2.body.token)
    })

    it('should include user ID in token payload', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'payload@nyu.edu', password: 'pass123' })

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET)
      
      // Debug: log the decoded token structure
      console.log('Decoded token:', JSON.stringify(decoded, null, 2))
      
      // Access the nested user.id
      expect(decoded).to.have.property('user')
      expect(decoded.user).to.have.property('id')
      expect(decoded.user.id).to.equal(res.body.data._id)
    })

    it('should have expiration time in token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'exp@nyu.edu', password: 'pass123' })

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET)
      expect(decoded).to.have.property('exp')
      expect(decoded).to.have.property('iat')
      expect(decoded.exp).to.be.greaterThan(decoded.iat)
    })
  })

  // ============================================
  // Password Security Tests
  // ============================================
  describe('Password Security', () => {
    it('should use bcrypt hashing (starts with $2)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'bcrypt@nyu.edu', password: 'pass123' })

      const user = await User.findById(res.body.data._id).select('+password')
      expect(user.password).to.match(/^\$2[aby]\$/)
    })

    it('should hash same password differently for different users', async () => {
      const res1 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User1', email: 'user1@nyu.edu', password: 'samepass' })

      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User2', email: 'user2@nyu.edu', password: 'samepass' })

      const user1 = await User.findById(res1.body.data._id).select('+password')
      const user2 = await User.findById(res2.body.data._id).select('+password')

      // Same password should produce different hashes (bcrypt uses salt)
      expect(user1.password).to.not.equal(user2.password)
    })

    it('should verify password correctly with bcrypt', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'verify@nyu.edu', password: 'mypassword' })

      // Login should work with correct password
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'verify@nyu.edu', password: 'mypassword' })

      expect(res.status).to.equal(200)
    })
  })

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle very long names', async () => {
      const longName = 'A'.repeat(100)
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: longName, email: 'long@nyu.edu', password: 'pass123' })

      expect(res.status).to.equal(201)
      expect(res.body.data.name).to.equal(longName)
    })

    it('should handle names with special characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: "O'Brien-Smith", email: 'special@nyu.edu', password: 'pass123' })

      expect(res.status).to.equal(201)
      expect(res.body.data.name).to.equal("O'Brien-Smith")
    })

    it('should trim whitespace from name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: '  Test User  ', email: 'trim@nyu.edu', password: 'pass123' })

      expect(res.status).to.equal(201)
      expect(res.body.data.name).to.equal('Test User')
    })

    it('should reject email with whitespace', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: '  test@nyu.edu  ', password: 'pass123' })

      // Email validation fails on whitespace
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
      expect(res.body.message).to.include('valid email')
    })

    it('should handle minimum valid name (2 characters)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jo', email: 'jo@nyu.edu', password: 'pass123' })

      expect(res.status).to.equal(201)
    })

    it('should reject single character name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'J', email: 'j@nyu.edu', password: 'pass123' })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.include('at least 2')
    })

    it('should handle exactly 6 character password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'min@nyu.edu', password: '123456' })

      expect(res.status).to.equal(201)
    })

    it('should return JSON content type', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'json@nyu.edu', password: 'pass123' })

      expect(res.headers['content-type']).to.match(/json/)
    })
  })

  // ============================================
  // Data Integrity
  // ============================================
  describe('Data Integrity', () => {
    it('should create user in database on register', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'db@nyu.edu', password: 'pass123' })

      const user = await User.findById(res.body.data._id)
      expect(user).to.exist
      expect(user.email).to.equal('db@nyu.edu')
    })

    it('should not create user if validation fails', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'invalid', password: 'pass123' })

      const count = await User.countDocuments()
      expect(count).to.equal(0)
    })

    it('should not create duplicate user on 409 error', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'dup@nyu.edu', password: 'pass123' })

      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test2', email: 'dup@nyu.edu', password: 'pass456' })

      const count = await User.countDocuments({ email: 'dup@nyu.edu' })
      expect(count).to.equal(1)
    })
  })
})
