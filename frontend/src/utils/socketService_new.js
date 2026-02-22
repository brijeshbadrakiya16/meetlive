import io from 'socket.io-client'

// Dynamically determine socket server URL
function getSocketServerURL() {
  const envUrl = import.meta.env.VITE_STREAMING_SERVER_URL
  
  // If env is set and valid, use it
  if (envUrl && envUrl !== 'http://localhost:4000') {
    return envUrl
  }
  
  // Get current host and port
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  // If on localhost/127.0.0.1, use localhost for socket
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000'
  }
  
  // If on network (mobile or other device), use the same host's IP with socket port
  return `${protocol}//${hostname}:4000`
}

class SocketService {
  constructor() {
    this.socket = null
  }

  connect() {
    if (this.socket && this.socket.connected) {
      console.log('🔌 Socket already connected')
      return this.socket
    }

    if (this.socket && !this.socket.connected) {
      console.log('🔌 Socket exists but reconnecting...')
      this.socket.connect()
      return this.socket
    }

    const socketUrl = getSocketServerURL()
    console.log('🔌 Connecting to socket server:', socketUrl)
    
    this.socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: false,
    })
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server. Socket ID:', this.socket.id)
    })
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message)
    })

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket disconnected:', reason)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Host creates a meeting
  hostMeeting(meetingCode, hostId) {
    console.log('🏠 [EMIT] host-meeting', { meetingCode, hostId })
    this.socket?.emit('host-meeting', { meetingCode, hostId })
  }

  // User joins a meeting
  joinMeeting(meetingCode, userId, userName) {
    console.log('📞 [EMIT] join-meeting', { meetingCode, userId, userName })
    this.socket?.emit('join-meeting', { meetingCode, userId, userName })
  }

  // Host approves a join request
  approveJoinRequest(meetingCode, userId) {
    console.log('✅ [EMIT] approve-join', { meetingCode, userId })
    this.socket?.emit('approve-join', { meetingCode, userId })
  }

  // Host rejects a join request
  rejectJoinRequest(meetingCode, userId) {
    console.log('❌ [EMIT] reject-join', { meetingCode, userId })
    this.socket?.emit('reject-join', { meetingCode, userId })
  }

  // Host removes a participant
  removeParticipant(meetingCode, userId) {
    console.log('🚪 [EMIT] remove-participant', { meetingCode, userId })
    this.socket?.emit('remove-participant', { meetingCode, userId })
  }

  // Host ends the meeting
  endMeeting(meetingCode) {
    console.log('🏁 [EMIT] end-meeting', { meetingCode })
    this.socket?.emit('end-meeting', { meetingCode })
  }

  // User leaves the meeting
  leaveMeeting(meetingCode, userId) {
    console.log('👋 [EMIT] leave-meeting', { meetingCode, userId })
    this.socket?.emit('leave-meeting', { meetingCode, userId })
  }

  // Send WebRTC offer
  sendOffer(meetingCode, targetUserId, offer) {
    console.log('📤 [EMIT] send-offer to', targetUserId)
    this.socket?.emit('send-offer', { meetingCode, targetUserId, offer })
  }

  // Send WebRTC answer
  sendAnswer(meetingCode, targetUserId, answer) {
    console.log('📥 [EMIT] send-answer to', targetUserId)
    this.socket?.emit('send-answer', { meetingCode, targetUserId, answer })
  }

  // Send ICE candidate
  sendIceCandidate(meetingCode, targetUserId, candidate) {
    this.socket?.emit('send-ice-candidate', { meetingCode, targetUserId, candidate })
  }

  // Listen for events
  on(event, callback) {
    console.log(`📡 [LISTEN] Registering listener for: "${event}"`)
    this.socket?.on(event, (...args) => {
      console.log(`📨 [RECEIVED] ${event}`, args[0])
      callback(...args)
    })
  }

  off(event, callback) {
    this.socket?.off(event, callback)
  }

  // Emit custom event
  emit(event, data) {
    this.socket?.emit(event, data)
  }
}

export default new SocketService()
