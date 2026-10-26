import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './hooks/useAuth'
import ChatList from './pages/ChatList'
import ChatWindow from './pages/ChatWindow'

export default function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={token ? <ChatList /> : <Navigate to="/login" replace />} />
      <Route path="/chats/:chatId" element={token ? <ChatWindow /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
