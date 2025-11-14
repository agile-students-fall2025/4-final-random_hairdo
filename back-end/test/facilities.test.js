import request from 'supertest'
import { expect } from 'chai'
import express from 'express'
import facilitiesRouter from '../routes/facilities.js'
import { facilities } from '../utils/mockData.js'

// Create a test app
const app = express()
app.use(express.json())
app.use('/api/facilities', facilitiesRouter)

describe('Facilities API Tests', () => {
  
  describe('GET /api/facilities', () => {
    it('should return all facilities with success status', async () => {
      const res = await request(app).get('/api/facilities')
      
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('object')
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body).to.have.property('message', 'Facilities retrieved successfully')
    })

    it('should return an array of facilities', async () => {
      const res = await request(app).get('/api/facilities')
      
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.be.greaterThan(0)
    })

    it('should return facilities with correct structure', async () => {
      const res = await request(app).get('/api/facilities')
      
      const facility = res.body.data[0]
      expect(facility).to.have.property('id')
      expect(facility).to.have.property('name')
      expect(facility).to.have.property('address')
      expect(facility).to.have.property('capacity')
      expect(facility).to.have.property('hours')
      expect(facility).to.have.property('amenities')
      expect(facility).to.have.property('phone')
    })

    it('should return facilities with valid data types', async () => {
      const res = await request(app).get('/api/facilities')
      
      const facility = res.body.data[0]
      expect(facility.id).to.be.a('number')
      expect(facility.name).to.be.a('string')
      expect(facility.address).to.be.a('string')
      expect(facility.capacity).to.be.a('number')
      expect(facility.hours).to.be.an('object')
      expect(facility.amenities).to.be.an('array')
      expect(facility.phone).to.be.a('string')
    })

    it('should return all facilities from mock data', async () => {
      const res = await request(app).get('/api/facilities')
      
      expect(res.body.data.length).to.equal(facilities.length)
    })
  })

  describe('GET /api/facilities/:id', () => {
    it('should return a specific facility by valid id', async () => {
      const facilityId = 1
      const res = await request(app).get(`/api/facilities/${facilityId}`)
      
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body.data).to.be.an('object')
      expect(res.body.data.id).to.equal(facilityId)
    })

    it('should return facility with correct name for id 1', async () => {
      const res = await request(app).get('/api/facilities/1')
      
      expect(res.body.data.name).to.equal('Paulson Athletic Facility')
    })

    it('should return facility with correct address for id 2', async () => {
      const res = await request(app).get('/api/facilities/2')
      
      expect(res.body.data.name).to.equal('Palladium Athletic Facility')
      expect(res.body.data.address).to.equal('140 E 14th St, New York, NY 10003')
    })

    it('should return facility with hours object containing weekdays and weekends', async () => {
      const res = await request(app).get('/api/facilities/1')
      
      expect(res.body.data.hours).to.have.property('weekdays')
      expect(res.body.data.hours).to.have.property('weekends')
      expect(res.body.data.hours.weekdays).to.be.a('string')
      expect(res.body.data.hours.weekends).to.be.a('string')
    })

    it('should return facility with amenities array', async () => {
      const res = await request(app).get('/api/facilities/2')
      
      expect(res.body.data.amenities).to.be.an('array')
      expect(res.body.data.amenities.length).to.be.greaterThan(0)
      expect(res.body.data.amenities).to.include('Pool')
    })

    it('should return 404 for non-existent facility id', async () => {
      const res = await request(app).get('/api/facilities/9999')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'Facility not found')
    })

    it('should return 404 for invalid facility id', async () => {
      const res = await request(app).get('/api/facilities/999')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error')
    })

    it('should handle string id parameter correctly', async () => {
      const res = await request(app).get('/api/facilities/3')
      
      expect(res.status).to.equal(200)
      expect(res.body.data.id).to.equal(3)
      expect(res.body.data.name).to.equal('NYU 404 Fitness')
    })

    it('should return facility with capacity as number', async () => {
      const res = await request(app).get('/api/facilities/1')
      
      expect(res.body.data.capacity).to.be.a('number')
      expect(res.body.data.capacity).to.be.greaterThan(0)
    })

    it('should return facility with phone number', async () => {
      const res = await request(app).get('/api/facilities/4')
      
      expect(res.body.data).to.have.property('phone')
      expect(res.body.data.phone).to.be.a('string')
      expect(res.body.data.name).to.equal('Brooklyn Athletic Facility')
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative facility id gracefully', async () => {
      const res = await request(app).get('/api/facilities/-1')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })

    it('should handle zero facility id', async () => {
      const res = await request(app).get('/api/facilities/0')
      
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
    })

    it('should return JSON content type', async () => {
      const res = await request(app).get('/api/facilities')
      
      expect(res.headers['content-type']).to.match(/json/)
    })

    it('should return JSON content type for specific facility', async () => {
      const res = await request(app).get('/api/facilities/1')
      
      expect(res.headers['content-type']).to.match(/json/)
    })
  })

  describe('Data Integrity', () => {
    it('should have unique facility IDs', async () => {
      const res = await request(app).get('/api/facilities')
      
      const ids = res.body.data.map(f => f.id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).to.equal(uniqueIds.length)
    })

    it('should have all facilities with non-empty names', async () => {
      const res = await request(app).get('/api/facilities')
      
      res.body.data.forEach(facility => {
        expect(facility.name).to.not.be.empty
        expect(facility.name.length).to.be.greaterThan(0)
      })
    })

    it('should have all facilities with non-empty addresses', async () => {
      const res = await request(app).get('/api/facilities')
      
      res.body.data.forEach(facility => {
        expect(facility.address).to.not.be.empty
        expect(facility.address).to.match(/NY/)
      })
    })

    it('should have all facilities with positive capacity', async () => {
      const res = await request(app).get('/api/facilities')
      
      res.body.data.forEach(facility => {
        expect(facility.capacity).to.be.greaterThan(0)
      })
    })

    it('should have createdAt timestamp for all facilities', async () => {
      const res = await request(app).get('/api/facilities')
      
      res.body.data.forEach(facility => {
        expect(facility).to.have.property('createdAt')
        expect(facility.createdAt).to.be.a('string')
      })
    })
  })
})
