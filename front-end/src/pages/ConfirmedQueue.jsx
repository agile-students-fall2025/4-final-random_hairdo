import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const btnPrimary = "w-1/2 px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition hover:cursor-pointer"
const btnOutline = "w-1/2 px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition hover:cursor-pointer"

function ConfirmedQueue() {
  const location = useLocation()
  const { zone, position: initialPosition, queueId, facilityId, estimatedWait: initialWait } = location.state || { 
    zone: { name: 'Unknown Zone', averageWaitTime: 0 }, 
    position: 0,
    queueId: null,
    facilityId: null,
    estimatedWait: 0
  }

  const [currentPosition, setCurrentPosition] = useState(initialPosition)
  const [estimatedWait, setEstimatedWait] = useState(initialWait || zone.averageWaitTime || 0)
  const [error, setError] = useState(null)

  // Fetch queue updates from backend
  useEffect(() => {
    if (!queueId) return

    const fetchQueueStatus = async () => {
      try {
        const response = await fetch(`/api/queues/${queueId}`)
        const data = await response.json()

        if (data.success) {
          setCurrentPosition(data.data.position)
          setEstimatedWait(data.data.estimatedWait)
        } else {
          setError('Failed to fetch queue status')
        }
      } catch (err) {
        console.error('Error fetching queue status:', err)
        setError('Failed to fetch queue status')
      }
    }

    // Fetch immediately
    fetchQueueStatus()

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchQueueStatus, 10000)

    return () => clearInterval(interval)
  }, [queueId])

  // Format wait time for display
  const formatWaitTime = (minutes) => {
    if (minutes === 0) return 'Next in line!'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Handle leave queue
  const handleLeaveQueue = async () => {
    if (!queueId) return

    if (!confirm('Are you sure you want to leave the queue?')) return

    try {
      const response = await fetch(`/api/queues/${queueId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('Successfully left the queue')
        window.location.href = '/facility'
      } else {
        alert(data.error || 'Failed to leave queue')
      }
    } catch (err) {
      console.error('Error leaving queue:', err)
      alert('Failed to leave queue. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#efefed] px-6 py-4">
      <div className="w-full flex items-start justify-between mb-8">
        <div className="flex items-start">
          <Link
            to="/"
            aria-label="Back to Home"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-[#462c9f] transition-colors"
          >
            Back to Home Page
          </Link>
        </div>

        <div className="flex items-center">
          <img src="/smartfit_logo.png" alt="Logo" className="h-20 w-auto" />
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">✓ Queue Confirmed!</h1>
          <p className="text-lg text-green-700">You've successfully joined the queue</p>
        </div>
        {error && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="flex-1 max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Queue Summary</h2>
          
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Equipment Zone</p>
              <p className="text-xl font-bold">{zone.name}</p>
            </div>

            <div className="pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Your Position</p>
              <p className="text-4xl font-bold text-[#462c9f]">#{currentPosition}</p>
              {currentPosition === 1 ? (
                <p className="text-sm text-green-600 font-semibold mt-2">You're next! Please proceed to the zone.</p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">{currentPosition - 1} people ahead of you</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Estimated Wait Time</p>
              <p className="text-2xl font-bold">{formatWaitTime(estimatedWait)}</p>
              <p className="text-xs text-gray-500 mt-1">Updates automatically as the queue moves</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <button 
            onClick={handleLeaveQueue}
            className={btnOutline}
          >
            Leave Queue
          </button>
          
          <Link to="/zone" className={btnPrimary}>
            View Other Zones
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Queue position updating in real-time</span>
        </div>
      </div>
    </div>
  )
}

export default ConfirmedQueue