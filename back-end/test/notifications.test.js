// test/notifications.test.js
import request from 'supertest'
import { expect } from 'chai'
import express from 'express'
import notificationsRouter from '../routes/notifications.js'
import { notifications } from '../utils/mockData.js'

// Create a tiny test app that only mounts the notifications router
const app = express()
app.use(express.json())
app.use('/api/notifications', notificationsRouter)

describe('Notifications API Tests', () => {
  describe('GET /api/notifications', () => {
    it('should return all notifications with success status', async () => {
      const res = await request(app).get('/api/notifications')

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body).to.have.property(
        'message',
        'All notifications retrieved successfully'
      )
      expect(res.body.data).to.be.an('array')
    })

    it('should return the same number of notifications as in mockData', async () => {
      const res = await request(app).get('/api/notifications')

      expect(res.status).to.equal(200)
      expect(res.body.data.length).to.equal(notifications.length)
    })

    it('should respond with JSON content type', async () => {
      const res = await request(app).get('/api/notifications')

      expect(res.headers['content-type']).to.match(/json/)
    })
  })

  describe('GET /api/notifications/user/:userId', () => {
    it('should return notifications only for the specified user', async () => {
      // Grab a real userId from mockData so test is robust
      const sample = notifications[0]
      const userId = sample.userId

      const res = await request(app).get(`/api/notifications/user/${userId}`)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property(
        'message',
        'User notifications retrieved successfully'
      )
      expect(res.body.data).to.be.an('array')

      // Every notification should belong to that user
      res.body.data.forEach(n => {
        expect(n.userId).to.equal(userId)
      })
    })

    it('should sort notifications by createdAt in descending order (newest first)', async () => {
      const sample = notifications[0]
      const userId = sample.userId

      const res = await request(app).get(`/api/notifications/user/${userId}`)

      expect(res.status).to.equal(200)
      const data = res.body.data

      if (data.length > 1) {
        for (let i = 0; i < data.length - 1; i++) {
          const t1 = new Date(data[i].createdAt).getTime()
          const t2 = new Date(data[i + 1].createdAt).getTime()
          expect(t1).to.be.at.least(t2) // newest first
        }
      }
    })
  })

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      // Pick an existing notification id from mockData
      const sample = notifications[0]
      const id = sample.id

      const res = await request(app).put(`/api/notifications/${id}/read`)

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property(
        'message',
        'Notification marked as read'
      )
      expect(res.body.data).to.have.property('id', id)
      expect(res.body.data).to.have.property('isRead', true)
    })

    it('should return 404 for a non-existent notification id', async () => {
      const res = await request(app).put('/api/notifications/999999/read')

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'Notification not found')
    })
  })
})
