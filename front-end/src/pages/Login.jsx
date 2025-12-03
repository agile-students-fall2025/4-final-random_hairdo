import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogIn = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "Login failed")
        return
      }

      // ✅ Store token and user in localStorage for Goals page
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      alert("Login successful!")
      navigate("/") // Redirect to Home after login
    } catch (err) {
      console.error(err)
      alert("Something went wrong connecting to server.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efefed] text-[#282f32]">
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
            className="w-full py-2 px-4 bg-[#462c9f] text-white rounded-md 
                       font-medium hover:bg-[#3b237f] transition-colors"
          >
            Log in
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#462c9f] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
