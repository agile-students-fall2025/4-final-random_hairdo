import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Shared button styles
const btnPrimary =
  "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition"
const btnOutline =
  "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition"

function EditProfile() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState(null)
  
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goals: []
  })

  const [loading, setLoading] = useState(true)
  const [goalInput, setGoalInput] = useState('')

  // Get user ID from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (storedUser._id) {
      setUserId(storedUser._id)
    }
  }, [])

  // ------------------------
  // Load user data on page load
  // ------------------------
  useEffect(() => {
    if (!userId) return
    
    const token = localStorage.getItem('token')
    fetch(`http://localhost:3000/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return
        
        // Populate form with current user data
        const user = data.data
        setFormData({
          name: user.name || '',
          email: user.email || '',
          goals: user.goals || []
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        alert('Failed to load profile')
        setLoading(false)
      })
  }, [userId])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  // Add goal to list
  const addGoal = () => {
    if (!goalInput.trim()) return
    
    setFormData(prevData => ({
      ...prevData,
      goals: [...prevData.goals, goalInput.trim()]
    }))
    setGoalInput('')
  }

  // Remove goal from list
  const removeGoal = (index) => {
    setFormData(prevData => ({
      ...prevData,
      goals: prevData.goals.filter((_, i) => i !== index)
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!userId) {
      alert('Please log in first')
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        alert(data.message || 'Update failed')
        return
      }
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(data.data))
      
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

      {/* Page Title */}
      <h1 className="text-4xl font-normal text-center mb-2 text-[#282f3e]">
        Edit Profile
      </h1>
      <p className="text-center text-sm text-gray-600 mb-8">
        Update your personal information below
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

          {/* Goals Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fitness Goals
            </label>
            
            {/* Current Goals */}
            {formData.goals.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-[#462c9f] text-white text-sm rounded-full"
                  >
                    <span>{goal}</span>
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="ml-1 text-white hover:text-red-200"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Goal Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                placeholder="Add a goal (e.g., Weight Loss)"
                className="flex-1 px-4 py-2 border-2 border-gray-300 bg-white text-[#282f3e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
              />
              <button
                type="button"
                onClick={addGoal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter or click Add to add goals
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