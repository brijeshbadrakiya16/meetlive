import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import os from 'os'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000', 'https://meetlive-02.vercel.app', 'https://meetlive-streaming.onrender.com', '*'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Store active meetings
const activeMeetings = new Map()

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' })
})

// Create a new meeting record
app.post('/api/meetings/create', (req, res) => {
  const { meetingCode, hostId, hostName } = req.body

  if (!meetingCode || !hostId) {
    return res.status(400).json({ error: 'Meeting code and host ID are required' })
  }

  const meeting = {
    code: meetingCode,
    hostId,
    hostName: hostName || 'Host',
    createdAt: new Date(),
    participants: [hostId],
  }

  activeMeetings.set(meetingCode, meeting)

  res.json({
    success: true,
    meeting
  })
})

// Get meeting details
app.get('/api/meetings/:code', (req, res) => {
  const { code } = req.params
  const meeting = activeMeetings.get(code)

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' })
  }

  res.json({
    success: true,
    meeting
  })
})

// End a meeting
app.post('/api/meetings/:code/end', (req, res) => {
  const { code } = req.params
  const meeting = activeMeetings.get(code)

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' })
  }

  activeMeetings.delete(code)

  res.json({
    success: true,
    message: 'Meeting ended'
  })
})

// Update meeting participants
app.post('/api/meetings/:code/participants', (req, res) => {
  const { code } = req.params
  const { userId, action } = req.body

  const meeting = activeMeetings.get(code)

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' })
  }

  if (action === 'add') {
    if (!meeting.participants.includes(userId)) {
      meeting.participants.push(userId)
    }
  } else if (action === 'remove') {
    meeting.participants = meeting.participants.filter(p => p !== userId)
  }

  res.json({
    success: true,
    participants: meeting.participants
  })
})

// Get all active meetings (for admin/monitoring)
app.get('/api/meetings', (req, res) => {
  const meetings = Array.from(activeMeetings.values()).map(m => ({
    code: m.code,
    hostName: m.hostName,
    participantCount: m.participants.length,
    createdAt: m.createdAt
  }))

  res.json({
    success: true,
    meetings,
    totalActiveMeetings: meetings.length
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend server running on http://0.0.0.0:${PORT}`)
})