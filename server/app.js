require('dotenv').config()
const express = require('express')
const cors = require('cors')
const examRoutes = require('./routes/exams')
const presetRoutes = require('./routes/preset-exams')
const authRoutes = require('./routes/auth')
const syncRoutes = require('./routes/sync')
const teamRoutes = require('./routes/teams')
const { initPresetData } = require('./services/preset-service')
const { startScheduler } = require('./services/scheduler')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/exams', examRoutes)
app.use('/api/preset-exams', presetRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/sync', syncRoutes)
app.use('/api/teams', teamRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Initialize preset data
initPresetData()

// Start scheduler
startScheduler()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
