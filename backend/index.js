const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { dbQuery } = require('./database');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Di produksi, batasi ke domain frontend Anda
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- REST API ENDPOINTS ---

// 1. Login / Register Instan (Hanya butuh username)
app.post('/api/users/login', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username wajib diisi' });
  }

  try {
    // Cek apakah user sudah ada
    let user = await dbQuery.get('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!user) {
      // Jika belum ada, buat user baru
      const id = 'usr_' + Math.random().toString(36).substr(2, 9);
      // Berikan avatar acak menggunakan dicebear atau multiavatar
      const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;
      
      await dbQuery.run(
        'INSERT INTO users (id, username, avatar, status) VALUES (?, ?, ?, ?)',
        [id, username, avatar, 'online']
      );
      user = { id, username, avatar, status: 'online' };
    } else {
      // Jika sudah ada, update status ke online
      await dbQuery.run('UPDATE users SET status = ? WHERE id = ?', ['online', user.id]);
      user.status = 'online';
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// 2. Dapatkan semua user (kecuali user yang sedang login)
app.get('/api/users', async (req, res) => {
  const { exclude } = req.query;
  try {
    let sql = 'SELECT * FROM users';
    let params = [];
    if (exclude) {
      sql += ' WHERE id != ?';
      params.push(exclude);
    }
    const users = await dbQuery.all(sql, params);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// 3. Dapatkan daftar chat room yang diikuti oleh user
app.get('/api/rooms', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId wajib disertakan' });
  }

  try {
    // Query untuk mendapatkan semua room di mana user adalah anggotanya,
    // beserta info pesan terakhir (last message) dan info lawan bicara jika tipenya 'private'
    const rooms = await dbQuery.all(`
      SELECT r.*, 
             (SELECT message FROM messages WHERE room_id = r.id ORDER BY timestamp DESC LIMIT 1) as last_message,
             (SELECT timestamp FROM messages WHERE room_id = r.id ORDER BY timestamp DESC LIMIT 1) as last_message_time
      FROM rooms r
      JOIN room_members rm ON r.id = rm.room_id
      WHERE rm.user_id = ?
      ORDER BY last_message_time DESC, r.created_at DESC
    `, [userId]);

    // Untuk setiap room bertipe 'private', cari info lawan bicaranya
    const detailedRooms = await Promise.all(rooms.map(async (room) => {
      if (room.type === 'private') {
        const opponent = await dbQuery.get(`
          SELECT u.* FROM users u
          JOIN room_members rm ON u.id = rm.user_id
          WHERE rm.room_id = ? AND rm.user_id != ?
        `, [room.id, userId]);
        
        return {
          ...room,
          name: opponent ? opponent.username : room.name,
          avatar: opponent ? opponent.avatar : null,
          opponentId: opponent ? opponent.id : null,
          opponentStatus: opponent ? opponent.status : 'offline'
        };
      }
      // Untuk group chat, gunakan avatar default group
      return {
        ...room,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${room.id}`
      };
    }));

    res.json(detailedRooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// 4. Buat atau dapatkan private chat room antara dua user
app.post('/api/rooms/private', async (req, res) => {
  const { creatorId, recipientId } = req.body;
  if (!creatorId || !recipientId) {
    return res.status(400).json({ error: 'creatorId dan recipientId wajib diisi' });
  }

  try {
    // Cek apakah sudah ada private room antara kedua user ini
    const existingRoom = await dbQuery.get(`
      SELECT rm1.room_id 
      FROM room_members rm1
      JOIN room_members rm2 ON rm1.room_id = rm2.room_id
      JOIN rooms r ON r.id = rm1.room_id
      WHERE rm1.user_id = ? AND rm2.user_id = ? AND r.type = 'private'
    `, [creatorId, recipientId]);

    if (existingRoom) {
      // Jika sudah ada, kembalikan room tersebut
      const room = await dbQuery.get('SELECT * FROM rooms WHERE id = ?', [existingRoom.room_id]);
      return res.json(room);
    }

    // Jika belum ada, buat room baru
    const roomId = 'room_' + Math.random().toString(36).substr(2, 9);
    await dbQuery.run('INSERT INTO rooms (id, name, type) VALUES (?, ?, ?)', [roomId, null, 'private']);
    
    // Tambahkan kedua user sebagai anggota room
    await dbQuery.run('INSERT INTO room_members (room_id, user_id) VALUES (?, ?)', [roomId, creatorId]);
    await dbQuery.run('INSERT INTO room_members (room_id, user_id) VALUES (?, ?)', [roomId, recipientId]);

    const newRoom = { id: roomId, name: null, type: 'private' };
    res.json(newRoom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// 5. Buat group chat room baru
app.post('/api/rooms/group', async (req, res) => {
  const { name, memberIds } = req.body; // memberIds adalah array of user_id
  if (!name || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ error: 'Nama grup dan anggota wajib diisi' });
  }

  try {
    const roomId = 'group_' + Math.random().toString(36).substr(2, 9);
    await dbQuery.run('INSERT INTO rooms (id, name, type) VALUES (?, ?, ?)', [roomId, name, 'group']);

    // Tambahkan semua anggota ke room_members
    for (const userId of memberIds) {
      await dbQuery.run('INSERT INTO room_members (room_id, user_id) VALUES (?, ?)', [roomId, userId]);
    }

    const newGroup = { id: roomId, name, type: 'group' };
    res.json(newGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// 6. Dapatkan riwayat pesan dari suatu room
app.get('/api/rooms/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await dbQuery.all(`
      SELECT m.*, u.username as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.timestamp ASC
    `, [roomId]);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});


// --- SOCKET.IO REAL-TIME CHAT ---

// Menyimpan mapping socket.id ke user_id
const activeConnections = {};

io.on('connection', (socket) => {
  console.log('User terhubung:', socket.id);

  // Event ketika user login/mengaktifkan koneksi real-time
  socket.on('user_connected', async (userId) => {
    if (!userId) return;
    activeConnections[socket.id] = userId;
    
    // Update status user di database ke 'online'
    await dbQuery.run('UPDATE users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?', ['online', userId]);
    
    // Beritahu semua client bahwa user ini online
    io.emit('user_status_changed', { userId, status: 'online' });
    console.log(`User ${userId} sekarang online.`);
  });

  // Event ketika user masuk ke chat room tertentu
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} bergabung ke room: ${roomId}`);
  });

  // Event ketika user keluar dari chat room tertentu
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} keluar dari room: ${roomId}`);
  });

  // Event ketika user mengirim pesan
  socket.on('send_message', async (data) => {
    const { roomId, senderId, message } = data;
    if (!roomId || !senderId || !message) return;

    const messageId = 'msg_' + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    try {
      // Simpan pesan ke database
      await dbQuery.run(
        'INSERT INTO messages (id, room_id, sender_id, message, timestamp) VALUES (?, ?, ?, ?, ?)',
        [messageId, roomId, senderId, message, timestamp]
      );

      // Ambil info pengirim untuk dikirimkan ke client
      const sender = await dbQuery.get('SELECT username, avatar FROM users WHERE id = ?', [senderId]);

      const formattedMessage = {
        id: messageId,
        room_id: roomId,
        sender_id: senderId,
        sender_name: sender ? sender.username : 'Unknown',
        sender_avatar: sender ? sender.avatar : null,
        message,
        timestamp
      };

      // Kirim pesan ke semua orang di room tersebut (termasuk pengirim)
      io.to(roomId).emit('receive_message', formattedMessage);

      // Kirim notifikasi update room list ke semua anggota room (agar chat terakhir ter-update di sidebar)
      const members = await dbQuery.all('SELECT user_id FROM room_members WHERE room_id = ?', [roomId]);
      members.forEach(member => {
        // Cari socket id milik member tersebut dan kirim event update_room_list
        // (Untuk kesederhanaan, kita bisa broadcast global atau emit ke room)
      });
      io.to(roomId).emit('room_updated', { roomId, lastMessage: message, lastMessageTime: timestamp });

    } catch (err) {
      console.error('Gagal menyimpan/mengirim pesan:', err);
    }
  });

  // Event ketika user sedang mengetik (typing...)
  socket.on('typing', (data) => {
    const { roomId, username, isTyping } = data;
    socket.to(roomId).emit('user_typing', { roomId, username, isTyping });
  });

  // Event ketika user terputus (disconnect)
  socket.on('disconnect', async () => {
    const userId = activeConnections[socket.id];
    if (userId) {
      delete activeConnections[socket.id];
      
      // Cek apakah user masih memiliki koneksi aktif lain (misal buka tab baru)
      const stillConnected = Object.values(activeConnections).includes(userId);
      if (!stillConnected) {
        // Update status user di database ke 'offline'
        await dbQuery.run('UPDATE users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?', ['offline', userId]);
        
        // Beritahu semua client bahwa user ini offline
        io.emit('user_status_changed', { userId, status: 'offline' });
        console.log(`User ${userId} sekarang offline.`);
      }
    }
    console.log('User terputus:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
