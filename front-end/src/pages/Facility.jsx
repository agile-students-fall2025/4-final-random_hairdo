import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const btnPrimary = "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition hover:cursor-pointer"

function Facility() {
  const navigate = useNavigate()
  const [facilities] = useState([
    { id: 1, name: 'Paulson Athletic Facility', address: '181 Mercer Street' },
    { id: 2, name: 'Palladium Athletic Facility', address: '140 E 14th St' },
    { id: 3, name: 'NYU 404 Fitness', address: '404 Lafayette St' },
    { id: 4, name: 'Brooklyn Athletic Facility', address: '6 Metrotech Center' }
  ])

  const handleSelectFacility = (facilityId) => {
    navigate('/zone', { state: { facilityId } })
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
        {facilities.map((facility) => (
          <button
            key={facility.id}
            onClick={() => handleSelectFacility(facility.id)}
            className={btnPrimary}
          >
            <div className="text-left">
              <div className="font-bold">{facility.name}</div>
              <div className="text-sm opacity-90">{facility.address}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Facility