import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import getApiUrl from '../utils/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  const handleLogIn = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Using relative URL
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.message || "Login failed", "error")
        return
      }

      // Only store token (user data is in JWT payload)
      localStorage.setItem('token', data.token)

      showToast("Login successful!", "success")
      setTimeout(() => navigate("/"), 1000) // Redirect to Home after login
    } catch (err) {
      console.error(err)
      showToast("Something went wrong connecting to server.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efefed] text-[#282f32]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center">
          <img src="/smartfit_logo.png" alt="Logo" className="w-70 h-auto" />
        </div>

        <h2 className="text-center text-3xl font-semibold">Log In</h2>

        <form className="mt-4 space-y-4" onSubmit={handleLogIn}>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            required
            placeholder="Email"
            className="mt-1 block w-full px-3 py-2 border rounded-md
                       focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
          />

          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            required
            placeholder="Password"
            className="mt-1 block w-full px-3 py-2 border rounded-md
                       focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
          />

          <button
            type="submit"
            disabled={loading}
            className={
              "w-full py-2 px-4 bg-[#462c9f] text-white rounded-md font-medium transition-colors " +
              (loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#3b237f]")
            }
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#462c9f] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
