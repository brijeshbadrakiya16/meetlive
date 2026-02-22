# MeetLive Developer Guide

## Contributing to MeetLive

This guide will help you understand the codebase and make enhancements to the application.

## Project Structure Overview

```
MeetLive/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Express.js REST API
├── streaming_server/  # Socket.io Signaling Server
└── docs/             # Documentation
```

## Frontend Architecture

### Component Hierarchy

```
App
├── Landing (Home Page)
└── Meeting
    ├── VideoGrid
    │   ├── VideoStream (Host)
    │   └── VideoStream[] (Participants)
    ├── ControlPanel
    ├── JoinRequestsModal
    └── Error/Status Messages
```

### State Management

The app uses React Context API (`MeetingContext`) for global state:

```javascript
{
  meetingCode: string,
  isHost: boolean,
  participants: Participant[],
  joinRequests: JoinRequest[],
  localStream: MediaStream,
  isCameraEnabled: boolean,
  isMicEnabled: boolean,
  socket: Socket,
  isConnected: boolean
}
```

### Data Flow

```
User Action
    ↓
Component Handler
    ↓
Socket Event
    ↓
Streaming Server
    ↓
Other Clients via Socket
    ↓
WebRTC Offer/Answer
    ↓
P2P Connection
    ↓
Video Stream
```

## Backend Architecture

### Meeting Storage

Currently uses in-memory Map. To persist:

```javascript
// Replace this in server.js
const activeMeetings = new Map()

// With a database
import mongoose from 'mongoose'

const meetingSchema = new mongoose.Schema({
  code: String,
  hostId: String,
  hostName: String,
  createdAt: Date,
  participants: [String]
})

const Meeting = mongoose.model('Meeting', meetingSchema)
```

### Adding New API Endpoints

```javascript
// Example: Get meeting history for a user
app.get('/api/meetings/user/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const meetings = await Meeting.find({ 'participants': userId })
    res.json({ success: true, meetings })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

## Streaming Server Architecture

### Socket Event Flow

```
Client → emit event → Server listener
          ↓
        Process event
          ↓
Server → emit event → Other clients
```

### Adding New Socket Events

```javascript
// In stream_server.js
socket.on('custom-event', (data) => {
  console.log('Received custom-event:', data)
  
  // Process
  const result = processData(data)
  
  // Emit to specific user
  const targetSocket = io.sockets.sockets.get(targetSocketId)
  targetSocket.emit('custom-response', result)
})
```

## WebRTC Flow Details

### Offer/Answer Negotiation

```
Host creates Offer
    ↓
Send via Socket to Participant
    ↓
Participant creates Answer
    ↓
Send Answer back to Host
    ↓
Exchange ICE Candidates
    ↓
P2P Connection Established
```

### Adding ICE Servers

```javascript
// In frontend/src/utils/webrtcService.js
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add more STUN servers
    { urls: 'turn:turnserver.example.com:3478', username: 'user', credential: 'pass' },
    // Add TURN servers for behind firewalls
  ]
}
```

## Common Enhancements

### 1. Add Screen Sharing

```javascript
// In webrtcService.js
async shareScreen(peerId) {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' },
      audio: false
    })
    
    const sender = peerConnection.getSenders()
      .find(s => s.track.kind === 'video')
    
    await sender.replaceTrack(screenStream.getVideoTracks()[0])
    
    return screenStream
  } catch (err) {
    console.error('Screen sharing failed:', err)
  }
}
```

### 2. Add Chat Functionality

```javascript
// In streaming_server/stream_server.js
socket.on('send-message', (data) => {
  const { meetingCode, message, userId } = data
  const meeting = getOrCreateMeeting(meetingCode)
  
  io.to(`meeting-${meetingCode}`).emit('new-message', {
    userId,
    message,
    timestamp: new Date()
  })
})
```

### 3. Add Meeting Recording

```javascript
// In frontend/src/utils/recordingService.js
export class RecordingService {
  startRecording(stream) {
    this.mediaRecorder = new MediaRecorder(stream)
    this.chunks = []
    
    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data)
    }
    
    this.mediaRecorder.start()
  }
  
  stopRecording() {
    this.mediaRecorder.stop()
    const blob = new Blob(this.chunks, { type: 'video/webm' })
    return blob
  }
}
```

### 4. Add User Authentication

```javascript
// Backend
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  
  // Verify credentials
  const user = await User.findOne({ email })
  if (!user || !await user.verifyPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
  
  res.json({ success: true, token })
})

// Middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]
  
  if (!token) return res.sendStatus(401)
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}
```

### 5. Add Database (MongoDB)

```javascript
// Install: npm install mongoose

import mongoose from 'mongoose'

const meetingSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  hostId: String,
  hostName: String,
  createdAt: { type: Date, default: Date.now },
  endedAt: Date,
  participants: [String],
  duration: Number
})

export const Meeting = mongoose.model('Meeting', meetingSchema)

// In server.js
mongoose.connect(process.env.MONGODB_URI)
```

## Testing

### Unit Testing with Vitest

```javascript
// Install: npm install vitest
import { describe, it, expect } from 'vitest'
import { generateMeetingCode } from './hooks/useMediaStream'

describe('generateMeetingCode', () => {
  it('should generate 6 character code', () => {
    const code = generateMeetingCode()
    expect(code).toHaveLength(6)
  })
  
  it('should generate uppercase code', () => {
    const code = generateMeetingCode()
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
  })
})
```

### E2E Testing with Playwright

```javascript
// Install: npm install @playwright/test

import { test, expect } from '@playwright/test'

test('hosts can create a meeting', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.fill('input[placeholder="Enter your name"]', 'Test User')
  await page.click('button:has-text("+ Host a Meeting")')
  
  await expect(page.locator('text=Meeting Code')).toBeVisible()
})
```

## Performance Optimization

### Code Splitting

```javascript
// In App.jsx
import { lazy, Suspense } from 'react'

const Landing = lazy(() => import('./pages/Landing'))
const Meeting = lazy(() => import('./pages/Meeting'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/meeting/:code" element={<Meeting />} />
      </Routes>
    </Suspense>
  )
}
```

### Video Quality Optimization

```javascript
// In webrtcService.js
const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
  videoConstraints: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  }
}
```

## Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy 'dist' folder
```

### Backend (Heroku/Railway)

```bash
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
git push heroku main
```

### Docker Setup

```dockerfile
# Frontend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Debugging Tips

### Enable Verbose Logging

```javascript
// In socketService.js
socket.on('connect', () => console.log('✅ Socket connected'))
socket.on('disconnect', () => console.log('❌ Socket disconnected'))
socket.on('error', (err) => console.error('Socket error:', err))
```

### WebRTC Stats

```javascript
// Monitor peer connection quality
setInterval(() => {
  peerConnection.getStats().then(stats => {
    stats.forEach(report => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        console.log('Bytes received:', report.bytesReceived)
        console.log('Frames decoded:', report.framesDecoded)
      }
    })
  })
}, 1000)
```

## Code Style Guide

### Naming Conventions

- **Components**: `PascalCase` (VideoStream.jsx)
- **Functions**: `camelCase` (handleJoinMeeting)
- **Constants**: `UPPER_SNAKE_CASE` (MAX_PARTICIPANTS)
- **Files**: `kebab-case` for utilities, `PascalCase` for components

### Code Organization

```javascript
// 1. Imports
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Constants
const MAX_PARTICIPANTS = 10

// 3. Component
export default function MyComponent() {
  // 2.1. Hooks
  const [state, setState] = useState()
  const navigate = useNavigate()
  
  // 2.2. Effects
  useEffect(() => {}, [])
  
  // 2.3. Handlers
  const handleClick = () => {}
  
  // 2.4. JSX
  return <div></div>
}
```

## Resources

- [WebRTC MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Socket.io Docs](https://socket.io/docs/)
- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Ensure tests pass

---

Happy coding! 🚀
