import { useEffect, useState, useContext, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MeetingContext } from '../context/MeetingContext'
import VideoGrid from '../components/VideoGrid'
import ControlPanel from '../components/ControlPanel'
import JoinRequestsModal from '../components/JoinRequestsModal'
import { useMediaStream, generateUserId } from '../hooks/useMediaStream'
import socketService from '../utils/socketService'
import webrtcService from '../utils/webrtcService'

export default function Meeting() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { isHost, setLocalStream: setContextLocalStream, setIsCameraEnabled, setIsMicEnabled } = useContext(MeetingContext)
  const { stream: localStream, isLoading } = useMediaStream()

  const [participants, setParticipants] = useState([])
  const [joinRequests, setJoinRequests] = useState([])
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [hostStream, setHostStream] = useState(null)
  const [hostName, setHostName] = useState('Host')
  const [error, setError] = useState('')
  const [isConnecting, setIsConnecting] = useState(!isHost)
  const socketRef = useRef(null)
  const userIdRef = useRef(generateUserId())
  const userNameRef = useRef('User')

  // Initialize socket and local stream
  useEffect(() => {
    if (!localStream) return

    webrtcService.setLocalStream(localStream)
    socketRef.current = socketService.connect()
    
    // Update context with local stream for camera/mic controls
    if (setContextLocalStream) {
      setContextLocalStream(localStream)
    }
    if (setIsCameraEnabled) {
      setIsCameraEnabled(true)
    }
    if (setIsMicEnabled) {
      setIsMicEnabled(true)
    }

    return () => {
      // Cleanup
    }
  }, [localStream, setContextLocalStream, setIsCameraEnabled, setIsMicEnabled])

  // Setup socket event listeners FIRST, before joining
  useEffect(() => {
    // Don't set up listeners until local stream is ready
    if (!localStream) {
      console.log('⏳ Waiting for local stream before setting up listeners...')
      return
    }

    console.log('✅ Local stream ready, preparing to connect')
    
    // Ensure socket exists
    if (!socketRef.current) {
      socketRef.current = socketService.connect()
    }

    // Define all handlers here (outside async so they're in scope for cleanup)
    const handleMeetingCreated = (data) => {
      console.log('✅ Meeting created:', data)
    }

    const handleJoinRequestSent = (data) => {
      console.log('📨 Join request sent:', data)
    }

    const handleJoinApproved = (data) => {
      console.log('✅✅✅ JOIN APPROVED - Setting isConnecting to FALSE:', data)
      setIsConnecting(false)
    }

    const handleJoinRejected = (data) => {
      console.log('❌ Join rejected:', data)
      setError('Your join request was rejected by the host')
      setTimeout(() => navigate('/'), 2000)
    }

    const handleMeetingParticipants = (data) => {
      console.log('👥 Meeting participants:', data)
      if (data.host) {
        setHostName(data.host.userName)
        // Add host to participants list so it shows in video grid
        // Stream will be added when offer/answer completes
        if (!isHost) {
          console.log('📨 Adding host to participants list')
          setParticipants(prev => {
            const exists = prev.find(p => p.id === data.host.id)
            if (!exists) {
              return [{
                id: data.host.id,
                name: data.host.userName,
                stream: null, // Stream will come later from offer
                isLocal: false
              }, ...prev]
            }
            return prev
          })
        }
      }
      // Add other participants
      if (data.participants && Array.isArray(data.participants)) {
        console.log('📨 Adding', data.participants.length, 'existing participants')
        setParticipants(prev => {
          const newParticipants = [...prev]
          data.participants.forEach(participant => {
            const exists = newParticipants.find(p => p.id === participant.id)
            if (!exists) {
              newParticipants.push({
                id: participant.id,
                name: participant.userName,
                stream: null,
                isLocal: false
              })
            }
          })
          return newParticipants
        })
      }
    }

    const handleUserJoined = async (data) => {
      console.log('👤 User joined:', data)
      const { userId: newUserId, userName: newUserName, isHost: isNewUserHost } = data

      if (!isNewUserHost && isHost) {
        // Add participant to list immediately (stream will be added later)
        console.log('👥 Adding participant to list:', newUserName)
        setParticipants(prev => {
          const exists = prev.find(p => p.id === newUserId)
          if (!exists) {
            return [...prev, {
              id: newUserId,
              name: newUserName,
              stream: null,
              isLocal: false
            }]
          }
          return prev
        })

        try {
          console.log('🏠 Host creating offer for new participant:', newUserId)
          const offer = await webrtcService.createOffer(
            newUserId,
            (candidate) => socketService.sendIceCandidate(code, newUserId, candidate),
            (stream) => {
              console.log('📹 Stream received from participant', newUserId, 'tracks:', stream.getTracks().length)
              setParticipants(prev => {
                return prev.map(p =>
                  p.id === newUserId ? { ...p, stream } : p
                )
              })
            }
          )
          socketService.sendOffer(code, newUserId, offer)
        } catch (err) {
          console.error('Error creating offer:', err)
        }
      }
    }

    const handleOffer = async (data) => {
      console.log('📤 Offer received:', data)
      const { userId: senderId, userName: senderName, offer } = data

      try {
        const answer = await webrtcService.createAnswer(
          senderId,
          offer,
          (candidate) => socketService.sendIceCandidate(code, senderId, candidate),
          (stream) => {
            console.log('📹 Stream received from', senderId, 'tracks:', stream.getTracks().length)
            setParticipants(prev => {
              const exists = prev.find(p => p.id === senderId)
              if (exists) {
                // Update existing participant with stream
                console.log('📹 Updating existing participant', senderId, 'with stream')
                return prev.map(p => 
                  p.id === senderId ? { ...p, stream } : p
                )
              } else {
                // Create new participant if doesn't exist
                console.log('📹 Creating new participant', senderId, 'with stream')
                return [...prev, {
                  id: senderId,
                  name: senderName,
                  stream,
                  isLocal: false
                }]
              }
            })
          }
        )
        socketService.sendAnswer(code, senderId, answer)
      } catch (err) {
        console.error('Error creating answer:', err)
      }
    }

    const handleAnswer = async (data) => {
      console.log('📥 Answer received:', data)
      const { userId: senderId, answer } = data
      try {
        await webrtcService.addAnswer(senderId, answer)
      } catch (err) {
        console.error('Error adding answer:', err)
      }
    }

    const handleIceCandidate = async (data) => {
      console.log('❄️  ICE candidate received:', data)
      const { userId: senderId, candidate } = data
      try {
        await webrtcService.addIceCandidate(senderId, candidate)
      } catch (err) {
        console.error('Error adding ICE candidate:', err)
      }
    }

    const handleUserLeft = (data) => {
      console.log('👋 User left:', data)
      const { userId: departingUserId } = data
      webrtcService.closePeerConnection(departingUserId)
      setParticipants(prev => prev.filter(p => p.id !== departingUserId))
    }

    const handleJoinRequest = (data) => {
      console.log('📩 Join request:', data)
      if (isHost) {
        setJoinRequests(prev => {
          // Check if this request already exists to prevent duplicates
          const exists = prev.some(r => r.id === data.id)
          if (!exists) {
            return [...prev, data]
          }
          return prev
        })
      }
    }

    const handleMeetingEnded = (data) => {
      console.log('🏁 Meeting ended:', data)
      setError('Meeting has been ended by the host')
      setTimeout(() => {
        webrtcService.closeAllConnections()
        navigate('/')
      }, 2000)
    }

    const handleParticipantRemoved = (data) => {
      console.log('🚪 Participant removed:', data)
      const { reason } = data
      setError(reason || 'You have been removed from the meeting')
      setTimeout(() => {
        webrtcService.closeAllConnections()
        navigate('/')
      }, 2000)
    }

    const handleHostDisconnected = (data) => {
      console.log('💔 Host disconnected:', data)
      setError('Host disconnected from the meeting')
      setTimeout(() => {
        webrtcService.closeAllConnections()
        navigate('/')
      }, 2000)
    }

    // Setup async flow
    let isMounted = true
    
    const setupListeners = async () => {
      // Wait for socket to be connected
      await socketService.waitForConnection()
      
      if (!isMounted) return
      
      console.log('✅ Socket is connected, registering all listeners now')
      
      // REGISTER ALL LISTENERS
      socketService.on('meeting-created', handleMeetingCreated)
      socketService.on('join-request-sent', handleJoinRequestSent)
      socketService.on('join-approved', handleJoinApproved)
      socketService.on('join-rejected', handleJoinRejected)
      socketService.on('meeting-participants', handleMeetingParticipants)
      socketService.on('user-joined', handleUserJoined)
      socketService.on('offer', handleOffer)
      socketService.on('answer', handleAnswer)
      socketService.on('ice-candidate', handleIceCandidate)
      socketService.on('user-left', handleUserLeft)
      socketService.on('join-request', handleJoinRequest)
      socketService.on('meeting-ended', handleMeetingEnded)
      socketService.on('participant-removed', handleParticipantRemoved)
      socketService.on('host-disconnected', handleHostDisconnected)

      if (!isMounted) return

      // Now join/host the meeting
      const userId = userIdRef.current
      const userName = userNameRef.current

      if (isHost) {
        console.log('🏠 Hosting meeting:', code)
        socketService.hostMeeting(code, userId)
        setHostName('You (Host)')
        setHostStream(localStream)
        setParticipants([])
      } else {
        console.log('📞 Joining meeting:', code)
        socketService.joinMeeting(code, userId, userName)
      }
    }

    setupListeners()

    return () => {
      isMounted = false
      socketService.off('meeting-created', handleMeetingCreated)
      socketService.off('join-request-sent', handleJoinRequestSent)
      socketService.off('join-approved', handleJoinApproved)
      socketService.off('join-rejected', handleJoinRejected)
      socketService.off('meeting-participants', handleMeetingParticipants)
      socketService.off('user-joined', handleUserJoined)
      socketService.off('offer', handleOffer)
      socketService.off('answer', handleAnswer)
      socketService.off('ice-candidate', handleIceCandidate)
      socketService.off('user-left', handleUserLeft)
      socketService.off('join-request', handleJoinRequest)
      socketService.off('meeting-ended', handleMeetingEnded)
      socketService.off('participant-removed', handleParticipantRemoved)
      socketService.off('host-disconnected', handleHostDisconnected)
    }
  }, [code, isHost, localStream, navigate])

  const handleEndMeeting = () => {
    if (isHost) {
      socketService.endMeeting(code)
    } else {
      const userId = userIdRef.current
      socketService.leaveMeeting(code, userId)
    }
    webrtcService.closeAllConnections()
    localStream?.getTracks().forEach(t => t.stop())
    navigate('/')
  }

  const handleApproveRequest = (requestId) => {
    socketService.approveJoinRequest(code, requestId)
    setJoinRequests(prev => prev.filter(r => r.id !== requestId))
  }

  const handleRejectRequest = (requestId) => {
    socketService.rejectJoinRequest(code, requestId)
    setJoinRequests(prev => prev.filter(r => r.id !== requestId))
  }

  const handleRemoveParticipant = (participantId) => {
    if (isHost) {
      socketService.removeParticipant(code, participantId)
      setParticipants(prev => prev.filter(p => p.id !== participantId))
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing meeting...</p>
        </div>
      </div>
    )
  }

  if (isConnecting && !isHost) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Waiting for host approval...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gray-900 overflow-hidden">
      {/* Error Message */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 animate-fadeIn">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Meeting Code Display */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800 bg-opacity-80 px-4 py-2 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-xs">Meeting Code</p>
        <p className="text-white text-lg font-mono font-bold">{code}</p>
      </div>

      {/* Video Grid */}
      <VideoGrid
        hostStream={hostStream}
        hostName={hostName}
        participants={participants}
        isHost={isHost}
      />

      {/* Control Panel */}
      <ControlPanel
        onEndMeeting={handleEndMeeting}
        onViewRequests={() => setShowRequestsModal(true)}
        joinRequestCount={joinRequests.length}
      />

      {/* Join Requests Modal */}
      <JoinRequestsModal
        isOpen={showRequestsModal}
        requests={joinRequests}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        onClose={() => setShowRequestsModal(false)}
      />
    </div>
  )
}

