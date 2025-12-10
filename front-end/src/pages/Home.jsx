import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'
import Toast from '../components/Toast'
import getApiUrl from '../utils/api'

const formatWaitTime = (minutes) => {
  if (minutes === 0) return 'Next in line!'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const calculateWorkoutStreak = (workouts) => {
  if (!workouts || workouts.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let currentDate = new Date(today)

  for (const workout of workouts) {
    const workoutDate = new Date(workout.date)
    workoutDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (diffDays === 1) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (diffDays > 1) {
      break
    }
  }

  return streak
}

function Home() {
  const navigate = useNavigate()
  const [currentWorkout, setCurrentWorkout] = useState(null)
  const [activeQueue, setActiveQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState(null)
  const [lastWorkout, setLastWorkout] = useState(null)
  const [workoutStreak, setWorkoutStreak] = useState(0)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  // Decode JWT to get user
  const userFromToken = useMemo(() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      const decoded = jwtDecode(token)
      return decoded.user
    } catch (error) {
      console.error('Error decoding token:', error)
      localStorage.removeItem('token')
      return null
    }
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (!userFromToken?.id) {
      showToast('Please log in to continue', 'warning')
      setTimeout(() => navigate('/login'), 1000)
    }
  }, [userFromToken, navigate])

  // Fetch current workout + active queue
  useEffect(() => {
    const fetchQueues = async () => {
      if (!userFromToken?.id) {
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('token')
        const userId = userFromToken.id

        // Fetch in_use and active queues separately
        const [inUseRes, activeRes] = await Promise.all([
          fetch(getApiUrl(`/api/queues/user/${userId}?status=in_use`), {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(getApiUrl(`/api/queues/user/${userId}?status=active`), {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`/api/history/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        // Handle auth errors
        if (inUseRes.status === 401 || activeRes.status === 401 || historyRes.status === 401) {
          localStorage.clear()
          showToast('Your session has expired. Please log in again.', 'error')
          setTimeout(() => navigate('/login'), 1000)
          return
        }
        if (inUseRes.status === 403 || activeRes.status === 403) {
          console.error('Forbidden: Not authorized to view queues')
          setLoading(false)
          return
        }

        const inUseData = await inUseRes.json()
        const activeData = await activeRes.json()
        const historyData = await historyRes.json()

        if (inUseData.success && inUseData.data.length > 0) {
          setCurrentWorkout(inUseData.data[0])
        } else {
          setCurrentWorkout(null)
        }

        if (activeData.success && activeData.data.length > 0) {
          setActiveQueue(activeData.data[0])
        } else {
          setActiveQueue(null)
        }

        if (historyData.success) {
          setStats(historyData.stats)
          if (historyData.data && historyData.data.length > 0) {
            setLastWorkout(historyData.data[0])
            const streak = calculateWorkoutStreak(historyData.data)
            setWorkoutStreak(streak)
          }
        }
      } catch (error) {
        console.error('Error fetching queues:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQueues()
  }, [userFromToken, navigate])

  return (
    <div className="min-h-[90vh] flex flex-col justify-between bg-[#efefed] px-6 py-4 text-[#282f32]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <img src="/smartfit_logo.png" alt="Logo" className="h-20 w-auto" />
        </div>
      </div>

      {/* Greeting */}
      <div>
        <h1 className="text-3xl text-left">
          Hello, {userFromToken?.name || 'guest'}!
        </h1>
      </div>

      {/* WORKOUT IN PROGRESS CARD */}
      {!loading && currentWorkout && (
        <div className="max-w-md mx-auto w-full mb-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#462c9f]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-[#462c9f]">
                Workout In Progress!
              </h2>
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Zone</p>
                <p className="text-lg font-semibold">
                  {currentWorkout.zoneId?.name || 'Loading...'}
                </p>
              </div>

              <div className="pb-3 border-b border-gray-200">
                <p className="text-sm text-gray-600">Your Status</p>
                <p className="text-lg font-semibold text-green-700">
                  You&apos;re currently using the zone.
                </p>
              </div>

              <Link
                to="/confirmed-queue"
                state={{
                  zone: currentWorkout.zoneId,
                  position: currentWorkout.position || 1,
                  queueId: currentWorkout._id,
                  facilityId: currentWorkout.facilityId?._id,
                  estimatedWait: currentWorkout.estimatedWait || 0
                }}
                className="block w-full py-2 text-center bg-[#462c9f] text-white rounded-md hover:bg-[#3b237f] transition font-medium"
              >
                View Workout Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE QUEUE CARD */}
      {!loading && activeQueue && (
        <div className="max-w-md mx-auto w-full mb-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#462c9f]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-[#462c9f]">
                You&apos;re in a Queue!
              </h2>
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Zone</p>
                <p className="text-lg font-semibold">
                  {activeQueue.zoneId?.name || 'Loading...'}
                </p>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="text-2xl font-bold text-[#462c9f]">
                    #{activeQueue.position}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Est. Wait</p>
                  <p className="text-lg font-semibold">
                    {formatWaitTime(activeQueue.estimatedWait)}
                  </p>
                </div>
              </div>

              <Link
                to="/confirmed-queue"
                state={{
                  zone: activeQueue.zoneId,
                  position: activeQueue.position,
                  queueId: activeQueue._id,
                  facilityId: activeQueue.facilityId?._id,
                  estimatedWait: activeQueue.estimatedWait
                }}
                className="block w-full py-2 text-center bg-[#462c9f] text-white rounded-md hover:bg-[#3b237f] transition font-medium"
              >
                View Queue Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary Card */}
      {!loading && stats && (
        <div className="max-w-md mx-auto w-full mb-4">
          <div className="bg-white rounded-lg shadow-md p-5 border-2 border-[#462c9f]">
            <h2 className="text-lg font-bold text-[#462c9f] mb-3">Your Stats</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-[#462c9f]">{stats.totalWorkouts || 0}</p>
                <p className="text-xs text-gray-600">Workouts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#462c9f]">{stats.totalMinutes || 0}</p>
                <p className="text-xs text-gray-600">Minutes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#462c9f]">{stats.averageMood || 0}</p>
                <p className="text-xs text-gray-600">Avg Mood</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Streak Card */}
      {!loading && workoutStreak > 0 && (
        <div className="max-w-md mx-auto w-full mb-4">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg shadow-md p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Workout Streak</h2>
                <p className="text-sm opacity-90">Keep it going!</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{workoutStreak}</p>
                <p className="text-sm opacity-90">{workoutStreak === 1 ? 'day' : 'days'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facilities button */}
      <div className="max-w-md mx-auto w-full mb-4">
        <Link
          to="/facility"
          aria-label="facility"
          className="h-20 flex items-center justify-center bg-[#462c9f] text-white text-xl font-semibold rounded-lg shadow-md hover:bg-[#3b237f] transition-colors"
        >
          Facilities
        </Link>
      </div>

      <div className="h-1 flex flex-col items-center justify-start" />
    </div>
  )
}

export default Home
