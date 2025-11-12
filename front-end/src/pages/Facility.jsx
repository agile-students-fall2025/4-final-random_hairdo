import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const btnPrimary = "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition hover:cursor-pointer"

function Facility() {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/facilities')
        const data = await response.json()
        
        if (data.success) {
          setFacilities(data.data)
        } else {
          setError('Failed to load facilities')
        }
      } catch (err) {
        console.error('Error fetching facilities:', err)
        setError('Failed to connect to server')
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
  }, [])

  const handleSelectFacility = (facilityId) => {
    navigate('/zone', { state: { facilityId } })
  }

  const getTodayHours = (hours) => {
    if (!hours) return 'Hours not available'
    
    const today = new Date().getDay()
    // 0 = Sunday, 6 = Saturday
    const isWeekend = today === 0 || today === 6
    
    return isWeekend ? hours.weekends : hours.weekdays
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
        <h1 className="text-3xl font-bold mb-2">Select a Facility</h1>
        <p className="text-lg text-gray-600">Choose a gym facility to view available zones</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 max-w-md py-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Loading facilities...</p>
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
        ) : (
          facilities.map((facility) => (
            <button
              key={facility.id}
              onClick={() => handleSelectFacility(facility.id)}
              className={btnPrimary}
            >
              <div className="text-left">
                <div className="font-bold">{facility.name}</div>
                <div className="text-sm opacity-90">{facility.address}</div>
                {facility.hours && (
                  <div className="text-sm opacity-75 mt-1">
                    Today: {getTodayHours(facility.hours)}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default Facility