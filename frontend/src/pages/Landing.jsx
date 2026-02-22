import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { MeetingContext } from '../context/MeetingContext'
import { generateMeetingCode, generateUserId } from '../hooks/useMediaStream'
import socketService from '../utils/socketService'

export default function Landing() {
  const navigate = useNavigate()
  const { setMeetingCode, setIsHost, setSocket } = useContext(MeetingContext)
  const [joinCode, setJoinCode] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleHostMeeting = async () => {
    setIsLoading(true)
    setError('')

    try {
      if (!userName.trim()) {
        setError('Please enter your name')
        setIsLoading(false)
        return
      }

      const code = generateMeetingCode()
      const userId = generateUserId()

      // Connect to socket
      const socket = socketService.connect()
      setSocket(socket)

      // Host the meeting
      socketService.hostMeeting(code, userId)

      // Set context
      setMeetingCode(code)
      setIsHost(true)

      // Navigate to meeting
      setTimeout(() => {
        navigate(`/meeting/${code}`)
      }, 500)
    } catch (err) {
      setError('Failed to host meeting. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinMeeting = async () => {
    setIsLoading(true)
    setError('')

    try {
      if (!joinCode.trim()) {
        setError('Please enter a meeting code')
        setIsLoading(false)
        return
      }

      if (!userName.trim()) {
        setError('Please enter your name')
        setIsLoading(false)
        return
      }

      const userId = generateUserId()

      // Connect to socket
      const socket = socketService.connect()
      setSocket(socket)

      // Request to join meeting
      socketService.joinMeeting(joinCode, userId, userName)

      // Set context
      setMeetingCode(joinCode)
      setIsHost(false)

      // Navigate to meeting
      setTimeout(() => {
        navigate(`/meeting/${joinCode}`)
      }, 500)
    } catch (err) {
      setError('Failed to join meeting. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              MeetLive
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">Connect, Share, and Communicate</p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm bg-opacity-80 border border-gray-700 animate-fadeIn">
          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-xs sm:text-sm animate-fadeIn">
              {error}
            </div>
          )}

          {/* User Name Input */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
            />
          </div>

          {/* Host Meeting Button */}
          <button
            onClick={handleHostMeeting}
            disabled={isLoading}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? 'Creating...' : '+ Host a Meeting'}
          </button>

          {/* Divider */}
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>

          {/* Join Meeting Section */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
              Meeting Code
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter meeting code"
              maxLength="6"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-xl sm:text-2xl font-mono tracking-widest"
            />
          </div>

          {/* Join Meeting Button */}
          <button
            onClick={handleJoinMeeting}
            disabled={isLoading}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? 'Joining...' : 'Join Meeting'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm">
          <p>Secure • Fast • Easy to Use</p>
        </div>
      </div>

      {/* Gradient Background Animation */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  )
}
