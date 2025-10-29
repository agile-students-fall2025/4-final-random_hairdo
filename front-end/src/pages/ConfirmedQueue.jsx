import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const btnPrimary = "w-1/2 px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition hover:cursor-pointer"
const btnOutline = "w-1/2 px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition hover:cursor-pointer"

function ConfirmedQueue() {
  const location = useLocation()
  const { zone, position: initialPosition } = location.state || { 
    zone: { name: 'Unknown Zone', waitTime: 'N/A' }, 
    position: 0 
  }

  const [currentPosition, setCurrentPosition] = useState(initialPosition)
  const [estimatedWait, setEstimatedWait] = useState(zone.waitTime)

  useEffect(() => {
    if (currentPosition > 1) {
      const interval = setInterval(() => {
        setCurrentPosition(prev => {
          const newPosition = Math.max(1, prev - 1)
          const waitMinutes = (newPosition - 1) * 5
          setEstimatedWait(waitMinutes > 0 ? `${waitMinutes} min` : 'Next in line!')
          return newPosition
        })
      }, 10000) 

      return () => clearInterval(interval)
    }
  }, [currentPosition])

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
              <p className="text-2xl font-bold">{estimatedWait}</p>
              <p className="text-xs text-gray-500 mt-1">Updates automatically as the queue moves</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <Link to="/zone" className={btnPrimary}>
            View Other Zones
          </Link>
          
          <Link 
            to="/facility" 
            className={btnOutline}
          >
            Change Facility
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