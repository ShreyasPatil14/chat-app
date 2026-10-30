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
import AddMember from './pages/AddMember'
import { usePushNotifications } from './hooks/usePushNotifications'
import { useState } from 'react'
import SplashScreen from './components/SplashScreen'

function splashAlreadyShown() {
  try {
    return sessionStorage.getItem('splashShown') === '1'
  } catch {
    return false
  }
}

export default function App() {
  const { token } = useAuth()
  useDeliveryReceipts()
  usePushNotifications()

  const [showSplash, setShowSplash] = useState(() => !splashAlreadyShown())

  const handleSplashDone = () => {
    try {
      sessionStorage.setItem('splashShown', '1')
    } catch {
      // storage unavailable: the splash simply shows again next time
    }
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={token ? <ChatList /> : <Navigate to="/login" replace />} />
        <Route path="/chats/:chatId" element={token ? <ChatWindow /> : <Navigate to="/login" replace />} />
        <Route path="/new-chat" element={token ? <NewChat /> : <Navigate to="/login" replace />} />
        <Route path="/new-group" element={token ? <NewGroup /> : <Navigate to="/login" replace />} />
        <Route path="/chats/:chatId/info" element={token ? <GroupInfo /> : <Navigate to="/login" replace />} />
        <Route path="/chats/:chatId/add-member" element={token ? <AddMember /> : <Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}
