import React, { createContext, useState, useCallback, useEffect } from 'react'

export const MeetingContext = createContext()

export function MeetingProvider({ children }) {
  const [meetingCode, setMeetingCode] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [participants, setParticipants] = useState([])
  const [joinRequests, setJoinRequests] = useState([])
  const [localStream, setLocalStream] = useState(null)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const enabled = localStream.getVideoTracks()[0]?.enabled
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !enabled
      })
      setIsCameraEnabled(!enabled)
    }
  }, [localStream])

  const toggleMic = useCallback(() => {
    if (localStream) {
      const enabled = localStream.getAudioTracks()[0]?.enabled
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !enabled
      })
      setIsMicEnabled(!enabled)
    }
  }, [localStream])

  const value = {
    meetingCode,
    setMeetingCode,
    isHost,
    setIsHost,
    participants,
    setParticipants,
    joinRequests,
    setJoinRequests,
    localStream,
    setLocalStream,
    isCameraEnabled,
    setIsCameraEnabled,
    toggleCamera,
    isMicEnabled,
    setIsMicEnabled,
    toggleMic,
    socket,
    setSocket,
    isConnected,
    setIsConnected,
  }

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  )
}
