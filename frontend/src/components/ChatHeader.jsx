import { LogOut, ChevronLeft } from 'lucide-react'

export default function ChatHeader({ room, user, onBack, onLogout }) {
  return (
    <div className="bg-whatsapp-teal-dark text-white px-4 py-3 flex items-center gap-3 shadow-md">
      <button
        onClick={onBack}
        className="lg:hidden p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <ChevronLeft size={24} />
      </button>

      <img
        src={room?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${room?.id}`}
        alt=""
        className="w-10 h-10 rounded-full bg-white/20"
      />

      <div className="flex-1 min-w-0">
        <h2 className="font-semibold truncate">
          {room?.name || 'Pilih Chat'}
        </h2>
        {room?.type === 'private' && room?.opponentStatus && (
          <p className="text-xs text-green-300">
            {room.opponentStatus === 'online' ? 'Online' : 'Offline'}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-white/70 hidden sm:block">{user?.username}</span>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Keluar"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}
