import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function History() {
  const [userId, setUserId] = useState(null)
  const [workoutHistory, setWorkoutHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get user ID from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (storedUser._id) {
      setUserId(storedUser._id)
    }
  }, [])

  // ------------------------
  // Load workout history on page load
  // ------------------------
  useEffect(() => {
    if (!userId) return
    
    const token = localStorage.getItem('token')
    fetch(`http://localhost:3000/api/history/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          alert('Failed to load workout history')
          return
        }
        setWorkoutHistory(data.data || [])
        setStats(data.stats)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        alert('Something went wrong connecting to server.')
        setLoading(false)
      })
  }, [userId])

  // Show loading while fetching
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efefed]">
        <p className="text-xl text-gray-600">Loading workout history...</p>
      </div>
    )
  }

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

      {/* Stats Summary (if available) */}
      {stats && (
        <div className="w-full max-w-2xl mx-auto mb-8">
          <div className="bg-white border-2 border-[#462c9f] rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#462c9f]">{stats.totalWorkouts || 0}</p>
                <p className="text-sm text-gray-600">Total Workouts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#462c9f]">{stats.totalMinutes || 0}</p>
                <p className="text-sm text-gray-600">Total Minutes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#462c9f]">{stats.totalCalories || 0}</p>
                <p className="text-sm text-gray-600">Calories Burned</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Previous Workouts Section */}
      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
        <h2 className="text-2xl font-normal text-center mb-6 text-[#282f3e]">Previous Workouts</h2>

        {/* Empty State */}
        {workoutHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-4">No workouts logged yet</p>
            <p className="text-sm text-gray-400">Start tracking your fitness journey!</p>
          </div>
        ) : (
          /* Workout Cards - Mobile Friendly */
          <div className="space-y-4">
            {workoutHistory.map((workout) => (
              <div 
                key={workout.id} 
                className="bg-white border-2 border-black p-4 rounded-lg shadow-sm"
              >
                {/* Workout Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-[#462c9f]">
                    {workout.type}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {new Date(workout.date).toLocaleDateString()}
                  </span>
                </div>

                {/* Workout Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-[#282f3e]">Location:</span>
                    <p className="text-gray-700">{workout.gym}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#282f3e]">Duration:</span>
                    <p className="text-gray-700">{workout.duration} minutes</p>
                  </div>
                  
                  {/* Exercises (if available) */}
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium text-[#282f3e]">Exercises:</span>
                      <p className="text-gray-700">{workout.exercises.join(', ')}</p>
                    </div>
                  )}

                  {/* Calories (if available) */}
                  {workout.caloriesBurned > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium text-[#282f3e]">Calories Burned:</span>
                      <p className="text-gray-700">🔥 {workout.caloriesBurned} kcal</p>
                    </div>
                  )}

                  {/* Notes (if available) */}
                  {workout.notes && (
                    <div className="col-span-2">
                      <span className="font-medium text-[#282f3e]">Notes:</span>
                      <p className="text-gray-700 italic">{workout.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Description Text */}
        <p className="text-center mt-8 text-sm text-[#282f3e] max-w-md mx-auto">
          {workoutHistory.length > 0 
            ? 'Your complete workout history showing locations, workout types, and exercises.'
            : 'Track your workouts and watch your fitness journey grow!'
          }
        </p>
      </div>
    </div>
  )
}

export default History