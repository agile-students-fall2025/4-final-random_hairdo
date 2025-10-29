import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

// Shared button styles
const btnPrimary = "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition hover:cursor-pointer"
const btnOutline = "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition hover:cursor-pointer"

function Zone() {
  const navigate = useNavigate()
  const location = useLocation()
  const facilityId = location.state?.facilityId || 1

  const [zones] = useState([
    { id: 1, name: 'Cardio Studio', queueLength: 3, waitTime: '15 min' },
    { id: 2, name: 'Squat Rack Zone', queueLength: 5, waitTime: '25 min' },
    { id: 3, name: 'Free Weights Zone', queueLength: 2, waitTime: '10 min' },
    { id: 4, name: 'Functional Training Zone', queueLength: 1, waitTime: '5 min' },
    { id: 5, name: 'Machine Zone', queueLength: 0, waitTime: 'No wait' }
  ])

  const [selectedZone, setSelectedZone] = useState(null)

  const handleJoinQueue = (zone) => {
    setSelectedZone(zone)
  }

  const handleConfirmQueue = () => {
    if (selectedZone) {
      navigate('/confirmed-queue', { 
        state: { 
          zone: selectedZone, 
          facilityId,
          position: selectedZone.queueLength + 1
        } 
      })
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
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`p-5 rounded-lg border-2 ${
              selectedZone?.id === zone.id
                ? 'border-[#462c9f] bg-purple-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <div className="mb-3">
              <h3 className="text-xl font-bold mb-2">{zone.name}</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>Queue Length: <span className="font-semibold">{zone.queueLength} people</span></p>
                <p>Estimated Wait: <span className="font-semibold">{zone.waitTime}</span></p>
              </div>
            </div>
            <button
              onClick={() => handleJoinQueue(zone)}
              className={selectedZone?.id === zone.id ? btnPrimary : btnOutline}
            >
              {selectedZone?.id === zone.id ? 'Selected' : 'Join Queue'}
            </button>
          </div>
        ))}
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