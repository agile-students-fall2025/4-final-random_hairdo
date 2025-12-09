import { Link, useNavigate, useLocation } from 'react-router-dom'

function Header({ title, showBack = true, backTo = null }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Determine back button destination based on current page if not specified
  const getBackDestination = () => {
    if (backTo) return backTo

    const pathname = location.pathname
    
    // Page-specific back navigation
    if (pathname === '/profile') return '/'
    if (pathname === '/goals' || pathname === '/history' || pathname === '/edit-profile') return '/profile'
    if (pathname === '/zone') return '/facility'
    if (pathname === '/confirmed-queue') return '/'
    if (pathname === '/notifications') return '/'
    if (pathname === '/support' || pathname === '/change-password') return '/settings'
    
    // Default to home
    return '/'
  }

  const handleBack = () => {
    const destination = getBackDestination()
    navigate(destination)
  }

  return (
    <div className="w-full flex items-center justify-between mb-6 pb-4">
      {/* Back Button or Spacer */}
      <div className="flex-1">
        {showBack && (
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:bg-[#462c9f] transition-colors"
            aria-label="Go back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
      </div>

      {/* Center Title */}
      {title && (
        <h1 className="text-2xl font-bold text-[#282f32] text-center flex-1">
          {title}
        </h1>
      )}

      {/* Logo */}
      <div className="flex-1 flex justify-end">
        <Link to="/" aria-label="Home">
          <img src="/smartfit_logo.png" alt="SmartFit" className="h-12 w-auto md:h-16" />
        </Link>
      </div>
    </div>
  )
}

export default Header
