import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'

export default function NewChatModal({ userId, onClose, onStartChat }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`/api/users?exclude=${userId}`)
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => {})
  }, [userId])

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Chat Baru</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengguna..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-green text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Tidak ada pengguna lain</p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => onStartChat(u)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <img
                  src={u.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full bg-gray-200"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`
                  }}
                />
                <div>
                  <h3 className="font-medium text-gray-800">{u.username}</h3>
                  <p className="text-xs text-gray-400">
                    {u.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
