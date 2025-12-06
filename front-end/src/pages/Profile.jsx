import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

// Shared button styles
const btnPrimary = "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition"
const btnOutline = "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition"

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Decode JWT to get user object
  const userFromToken = useMemo(() => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const decoded = jwtDecode(token)
      // Token payload is { user: { id, email, name } }
      return decoded.user  
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }, [])

  // Redirect to login if no token
  useEffect(() => {
    if (!userFromToken?.id) {
      alert('Please log in to view your profile')
      navigate('/login')
    }
  }, [userFromToken, navigate])

  // ------------------------
  // Load user data on page load
  // ------------------------
  useEffect(() => {
    if (!userFromToken?.id) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    // Using relative URL 
    fetch(`/api/users/${userFromToken.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        // Handle 401/403 errors
        if (res.status === 401) {
          localStorage.clear()
          alert('Your session has expired. Please log in again.')
          navigate('/login')
          throw new Error('Unauthorized')
        }
        if (res.status === 403) {
          alert('You do not have permission to view this profile')
          navigate('/login')
          throw new Error('Forbidden')
        }
        return res.json()
      })
      .then((data) => {
        if (!data.success) {
          alert('Failed to load profile')
          return
        }
        setUser(data.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
          alert('Something went wrong connecting to server.')
        }
        setLoading(false)
      })
  }, [userFromToken, navigate])

  // Show loading while fetching
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efefed]">
        <p className="text-xl text-gray-600">Loading profile...</p>
      </div>
    )
  }

  // Show error if user not found
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efefed]">
        <p className="text-xl text-red-600">Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#efefed] px-6 py-4">
      {/* Header with Back Button and Logo */}
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

      {/* Profile Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        {/* User Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-md">
          <div className="space-y-3">
            {/* Name */}
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
            
            {/* Email */}
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>

            {/* Focus Tags */}
            {user.focusTags && user.focusTags.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">Current Focus</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.focusTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#462c9f] text-white text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Member Since */}
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Last Updated */}
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-base text-gray-500">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Spread out vertically */}
      <div className="flex-1 flex flex-col justify-around max-w-md py-8">
        {/* Goals Button */}
        <Link to="/goals" className={btnPrimary}>
          Goals
        </Link>

        {/* History Button */}
        <Link to="/history" className={btnPrimary}>
          History
        </Link>

        {/* Edit Profile Button */}
        <Link to="/edit-profile" className={btnPrimary}>
          Edit Profile
        </Link>
      </div>
    </div>
  )
}

export default Profile