import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './hooks/useAuth'
import ChatList from './pages/ChatList'
import ChatWindow from './pages/ChatWindow'
import { useDeliveryReceipts } from './hooks/useDeliveryReceipts'
import NewChat from './pages/NewChat'
import NewGroup from './pages/NewGroup'
import GroupInfo from './pages/GroupInfo'

export default function App() {
  const { token } = useAuth()
  useDeliveryReceipts()

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={token ? <ChatList /> : <Navigate to="/login" replace />} />
      <Route path="/chats/:chatId" element={token ? <ChatWindow /> : <Navigate to="/login" replace />} />
      <Route path="/new-chat" element={token ? <NewChat /> : <Navigate to="/login" replace />} />
      <Route path="/new-group" element={token ? <NewGroup /> : <Navigate to="/login" replace />} />
      <Route path="/chats/:chatId/info" element={token ? <GroupInfo /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
