import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'

function NavBar() {
  const location = useLocation()
  
  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    const token = localStorage.getItem('token')
    if (!token) return false
    try {
      jwtDecode(token)
      return true
    } catch {
      return false
    }
  }, [])

  // Don't show nav on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null
  }

  const navLinkBase = "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors"
  const activeLink = "text-[#462c9f] font-semibold"
  const inactiveLink = "text-gray-600 hover:text-[#462c9f]"

  const isActive = (path) => location.pathname === path

  if (!isAuthenticated) return null

  return (
    <nav className="h-[10vh] fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ">
      <div className="max-w-md mx-auto px-4 py-2 h-full">
        <div className="flex justify-around items-center h-full">
          {/* Home */}
          <Link 
            to="/" 
            className={`${navLinkBase} ${isActive('/') ? activeLink : inactiveLink}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>

          {/* Facilities */}
          <Link 
            to="/facility" 
            className={`${navLinkBase} ${isActive('/facility') || isActive('/zone') || isActive('/confirmed-queue') ? activeLink : inactiveLink}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Facilities</span>
          </Link>

          {/* Notifications */}
          <Link 
            to="/notifications" 
            className={`${navLinkBase} ${isActive('/notifications') ? activeLink : inactiveLink}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Alerts</span>
          </Link>

          {/* Profile */}
          <Link 
            to="/profile" 
            className={`${navLinkBase} ${isActive('/profile') || isActive('/goals') || isActive('/history') ? activeLink : inactiveLink}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </Link>

          {/* Settings */}
          <Link 
            to="/settings" 
            className={`${navLinkBase} ${isActive('/settings') || isActive('/support') || isActive('/change-password') || isActive('/edit-profile') ? activeLink : inactiveLink}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
