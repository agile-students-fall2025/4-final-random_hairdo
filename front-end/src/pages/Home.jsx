import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'

function Home() {
  const [user, setUser] = useState(null)
  const [activeQueue, setActiveQueue] = useState(null)
  const [loading, setLoading] = useState(true)

  // Decode JWT to get user ID
  const userFromToken = useMemo(() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      
      const decoded = jwtDecode(token)
      // Token payload is { id, email }
      return decoded
    } catch (error) {
      console.error('Error decoding token:', error)
      localStorage.removeItem('token')
      return null
    }
  }, [])

  useEffect(() => {
    if (userFromToken) {
      // Fetch user details to get name and other info
      const fetchUserDetails = async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`/api/users/${userFromToken.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setUser(data.data)
            }
          }
        } catch (error) {
          console.error('Error fetching user details:', error)
        }
      }
      
      fetchUserDetails()
    }
  }, [userFromToken])

  useEffect(() => {
    const fetchActiveQueue = async () => {
      if (!userFromToken?.id) {
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/queues/user/${userFromToken.id}?status=active`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.status === 401) {
          console.error('Unauthorized: Session expired')
          localStorage.removeItem('token')
          window.location.href = '/login'
          return
        }
        
        if (response.status === 403) {
          console.error('Forbidden: Not authorized to view this resource')
          setLoading(false)
          return
        }
        
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          setActiveQueue(data.data[0])
        }
      } catch (error) {
        console.error('Error fetching active queue:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveQueue()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchActiveQueue, 10000)
    return () => clearInterval(interval)
  }, [userFromToken])

  const formatWaitTime = (minutes) => {
    if (minutes === 0) return 'Next in line!'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#efefed] px-6 py-4 text-[#282f32]">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <img src="/smartfit_logo.png" alt="Logo" className="h-20 w-auto" />
        </div>

        <div className='flex items-start gap-2'>
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-[#462c9f] text-white text-sm font-medium hover:bg-[#3b237f] transition-colors"
          >
            Notifications
          </Link>
          <Link
            to="/profile"
            aria-label="Profile"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-[#462c9f] text-white text-sm font-medium hover:bg-[#3b237f] transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>
      <div>
        <h1 className="text-3xl text-left">
          Hello, {user?.name || "guest"}!
        </h1>
      </div>

      {/* Active Queue Status */}
      {!loading && activeQueue && (
        <div className="max-w-md mx-auto w-full mb-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#462c9f]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-[#462c9f]">You're in a Queue!</h2>
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Zone</p>
                <p className="text-lg font-semibold">{activeQueue.zoneId?.name || 'Loading...'}</p>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="text-2xl font-bold text-[#462c9f]">#{activeQueue.position}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Est. Wait</p>
                  <p className="text-lg font-semibold">{formatWaitTime(activeQueue.estimatedWait)}</p>
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

      <div className="pt-20 flex flex-col items-center justify-start">
        <Link
          to="/facility"
          aria-label="facility"
          className="w-48 h-48 flex items-center justify-center bg-[#462c9f] text-white text-xl font-semibold rounded-lg shadow-md hover:bg-[#3b237f] transition-colors"
        >
          Facilities
        </Link>
      </div>
      <div className="h-20 flex flex-col items-center justify-start">
        <Link
          to="/settings"
          aria-label="Settings"
          className="mt-6 w-40 py-2 text-center bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition"
        >
          Settings
        </Link>
      </div>
    </div>
  )
}

export default Home