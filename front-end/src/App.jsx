import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

function App() {

  return (
    <div className="app">
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
