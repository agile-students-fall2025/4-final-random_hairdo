// test/users.test.js
import { expect } from 'chai'
import chaiHttp from 'chai-http'
import chai from 'chai'
import app from '../app.js'

chai.use(chaiHttp)

describe('User API', () => {
  
  describe('POST /api/users/register', () => {
    it('should register a new user', (done) => {
      chai.request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'test@nyu.edu',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(201)
          expect(res.body.success).to.equal(true)
          expect(res.body.data).to.have.property('id')
          expect(res.body.data).to.not.have.property('password')
          done()
        })
    })
    
    it('should fail without required fields', (done) => {
      chai.request(app)
        .post('/api/users/register')
        .send({ email: 'test@nyu.edu' })
        .end((err, res) => {
          expect(res).to.have.status(400)
          done()
        })
    })
    
    it('should reject duplicate email', (done) => {
      const user = { name: 'User', email: 'dup@nyu.edu', password: 'pass123' }
      chai.request(app).post('/api/users/register').send(user).end(() => {
        chai.request(app).post('/api/users/register').send(user).end((err, res) => {
          expect(res).to.have.status(409)
          done()
        })
      })
    })
  })
  
  describe('POST /api/users/login', () => {
    before((done) => {
      chai.request(app)
        .post('/api/users/register')
        .send({ name: 'Login User', email: 'login@nyu.edu', password: 'test123' })
        .end(() => done())
    })
    
    it('should login with correct credentials', (done) => {
      chai.request(app)
        .post('/api/users/login')
        .send({ email: 'login@nyu.edu', password: 'test123' })
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body.success).to.equal(true)
          expect(res.body.data).to.not.have.property('password')
          done()
        })
    })
    
    it('should fail with wrong password', (done) => {
      chai.request(app)
        .post('/api/users/login')
        .send({ email: 'login@nyu.edu', password: 'wrong' })
        .end((err, res) => {
          expect(res).to.have.status(401)
          done()
        })
    })
  })
  
  describe('GET /api/users/:id', () => {
    it('should get user by id', (done) => {
      chai.request(app)
        .get('/api/users/1')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body.data).to.have.property('id', 1)
          expect(res.body.data).to.not.have.property('password')
          done()
        })
    })
    
    it('should return 404 for invalid id', (done) => {
      chai.request(app)
        .get('/api/users/999')
        .end((err, res) => {
          expect(res).to.have.status(404)
          done()
        })
    })
  })
  
  describe('PUT /api/users/:id', () => {
    it('should update user profile', (done) => {
      chai.request(app)
        .put('/api/users/1')
        .send({ bio: 'Updated bio' })
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body.data.bio).to.equal('Updated bio')
          done()
        })
    })
    
    it('should not update with empty body', (done) => {
      chai.request(app)
        .put('/api/users/1')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400)
          done()
        })
    })
  })
})