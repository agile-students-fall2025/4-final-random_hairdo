// server.js - Server startup
import app from './app.js'

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`SmartFit API server listening on port ${PORT}`)
})

const close = () => {
  server.close()
}

// Export for testing
export { server, close }
