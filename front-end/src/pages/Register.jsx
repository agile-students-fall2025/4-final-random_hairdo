import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)

  const navigate = useNavigate()

  // verify nyu email format
  const isNyuEmail = (value) =>
    /^[A-Za-z]{2,3}\d{4,5}@nyu\.edu$/i.test(value.trim())

  useEffect(() => {
    setIsFormValid(
      isNyuEmail(email) &&
        password.length > 0 &&
        password === confirmPassword
    )
  }, [email, password, confirmPassword])

  const handleRegister = (e) => {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')

    if (!isNyuEmail(email)) {
      setEmailError('You must register with a valid @nyu.edu email (e.g. ab1234@nyu.edu).')
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    // Placeholder for register logic
    alert('Register functionality to be implemented.')
    navigate('/')
  }

  const getEmailHelperText = () => {
    if (emailError) return emailError
    if (!email) return 'Must be an @nyu.edu email to register.'
    if (isNyuEmail(email)) return null
    return 'e.g. abc123@nyu.edu'
  }

  const emailHelper = getEmailHelperText()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efefed] text-[#282f32]">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center">
          <img src="/smartfit_logo.png" alt="Logo" className="w-70 h-auto" />
        </div>

        <h2 className="text-center text-3xl font-semibold">Register</h2>

        <form className="mt-4 space-y-4" onSubmit={handleRegister}>
          <div>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError('')
              }}
              type="email"
              required
              className={
                'mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#462c9f]'
              }
              placeholder="Email (must be @nyu.edu)"
            />
            {emailHelper && (
              <p
                className='mt-1 text-sm'
              >
                {emailHelper}
              </p>
            )}
          </div>

          <div>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) setPasswordError('')
              }}
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
              placeholder="Password"
            />
          </div>

          <div>
            <input
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (passwordError) setPasswordError('')
              }}
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
              placeholder="Confirm Password"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={
              'w-full py-2 px-4 bg-[#462c9f] text-white rounded-md font-medium transition-colors ' +
              (isFormValid ? 'hover:bg-[#3b237f]' : 'opacity-50 cursor-not-allowed')
            }
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account? Click{' '}
          <Link to="/login" className="text-[#462c9f] hover:underline">
            here to log in
          </Link>.
        </p>
      </div>
    </div>
  )
}

export default Register