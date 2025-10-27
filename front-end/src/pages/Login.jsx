import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const handleLogIn = () => {
    // Placeholder for login logic
    alert('Log in functionality to be implemented.')
    navigate('/')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efefed] text-[#282f32]">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center">
          <img src="/smartfit_logo.png" alt="Logo" className="w-70 h-auto" />
        </div>

        <h2 className="text-center text-3xl font-semibold">Log In</h2>

        <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email"
            />
          </div>

          <div>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#462c9f] text-white rounded-md font-medium hover:bg-[#3b237f] hover:cursor-pointer transition-colors"
            onClick={handleLogIn}
          >
            Log in
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don’t have an account? Click{' '}
          <Link to="/register" className="text-[#462c9f] hover:underline">
          here to sign up
          </Link>.
        </p>
      </div>
    </div>
  )
}

export default Login