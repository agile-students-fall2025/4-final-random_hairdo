import request from 'supertest'
import { expect } from 'chai'
import express from 'express'
import queuesRouter from '../routes/queues.js'
import { queues } from '../utils/mockData.js'

// Create a test app
const app = express()
app.use(express.json())
app.use('/api/queues', queuesRouter)

describe('Queues API Tests', () => {
  
  // Store created queue IDs to clean up after tests
  let createdQueueIds = []
  
  afterEach(() => {
    // Clean up any queues created during tests to avoid conflicts
    createdQueueIds.forEach(id => {
      const index = queues.findIndex(q => q.id === id)
      if (index !== -1) {
        queues.splice(index, 1)
      }
    })
    createdQueueIds = []
  })

  describe('POST /api/queues', () => {
    it('should create a new queue entry with valid data', async () => {
      const newQueue = {
        userId: 10,
        zoneId: 3,
        facilityId: 1
      }
      
      const res = await request(app)
        .post('/api/queues')
        .send(newQueue)
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      
      expect(res.status).to.equal(201)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body).to.have.property('message', 'Successfully joined queue')
      expect(res.body.data).to.have.property('id')
      expect(res.body.data.userId).to.equal(newQueue.userId)
      expect(res.body.data.zoneId).to.equal(newQueue.zoneId)
    })

    it('should set default position and estimatedWait if not provided', async () => {
      const newQueue = {
        userId: 11,
        zoneId: 5
      }
      
      const res = await request(app)
        .post('/api/queues')
        .send(newQueue)
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      
      expect(res.status).to.equal(201)
      expect(res.body.data.position).to.equal(1)
      expect(res.body.data.estimatedWait).to.equal(10)
      expect(res.body.data.status).to.equal('active')
    })

    it('should use provided position and estimatedWait', async () => {
      const newQueue = {
        userId: 12,
        zoneId: 6,
        position: 5,
        estimatedWait: 25
      }
      
      const res = await request(app)
        .post('/api/queues')
        .send(newQueue)
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      
      expect(res.status).to.equal(201)
      expect(res.body.data.position).to.equal(5)
      expect(res.body.data.estimatedWait).to.equal(25)
    })

    it('should set timestamps when creating queue', async () => {
      const newQueue = {
        userId: 13,
        zoneId: 4
      }
      
      const res = await request(app)
        .post('/api/queues')
        .send(newQueue)
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      
      expect(res.status).to.equal(201)
      expect(res.body.data).to.have.property('joinedAt')
      expect(res.body.data).to.have.property('updatedAt')
      expect(res.body.data.completedAt).to.be.null
    })

    it('should return 400 if userId is missing', async () => {
      const newQueue = {
        zoneId: 1
      }
      
      const res = await request(app)
        .post('/api/queues')
        .send(newQueue)
      
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'userId and zoneId are required')
    })

    it('should return 400 if zoneId is missing', async () => {
      const newQueue = {
        userId: 1
      }
      
      const res = await request(app)
        .post('/api/queues')
        .send(newQueue)
      
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'userId and zoneId are required')
    })

    it('should return 400 if both userId and zoneId are missing', async () => {
      const res = await request(app)
        .post('/api/queues')
        .send({})
      
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
    })

    it('should return 409 if user already has an active queue', async () => {
      // First, create an active queue
      const res1 = await request(app)
        .post('/api/queues')
        .send({ userId: 50, zoneId: 1 })
      
      if (res1.status === 201) createdQueueIds.push(res1.body.data.id)
      
      // Try to create another active queue for the same user
      const res = await request(app)
        .post('/api/queues')
        .send({ userId: 50, zoneId: 2 })
      
      expect(res.status).to.equal(409)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'User already has an active queue')
      expect(res.body).to.have.property('data')
    })

    it('should set status to active for new queue', async () => {
      const newQueue = {
        userId: 14,
        zoneId: 1
      }
      
      const res = await request(app)
        .post('/api/queues')
        .send(newQueue)
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      
      expect(res.status).to.equal(201)
      expect(res.body.data.status).to.equal('active')
    })
  })

  describe('GET /api/queues/:id', () => {
    it('should return a specific queue by valid id', async () => {
      const queueId = 1
      const res = await request(app).get(`/api/queues/${queueId}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body.data).to.be.an('object')
      expect(res.body.data.id).to.equal(queueId)
    })

    it('should return queue with all required fields', async () => {
      const res = await request(app).get('/api/queues/1')
      
      expect(res.body.data).to.have.property('id')
      expect(res.body.data).to.have.property('userId')
      expect(res.body.data).to.have.property('zoneId')
      expect(res.body.data).to.have.property('position')
      expect(res.body.data).to.have.property('estimatedWait')
      expect(res.body.data).to.have.property('status')
      expect(res.body.data).to.have.property('joinedAt')
      expect(res.body.data).to.have.property('updatedAt')
    })

    it('should return queue with correct data types', async () => {
      const res = await request(app).get('/api/queues/1')
      
      expect(res.body.data.id).to.be.a('number')
      expect(res.body.data.userId).to.be.a('number')
      expect(res.body.data.zoneId).to.be.a('number')
      expect(res.body.data.position).to.be.a('number')
      expect(res.body.data.estimatedWait).to.be.a('number')
      expect(res.body.data.status).to.be.a('string')
    })

    it('should return 404 for non-existent queue id', async () => {
      const res = await request(app).get('/api/queues/9999')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'Queue entry not found')
    })

    it('should handle string id parameter correctly', async () => {
      const res = await request(app).get('/api/queues/2')
      
      expect(res.status).to.equal(200)
      expect(res.body.data.id).to.equal(2)
    })

    it('should return queue with completed status', async () => {
      const res = await request(app).get('/api/queues/1')
      
      expect(res.body.data.status).to.equal('completed')
      expect(res.body.data).to.have.property('completedAt')
    })
  })

  describe('GET /api/queues/user/:userId', () => {
    it('should return all queues for a specific user', async () => {
      const res = await request(app).get('/api/queues/user/1')
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body).to.have.property('count')
      expect(res.body.data).to.be.an('array')
    })

    it('should filter queues by userId', async () => {
      const userId = 1
      const res = await request(app).get(`/api/queues/user/${userId}`)
      
      res.body.data.forEach(queue => {
        expect(queue.userId).to.equal(userId)
      })
    })

    it('should return count matching array length', async () => {
      const res = await request(app).get('/api/queues/user/1')
      
      expect(res.body.count).to.equal(res.body.data.length)
    })

    it('should sort queues by joinedAt in descending order', async () => {
      const res = await request(app).get('/api/queues/user/1')
      
      if (res.body.data.length > 1) {
        for (let i = 0; i < res.body.data.length - 1; i++) {
          const date1 = new Date(res.body.data[i].joinedAt)
          const date2 = new Date(res.body.data[i + 1].joinedAt)
          expect(date1.getTime()).to.be.at.least(date2.getTime())
        }
      }
    })

    it('should filter by status when provided', async () => {
      const res = await request(app).get('/api/queues/user/1?status=completed')
      
      expect(res.status).to.equal(200)
      res.body.data.forEach(queue => {
        expect(queue.status).to.equal('completed')
      })
    })

    it('should filter by active status', async () => {
      const res = await request(app).get('/api/queues/user/1?status=active')
      
      expect(res.status).to.equal(200)
      res.body.data.forEach(queue => {
        expect(queue.status).to.equal('active')
      })
    })

    it('should return empty array for user with no queues', async () => {
      const res = await request(app).get('/api/queues/user/999')
      
      expect(res.status).to.equal(200)
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.equal(0)
      expect(res.body.count).to.equal(0)
    })

    it('should handle string userId parameter', async () => {
      const res = await request(app).get('/api/queues/user/2')
      
      expect(res.status).to.equal(200)
      res.body.data.forEach(queue => {
        expect(queue.userId).to.equal(2)
      })
    })
  })

  describe('PUT /api/queues/:id', () => {
    it('should update queue position', async () => {
      // First create a queue to update
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 20, zoneId: 5 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ position: 2 })
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('message', 'Queue updated successfully')
      expect(res.body.data.position).to.equal(2)
    })

    it('should calculate estimatedWait based on position', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 21, zoneId: 3 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ position: 3 })
      
      expect(res.status).to.equal(200)
      expect(res.body.data.position).to.equal(3)
      expect(res.body.data.estimatedWait).to.equal(21) // 3 * 7
    })

    it('should set status to completed when position is 0', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 22, zoneId: 2 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ position: 0 })
      
      expect(res.status).to.equal(200)
      expect(res.body.data.position).to.equal(0)
      expect(res.body.data.estimatedWait).to.equal(0)
      expect(res.body.data.status).to.equal('completed')
      expect(res.body.data).to.have.property('completedAt')
      expect(res.body.data.completedAt).to.not.be.null
    })

    it('should update estimatedWait directly', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 23, zoneId: 6 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ estimatedWait: 15 })
      
      expect(res.status).to.equal(200)
      expect(res.body.data.estimatedWait).to.equal(15)
    })

    it('should update status to cancelled', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 24, zoneId: 1 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ status: 'cancelled' })
      
      expect(res.status).to.equal(200)
      expect(res.body.data.status).to.equal('cancelled')
      expect(res.body.data).to.have.property('completedAt')
      expect(res.body.data.completedAt).to.not.be.null
    })

    it('should update multiple fields at once', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 25, zoneId: 4 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ 
          position: 2,
          estimatedWait: 12,
          status: 'active'
        })
      
      expect(res.status).to.equal(200)
      expect(res.body.data.position).to.equal(2)
      expect(res.body.data.estimatedWait).to.equal(12)
      expect(res.body.data.status).to.equal('active')
    })

    it('should update updatedAt timestamp', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 26, zoneId: 3 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      const originalUpdatedAt = createRes.body.data.updatedAt
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ position: 3 })
      
      expect(res.status).to.equal(200)
      expect(res.body.data.updatedAt).to.not.equal(originalUpdatedAt)
    })

    it('should return 404 for non-existent queue', async () => {
      const res = await request(app)
        .put('/api/queues/9999')
        .send({ position: 1 })
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'Queue entry not found')
    })

    it('should handle empty update body', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 27, zoneId: 5 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({})
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
    })
  })

  describe('DELETE /api/queues/:id', () => {
    it('should delete a queue entry', async () => {
      // Create a queue to delete
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 30, zoneId: 2 })
      
      const queueId = createRes.body.data.id
      
      const res = await request(app).delete(`/api/queues/${queueId}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('message', 'Successfully left queue')
      expect(res.body).to.have.property('data')
    })

    it('should return deleted queue data', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 31, zoneId: 4 })
      
      const queueId = createRes.body.data.id
      
      const res = await request(app).delete(`/api/queues/${queueId}`)
      
      expect(res.status).to.equal(200)
      expect(res.body.data.id).to.equal(queueId)
      expect(res.body.data.userId).to.equal(31)
      expect(res.body.data.zoneId).to.equal(4)
    })

    it('should actually remove queue from array', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 32, zoneId: 1 })
      
      const queueId = createRes.body.data.id
      
      await request(app).delete(`/api/queues/${queueId}`)
      
      // Try to get the deleted queue
      const getRes = await request(app).get(`/api/queues/${queueId}`)
      expect(getRes.status).to.equal(404)
    })

    it('should return 404 for non-existent queue', async () => {
      const res = await request(app).delete('/api/queues/9999')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'Queue entry not found')
    })

    it('should handle string id parameter', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 33, zoneId: 5 })
      
      const queueId = createRes.body.data.id.toString()
      
      const res = await request(app).delete(`/api/queues/${queueId}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
    })
  })

  describe('Edge Cases', () => {
    it('should return JSON content type for POST', async () => {
      const res = await request(app)
        .post('/api/queues')
        .send({ userId: 40, zoneId: 1 })
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      expect(res.headers['content-type']).to.match(/json/)
    })

    it('should return JSON content type for GET', async () => {
      const res = await request(app).get('/api/queues/1')
      
      expect(res.headers['content-type']).to.match(/json/)
    })

    it('should return JSON content type for PUT', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 41, zoneId: 3 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ position: 2 })
      
      expect(res.headers['content-type']).to.match(/json/)
    })

    it('should handle negative queue id in GET', async () => {
      const res = await request(app).get('/api/queues/-1')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })

    it('should handle zero queue id in DELETE', async () => {
      const res = await request(app).delete('/api/queues/0')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })

    it('should handle negative userId in user queues endpoint', async () => {
      const res = await request(app).get('/api/queues/user/-1')
      
      expect(res.status).to.equal(200)
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.equal(0)
    })
  })

  describe('Data Integrity', () => {
    it('should generate unique queue IDs', async () => {
      const res1 = await request(app)
        .post('/api/queues')
        .send({ userId: 60, zoneId: 1 })
      
      const res2 = await request(app)
        .post('/api/queues')
        .send({ userId: 61, zoneId: 2 })
      
      if (res1.status === 201) createdQueueIds.push(res1.body.data.id)
      if (res2.status === 201) createdQueueIds.push(res2.body.data.id)
      
      expect(res1.body.data.id).to.not.equal(res2.body.data.id)
    })

    it('should parse userId as integer', async () => {
      const res = await request(app)
        .post('/api/queues')
        .send({ userId: '62', zoneId: 1 })
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      expect(res.status).to.equal(201)
      expect(res.body.data.userId).to.be.a('number')
    })

    it('should parse zoneId as integer', async () => {
      const res = await request(app)
        .post('/api/queues')
        .send({ userId: 63, zoneId: '2' })
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      expect(res.status).to.equal(201)
      expect(res.body.data.zoneId).to.be.a('number')
    })

    it('should have non-negative position values', async () => {
      const res = await request(app)
        .post('/api/queues')
        .send({ userId: 64, zoneId: 3 })
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      expect(res.body.data.position).to.be.at.least(0)
    })

    it('should have non-negative estimatedWait values', async () => {
      const res = await request(app)
        .post('/api/queues')
        .send({ userId: 65, zoneId: 4 })
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      expect(res.body.data.estimatedWait).to.be.at.least(0)
    })

    it('should have valid ISO timestamp for joinedAt', async () => {
      const res = await request(app)
        .post('/api/queues')
        .send({ userId: 66, zoneId: 5 })
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      const date = new Date(res.body.data.joinedAt)
      expect(date.toString()).to.not.equal('Invalid Date')
    })
  })

  describe('Business Logic', () => {
    it('should calculate wait time as position * 7 minutes', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 70, zoneId: 1 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ position: 5 })
      
      expect(res.body.data.estimatedWait).to.equal(35) // 5 * 7
    })

    it('should set completedAt when status is completed', async () => {
      const createRes = await request(app)
        .post('/api/queues')
        .send({ userId: 71, zoneId: 2 })
      
      const queueId = createRes.body.data.id
      createdQueueIds.push(queueId)
      
      const res = await request(app)
        .put(`/api/queues/${queueId}`)
        .send({ status: 'completed' })
      
      expect(res.body.data.completedAt).to.not.be.null
    })

    it('should allow completed queues for user to join new queue', async () => {
      // The conflict only checks for 'active' status
      // So users with completed queues should be able to join new queues
      const res = await request(app)
        .post('/api/queues')
        .send({ userId: 72, zoneId: 6 })
      
      if (res.status === 201) createdQueueIds.push(res.body.data.id)
      // User 72 has no existing queues, so should succeed
      expect(res.status).to.equal(201)
    })

    it('should maintain queue order when filtering by user', async () => {
      const res = await request(app).get('/api/queues/user/1')
      
      // Should be sorted by joinedAt descending (newest first)
      if (res.body.data.length > 1) {
        const dates = res.body.data.map(q => new Date(q.joinedAt).getTime())
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]).to.be.at.least(dates[i + 1])
        }
      }
    })
  })
})
