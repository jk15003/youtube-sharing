// backend/server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Store room data
const rooms = {};

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join Room
  socket.on('joinRoom', ({ roomId, username }) => {
    // Check if room exists
    const roomExists = !!rooms[roomId];
    socket.emit('roomExists', roomExists);

    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], video: { videoId: '', isPlaying: false } };
    }
    rooms[roomId].users.push({ id: socket.id, username });

    // Emit current video state to the newly joined user
    socket.emit('videoControl', { action: 'load', data: { videoId: rooms[roomId].video.videoId } });
    if (rooms[roomId].video.isPlaying) {
      socket.emit('videoControl', { action: 'play', data: {} });
    }

    // Update all users in the room
    io.to(roomId).emit('updateUsers', rooms[roomId].users);
    console.log(`${username} joined room: ${roomId}`);
  });

  // Handle YouTube Video Sync
  socket.on('videoControl', ({ roomId, action, data }) => {
    if (rooms[roomId]) {
      if (action === 'load') {
        rooms[roomId].video.videoId = data.videoId;
      } else if (action === 'play') {
        rooms[roomId].video.isPlaying = true;
      } else if (action === 'pause') {
        rooms[roomId].video.isPlaying = false;
      }
      socket.to(roomId).emit('videoControl', { action, data });
    }
  });

  // Handle Mouse Movement
  socket.on('mouseMove', ({ roomId, mouseData }) => {
    socket.to(roomId).emit('mouseMove', mouseData);
  });

  // Handle Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove user from rooms
    for (const roomId in rooms) {
      rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== socket.id);
      io.to(roomId).emit('updateUsers', rooms[roomId].users);
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
