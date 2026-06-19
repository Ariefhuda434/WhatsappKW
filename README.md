# WhatsApp KW

A real-time chat application built with **Express**, **Socket.io**, **SQLite**, **React**, and **Vite**. WhatsApp KW is a simplified WhatsApp clone with private messaging, real-time chat, and user presence.

## Features

- **Instant Login** — Enter a username to automatically register/login
- **Real-time Chat** — Instant messaging via Socket.io
- **Private Chat** — One-on-one conversations between users
- **User Presence** — See who's online/offline
- **Typing Indicators** — See when someone is typing
- **Chat History** — Messages are persisted in SQLite
- **Responsive Design** — Works on desktop and mobile

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | React, Vite, TailwindCSS, Socket.io Client, Axios |
| Backend  | Express, Socket.io, SQLite3       |
| Database | SQLite                            |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/whatsapp-kw.git
cd whatsapp-kw

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Running the App

Open **two terminals**:

**Terminal 1 — Backend (port 5000):**
```bash
cd backend
node index.js
```

**Terminal 2 — Frontend (port 3000):**
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in **two browser tabs**. Login with different usernames, then click the chat icon to start a conversation.

### Access from Other Devices

Make sure your frontend `vite.config.js` has `host: '0.0.0.0'` (already configured), then:

```bash
cd frontend
npm run dev
```

Find your local IP and open `http://<YOUR_IP>:3000` from another device on the same network.

## API Endpoints

| Method | Endpoint                    | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| POST   | `/api/users/login`          | Login or register a user           |
| GET    | `/api/users?exclude={id}`   | Get all users except one           |
| GET    | `/api/rooms?userId={id}`    | Get chat rooms for a user          |
| POST   | `/api/rooms/private`        | Create or get a private room       |
| POST   | `/api/rooms/group`          | Create a group chat                |
| GET    | `/api/rooms/:id/messages`   | Get message history for a room     |

## Project Structure

```
whatsapp-kw/
├── backend/
│   ├── index.js          # Express server + Socket.io
│   ├── database.js       # SQLite connection & queries
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Main app component
│   │   ├── index.css          # Tailwind CSS
│   │   ├── hooks/
│   │   │   └── useSocket.js   # Socket.io hook
│   │   └── components/
│   │       ├── Login.jsx
│   │       ├── Sidebar.jsx
│   │       ├── ChatRoom.jsx
│   │       ├── ChatHeader.jsx
│   │       ├── MessageInput.jsx
│   │       └── NewChatModal.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── generate_doc.js
└── README.md
```

