import { useState, useEffect } from 'react'
import { Search, Users, MessageCircle } from 'lucide-react'

export default function Sidebar({ user, rooms, selectedRoomId, onSelectRoom, onNewChat }) {
  const [search, setSearch] = useState('')

  const filteredRooms = rooms.filter((room) =>
    room.name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Kemarin'
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="bg-whatsapp-teal-dark text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">WhatsApp KW</h1>
        <button
          onClick={onNewChat}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Chat baru"
        >
          <MessageCircle size={20} />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari chat..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-green text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
            <Users size={48} className="mb-2" />
            <p className="text-sm">Belum ada chat</p>
            <p className="text-xs mt-1">Klik ikon chat untuk memulai</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left ${
                selectedRoomId === room.id ? 'bg-gray-100' : ''
              }`}
            >
              <img
                src={room.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${room.id}`}
                alt=""
                className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-gray-800 truncate">{room.name}</h3>
                  {room.last_message_time && (
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(room.last_message_time)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {room.last_message || 'Belum ada pesan'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
