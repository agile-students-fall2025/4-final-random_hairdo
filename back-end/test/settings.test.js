// test/settings.test.js
import request from 'supertest'
import { expect } from 'chai'
import express from 'express'

// Router under test
import settingsRouter from '../routes/settings.js'

// Seed/inspect the in-memory data
import {
  users,
  queues,
  goals,
  history,
  notifications,
  supportIssues,
  getNextId,
} from '../utils/mockData.js'

// Minimal test app
const app = express()
app.use(express.json())
app.use('/api/settings', settingsRouter)

describe('Settings API', () => {
  // We'll create a disposable user + related records for most tests
  let testUserId
  // Also create a control user to ensure we don't over-delete
  let controlUserId

  beforeEach(() => {
    // ---- create a test user ----
    testUserId = getNextId(users)
    users.push({
      id: testUserId,
      name: 'Delete Me',
      email: `deleteme_${testUserId}@example.com`,
      password: 'secret',
      goals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Create a few linked records for the test user
    queues.push({ id: getNextId(queues), userId: testUserId, zoneId: 1, position: 1, estimatedWait: 7, status: 'active', joinedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: null })
    goals.push({ id: getNextId(goals), userId: testUserId, title: 'Goal A', target: 10, createdAt: new Date().toISOString() })
    history.push({ id: getNextId(history), userId: testUserId, gym: 'Palladium', date: new Date().toISOString(), duration: 30, type: 'Cardio', caloriesBurned: 200 })
    notifications.push({ id: getNextId(notifications), userId: testUserId, title: 'Ping', isRead: false, createdAt: new Date().toISOString() })
    supportIssues.push({ id: getNextId(supportIssues), userId: testUserId, subject: 'Help', description: 'Test issue', status: 'open', priority: 'medium', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), resolvedAt: null })

    // ---- control user (should survive deletions) ----
    controlUserId = getNextId(users)
    users.push({
      id: controlUserId,
      name: 'Keep Me',
      email: `keep_${controlUserId}@example.com`,
      password: 'secret',
      goals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    notifications.push({ id: getNextId(notifications), userId: controlUserId, title: 'Keep', isRead: false, createdAt: new Date().toISOString() })
  })

  afterEach(() => {
    // Hard reset: remove any records for either test user (in case a test failed)
    const purgeByUser = (arr, uid) => {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].userId === uid) arr.splice(i, 1)
      }
    }
    // users array is special (no userId field)
    for (let i = users.length - 1; i >= 0; i--) {
      if (users[i].id === testUserId || users[i].id === controlUserId) {
        users.splice(i, 1)
      }
    }
    purgeByUser(queues, testUserId); purgeByUser(queues, controlUserId)
    purgeByUser(goals, testUserId); purgeByUser(goals, controlUserId)
    purgeByUser(history, testUserId); purgeByUser(history, controlUserId)
    purgeByUser(notifications, testUserId); purgeByUser(notifications, controlUserId)
    purgeByUser(supportIssues, testUserId); purgeByUser(supportIssues, controlUserId)
  })

  describe('GET /api/settings', () => {
    it('returns a simple running status', async () => {
      const res = await request(app).get('/api/settings')
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('message').that.includes('running')
    })
  })

  describe('DELETE /api/settings/account/:userId', () => {
    it('deletes the user and all related data', async () => {
      // Pre-assert: records exist
      const countsBefore = {
        users: users.filter(u => u.id === testUserId).length,
        queues: queues.filter(r => r.userId === testUserId).length,
        goals: goals.filter(r => r.userId === testUserId).length,
        history: history.filter(r => r.userId === testUserId).length,
        notifications: notifications.filter(r => r.userId === testUserId).length,
        supportIssues: supportIssues.filter(r => r.userId === testUserId).length,
      }
      expect(countsBefore.users).to.equal(1)

      const res = await request(app).delete(`/api/settings/account/${testUserId}`)
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('message').that.includes('deleted')
      expect(res.body).to.have.nested.property('data.user.id', testUserId)

      // Removed record counts reported by API should match reality
      const reported = res.body.data.removedRecords
      expect(reported.queues).to.equal(1)
      expect(reported.goals).to.equal(1)
      expect(reported.history).to.equal(1)
      expect(reported.notifications).to.equal(1)
      expect(reported.supportIssues).to.equal(1)

      // Verify arrays no longer contain any entries for testUserId
      const countsAfter = {
        users: users.filter(u => u.id === testUserId).length,
        queues: queues.filter(r => r.userId === testUserId).length,
        goals: goals.filter(r => r.userId === testUserId).length,
        history: history.filter(r => r.userId === testUserId).length,
        notifications: notifications.filter(r => r.userId === testUserId).length,
        supportIssues: supportIssues.filter(r => r.userId === testUserId).length,
      }
      expect(countsAfter.users).to.equal(0)
      expect(countsAfter.queues).to.equal(0)
      expect(countsAfter.goals).to.equal(0)
      expect(countsAfter.history).to.equal(0)
      expect(countsAfter.notifications).to.equal(0)
      expect(countsAfter.supportIssues).to.equal(0)

      // Control user and their data must remain
      expect(users.some(u => u.id === controlUserId)).to.equal(true)
      expect(notifications.some(n => n.userId === controlUserId)).to.equal(true)
    })

    it('returns 404 if user does not exist', async () => {
      const res = await request(app).delete('/api/settings/account/999999')
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'User not found')
    })

    it('accepts string param and still deletes (parseInt behavior)', async () => {
      // Create a tiny extra user to test string path param
      const uid = getNextId(users)
      users.push({ id: uid, name: 'Str Param', email: `s_${uid}@x.com`, password: 's' })
      goals.push({ id: getNextId(goals), userId: uid, title: 'X' })

      const res = await request(app).delete(`/api/settings/account/${String(uid)}`)
      expect(res.status).to.equal(200)

      // Confirm removal
      expect(users.some(u => u.id === uid)).to.equal(false)
      expect(goals.some(g => g.userId === uid)).to.equal(false)
    })
  })
})
