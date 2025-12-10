// test/helpsupp.test.js
import express from 'express'
import request from 'supertest'
import { expect } from 'chai'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import helpSupportRouter from '../routes/helpsupp.js'
import { FAQ, SupportIssue } from '../db.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use('/api/support', helpSupportRouter)

describe('Help & Support API Tests', () => {
  let createdIssueIds = []
  let testUserId // store an ObjectId of a test user for issues

  before(async () => {
    try {
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_UNIT_TEST_URI)
        console.log('MongoDB Connected')
      }

      // Clear existing test data
      await FAQ.deleteMany({})
      await SupportIssue.deleteMany({})

      // Insert sample FAQ data
      await FAQ.insertMany([
        { question: 'How to reset password?', answer: 'Use the reset link.', category: 'Account', order: 1 },
        { question: 'How to book a gym?', answer: 'Use the portal.', category: 'Account', order: 2 },
        { question: 'How to report an issue?', answer: 'Use support form.', category: 'Technical', order: 3 },
      ])

      // Insert a sample user ID to use in support issues
      testUserId = new mongoose.Types.ObjectId()

      // Insert a sample support issue
      const issue = new SupportIssue({
        userId: testUserId,
        description: 'Sample issue',
        subject: 'Support request',
        category: 'Technical',
        status: 'open',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null
      })
      await issue.save()
    } catch (err) {
      console.error('Setup error:', err)
      throw err
    }
  })

  after(async () => {
    await FAQ.deleteMany({})
    await SupportIssue.deleteMany({})
    await mongoose.connection.close()
    console.log('MongoDB Disconnected')
  })

  afterEach(async () => {
    if (createdIssueIds.length > 0) {
      await SupportIssue.deleteMany({ _id: { $in: createdIssueIds } })
      createdIssueIds = []
    }
  })

  // ---------- GET /api/support/faqs ----------
  describe('GET /api/support/faqs', () => {
    it('should return all FAQs with success status', async () => {
      const res = await request(app).get('/api/support/faqs')
      expect(res.status).to.equal(200)
      expect(res.body.success).to.be.true
      expect(res.body.data).to.be.an('array')
      expect(res.body).to.have.property('message', 'FAQs retrieved successfully')
    })

    it('should filter FAQs by category', async () => {
      const res = await request(app).get('/api/support/faqs').query({ category: 'Account' })
      expect(res.status).to.equal(200)
      res.body.data.forEach(faq => {
        expect(faq.category.toLowerCase()).to.equal('account')
      })
    })
  })

  // ---------- GET /api/support/issues/user/:userId ----------
  describe('GET /api/support/issues/user/:userId', () => {
    it('should return support issues for a valid userId', async () => {
      const res = await request(app).get(`/api/support/issues/user/${testUserId}`)
      expect(res.status).to.equal(200)
      expect(res.body.success).to.be.true
      res.body.data.forEach(issue => {
        expect(issue.userId).to.equal(testUserId.toString())
      })
    })

    it('should return 400 for invalid userId', async () => {
      const res = await request(app).get('/api/support/issues/user/123invalid')
      expect(res.status).to.equal(400)
      expect(res.body.success).to.be.false
    })
  })

  // ---------- POST /api/support/issues ----------
  describe('POST /api/support/issues', () => {
    it('should create a new support issue with valid data', async () => {
      const payload = {
        userId: testUserId,
        message: 'The treadmill is broken'
      }
      const res = await request(app).post('/api/support/issues').send(payload)
      expect(res.status).to.equal(201)
      expect(res.body.success).to.be.true
      expect(res.body.data.userId).to.equal(testUserId.toString())
      expect(res.body.data.description).to.equal(payload.message)
      createdIssueIds.push(res.body.data._id)
    })

    it('should apply default subject, category, and priority', async () => {
      const payload = { userId: testUserId, message: 'Feedback' }
      const res = await request(app).post('/api/support/issues').send(payload)
      expect(res.status).to.equal(201)
      expect(res.body.data.subject).to.equal('Support request')
      expect(res.body.data.category).to.equal('Other')
      expect(res.body.data.priority).to.equal('medium')
      createdIssueIds.push(res.body.data._id)
    })

    it('should return 400 if userId or message missing', async () => {
      const res = await request(app).post('/api/support/issues').send({ userId: testUserId })
      expect(res.status).to.equal(400)
      expect(res.body.success).to.be.false
    })

    it('should return 500 for invalid userId string', async () => {
      const res = await request(app).post('/api/support/issues').send({ userId: 'abc', message: 'Bad id' })
      expect(res.status).to.equal(500)
      expect(res.body.success).to.be.false
    })
  })
})