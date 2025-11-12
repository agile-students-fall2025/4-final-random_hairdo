import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

// Shared button styles
const btnPrimary = "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition hover:cursor-pointer"
const btnOutline = "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition hover:cursor-pointer"

function Zone() {
  const navigate = useNavigate()
  const location = useLocation()
  const facilityId = location.state?.facilityId || 1

  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedZone, setSelectedZone] = useState(null)

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/zones?facilityId=${facilityId}`)
        const data = await response.json()
        
        if (data.success) {
          setZones(data.data)
        } else {
          setError(data.error || 'Failed to load zones')
        }
      } catch (err) {
        console.error('Error fetching zones:', err)
        setError('Failed to connect to server')
      } finally {
        setLoading(false)
      }
    }

    fetchZones()
  }, [facilityId])

  const handleJoinQueue = (zone) => {
    setSelectedZone(zone)
  }

  const handleConfirmQueue = async () => {
    if (!selectedZone) return

    try {
      // Create queue entry in backend
      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // TODO: Get from auth context
          zoneId: selectedZone.id,
          facilityId: facilityId,
          position: selectedZone.queueLength + 1,
          estimatedWait: selectedZone.averageWaitTime
        })
      })

      const data = await response.json()

      if (data.success) {
        // Navigate to confirmation page with queue data
        navigate('/confirmed-queue', { 
          state: { 
            zone: selectedZone,
            facilityId: facilityId,
            queueId: data.data.id,
            position: data.data.position,
            estimatedWait: data.data.estimatedWait
          } 
        })
      } else {
        alert(data.error || 'Failed to join queue')
      }
    } catch (error) {
      console.error('Error joining queue:', error)
      alert('Failed to join queue. Please try again.')
    }
  }

  const formatWaitTime = (minutes) => {
    if (minutes === 0) return 'No wait'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600'
      case 'moderate':
        return 'text-yellow-600'
      case 'busy':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#efefed] px-6 py-4">
      <div className="w-full flex items-start justify-between mb-8">
        <div className="flex items-start">
          <Link
            to="/facility"
            aria-label="Back to Facilities"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-[#462c9f] transition-colors"
          >
            Back to Facilities
          </Link>
        </div>

        <div className="flex items-center">
          <img src="/smartfit_logo.png" alt="Logo" className="h-20 w-auto" />
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Equipment Zones</h1>
        <p className="text-lg text-gray-600">Select a zone to join the queue</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 max-w-md">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Loading zones...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-lg text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#462c9f] text-white rounded-lg hover:bg-[#3b237f]"
            >
              Retry
            </button>
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">No zones available for this facility</p>
          </div>
        ) : (
          zones.map((zone) => (
            <div
              key={zone.id}
              className={`p-5 rounded-lg border-2 ${
                selectedZone?.id === zone.id
                  ? 'border-[#462c9f] bg-purple-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{zone.name}</h3>
                  <span className={`text-sm font-semibold uppercase ${getStatusColor(zone.status)}`}>
                    {zone.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>Queue Length: <span className="font-semibold">{zone.queueLength} people</span></p>
                  <p>Estimated Wait: <span className="font-semibold">{formatWaitTime(zone.averageWaitTime)}</span></p>
                  <p>Capacity: <span className="font-semibold">{zone.currentOccupancy}/{zone.capacity}</span></p>
                  {zone.equipment && zone.equipment.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      Equipment: {zone.equipment.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleJoinQueue(zone)}
                className={selectedZone?.id === zone.id ? btnPrimary : btnOutline}
              >
                {selectedZone?.id === zone.id ? 'Selected' : 'Join Queue'}
              </button>
            </div>
          ))
        )}
      </div>

      {selectedZone && (
        <div className="mt-6 max-w-md">
          <button
            onClick={handleConfirmQueue}
            className={btnPrimary}
          >
            Confirm Queue
          </button>
        </div>
      )}
    </div>
  )
}

export default Zone