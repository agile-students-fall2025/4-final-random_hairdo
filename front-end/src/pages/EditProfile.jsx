import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Shared button styles
const btnPrimary = "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition"
const btnOutline = "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition"

function EditProfile() {
  const navigate = useNavigate()
  
  // State for form inputs
  const [formData, setFormData] = useState({
    fullName: 'Loream',
    email: 'lpsum@nyu.edu'
  })

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Add API call to update profile during Sprint 2
    console.log('Profile updated:', formData)
    // Navigate back to profile page after saving
    navigate('/profile')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#efefed] px-6 py-4">
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
      <h1 className="text-4xl font-normal text-center mb-12 text-[#282f3e]">Edit Profile</h1>

      {/* Edit Profile Form - Centered and spread out */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
        {/* Full Name Input */}
        <div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name: Loream"
            required
            className="w-full px-4 py-3 border-2 border-black bg-white text-[#282f3e] placeholder-[#282f3e] focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
          />
        </div>

        {/* Email Input */}
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address: lpsum@nyu.edu"
            required
            className="w-full px-4 py-3 border-2 border-black bg-white text-[#282f3e] placeholder-[#282f3e] focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
          />
        </div>

        {/* Done Button - Centered at bottom */}
        <div className="flex justify-center pt-12">
          <button
            type="submit"
            className="px-16 py-4 rounded-lg bg-[#462c9f] text-white text-lg font-semibold hover:bg-[#3b237f] transition"
          >
            Done
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProfile