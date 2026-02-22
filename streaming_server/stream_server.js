import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import os from 'os'

dotenv.config()

const PORT = process.env.PORT || 4000

const httpServer = http.createServer()

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4000', '*'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Store active meetings and their participants
const meetings = new Map()
const userSockets = new Map()

// Helper function to get or create a meeting
function getOrCreateMeeting(meetingCode) {
  if (!meetings.has(meetingCode)) {
    meetings.set(meetingCode, {
      code: meetingCode,
      host: null,
      participants: new Map(),
      joinRequests: new Map(),
      createdAt: Date.now()
    })
  }
  return meetings.get(meetingCode)
}

// Helper function to join socket to room
function joinSocketToRoom(socket, meetingCode) {
  socket.join(`meeting-${meetingCode}`)
  socket.data.meetingCode = meetingCode
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`)

  // Host creates a meeting
  socket.on('host-meeting', (data) => {
    const { meetingCode, hostId } = data
    const meeting = getOrCreateMeeting(meetingCode)

    meeting.host = {
      id: hostId,
      socketId: socket.id,
      userName: 'Host'
    }

    userSockets.set(hostId, socket.id)
    joinSocketToRoom(socket, meetingCode)

    console.log(`🏠 Host ${hostId} created meeting ${meetingCode}`)

    socket.emit('meeting-created', {
      success: true,
      meetingCode,
      isHost: true
    })
  })

  // User joins a meeting
  socket.on('join-meeting', (data) => {
    console.log(`\n🟠 JOIN-MEETING received - Data:`, data)
    const { meetingCode, userId, userName } = data
    const meeting = getOrCreateMeeting(meetingCode)
    console.log(`   Meeting exists, host: ${meeting.host?.id || 'NONE'}`)

    // If not host, send join request
    if (meeting.host && meeting.host.id !== userId) {
      console.log(`   ✅ Storing join request for non-host user`)
      // Store join request
      meeting.joinRequests.set(userId, {
        id: userId,
        socketId: socket.id,
        userName,
        timestamp: Date.now()
      })

      userSockets.set(userId, socket.id)
      socket.data.userId = userId
      socket.data.userName = userName

      // Notify host about join request
      const hostSocket = io.sockets.sockets.get(meeting.host.socketId)
      console.log(`   🔍 Host socket ${meeting.host.socketId} - Found: ${!!hostSocket}`)
      if (hostSocket) {
        console.log(`   📤 Emitting join-request to host`)
        hostSocket.emit('join-request', {
          id: userId,
          userName,
          meetingCode
        })
      } else {
        console.log(`   ❌ Host socket not found!`)
      }

      console.log(`📥 Join request from ${userName} (${userId}) for meeting ${meetingCode}`)

      socket.emit('join-request-sent', {
        success: true,
        message: 'Join request sent to host'
      })
    } else {
      console.log(`   ⚠️ Host not found or user is the host`)
    }
  })

  // Host approves a join request
  socket.on('approve-join', (data) => {
    const { meetingCode, userId } = data
    console.log(`\n🔵 APPROVE-JOIN received - Code: ${meetingCode}, User: ${userId}`)
    const meeting = getOrCreateMeeting(meetingCode)

    if (!meeting.joinRequests.has(userId)) {
      console.log(`❌ Join request not found for user ${userId}`)
      return
    }

    const joinRequest = meeting.joinRequests.get(userId)
    meeting.participants.set(userId, {
      id: userId,
      socketId: joinRequest.socketId,
      userName: joinRequest.userName
    })
    meeting.joinRequests.delete(userId)

    // Add approved user to the meeting room
    const approvedSocket = io.sockets.sockets.get(joinRequest.socketId)
    console.log(`🔍 Looking for socket ${joinRequest.socketId} - Found: ${!!approvedSocket}`)
    
    if (approvedSocket) {
      console.log(`✅ Adding socket ${joinRequest.socketId} to room meeting-${meetingCode}`)
      approvedSocket.join(`meeting-${meetingCode}`)
    } else {
      console.log(`❌ Approved socket not found!`)
    }

    // Notify the user
    console.log(`📤 Emitting join-approved to socket ${joinRequest.socketId}`)
    approvedSocket?.emit('join-approved', {
      success: true,
      meetingCode
    })

    // Send existing participants list to new user
    const participantsList = Array.from(meeting.participants.values()).filter(p => p.id !== userId)
    console.log(`📤 Emitting meeting-participants with ${participantsList.length} participants`)
    approvedSocket?.emit('meeting-participants', {
      host: {
        id: meeting.host.id,
        userName: meeting.host.userName
      },
      participants: participantsList
    })

    // Notify all participants (including host) about new user
    console.log(`📢 Broadcasting user-joined to room meeting-${meetingCode}`)
    io.to(`meeting-${meetingCode}`).emit('user-joined', {
      userId,
      userName: joinRequest.userName,
      isHost: false
    })

    console.log(`✅✅✅ ${userId} successfully approved to join meeting ${meetingCode}\n`)
  })

  // Host rejects a join request
  socket.on('reject-join', (data) => {
    const { meetingCode, userId } = data
    const meeting = getOrCreateMeeting(meetingCode)

    if (!meeting.joinRequests.has(userId)) {
      return
    }

    const joinRequest = meeting.joinRequests.get(userId)
    meeting.joinRequests.delete(userId)

    io.to(joinRequest.socketId).emit('join-rejected', {
      reason: 'Host rejected your join request'
    })

    console.log(`❌ ${userId} rejected from meeting ${meetingCode}`)
  })

  // Send WebRTC offer
  socket.on('send-offer', (data) => {
    const { meetingCode, targetUserId, offer } = data
    const meeting = getOrCreateMeeting(meetingCode)
    const targetUser = meeting.participants.get(targetUserId) || 
                        (meeting.host?.id === targetUserId && meeting.host)

    if (targetUser) {
      const targetSocket = io.sockets.sockets.get(targetUser.socketId)
      if (targetSocket) {
        targetSocket.emit('offer', {
          userId: socket.data.userId,
          userName: socket.data.userName,
          offer
        })
      }
    }
  })

  // Send WebRTC answer
  socket.on('send-answer', (data) => {
    const { meetingCode, targetUserId, answer } = data
    const meeting = getOrCreateMeeting(meetingCode)
    const targetUser = meeting.participants.get(targetUserId) || 
                        (meeting.host?.id === targetUserId && meeting.host)

    if (targetUser) {
      const targetSocket = io.sockets.sockets.get(targetUser.socketId)
      if (targetSocket) {
        targetSocket.emit('answer', {
          userId: socket.data.userId,
          answer
        })
      }
    }
  })

  // Send ICE candidate
  socket.on('send-ice-candidate', (data) => {
    const { meetingCode, targetUserId, candidate } = data
    const meeting = getOrCreateMeeting(meetingCode)
    const targetUser = meeting.participants.get(targetUserId) || 
                        (meeting.host?.id === targetUserId && meeting.host)

    if (targetUser) {
      const targetSocket = io.sockets.sockets.get(targetUser.socketId)
      if (targetSocket) {
        targetSocket.emit('ice-candidate', {
          userId: socket.data.userId,
          candidate
        })
      }
    }
  })

  // Host removes a participant
  socket.on('remove-participant', (data) => {
    const { meetingCode, userId } = data
    const meeting = getOrCreateMeeting(meetingCode)

    if (meeting.participants.has(userId)) {
      const participant = meeting.participants.get(userId)
      meeting.participants.delete(userId)

      io.to(participant.socketId).emit('participant-removed', {
        reason: 'Host removed you from the meeting'
      })

      io.to(`meeting-${meetingCode}`).emit('user-left', {
        userId
      })

      console.log(`🚪 ${userId} removed from meeting ${meetingCode}`)
    }
  })

  // User leaves the meeting
  socket.on('leave-meeting', (data) => {
    const { meetingCode, userId } = data
    const meeting = getOrCreateMeeting(meetingCode)
    
    meeting.participants.delete(userId)
    io.to(`meeting-${meetingCode}`).emit('user-left', {
      userId
    })

    socket.leave(`meeting-${meetingCode}`)
    console.log(`👋 ${userId} left meeting ${meetingCode}`)
  })

  // Host ends the meeting
  socket.on('end-meeting', (data) => {
    const { meetingCode } = data
    const meeting = getOrCreateMeeting(meetingCode)

    io.to(`meeting-${meetingCode}`).emit('meeting-ended', {
      reason: 'Host ended the meeting'
    })

    meetings.delete(meetingCode)
    console.log(`🏁 Meeting ${meetingCode} ended`)
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`)

    const meetingCode = socket.data.meetingCode
    if (meetingCode) {
      const meeting = meetings.get(meetingCode)
      if (meeting) {
        // Remove from participants
        for (let [userId, participant] of meeting.participants.entries()) {
          if (participant.socketId === socket.id) {
            meeting.participants.delete(userId)
            io.to(`meeting-${meetingCode}`).emit('user-left', { userId })
            break
          }
        }

        // Remove from join requests
        for (let [userId, request] of meeting.joinRequests.entries()) {
          if (request.socketId === socket.id) {
            meeting.joinRequests.delete(userId)
            break
          }
        }

        // If host disconnected, end meeting
        if (meeting.host?.socketId === socket.id) {
          io.to(`meeting-${meetingCode}`).emit('host-disconnected', {
            reason: 'Host disconnected'
          })
          meetings.delete(meetingCode)
        }
      }
    }

    // Clean up user socket mapping
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId)
        break
      }
    }
  })
})

// Start server
function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

const localIP = getLocalIP()

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Streaming server running`)
  console.log(`   Local: http://localhost:${PORT}`)
  console.log(`   Network: http://${localIP}:${PORT}`)
  console.log(`📡 WebSocket endpoint: ws://${localIP}:${PORT}`)
  console.log(`   (Use http://localhost:${PORT} for local development)`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})
