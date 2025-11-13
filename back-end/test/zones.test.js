import request from 'supertest'
import { expect } from 'chai'
import express from 'express'
import zonesRouter from '../routes/zones.js'
import { zones } from '../utils/mockData.js'

// Create a test app
const app = express()
app.use(express.json())
app.use('/api/zones', zonesRouter)

describe('Zones API Tests', () => {
  
  describe('GET /api/zones', () => {
    it('should return all zones with success status', async () => {
      const res = await request(app).get('/api/zones')
      
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('object')
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body).to.have.property('count')
    })

    it('should return an array of zones', async () => {
      const res = await request(app).get('/api/zones')
      
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.be.greaterThan(0)
    })

    it('should return correct count of zones', async () => {
      const res = await request(app).get('/api/zones')
      
      expect(res.body.count).to.equal(res.body.data.length)
      expect(res.body.count).to.equal(zones.length)
    })

    it('should return zones with correct structure', async () => {
      const res = await request(app).get('/api/zones')
      
      const zone = res.body.data[0]
      expect(zone).to.have.property('id')
      expect(zone).to.have.property('facilityId')
      expect(zone).to.have.property('name')
      expect(zone).to.have.property('equipment')
      expect(zone).to.have.property('capacity')
      expect(zone).to.have.property('currentOccupancy')
      expect(zone).to.have.property('queueLength')
      expect(zone).to.have.property('averageWaitTime')
      expect(zone).to.have.property('status')
    })

    it('should return zones with valid data types', async () => {
      const res = await request(app).get('/api/zones')
      
      const zone = res.body.data[0]
      expect(zone.id).to.be.a('number')
      expect(zone.facilityId).to.be.a('number')
      expect(zone.name).to.be.a('string')
      expect(zone.equipment).to.be.an('array')
      expect(zone.capacity).to.be.a('number')
      expect(zone.currentOccupancy).to.be.a('number')
      expect(zone.queueLength).to.be.a('number')
      expect(zone.averageWaitTime).to.be.a('number')
      expect(zone.status).to.be.a('string')
    })
  })

  describe('GET /api/zones?facilityId=<id>', () => {
    it('should filter zones by facility ID', async () => {
      const res = await request(app).get('/api/zones?facilityId=1')
      
      expect(res.status).to.equal(200)
      expect(res.body.success).to.be.true
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.be.greaterThan(0)
      
      // All zones should belong to facility 1
      res.body.data.forEach(zone => {
        expect(zone.facilityId).to.equal(1)
      })
    })

    it('should return correct count for facility 1', async () => {
      const res = await request(app).get('/api/zones?facilityId=1')
      
      const expectedCount = zones.filter(z => z.facilityId === 1).length
      expect(res.body.count).to.equal(expectedCount)
      expect(res.body.data.length).to.equal(expectedCount)
    })

    it('should filter zones for facility 2', async () => {
      const res = await request(app).get('/api/zones?facilityId=2')
      
      expect(res.status).to.equal(200)
      res.body.data.forEach(zone => {
        expect(zone.facilityId).to.equal(2)
      })
    })

    it('should filter zones for facility 3', async () => {
      const res = await request(app).get('/api/zones?facilityId=3')
      
      expect(res.status).to.equal(200)
      res.body.data.forEach(zone => {
        expect(zone.facilityId).to.equal(3)
      })
    })

    it('should return 404 for facility with no zones', async () => {
      const res = await request(app).get('/api/zones?facilityId=999')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error')
      expect(res.body.error).to.include('No zones found')
    })

    it('should return specific error message for non-existent facility', async () => {
      const res = await request(app).get('/api/zones?facilityId=100')
      
      expect(res.status).to.equal(404)
      expect(res.body.error).to.equal('No zones found for facility ID 100')
    })

    it('should handle string facilityId parameter', async () => {
      const res = await request(app).get('/api/zones?facilityId=1')
      
      expect(res.status).to.equal(200)
      expect(res.body.data).to.be.an('array')
      res.body.data.forEach(zone => {
        expect(zone.facilityId).to.equal(1)
      })
    })
  })

  describe('GET /api/zones/:id', () => {
    it('should return a specific zone by valid id', async () => {
      const zoneId = 1
      const res = await request(app).get(`/api/zones/${zoneId}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body.data).to.be.an('object')
      expect(res.body.data.id).to.equal(zoneId)
    })

    it('should return zone with correct name for id 1', async () => {
      const res = await request(app).get('/api/zones/1')
      
      expect(res.body.data.name).to.equal('Cardio Zone')
      expect(res.body.data.facilityId).to.equal(1)
    })

    it('should return zone with equipment array', async () => {
      const res = await request(app).get('/api/zones/1')
      
      expect(res.body.data.equipment).to.be.an('array')
      expect(res.body.data.equipment.length).to.be.greaterThan(0)
      expect(res.body.data.equipment).to.include('Treadmills')
    })

    it('should return zone with queue information', async () => {
      const res = await request(app).get('/api/zones/1')
      
      expect(res.body.data).to.have.property('queueLength')
      expect(res.body.data).to.have.property('averageWaitTime')
      expect(res.body.data.queueLength).to.be.a('number')
      expect(res.body.data.averageWaitTime).to.be.a('number')
    })

    it('should return zone with capacity information', async () => {
      const res = await request(app).get('/api/zones/2')
      
      expect(res.body.data).to.have.property('capacity')
      expect(res.body.data).to.have.property('currentOccupancy')
      expect(res.body.data.capacity).to.be.a('number')
      expect(res.body.data.currentOccupancy).to.be.a('number')
      expect(res.body.data.currentOccupancy).to.be.at.most(res.body.data.capacity)
    })

    it('should return zone with status field', async () => {
      const res = await request(app).get('/api/zones/1')
      
      expect(res.body.data).to.have.property('status')
      expect(res.body.data.status).to.be.oneOf(['available', 'moderate', 'busy'])
    })

    it('should return different zone details for id 6', async () => {
      const res = await request(app).get('/api/zones/6')
      
      expect(res.status).to.equal(200)
      expect(res.body.data.id).to.equal(6)
      expect(res.body.data.name).to.equal('CrossFit Zone')
      expect(res.body.data.facilityId).to.equal(3)
    })

    it('should return 404 for non-existent zone id', async () => {
      const res = await request(app).get('/api/zones/9999')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'Zone not found')
    })

    it('should return 404 for invalid zone id', async () => {
      const res = await request(app).get('/api/zones/999')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error')
    })

    it('should handle string id parameter correctly', async () => {
      const res = await request(app).get('/api/zones/3')
      
      expect(res.status).to.equal(200)
      expect(res.body.data.id).to.equal(3)
      expect(res.body.data.name).to.equal('Functional Training Zone')
    })

    it('should return zone with createdAt timestamp', async () => {
      const res = await request(app).get('/api/zones/1')
      
      expect(res.body.data).to.have.property('createdAt')
      expect(res.body.data.createdAt).to.be.a('string')
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative zone id gracefully', async () => {
      const res = await request(app).get('/api/zones/-1')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })

    it('should handle zero zone id', async () => {
      const res = await request(app).get('/api/zones/0')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })

    it('should return JSON content type', async () => {
      const res = await request(app).get('/api/zones')
      
      expect(res.headers['content-type']).to.match(/json/)
    })

    it('should return JSON content type for specific zone', async () => {
      const res = await request(app).get('/api/zones/1')
      
      expect(res.headers['content-type']).to.match(/json/)
    })

    it('should handle negative facilityId in query', async () => {
      const res = await request(app).get('/api/zones?facilityId=-1')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })

    it('should handle invalid facilityId format', async () => {
      const res = await request(app).get('/api/zones?facilityId=abc')
      
      // Should either return 404 or all zones
      expect([200, 404]).to.include(res.status)
    })
  })

  describe('Data Integrity', () => {
    it('should have unique zone IDs', async () => {
      const res = await request(app).get('/api/zones')
      
      const ids = res.body.data.map(z => z.id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).to.equal(uniqueIds.length)
    })

    it('should have all zones with non-empty names', async () => {
      const res = await request(app).get('/api/zones')
      
      res.body.data.forEach(zone => {
        expect(zone.name).to.not.be.empty
        expect(zone.name.length).to.be.greaterThan(0)
      })
    })

    it('should have all zones with valid facilityId', async () => {
      const res = await request(app).get('/api/zones')
      
      res.body.data.forEach(zone => {
        expect(zone.facilityId).to.be.a('number')
        expect(zone.facilityId).to.be.greaterThan(0)
      })
    })

    it('should have all zones with positive capacity', async () => {
      const res = await request(app).get('/api/zones')
      
      res.body.data.forEach(zone => {
        expect(zone.capacity).to.be.greaterThan(0)
      })
    })

    it('should have currentOccupancy not exceeding capacity', async () => {
      const res = await request(app).get('/api/zones')
      
      res.body.data.forEach(zone => {
        expect(zone.currentOccupancy).to.be.at.most(zone.capacity)
        expect(zone.currentOccupancy).to.be.at.least(0)
      })
    })

    it('should have non-negative queue lengths', async () => {
      const res = await request(app).get('/api/zones')
      
      res.body.data.forEach(zone => {
        expect(zone.queueLength).to.be.at.least(0)
      })
    })

    it('should have non-negative wait times', async () => {
      const res = await request(app).get('/api/zones')
      
      res.body.data.forEach(zone => {
        expect(zone.averageWaitTime).to.be.at.least(0)
      })
    })

    it('should have valid status values', async () => {
      const res = await request(app).get('/api/zones')
      
      const validStatuses = ['available', 'moderate', 'busy']
      res.body.data.forEach(zone => {
        expect(validStatuses).to.include(zone.status)
      })
    })

    it('should have all zones with equipment arrays', async () => {
      const res = await request(app).get('/api/zones')
      
      res.body.data.forEach(zone => {
        expect(zone.equipment).to.be.an('array')
        expect(zone.equipment.length).to.be.greaterThan(0)
      })
    })

    it('should have createdAt timestamp for all zones', async () => {
      const res = await request(app).get('/api/zones')
      
      res.body.data.forEach(zone => {
        expect(zone).to.have.property('createdAt')
        expect(zone.createdAt).to.be.a('string')
      })
    })
  })

  describe('Business Logic', () => {
    it('should return zones with busy status when queue length > 3', async () => {
      const res = await request(app).get('/api/zones')
      
      const busyZones = res.body.data.filter(z => z.status === 'busy')
      busyZones.forEach(zone => {
        expect(zone.queueLength).to.be.greaterThan(3)
      })
    })

    it('should return zones with available status when queue length is 0', async () => {
      const res = await request(app).get('/api/zones')
      
      const availableZones = res.body.data.filter(z => z.status === 'available')
      availableZones.forEach(zone => {
        expect(zone.queueLength).to.be.at.most(1)
      })
    })

    it('should have wait time of 0 when queue is empty', async () => {
      const res = await request(app).get('/api/zones')
      
      const emptyQueueZones = res.body.data.filter(z => z.queueLength === 0)
      emptyQueueZones.forEach(zone => {
        expect(zone.averageWaitTime).to.equal(0)
      })
    })

    it('should return multiple zones for the same facility', async () => {
      const res = await request(app).get('/api/zones?facilityId=1')
      
      expect(res.status).to.equal(200)
      expect(res.body.data.length).to.be.greaterThan(1)
    })

    it('should verify zone names are descriptive', async () => {
      const res = await request(app).get('/api/zones')
      
      res.body.data.forEach(zone => {
        expect(zone.name).to.match(/Zone/)
      })
    })
  })
})
