const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(morgan('combined'))

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Manager API is running'
  })
})

app.use('/api/tasks', require('./routes/taskRoutes.js'))

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
