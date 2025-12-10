// test/facilities.test.js
import request from 'supertest'
import { expect } from 'chai'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from '../app.js'
import { Facility } from '../db.js' // Your Facility model

dotenv.config()

describe('Facilities API Tests', () => {
  let testFacilityId // Store a valid MongoDB _id for testing

  before(async () => {
    try {
      // Connect to test DB
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_UNIT_TEST_URI)
        console.log('Connected to MongoDB test database')
      }

      // Clear old test facilities
      await Facility.deleteMany({})

      // Insert test facilities and store the result
      const facilities = await Facility.insertMany([
        {
          name: 'Paulson Athletic Facility',
          address: '70 Washington Square S, New York, NY 10012',
          capacity: 100,
          hours: { weekdays: '6am-10pm', weekends: '8am-8pm' },
          amenities: ['Pool', 'Gym', 'Basketball Court'],
          phone: '212-998-0000',
          createdAt: new Date()
        },
        {
          name: 'Palladium Athletic Facility',
          address: '140 E 14th St, New York, NY 10003',
          capacity: 50,
          hours: { weekdays: '6am-10pm', weekends: '8am-8pm' },
          amenities: ['Pool', 'Weights'],
          phone: '212-777-0000',
          createdAt: new Date()
        },
        {
          name: 'NYU 404 Fitness',
          address: 'NYU Campus, New York, NY',
          capacity: 30,
          hours: { weekdays: '7am-9pm', weekends: '9am-5pm' },
          amenities: ['Gym'],
          phone: '212-555-0003',
          createdAt: new Date()
        },
        {
          name: 'Brooklyn Athletic Facility',
          address: 'Brooklyn, NY',
          capacity: 80,
          hours: { weekdays: '6am-10pm', weekends: '8am-8pm' },
          amenities: ['Pool', 'Gym'],
          phone: '718-888-0004',
          createdAt: new Date()
        }
      ])

      // Store first facility's _id for testing
      testFacilityId = facilities[0]._id.toString()
    } catch (err) {
      console.error('Setup error:', err)
      throw err
    }
  })

  after(async () => {
    // Clean up test facilities
    await Facility.deleteMany({})
    await mongoose.connection.close()
    console.log('Disconnected from test MongoDB')
  })

  describe('GET /api/facilities', () => {
    it('should return all facilities with success status', async () => {
      const res = await request(app).get('/api/facilities')
      expect(res.status).to.equal(200)
      expect(res.body).to.be.an('object')
      expect(res.body).to.have.property('success', true)
      expect(res.body).to.have.property('data')
      expect(res.body.data.length).to.be.greaterThan(0)
      expect(res.body).to.have.property('message', 'Facilities retrieved successfully')
    })

    it('should return facilities with correct structure and types', async () => {
      const res = await request(app).get('/api/facilities')
      const facility = res.body.data[0]
      expect(facility).to.have.property('_id')
      expect(facility).to.have.property('name').that.is.a('string')
      expect(facility).to.have.property('address').that.is.a('string')
      expect(facility).to.have.property('capacity').that.is.a('number')
      expect(facility).to.have.property('hours').that.is.an('object')
      expect(facility).to.have.property('amenities').that.is.an('array')
      expect(facility).to.have.property('phone').that.is.a('string')
      expect(facility).to.have.property('createdAt').that.is.a('string')
    })

    it('should have unique facility IDs', async () => {
      const res = await request(app).get('/api/facilities')
      const ids = res.body.data.map(f => f._id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).to.equal(uniqueIds.length)
    })
  })

  describe('GET /api/facilities/:id', () => {
    it('should return a specific facility by valid id', async () => {
      const res = await request(app).get(`/api/facilities/${testFacilityId}`)
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property('success', true)
      expect(res.body.data._id).to.equal(testFacilityId)
    })

    it('should return 404 for non-existent facility id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString()
      const res = await request(app).get(`/api/facilities/${fakeId}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'Facility not found')
    })

    it('should return 400 for invalid facility id', async () => {
      const res = await request(app).get('/api/facilities/123')
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('success', false)
      expect(res.body).to.have.property('error', 'Validation failed')
    })
  })

  describe('Data Integrity', () => {
    it('should have all facilities with non-empty names and addresses', async () => {
      const res = await request(app).get('/api/facilities')
      res.body.data.forEach(facility => {
        expect(facility.name).to.not.be.empty
        expect(facility.address).to.not.be.empty
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