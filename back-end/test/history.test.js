// test/history.test.js
import { expect } from 'chai'
import chaiHttp from 'chai-http'
import chai from 'chai'
import app from '../app.js'

chai.use(chaiHttp)

describe('History API', () => {
  
  describe('GET /api/history/user/:userId', () => {
    it('should get workout history for user', (done) => {
      chai.request(app)
        .get('/api/history/user/1')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body.data).to.be.an('array')
          expect(res.body).to.have.property('stats')
          if (res.body.data.length > 0) {
            expect(res.body.data[0]).to.have.property('exercises')
            expect(res.body.data[0].exercises).to.be.an('array')
          }
          done()
        })
    })
    
    it('should filter by location', (done) => {
      chai.request(app)
        .get('/api/history/user/1?location=Palladium')
        .end((err, res) => {
          expect(res).to.have.status(200)
          res.body.data.forEach(w => {
            expect(w.gym.toLowerCase()).to.include('palladium')
          })
          done()
        })
    })
  })
  
  describe('GET /api/history/:id', () => {
    it('should get specific workout', (done) => {
      chai.request(app)
        .get('/api/history/1')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body.data).to.have.property('id', 1)
          done()
        })
    })
  })
  
  describe('POST /api/history', () => {
    it('should create new workout', (done) => {
      chai.request(app)
        .post('/api/history')
        .send({
          userId: 1,
          gym: 'Test Gym',
          duration: 30,
          type: 'Cardio',
          exercises: ['Treadmill']
        })
        .end((err, res) => {
          expect(res).to.have.status(201)
          expect(res.body.data).to.have.property('id')
          expect(res.body.data.exercises).to.deep.equal(['Treadmill'])
          done()
        })
    })
    
    it('should fail without required fields', (done) => {
      chai.request(app)
        .post('/api/history')
        .send({ userId: 1 })
        .end((err, res) => {
          expect(res).to.have.status(400)
          done()
        })
    })
  })
})