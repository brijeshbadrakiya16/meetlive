import VideoStream from './VideoStream'

export default function VideoGrid({ hostStream, hostName, participants, isHost }) {
  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-2 p-2 md:p-4 bg-gray-900">
      {/* Main Host Video - Top on mobile, Right on desktop */}
      <div className="w-full lg:flex-1 flex flex-col">
        <div className="flex-1 rounded-lg overflow-hidden shadow-lg animate-fadeIn min-h-80 md:min-h-96">
          {hostStream && (
            <VideoStream
              stream={hostStream}
              userName={hostName}
              isLocal={isHost}
              isHost={true}
            />
          )}
        </div>
      </div>

      {/* Participants List - Bottom on mobile (horizontal scroll), Right sidebar on desktop (vertical scroll) */}
      <div className="w-full lg:w-80 flex flex-row lg:flex-col gap-3 lg:overflow-y-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {/* No Participants Message */}
        {participants.length === 0 && (
          <div className="hidden lg:flex flex-shrink-0 items-center justify-center h-64 w-full rounded-lg bg-gray-800 border border-gray-700">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="text-gray-400 text-sm">No other participants</p>
            </div>
          </div>
        )}

        {/* Participants */}
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex-shrink-0 w-48 md:w-64 lg:w-full h-48 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-slideInRight relative group"
          >
            <VideoStream
              stream={participant.stream}
              userName={participant.name}
              isLocal={participant.isLocal}
              isHost={false}
            />
            {isHost && !participant.isLocal && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <button
                    onClick={() => participant.onRemove?.()}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
