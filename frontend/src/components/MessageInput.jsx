import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
    inputRef.current?.focus()
  }

  const handleChange = (e) => {
    setText(e.target.value)
    onTyping?.(e.target.value.length > 0)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-whatsapp-chat-gray px-4 py-3 flex items-center gap-3"
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Ketik pesan..."
        className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent bg-white"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="bg-whatsapp-teal hover:bg-whatsapp-teal-dark text-white rounded-full p-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={20} />
      </button>
    </form>
  )
}
