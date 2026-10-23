import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './hooks/useAuth'

function Home() {
  const { user, logout } = useAuth()
  return (
    <div className="p-6">
      <p>Logged in as {user?.username}</p>
      <button onClick={logout} className="mt-2 text-blue-600 underline">
        Log out
      </button>
    </div>
  )
}

export default function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
