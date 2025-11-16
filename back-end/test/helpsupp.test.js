// test/helpsupp.test.js
import express from 'express'
import request from 'supertest'
import { expect } from 'chai'
import helpSupportRouter from '../routes/helpsupp.js'
import { faqs, supportIssues } from '../utils/mockData.js'

// Create a tiny test app and mount the router like in app.js
const app = express()
app.use(express.json())
app.use('/api/support', helpSupportRouter)

describe('Help & Support API Tests', () => {
  // Track any issues we create so we can clean them up
  let createdIssueIds = []

  afterEach(() => {
    if (createdIssueIds.length > 0) {
      for (let i = supportIssues.length - 1; i >= 0; i--) {
        if (createdIssueIds.includes(supportIssues[i].id)) {
          supportIssues.splice(i, 1)
        }
      }
      createdIssueIds = []
    }
  })

  // ---------- GET /api/support/faqs ----------
  describe('GET /api/support/faqs', () => {
    it('should return all FAQs with success status', async () => {
      const res = await request(app).get('/api/support/faqs')

      expect(res.status).to.equal(200)
      expect(res.body.success).to.be.true
      expect(res.body).to.have.property('data')
      expect(res.body.data).to.be.an('array')
      expect(res.body).to.have.property('message', 'FAQs retrieved successfully')
    })

    it('should return the same number of FAQs as in mockData', async () => {
      const res = await request(app).get('/api/support/faqs')

      expect(res.status).to.equal(200)
      expect(res.body.data.length).to.equal(faqs.length)
    })

    it('should sort FAQs by order in ascending order', async () => {
      const res = await request(app).get('/api/support/faqs')

      const orders = res.body.data.map(f => f.order)
      for (let i = 0; i < orders.length - 1; i++) {
        expect(orders[i]).to.be.at.most(orders[i + 1])
      }
    })

    it('should filter FAQs by category when category query is provided', async () => {
      // Use a category that we know exists from mockData
      const category = faqs[0].category

      const res = await request(app)
        .get('/api/support/faqs')
        .query({ category })

      expect(res.status).to.equal(200)
      expect(res.body.success).to.be.true
      expect(res.body.data).to.be.an('array')
      res.body.data.forEach(faq => {
        expect(faq.category.toLowerCase()).to.equal(category.toLowerCase())
      })
    })
  })

  // ---------- GET /api/support/issues/user/:userId ----------
  describe('GET /api/support/issues/user/:userId', () => {
    it('should return support issues only for the specified user', async () => {
      // Pick a userId that actually exists in the mock data
      const userId = supportIssues.length > 0 ? supportIssues[0].userId : 1

      const res = await request(app)
        .get(`/api/support/issues/user/${userId}`)

      expect(res.status).to.equal(200)
      expect(res.body.success).to.be.true
      expect(res.body.data).to.be.an('array')
      res.body.data.forEach(issue => {
        expect(issue.userId).to.equal(userId)
      })
    })

    it('should return JSON content type', async () => {
      const userId = supportIssues.length > 0 ? supportIssues[0].userId : 1

      const res = await request(app)
        .get(`/api/support/issues/user/${userId}`)

      expect(res.headers['content-type']).to.match(/json/)
    })
  })

  // ---------- POST /api/support/issues ----------
  describe('POST /api/support/issues', () => {
    it('should create a new support issue with valid data', async () => {
      const payload = {
        userId: 1,
        message: 'The treadmill in Palladium is broken'
      }

      const initialLength = supportIssues.length

      const res = await request(app)
        .post('/api/support/issues')
        .send(payload)

      expect(res.status).to.equal(201)
      expect(res.body.success).to.be.true
      expect(res.body.data).to.have.property('id')
      expect(res.body.data.userId).to.equal(1)
      expect(res.body.data.description).to.equal(payload.message)
      expect(res.body.data.status).to.equal('open')
      expect(res.body.data).to.have.property('createdAt')
      expect(res.body.data).to.have.property('updatedAt')
      expect(res.body.data.resolvedAt).to.be.null

      // Track for cleanup
      createdIssueIds.push(res.body.data.id)

      // Confirm it was actually added to the in-memory array
      expect(supportIssues.length).to.equal(initialLength + 1)
    })

    it('should apply default subject, category, and priority when not provided', async () => {
      const payload = {
        userId: 2,
        message: 'General feedback'
      }

      const res = await request(app)
        .post('/api/support/issues')
        .send(payload)

      expect(res.status).to.equal(201)
      expect(res.body.success).to.be.true

      const issue = res.body.data
      createdIssueIds.push(issue.id)

      expect(issue.subject).to.equal('Support request')
      expect(issue.category).to.equal('General')
      expect(issue.priority).to.equal('medium')
    })

    it('should return 400 when userId or message is missing', async () => {
      const res = await request(app)
        .post('/api/support/issues')
        .send({ userId: 1 })   // missing message

      expect(res.status).to.equal(400)
      expect(res.body.success).to.be.false
      expect(res.body.error).to.equal('userId and message are required')
    })

    it('should return 400 when userId is not a valid number', async () => {
      const res = await request(app)
        .post('/api/support/issues')
        .send({ userId: 'abc', message: 'Bad id' })

      expect(res.status).to.equal(400)
      expect(res.body.success).to.be.false
      expect(res.body.error).to.equal('Invalid userId')
    })
  })
})
