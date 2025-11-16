// test/settings.test.js
import request from 'supertest'
import { expect } from 'chai'
import express from 'express'

import settingsRouter from '../routes/settings.js'
import {
  users,
  queues,
  goals,
  history,
  notifications,
  supportIssues,
  getNextId
} from '../utils/mockData.js'

// Mini app just for the settings router
const app = express()
app.use(express.json())
app.use('/api/settings', settingsRouter)

describe('Settings API Tests', () => {
  describe('GET /api/settings', () => {
    it('should return a health check message', async () => {
      const res = await request(app).get('/api/settings')

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('message', 'Settings API is running')
    })
  })

  describe('DELETE /api/settings/account/:userId', () => {
    let tempUserId

    // Helper to remove all records for tempUserId from an array
    const cleanByUserId = (arr, id) => {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].userId === id) {
          arr.splice(i, 1)
        }
      }
    }

    beforeEach(() => {
      // Create a temporary user and some related records
      tempUserId = getNextId(users)

      users.push({
        id: tempUserId,
        name: 'Temp Settings User',
        email: `temp-settings-${tempUserId}@example.com`,
        password: 'password123'
      })

      queues.push({ id: getNextId(queues), userId: tempUserId, zoneId: 1 })
      goals.push({ id: getNextId(goals), userId: tempUserId, title: 'Temp goal' })
      history.push({ id: getNextId(history), userId: tempUserId, gym: 'Test Gym' })
      notifications.push({
        id: getNextId(notifications),
        userId: tempUserId,
        title: 'Temp notification'
      })
      supportIssues.push({
        id: getNextId(supportIssues),
        userId: tempUserId,
        subject: 'Temp issue'
      })
    })

    afterEach(() => {
      // Clean up any leftover records for tempUserId
      const userIndex = users.findIndex(u => u.id === tempUserId)
      if (userIndex !== -1) {
        users.splice(userIndex, 1)
      }

      cleanByUserId(queues, tempUserId)
      cleanByUserId(goals, tempUserId)
      cleanByUserId(history, tempUserId)
      cleanByUserId(notifications, tempUserId)
      cleanByUserId(supportIssues, tempUserId)
    })

    it('should delete a user account and related records', async () => {
      // Sanity check: records exist before deletion
      expect(users.find(u => u.id === tempUserId)).to.exist
      expect(queues.some(q => q.userId === tempUserId)).to.be.true

      const res = await request(app).delete(
        `/api/settings/account/${tempUserId}`
      )

      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property(
        'message',
        'Account deleted successfully'
      )

      expect(res.body.data).to.have.property('user')
      expect(res.body.data.user.id).to.equal(tempUserId)

      // Removed records counts should be >= 0, and at least one queue/goal/etc was removed
      const removed = res.body.data.removedRecords
      expect(removed).to.have.property('queues')
      expect(removed).to.have.property('goals')
      expect(removed).to.have.property('history')
      expect(removed).to.have.property('notifications')
      expect(removed).to.have.property('supportIssues')
      expect(removed.queues).to.be.at.least(1)

      // Arrays should no longer contain this user
      expect(users.find(u => u.id === tempUserId)).to.be.undefined
      expect(queues.some(q => q.userId === tempUserId)).to.be.false
      expect(goals.some(g => g.userId === tempUserId)).to.be.false
      expect(history.some(h => h.userId === tempUserId)).to.be.false
      expect(notifications.some(n => n.userId === tempUserId)).to.be.false
      expect(supportIssues.some(s => s.userId === tempUserId)).to.be.false
    })

    it('should return 404 when deleting a non-existent user', async () => {
      const res = await request(app).delete('/api/settings/account/999999')

      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'User not found')
    })

    it('should respond with JSON for delete endpoint', async () => {
      const res = await request(app).delete(
        `/api/settings/account/${tempUserId}`
      )

      expect(res.headers['content-type']).to.match(/json/)
    })
  })
})
