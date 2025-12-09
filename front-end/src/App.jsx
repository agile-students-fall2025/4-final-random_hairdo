import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Settings from './pages/Settings'
import ChangePassword from './pages/ChangePassword'
import Facility from './pages/Facility'
import Goals from './pages/Goals'
import History from './pages/History'
import Notifications from './pages/Notifications'
import ConfirmedQueue from './pages/ConfirmedQueue'
import Support from './pages/Support'
import Zone from './pages/Zone'
import NavBar from './components/NavBar'
import Toast from './components/Toast'
import { useSocket } from './context/SocketContext'

function App() {
  const [toast, setToast] = useState(null)
  const { socket, isConnected } = useSocket()
  const [userId, setUserId] = useState(null)

  // Get user ID from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const id = decoded?.id || decoded?.userId || decoded?.user?.id
        if (id) {
          setUserId(id)
          //console.log('Global notification listener userId:', id)
        }
      } catch (error) {
        console.error('Failed to decode token:', error)
      }
    }
  }, [])

  // Global notification listener for position updates
  useEffect(() => {
    if (!socket || !isConnected || !userId) {
      //console.log('Global notification listener not ready:', { socket: !!socket, isConnected, userId })
      return
    }

    //console.log('Setting up global notification listener for user:', userId)

    // Join user's notification room
    socket.emit('join:notifications', userId)

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      //console.log('Global notification received:', notification)
      
      // Show toast for high priority notifications (position #1)
      if (notification.priority === 'high' || notification.type === 'queue_ready') {
        //console.log('Showing toast for high priority notification')
        setToast({
          message: notification.message || notification.title,
          type: 'warning',
        })
      }
    }

    socket.on('notification:new', handleNewNotification)

    // Cleanup
    return () => {
      socket.off('notification:new', handleNewNotification)
      socket.emit('leave:notifications', userId)
    }
  }, [socket, isConnected, userId])

  return (
    <div className="app">
      {/* Global Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={8000}
        />
      )}
      
      <Router>
        <div className="pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/facility" element={<Facility />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/history" element={<History />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/support" element={<Support />} />
            <Route path="/zone" element={<Zone />} />
            <Route path="/confirmed-queue" element={<ConfirmedQueue />} />
          </Routes>
        </div>
        <NavBar />
      </Router>
    </div>
  )
}
export default App
