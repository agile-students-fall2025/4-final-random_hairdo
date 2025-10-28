import React from 'react'
import { Link } from 'react-router-dom'

function Profile() {
  return (
    <div className="min-h-screen bg-[#efefed] p-6">
      {/* Back to Home Page Button */}
      <Link 
        to="/" 
        className="inline-block bg-black text-white px-4 py-2 text-sm mb-6"
      >
        Back to Home Page
      </Link>

      {/* Profile Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        {/* Logo/Avatar placeholder */}
        <div className="w-32 h-32 bg-gray-300 flex items-center justify-center text-gray-600 mb-4">
          logo
        </div>

        {/* User Info */}
        <div className="space-y-1">
          <p className="text-lg">[Full Name]</p>
          <p className="text-lg">[Email Address]</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="space-y-6">
        {/* Goals Button */}
        <Link 
          to="/goals" 
          className="block w-full bg-black text-white px-6 py-4 text-left hover:bg-[#462c9f] transition-colors"
        >
          Goals
        </Link>

        {/* History Button */}
        <Link 
          to="/history" 
          className="block w-full bg-black text-white px-6 py-4 text-left hover:bg-[#462c9f] transition-colors"
        >
          History
        </Link>

        {/* Edit Profile Button */}
        <Link 
          to="/edit-profile" 
          className="block w-full bg-black text-white px-6 py-4 text-left hover:bg-[#462c9f] transition-colors"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  )
}

export default Profile