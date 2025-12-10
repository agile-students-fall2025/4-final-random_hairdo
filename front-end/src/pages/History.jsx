import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import getApiUrl from '../utils/api'

function History() {
  const navigate = useNavigate()
  
  // Get userId from JWT token
  const token = localStorage.getItem('token')
  const decoded = token ? jwtDecode(token) : null
  const userId = decoded?.user?.id

  const [workoutHistory, setWorkoutHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Auth guard
  useEffect(() => {
    if (!token || !userId) {
      alert('Please log in to view your workout history')
      navigate('/login')
    }
  }, [token, userId, navigate])

  // ------------------------
  // Load workout history on page load
  // ------------------------
  useEffect(() => {
    if (!userId) return

    //Using relative URL
    fetch(getApiUrl(`/api/history/user/${userId}`), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        // Handle 401 errors
        if (res.status === 401) {
          localStorage.clear()
          alert('Your session has expired. Please log in again.')
          navigate('/login')
          throw new Error('Unauthorized')
        }
        return res.json()
      })
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
        if (err.message !== 'Unauthorized') {
          alert('Something went wrong connecting to server.')
        }
        setLoading(false)
      })
  }, [userId, token, navigate])

  // Show loading while fetching
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efefed]">
        <p className="text-xl text-gray-600">Loading workout history...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[90vh] w-full flex flex-col bg-[#efefed] px-6 py-4">
      <header className="mx-auto w-full max-w-xl flex items-start justify-between mb-6">
        <Link
          to="/profile"
          className="px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm hover:opacity-90"
        >
          Back to Profile
        </Link>
        <Link to="/">
          <img src="/smartfit_logo.png" className="h-12 md:h-16" />
        </Link>
      </header>

      {/* Page Title - Centered */}
      <h1 className="text-4xl font-semibold mb-2">History</h1>
      <p className="text-gray-600 mb-6">
        Track your history.
      </p>

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
                <p className="text-2xl font-bold text-[#462c9f]">{stats.averageMood || 0}</p>
                <p className="text-sm text-gray-600">Average Mood</p>
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
          <div className="max-h-[43vh] overflow-y-auto space-y-4">
            {workoutHistory.map((workout) => (
              <div 
                key={workout._id}
                className="bg-white border-2 border-black p-4 rounded-lg shadow-sm"
              >
                {/* Workout Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-[#462c9f]">
                    {workout.type}
                  </h3>
                </div>

                {/* Workout Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-[#282f3e]">Gym:</span>
                    <p className="text-gray-700">{workout.facilityId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#282f3e]">Zone:</span>
                    <p className="text-gray-700">{workout.zoneName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#282f3e]">Duration:</span>
                    <p className="text-gray-700">{workout.duration} minutes</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#282f3e]">Date:</span>
                    <p className="text-gray-700">{new Date(workout.date).toLocaleDateString()}</p>
                  </div>
                  
                  {/* Mood (if available) */}
                  {workout.mood && (
                    <div className="col-span-2">
                      <span className="font-medium text-[#282f3e]">Mood:</span>
                      <p className="text-gray-700">{workout.mood}/10</p>
                    </div>
                  )}
                  
                  {/* Exercises (if available) */}
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium text-[#282f3e]">Exercises:</span>
                      <p className="text-gray-700">{workout.exercises.join(', ')}</p>
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