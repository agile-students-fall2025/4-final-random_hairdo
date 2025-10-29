import React from 'react'
import { Link } from 'react-router-dom'

function History() {
  // Mock data for previous workouts
  const workoutHistory = [
    {
      id: 1,
      date: '2025-10-25',
      location: 'Palladium Athletic Facility',
      workoutType: 'Strength Training',
      bodyParts: 'Chest, Triceps, Shoulders',
      duration: '45 minutes'
    },
    {
      id: 2,
      date: '2025-10-23',
      location: 'Paulson Center',
      workoutType: 'Cardio',
      bodyParts: 'Full Body',
      duration: '30 minutes'
    },
    {
      id: 3,
      date: '2025-10-20',
      location: 'Palladium Athletic Facility',
      workoutType: 'Leg Day',
      bodyParts: 'Quads, Hamstrings, Glutes',
      duration: '60 minutes'
    },
    {
      id: 4,
      date: '2025-10-18',
      location: '404 Fitness Center',
      workoutType: 'Upper Body',
      bodyParts: 'Back, Biceps',
      duration: '50 minutes'
    },
    {
      id: 5,
      date: '2025-10-15',
      location: 'Palladium Athletic Facility',
      workoutType: 'Core & Abs',
      bodyParts: 'Core, Abs',
      duration: '25 minutes'
    }
  ]

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#efefed] px-6 py-4">
      {/* Header with Back Button and Logo */}
      <div className="w-full flex items-start justify-between mb-12">
        <div className="flex items-start">
          <Link
            to="/profile"
            aria-label="Back to Profile"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-[#462c9f] transition-colors"
          >
            Back to Profile Dashboard
          </Link>
        </div>

        <div className="flex items-center">
          <img src="/smartfit_logo.png" alt="Logo" className="h-20 w-auto" />
        </div>
      </div>

      {/* Page Title - Centered */}
      <h1 className="text-4xl font-normal text-center mb-8 text-[#282f3e]">History</h1>

      {/* Previous Workouts Section */}
      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
        <h2 className="text-2xl font-normal text-center mb-6 text-[#282f3e]">Previous Workouts</h2>

        {/* Workout Cards - Mobile Friendly */}
        <div className="space-y-4">
          {workoutHistory.map((workout) => (
            <div 
              key={workout.id} 
              className="bg-white border-2 border-black p-4 rounded-lg shadow-sm"
            >
              {/* Workout Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-[#462c9f]">
                  {workout.workoutType}
                </h3>
                <span className="text-sm text-gray-600">{workout.date}</span>
              </div>

              {/* Workout Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-[#282f3e]">Location:</span>
                  <p className="text-gray-700">{workout.location}</p>
                </div>
                <div>
                  <span className="font-medium text-[#282f3e]">Duration:</span>
                  <p className="text-gray-700">{workout.duration}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-[#282f3e]">Body Parts:</span>
                  <p className="text-gray-700">{workout.bodyParts}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Description Text */}
        <p className="text-center mt-8 text-sm text-[#282f3e] max-w-md mx-auto">
          Your complete workout history showing locations, workout types, and body part concentrations.
        </p>
      </div>
    </div>
  )
}

export default History