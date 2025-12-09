// server.js - Server startup
import { createServer } from 'http'
import { Server } from 'socket.io'
import app from './app.js'

const PORT = process.env.PORT || 3000

// Create HTTP server and attach Express app
const server = createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: /^http:\/\/localhost(:\d+)?$/,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
})

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Join a queue room
  socket.on('join:queue', (queueId) => {
    socket.join(`queue:${queueId}`)
    console.log(`Socket ${socket.id} joined queue:${queueId}`)
  })

  // Leave a queue room
  socket.on('leave:queue', (queueId) => {
    socket.leave(`queue:${queueId}`)
    console.log(`Socket ${socket.id} left queue:${queueId}`)
  })

  // Join a zone room
  socket.on('join:zone', (zoneId) => {
    socket.join(`zone:${zoneId}`)
    console.log(`Socket ${socket.id} joined zone:${zoneId}`)
  })

  // Leave a zone room
  socket.on('leave:zone', (zoneId) => {
    socket.leave(`zone:${zoneId}`)
    console.log(`Socket ${socket.id} left zone:${zoneId}`)
  })

  // Join facility zones room (for all zones in a facility)
  socket.on('join:facility-zones', (facilityId) => {
    socket.join(`facility-zones:${facilityId}`)
    console.log(`Socket ${socket.id} joined facility-zones:${facilityId}`)
  })

  // Leave facility zones room
  socket.on('leave:facility-zones', (facilityId) => {
    socket.leave(`facility-zones:${facilityId}`)
    console.log(`Socket ${socket.id} left facility-zones:${facilityId}`)
  })

  // Join notifications room for a user
  socket.on('join:notifications', (userId) => {
    socket.join(`notifications:${userId}`)
    console.log(`Socket ${socket.id} joined notifications:${userId}`)
  })

  // Leave notifications room
  socket.on('leave:notifications', (userId) => {
    socket.leave(`notifications:${userId}`)
    console.log(`Socket ${socket.id} left notifications:${userId}`)
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Make io accessible to routes
app.set('io', io)

server.listen(PORT, () => {
  console.log(`SmartFit API server listening on port ${PORT}`)
  console.log(`WebSocket server ready`)
})

const close = () => {
  io.close()
  server.close()
}

// Export for testing
export { server, close, io }
