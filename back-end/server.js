import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import facilityRoutes from './routes/facilities.js'
import zoneRoutes from './routes/zones.js'
import queueRoutes from './routes/queues.js'
import userRoutes from './routes/users.js'
import goalRoutes from './routes/goals.js'
import historyRoutes from './routes/history.js'
import notificationRoutes from './routes/notifications.js'
import settingsRoutes from './routes/settings.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/facilities', facilityRoutes)
app.use('/api/zones', zoneRoutes)
app.use('/api/queues', queueRoutes)
app.use('/api/users', userRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/settings', settingsRoutes)

app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartFit API Server',
    version: '1.0.0',
    endpoints: {
      facilities: '/api/facilities',
      zones: '/api/zones',
      queues: '/api/queues',
      users: '/api/users'
    }
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const server = app.listen(PORT, () => {
  console.log(`SmartFit API server listening on port ${PORT}`)
})

export default app
