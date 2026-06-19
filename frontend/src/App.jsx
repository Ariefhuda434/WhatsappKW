import { useState, useEffect, useCallback, useRef } from 'react'
import useSocket from './hooks/useSocket'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import ChatHeader from './components/ChatHeader'
import ChatRoom from './components/ChatRoom'
import MessageInput from './components/MessageInput'
import NewChatModal from './components/NewChatModal'

export default function App() {
  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState({})
  const [showNewChat, setShowNewChat] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const [showSidebar, setShowSidebar] = useState(true)

  const socketRef = useSocket(user?.id)
  const typingTimeout = useRef(null)

  const socket = socketRef.current

  const loadRooms = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/rooms?userId=${user.id}`)
      const data = await res.json()
      setRooms(data)
    } catch {}
  }, [user])

  const loadMessages = useCallback(async (roomId) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`)
      const data = await res.json()
      setMessages((prev) => ({ ...prev, [roomId]: data }))
      return data
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadRooms()
    }
  }, [user, loadRooms])

  useEffect(() => {
    if (!socket || !user) return

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => ({
        ...prev,
        [msg.room_id]: [...(prev[msg.room_id] || []), msg],
      }))
      loadRooms()
    }

    const handleRoomUpdated = () => {
      loadRooms()
    }

    const handleUserStatusChanged = ({ userId, status }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.opponentId === userId ? { ...r, opponentStatus: status } : r
        )
      )
    }

    const handleUserTyping = ({ roomId, username, isTyping }) => {
      if (isTyping) {
        setTypingUsers((prev) => ({
          ...prev,
          [roomId]: [...new Set([...(prev[roomId] || []), username])],
        }))
      } else {
        setTypingUsers((prev) => ({
          ...prev,
          [roomId]: (prev[roomId] || []).filter((u) => u !== username),
        }))
      }
    }

    socket.on('receive_message', handleReceiveMessage)
    socket.on('room_updated', handleRoomUpdated)
    socket.on('user_status_changed', handleUserStatusChanged)
    socket.on('user_typing', handleUserTyping)

    if (selectedRoom) {
      socket.emit('join_room', selectedRoom.id)
    }

    return () => {
      socket.off('receive_message', handleReceiveMessage)
      socket.off('room_updated', handleRoomUpdated)
      socket.off('user_status_changed', handleUserStatusChanged)
      socket.off('user_typing', handleUserTyping)
    }
  }, [socket, user, selectedRoom, loadRooms])

  const handleSendMessage = (message) => {
    if (!socket || !selectedRoom) return
    socket.emit('send_message', {
      roomId: selectedRoom.id,
      senderId: user.id,
      message,
    })
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }
    socket.emit('typing', {
      roomId: selectedRoom.id,
      username: user.username,
      isTyping: false,
    })
  }

  const handleTyping = (isTyping) => {
    if (!socket || !selectedRoom) return
    socket.emit('typing', {
      roomId: selectedRoom.id,
      username: user.username,
      isTyping,
    })
    if (isTyping) {
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => {
        socket.emit('typing', {
          roomId: selectedRoom.id,
          username: user.username,
          isTyping: false,
        })
      }, 2000)
    }
  }

  const handleSelectRoom = (room) => {
    if (socket && selectedRoom) {
      socket.emit('leave_room', selectedRoom.id)
    }
    setSelectedRoom(room)
    setShowSidebar(false)
    if (socket) {
      socket.emit('join_room', room.id)
    }
  }

  const handleStartChat = async (targetUser) => {
    try {
      const res = await fetch('/api/rooms/private', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: user.id, recipientId: targetUser.id }),
      })
      const room = await res.json()
      if (res.ok) {
        setShowNewChat(false)
        const fullRoom = {
          ...room,
          name: targetUser.username,
          avatar: targetUser.avatar,
          opponentId: targetUser.id,
          opponentStatus: targetUser.status,
        }
        handleSelectRoom(fullRoom)
        loadRooms()
      }
    } catch {}
  }

  const handleLogout = () => {
    if (socket && selectedRoom) {
      socket.emit('leave_room', selectedRoom.id)
    }
    setUser(null)
    setRooms([])
    setSelectedRoom(null)
    setMessages({})
  }

  const handleBack = () => {
    setShowSidebar(true)
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const currentTyping = typingUsers[selectedRoom?.id] || []

  return (
    <div className="h-full flex">
      <div
        className={`${
          showSidebar ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-80 xl:w-96 flex-shrink-0 flex-col`}
      >
        <Sidebar
          user={user}
          rooms={rooms}
          selectedRoomId={selectedRoom?.id}
          onSelectRoom={handleSelectRoom}
          onNewChat={() => setShowNewChat(true)}
        />
      </div>

      <div
        className={`${
          showSidebar ? 'hidden' : 'flex'
        } lg:flex flex-1 flex-col`}
      >
        {selectedRoom ? (
          <>
            <ChatHeader
              room={selectedRoom}
              user={user}
              onBack={handleBack}
              onLogout={handleLogout}
            />
            <ChatRoom
              room={selectedRoom}
              messages={messages[selectedRoom.id] || []}
              onLoadMessages={loadMessages}
              userId={user.id}
              typingUsers={currentTyping}
            />
            <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-whatsapp-bg-gray">
            <div className="text-center">
              <div className="bg-whatsapp-teal rounded-full p-6 inline-block mb-4">
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-600">WhatsApp KW</h2>
              <p className="text-gray-400 mt-2">Pilih chat untuk mulai mengobrol</p>
            </div>
          </div>
        )}
      </div>

      {showNewChat && (
        <NewChatModal
          userId={user.id}
          onClose={() => setShowNewChat(false)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  )
}
