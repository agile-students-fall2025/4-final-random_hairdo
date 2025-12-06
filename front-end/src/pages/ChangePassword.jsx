import React, { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { jwtDecode } from 'jwt-decode'

function ChangePassword() {
const navigate = useNavigate()

const [currentPassword, setCurrentPassword] = useState("")
const [newPassword, setNewPassword] = useState("")
const [confirmPassword, setConfirmPassword] = useState("")
const [message, setMessage] = useState(null)
const [isSuccess, setIsSuccess] = useState(false)
const [submitting, setSubmitting] = useState(false)

// Decode JWT to get user ID
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

// Auth guard - redirect if not logged in
useEffect(() => {
if (!userFromToken?.id) {
alert('Please log in to change your password')
navigate('/login')
}
}, [userFromToken, navigate])

const handleConfirmChanges = async (event) => {
event.preventDefault()

// Client-side validation
if (!currentPassword.trim()) {
setMessage("Please enter your current password.")
setIsSuccess(false)
return
}
if (!newPassword.trim() || !confirmPassword.trim()) {
setMessage("Please fill out all fields.")
setIsSuccess(false)
return
}
if (newPassword !== confirmPassword) {
setMessage("New passwords do not match!")
setIsSuccess(false)
return
}
if (newPassword.length < 6) {
setMessage("Password must be at least 6 characters long.")
setIsSuccess(false)
return
}
if (currentPassword === newPassword) {
setMessage("New password must be different from current password.")
setIsSuccess(false)
return
}

try {
setSubmitting(true)
setMessage(null)

const token = localStorage.getItem('token')
if (!token || !userFromToken?.id) {
throw new Error('Not authenticated')
}

// Send request with Authorization header and currentPassword
const res = await fetch(`/api/users/${userFromToken.id}/password`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${token}`
},
body: JSON.stringify({
currentPassword, // Required by backend
newPassword
}),
})

// Handle 401/403 errors (token expired or wrong current password)
if (res.status === 401) {
const body = await res.json().catch(() => ({}))
if (body.message && body.message.toLowerCase().includes('current password')) {
// Wrong current password
setMessage("Current password is incorrect.")
setIsSuccess(false)
setSubmitting(false)
return
} else {
// Token expired
localStorage.clear()
alert('Your session has expired. Please log in again.')
navigate('/login')
return
}
}

if (res.status === 403) {
alert('You do not have permission to change this password')
navigate('/login')
return
}

const body = await res.json().catch(() => ({}))

if (!res.ok || body.success === false) {
throw new Error(body.error || body.message || "Password change failed")
}

setMessage("✅ Your password has been successfully changed.")
setIsSuccess(true)
setCurrentPassword("")
setNewPassword("")
setConfirmPassword("")

// Navigate after a short delay
setTimeout(() => navigate("/profile"), 2000)
} catch (err) {
console.error('Password change error:', err)
if (err.message === 'Not authenticated') {
localStorage.clear()
alert('Please log in again')
navigate('/login')
} else {
setMessage(err.message || "Something went wrong. Please try again.")
setIsSuccess(false)
}
} finally {
setSubmitting(false)
}
}

const btnPrimary =
"w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition cursor-pointer"

return (
<div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4 flex flex-col">
<header className="mx-auto w-full max-w-md md:max-w-xl flex items-start justify-between mb-6">
<Link
to="/profile"
className="inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90"
>
Back to Profile
</Link>
<Link to="/" aria-label="Home">
<img src="/smartfit_logo.png" alt="SMARTFIT logo" className="h-12 w-auto md:h-16" />
</Link>
</header>

<main className="mx-auto w-full max-w-md md:max-w-xl flex-grow flex flex-col justify-center">
<h1 className="text-4xl font-semibold mb-8 text-center">Change Password</h1>

{message && (
<div
className={`mb-6 text-center px-4 py-3 rounded-lg text-base font-medium ${
isSuccess
? "bg-green-100 text-green-700 border border-green-300"
: "bg-red-100 text-red-700 border border-red-300"
}`}
>
{message}
</div>
)}

<form onSubmit={handleConfirmChanges} className="flex flex-col gap-6">
{/* Current Password */}
<div>
<label htmlFor="currentPassword" className="block text-lg font-medium mb-2">
Current Password
</label>
<input
type="password"
id="currentPassword"
value={currentPassword}
onChange={(e) => setCurrentPassword(e.target.value)}
required
className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#462c9f] focus:outline-none"
/>
</div>

{/* New Password */}
<div>
<label htmlFor="newPassword" className="block text-lg font-medium mb-2">
New Password
</label>
<input
type="password"
id="newPassword"
value={newPassword}
onChange={(e) => setNewPassword(e.target.value)}
required
className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#462c9f] focus:outline-none"
/>
<p className="text-sm text-gray-600 mt-1">Minimum 6 characters</p>
</div>

{/* Confirm Password */}
<div>
<label htmlFor="confirmPassword" className="block text-lg font-medium mb-2">
Confirm New Password
</label>
<input
type="password"
id="confirmPassword"
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
required
className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#462c9f] focus:outline-none"
/>
</div>

<button
type="submit"
disabled={submitting}
className={`${btnPrimary} mt-4 ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
>
{submitting ? "Saving…" : "Confirm Changes"}
</button>
</form>
</main>
</div>
)
}

export default ChangePassword