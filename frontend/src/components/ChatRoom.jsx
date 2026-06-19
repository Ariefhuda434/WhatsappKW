import { useEffect, useRef, useState } from 'react'

export default function ChatRoom({ room, messages, onLoadMessages, userId, typingUsers }) {
  const bottomRef = useRef(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (room?.id) {
      setLoading(true)
      onLoadMessages(room.id).finally(() => setLoading(false))
    }
  }, [room?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Hari ini'
    if (days === 1) return 'Kemarin'
    return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
  }

  let lastDate = null

  return (
    <div className="flex-1 flex flex-col bg-whatsapp-bg-gray" style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d1d5db\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    }}>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Memuat pesan...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 font-medium">Belum ada pesan</p>
            <p className="text-gray-300 text-sm mt-1">Kirim pesan untuk memulai obrolan</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {messages.map((msg) => {
            const msgDate = new Date(msg.timestamp).toDateString()
            const showDate = msgDate !== lastDate
            lastDate = msgDate
            const isOwn = msg.sender_id === userId

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-3">
                    <span className="text-xs bg-white/80 shadow-sm px-3 py-1 rounded-full text-gray-500">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${
                      isOwn
                        ? 'bg-whatsapp-chat-green rounded-br-sm'
                        : 'bg-white rounded-bl-sm'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-semibold text-whatsapp-teal mb-0.5">
                        {msg.sender_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <p className="text-[10px] text-gray-400 text-right mt-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm rounded-bl-sm">
                <p className="text-sm text-gray-500 italic">
                  {typingUsers.join(', ')} sedang mengetik...
                </p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
