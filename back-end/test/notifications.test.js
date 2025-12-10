// test/notifications.test.js
import request from 'supertest'
import { expect } from 'chai'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import { Notification, User } from '../db.js'

dotenv.config()

let token // JWT token for auth
let testUserId
let createdNotificationIds = []

describe('Notifications API Tests', () => {
  before(async () => {
    try {
      // Connect to test DB
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_UNIT_TEST_URI)
        console.log('Connected to MongoDB test database')
      }

      // Clear old data
      await Notification.deleteMany({})
      await User.deleteOne({ email: 'testnotifuser@nyu.edu' })

      // Register test user
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Notif User',
          email: 'testnotifuser@nyu.edu',
          password: 'TestPass123!@#',
        })

      expect(registerRes.status).to.equal(201)

      // Login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: 'testnotifuser@nyu.edu', 
          password: 'TestPass123!@#' 
        })

      if (loginRes.status !== 200) {
        console.error('Login failed:', loginRes.status)
        console.error('Response body:', loginRes.body)
        throw new Error(`Failed to login test user: ${loginRes.status}`)
      }

      // Extract token and userId
      token = loginRes.body.data?.token || loginRes.body.token || loginRes.body.data
      
      // Try multiple possible locations for userId
      testUserId = loginRes.body.data?.user?._id 
                || loginRes.body.data?.user?.id 
                || loginRes.body.user?._id
                || loginRes.body.user?.id
                || loginRes.body.data?._id
                || loginRes.body.data?.id

      if (!token) {
        console.error('Login response:', JSON.stringify(loginRes.body, null, 2))
        throw new Error('Token not found in login response')
      }

      if (!testUserId) {
        console.error('Login response:', JSON.stringify(loginRes.body, null, 2))
        throw new Error('User ID not found in login response')
      }

      console.log('Test user created and logged in')

      // Seed some notifications
      const notifications = await Notification.insertMany([
        {
          userId: testUserId,
          title: 'Welcome',
          message: 'Welcome to the app!',
          type: 'reminder',
          isRead: false,
          createdAt: new Date(),
        },
        {
          userId: testUserId,
          title: 'Update',
          message: 'System update completed.',
          type: 'facility_alert',
          isRead: false,
          createdAt: new Date(Date.now() - 1000),
        },
      ])

      createdNotificationIds = notifications.map(n => n._id)
    } catch (err) {
      console.error('Setup error:', err)
      throw err
    }
  })

  after(async () => {
    // Clean up
    await Notification.deleteMany({})
    await User.deleteOne({ email: 'testnotifuser@nyu.edu' })
    await mongoose.connection.close()
    console.log('Disconnected from test MongoDB')
  })

  describe('GET /api/notifications', () => {
    it('should return all notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
      
      expect(res.status).to.equal(200)
      expect(res.body.success).to.be.true
      expect(res.body.data.length).to.be.greaterThan(0)
    })

    it('should return notifications with correct structure', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
      
      const notification = res.body.data[0]
      expect(notification).to.have.property('_id')
      expect(notification).to.have.property('userId')
      expect(notification).to.have.property('title')
      expect(notification).to.have.property('message')
      expect(notification).to.have.property('type')
      expect(notification).to.have.property('isRead')
    })
  })

  describe('GET /api/notifications/user/:userId', () => {
    it('should return notifications for a specific user', async () => {
      const res = await request(app)
        .get(`/api/notifications/user/${testUserId}`)
        .set('Authorization', `Bearer ${token}`)
      
      expect(res.status).to.equal(200)
      expect(res.body.success).to.be.true
      res.body.data.forEach(n => {
        const userId = n.userId._id || n.userId
        expect(userId.toString()).to.equal(testUserId.toString())
      })
    })

    it('should return 400 for invalid userId format', async () => {
      const res = await request(app)
        .get('/api/notifications/user/invalid-id')
        .set('Authorization', `Bearer ${token}`)
      
      expect(res.status).to.equal(400)
      expect(res.body.success).to.be.false
    })

    it('should return empty array for user with no notifications', async () => {
      const newUserId = new mongoose.Types.ObjectId()
      const res = await request(app)
        .get(`/api/notifications/user/${newUserId}`)
        .set('Authorization', `Bearer ${token}`)
      
      expect(res.status).to.equal(200)
      expect(res.body.data).to.be.an('array').that.is.empty
    })
  })

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const id = createdNotificationIds[0]
      const res = await request(app)
        .put(`/api/notifications/${id}/read`)
        .set('Authorization', `Bearer ${token}`)
      
      expect(res.status).to.equal(200)
      expect(res.body.data.isRead).to.be.true
    })

    it('should return 404 for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res = await request(app)
        .put(`/api/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${token}`)
      
      expect(res.status).to.equal(404)
      expect(res.body.success).to.be.false
    })

    it('should return 400 for invalid notification ID format', async () => {
      const res = await request(app)
        .put('/api/notifications/invalid-id/read')
        .set('Authorization', `Bearer ${token}`)
      
      expect(res.status).to.equal(400)
      expect(res.body.success).to.be.false
    })
  })

  describe('Authentication', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/notifications')
      expect(res.status).to.equal(401)
    })

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer INVALID_TOKEN')
      
      expect(res.status).to.equal(401)
    })
  })

  describe('Data Integrity', () => {
    it('should have all notifications with non-empty titles and messages', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
      
      res.body.data.forEach(notification => {
        expect(notification.title).to.not.be.empty
        expect(notification.message).to.not.be.empty
      })
    })

    it('should have all notifications with valid type', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
      
      const validTypes = ['queue_update', 'queue_ready', 'goal_progress', 'reminder', 'facility_alert', 'achievement']
      res.body.data.forEach(notification => {
        expect(notification.type).to.be.a('string')
        expect(validTypes).to.include(notification.type)
      })
    })
  })
})