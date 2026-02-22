import { useEffect, useRef } from 'react'

export default function VideoStream({ stream, userName, isLocal = false, isHost = false }) {
  const videoRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (isLocal && videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, isLocal])

  useEffect(() => {
    if (!isLocal && audioRef.current && stream) {
      audioRef.current.srcObject = stream
    }
  }, [stream, isLocal])

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      {isLocal ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      ) : (
        <>
          <video
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            style={{ display: stream ? 'block' : 'none' }}
          />
          <audio ref={audioRef} autoPlay playsInline />
          {!stream && (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">{userName}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Info Badge */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-semibold truncate">{userName}</span>
          {isHost && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">HOST</span>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}
