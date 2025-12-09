import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

function EditProfile() {
  const navigate = useNavigate()
  
  // Get userId from JWT token
  const token = localStorage.getItem('token')
  const decoded = token ? jwtDecode(token) : null
  const userId = decoded?.user?.id
  
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    focusTags: []  // Changed from goals to focusTags
  })

  const [loading, setLoading] = useState(true)
  const [tagInput, setTagInput] = useState('')  // Changed from goalInput

  // Auth guard
  useEffect(() => {
    if (!token || !userId) {
      alert('Please log in to edit your profile')
      navigate('/login')
    }
  }, [token, userId, navigate])

  // ------------------------
  // Load user data on page load
  // ------------------------
  useEffect(() => {
    if (!userId) return

    // Using relative URL
    fetch(`/api/users/${userId}`, {
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
          alert('Failed to load profile')
          return
        }
        
        // Populate form with current user data
        const user = data.data
        setFormData({
          name: user.name || '',
          email: user.email || '',
          focusTags: user.focusTags || []  // Changed from goals
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        if (err.message !== 'Unauthorized') {
          alert('Failed to load profile')
        }
        setLoading(false)
      })
  }, [userId, token, navigate])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  // Add focus tag to list (max 3)
  const addTag = () => {
    if (!tagInput.trim()) return
    
    // Check if already at max
    if (formData.focusTags.length >= 3) {
      alert('Maximum 3 focus tags allowed')
      return
    }
    
    setFormData(prevData => ({
      ...prevData,
      focusTags: [...prevData.focusTags, tagInput.trim()]
    }))
    setTagInput('')
  }

  // Remove focus tag from list
  const removeTag = (index) => {
    setFormData(prevData => ({
      ...prevData,
      focusTags: prevData.focusTags.filter((_, i) => i !== index)
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Using relative URL 
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      // Handle 401 errors on update
      if (res.status === 401) {
        localStorage.clear()
        alert('Your session has expired. Please log in again.')
        navigate('/login')
        return
      }
      
      const data = await res.json()
      
      if (!res.ok) {
        alert(data.message || 'Update failed')
        return
      }
      
      alert('Profile updated successfully!')
      navigate('/profile')
    } catch (err) {
      console.error(err)
      alert('Something went wrong connecting to server.')
    }
  }

  // Show loading while fetching
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efefed]">
        <p className="text-xl text-gray-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#efefed] px-6 py-6">
      <header className="mx-auto w-full max-w-xl flex items-start justify-between mb-6">
        <Link
          to="/settings"
          className="px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm hover:opacity-90"
        >
          Back to Settings
        </Link>
        <Link to="/">
          <img src="/smartfit_logo.png" className="h-12 md:h-16" />
        </Link>
      </header>

      {/* Page Title - Centered */}
      <h1 className="text-4xl font-semibold mb-2">Edit Profile</h1>
      <p className="text-gray-600 mb-6">
        Update your personal information below.
      </p>

      {/* Form Card */}
      <div className="max-w-md mx-auto w-full bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 border-2 border-black bg-white text-[#282f3e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 border-2 border-black bg-white text-[#282f3e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
            />
          </div>

          {/* Focus Tags Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Focus (Max 3)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              What exercise, machine, or body part are you focusing on?
            </p>
            
            {/* Current Tags */}
            {formData.focusTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.focusTags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-[#462c9f] text-white text-sm rounded-full"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-white hover:text-red-200"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="e.g., Chest, Treadmill, Squats"
                disabled={formData.focusTags.length >= 3}
                className="flex-1 px-4 py-2 border-2 border-gray-300 bg-white text-[#282f3e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#462c9f] disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={formData.focusTags.length >= 3}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.focusTags.length}/3 tags • Press Enter or click Add
            </p>
          </div>

          {/* Done Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-16 py-4 rounded-lg bg-[#462c9f] text-white text-lg font-semibold hover:bg-[#3b237f] transition"
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile