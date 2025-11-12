// app.js - Express app configuration
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'                    // For static file paths
import { fileURLToPath } from 'url'        // For ES6 __dirname equivalent

// Route modules
import facilityRoutes from './routes/facilities.js'
import zoneRoutes from './routes/zones.js'
import queueRoutes from './routes/queues.js'
import userRoutes from './routes/users.js'
import goalRoutes from './routes/goals.js'
import historyRoutes from './routes/history.js'
import notificationRoutes from './routes/notifications.js'
import settingsRoutes from './routes/settings.js'
import authRoutes from "./routes/auth.js";

// Load environment variables
dotenv.config({ silent: true })

// Get __dirname equivalent for ES6 modules
// (For static file serving)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 1. CORS - Allow frontend to make requests
app.use(cors())

// 2. Morgan - Log HTTP requests (dev mode)
app.use(morgan('dev'))

// 3. Body parsers - Parse JSON and URL-encoded data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Serve static files from 'public' directory
// Sprint 2 requirement - "All static routes must be completed and respond with the requested file"
app.use('/static', express.static(path.join(__dirname, 'public')))

// Root info endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartFit API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      facilities: '/api/facilities',
      zones: '/api/zones',
      queues: '/api/queues',
      users: '/api/users',
      goals: '/api/goals',
      history: '/api/history',
      notifications: '/api/notifications',
      settings: '/api/settings',
      static: '/static'  // For Document static route
    }
  })
})

// API routes
app.use('/api/facilities', facilityRoutes)
app.use('/api/zones', zoneRoutes)
app.use('/api/queues', queueRoutes)
app.use('/api/users', userRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/settings', settingsRoutes)
app.use("/api/auth", authRoutes);


// 404 handler 
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.url 
  })
})

// Error handler 
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

export default app
