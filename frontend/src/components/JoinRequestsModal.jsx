import { useState, useEffect } from 'react'

export default function JoinRequestsModal({ isOpen, requests, onApprove, onReject, onClose }) {
  const [localRequests, setLocalRequests] = useState(requests)

  useEffect(() => {
    setLocalRequests(requests)
  }, [requests])

  const handleApprove = (requestId) => {
    onApprove(requestId)
    setLocalRequests(localRequests.filter(r => r.id !== requestId))
  }

  const handleReject = (requestId) => {
    onReject(requestId)
    setLocalRequests(localRequests.filter(r => r.id !== requestId))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700 animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Join Requests</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {localRequests.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between bg-gray-700 hover:bg-gray-650 rounded-lg p-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{request.userName}</p>
                    <p className="text-gray-400 text-sm">{request.id}</p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
