import { useContext } from 'react'
import { MeetingContext } from '../context/MeetingContext'

export default function ControlPanel({ onEndMeeting, onViewRequests, joinRequestCount = 0 }) {
  const { isCameraEnabled, toggleCamera, isMicEnabled, toggleMic } = useContext(MeetingContext)

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full px-4 sm:px-0">
      <div className="flex items-center justify-center gap-2 sm:gap-3 bg-gray-800 rounded-full p-2 sm:p-3 shadow-2xl border border-gray-700 backdrop-blur-md bg-opacity-90 w-full sm:w-auto sm:mx-auto">
        {/* Camera Button */}
        <button
          onClick={toggleCamera}
          className={`p-2 sm:p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
            isCameraEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isCameraEnabled ? 'Camera On' : 'Camera Off'}
        >
          {isCameraEnabled ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
              <path d="M13 2a2 2 0 012 2v12a2 2 0 002 2h.5a.5.5 0 00.5-.5v-2.05a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v2.05a.5.5 0 00.5.5H20a2 2 0 002-2V4a2 2 0 00-2-2h-.5a.5.5 0 00-.5.5v2.05a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V2.5a.5.5 0 00-.5-.5H15z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4.242 4.242a4 4 0 105.656 5.656l4.242-4.242m2.828-10.828a4 4 0 010 5.656l-4.242 4.242m2.828-10.828l4.242 4.242" />
            </svg>
          )}
        </button>

        {/* Microphone Button */}
        <button
          onClick={toggleMic}
          className={`p-2 sm:p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
            isMicEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isMicEnabled ? 'Mic On' : 'Mic Off'}
        >
          {isMicEnabled ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
              <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.539 5.585 5.75 5.585a5.756 5.756 0 005.506-3.256.75.75 0 10-1.385-.470A4.256 4.256 0 0110 14.643V9.643z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 2c.82 0 1.555.457 1.941 1.14.135.248.348.45.652.45.353 0 .656-.215.856-.45.386-.683 1.12-1.14 1.941-1.14 1.657 0 3 1.343 3 3v6a3 3 0 01-5 2.752V11a1 1 0 10-2 0v1.311A3 3 0 014 9V3a1 1 0 011-1 1 1 0 00-.617-.924z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Separator */}
        <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

        {/* Join Requests Button (Host Only) */}
        <button
          onClick={onViewRequests}
          className="relative p-2 sm:p-3 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-200 flex-shrink-0"
          title="Join Requests"
        >
          {joinRequestCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-5 text-center">
              {joinRequestCount}
            </span>
          )}
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </button>

        {/* Leave/End Button */}
        <button
          onClick={onEndMeeting}
          className="p-2 sm:p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 flex-shrink-0"
          title="Leave Meeting"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
