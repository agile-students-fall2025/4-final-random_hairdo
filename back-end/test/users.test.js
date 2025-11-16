// test/users.test.js
import request from 'supertest'
import { expect } from 'chai'
import express from 'express'
import usersRouter from '../routes/users.js'
import { users } from '../utils/mockData.js'

// Create isolated test app
const app = express()
app.use(express.json())
app.use('/api/users', usersRouter)

describe('Users API Tests', () => {
  
  // ============================================
  // GET /api/users (All Users)
  // ============================================
  
  describe('GET /api/users', () => {
    it('should return all users with success status', async () => {
      const res = await request(app).get('/api/users')
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body).to.have.property('count')
    })
    
    it('should return an array of users', async () => {
      const res = await request(app).get('/api/users')
      
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.be.greaterThan(0)
    })
    
    it('should return correct count', async () => {
      const res = await request(app).get('/api/users')
      
      expect(res.body.count).to.equal(res.body.data.length)
    })
    
    it('should not include passwords in response', async () => {
      const res = await request(app).get('/api/users')
      
      res.body.data.forEach(user => {
        expect(user).to.not.have.property('password')
      })
    })
  })
  
  // ============================================
  // GET /api/users/:id (Single User)
  // ============================================
  
  describe('GET /api/users/:id', () => {
    it('should return user by valid ID', async () => {
      const res = await request(app).get('/api/users/1')
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data).to.have.property('id', 1)
    })

    it('should return user with correct structure', async () => {
      const res = await request(app).get('/api/users/1')
      
      const user = res.body.data
      
      // Required fields (must exist)
      expect(user).to.have.property('id')
      expect(user).to.be.an('object')
      expect(user.id).to.be.a('number')
      expect(user).to.have.property('name')
      expect(user.name).to.be.a('string')
      expect(user).to.have.property('email')
      expect(user.email).to.be.a('string')
    })
    
    it('should not include password in response', async () => {
      const res = await request(app).get('/api/users/1')
      
      expect(res.body.data).to.not.have.property('password')
    })
    
    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/api/users/999')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })
  })
  
  // ============================================
  // POST /api/users/register
  // ============================================
  
  describe('POST /api/users/register', () => {
    it('should register new user with valid data', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'test@nyu.edu',
          password: 'test123'
        })
      
      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data).to.have.property('id')
      expect(res.body.data.email).to.equal('test@nyu.edu')
    })
    
    it('should not return password in response', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'User2',
          email: 'user2@nyu.edu',
          password: 'pass123'
        })
      
      expect(res.body.data).to.not.have.property('password')
    })
    
    it('should apply default values for optional fields', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Min User',
          email: 'min@nyu.edu',
          password: 'pass123'
        })
      
      expect(res.body.data.year).to.equal('Not specified')
      expect(res.body.data.fitnessLevel).to.equal('Beginner')
      expect(res.body.data.preferredGym).to.equal('Palladium')
    })
    
    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@nyu.edu', password: 'test123' })
      
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
    })
    
    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Test', email: 'invalid', password: 'test123' })
      
      expect(res.status).to.equal(400)
    })
    
    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Test', email: 'test@nyu.edu', password: '123' })
      
      expect(res.status).to.equal(400)
    })
    
    it('should return 409 for duplicate email', async () => {
      await request(app)
        .post('/api/users/register')
        .send({ name: 'User', email: 'dup@nyu.edu', password: 'pass123' })
      
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'User2', email: 'dup@nyu.edu', password: 'pass456' })
      
      expect(res.status).to.equal(409)
    })
  })
  
  // ============================================
  // POST /api/users/login
  // ============================================
  
  describe('POST /api/users/login', () => {
    before(async () => {
      await request(app)
        .post('/api/users/register')
        .send({ name: 'Login User', email: 'login@nyu.edu', password: 'login123' })
    })
    
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@nyu.edu', password: 'login123' })
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data).to.have.property('email', 'login@nyu.edu')
    })
    
    it('should not return password in login response', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@nyu.edu', password: 'login123' })
      
      expect(res.body.data).to.not.have.property('password')
    })
    
    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'login@nyu.edu', password: 'wrong' })
      
      expect(res.status).to.equal(401)
      expect(res.body).to.have.property('success', false)
    })
    
    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'none@nyu.edu', password: 'pass123' })
      
      expect(res.status).to.equal(401)
    })
    
    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ password: 'pass123' })
      
      expect(res.status).to.equal(400)
    })
  })
  
  // ============================================
  // PUT /api/users/:id
  // ============================================
  
  describe('PUT /api/users/:id', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/1')
        .send({ bio: 'Updated bio' })
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data.bio).to.equal('Updated bio')
    })
    
    it('should update multiple fields', async () => {
      const res = await request(app)
        .put('/api/users/1')
        .send({ year: 'Junior', major: 'Biology' })
      
      expect(res.body.data.year).to.equal('Junior')
      expect(res.body.data.major).to.equal('Biology')
    })
    
    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .put('/api/users/999')
        .send({ name: 'Test' })
      
      expect(res.status).to.equal(404)
    })
    
    it('should return 400 with empty body', async () => {
      const res = await request(app)
        .put('/api/users/1')
        .send({})
      
      expect(res.status).to.equal(400)
    })
    
    it('should validate email format', async () => {
      const res = await request(app)
        .put('/api/users/1')
        .send({ email: 'invalid' })
      
      expect(res.status).to.equal(400)
    })
  })
  
  // ============================================
  // Data Integrity Tests
  // ============================================
  
  describe('Data Integrity', () => {
    it('should have unique user IDs', async () => {
      const res = await request(app).get('/api/users')
      
      const ids = res.body.data.map(u => u.id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).to.equal(uniqueIds.length)
    })
    
    it('should have all users with non-empty names', async () => {
      const res = await request(app).get('/api/users')
      
      res.body.data.forEach(user => {
        expect(user.name).to.be.a('string')
        expect(user.name.length).to.be.greaterThan(0)
      })
    })
    
    it('should have all users with valid email format', async () => {
      const res = await request(app).get('/api/users')
      
      res.body.data.forEach(user => {
        expect(user.email).to.include('@')
      })
    })
    
    it('should have valid data types', async () => {
      const res = await request(app).get('/api/users/1')
      
      const user = res.body.data
      expect(user.id).to.be.a('number')
      expect(user.name).to.be.a('string')
      expect(user.email).to.be.a('string')
      expect(user.year).to.be.a('string')
      expect(user.major).to.be.a('string')
    })
  })
  
  // ============================================
  // Edge Cases
  // ============================================
  
  describe('Edge Cases', () => {
    it('should return JSON content type', async () => {
      const res = await request(app).get('/api/users')
      
      expect(res.headers['content-type']).to.match(/json/)
    })
    
    it('should handle negative user ID', async () => {
      const res = await request(app).get('/api/users/-1')
      
      expect(res.status).to.equal(404)
    })
    
    it('should handle case-insensitive email in login', async () => {
      await request(app)
        .post('/api/users/register')
        .send({ name: 'Case User', email: 'case@nyu.edu', password: 'pass123' })
      
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'CASE@NYU.EDU', password: 'pass123' })
      
      expect(res.status).to.equal(200)
    })
  })
})