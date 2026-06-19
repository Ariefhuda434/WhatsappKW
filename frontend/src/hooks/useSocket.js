import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export default function useSocket(userId) {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    const socket = io('/', {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      socket.emit('user_connected', userId)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId])

  return socketRef
}
