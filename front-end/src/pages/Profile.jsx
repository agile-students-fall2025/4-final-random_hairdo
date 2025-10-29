import React from 'react'
import { Link } from 'react-router-dom'

// Shared button styles
const btnPrimary = "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition"
const btnOutline = "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition"

function Profile() {
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

        {/* User Info */}
        <div className="space-y-1">
          <p className="text-lg">[Full Name]</p>
          <p className="text-lg">[Email Address]</p>
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