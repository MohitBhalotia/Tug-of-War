import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, 'https://your-frontend-url.vercel.app'] 
      : '*', // Allow all origins in development
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Add polling as a fallback
});

app.use(cors());
app.use(express.json());

// Store active rooms and their data
const rooms = new Map();

// Store admin connections
const admins = new Map();

// Store team tokens for secure access
const teamTokens = new Map();

// Routes
app.get('/', (req, res) => {
  res.send('Tug of War Quiz Game Server is running!');
});

// Get room info
app.get('/api/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  if (rooms.has(roomId)) {
    res.json({ exists: true, room: rooms.get(roomId) });
  } else {
    res.json({ exists: false });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create a new room as admin
  socket.on('create_room', ({ team1, team2 }) => {
    const roomId = generateRoomId();
    const team1Token = generateToken();
    const team2Token = generateToken();
    
    // Store room data
    rooms.set(roomId, {
      team1,
      team2,
      team1Token,
      team2Token,
      ropePosition: 0,
      team1Score: 0,
      team2Score: 0,
      team1Connected: false,
      team2Connected: false,
      adminConnected: true,
      questions: [],
      currentQuestion: null,
      gameStarted: false,
      winner: null,
      createdAt: new Date()
    });
    
    // Store team tokens for validation
    teamTokens.set(team1Token, { roomId, team: team1, isTeam1: true });
    teamTokens.set(team2Token, { roomId, team: team2, isTeam1: false });
    
    // Register this socket as the admin for this room
    admins.set(socket.id, roomId);
    socket.join(roomId);
    
    // Send room info back to creator
    socket.emit('room_created', { 
      roomId,
      roomInfo: rooms.get(roomId),
      team1Token,
      team2Token,
      isAdmin: true
    });
    
    console.log(`Room created by admin: ${roomId}`);
  });

  // Join a room
  socket.on('join_room', ({ roomId, team, isAdmin, teamToken }) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }
    
    const roomInfo = rooms.get(roomId);
    
    if (isAdmin) {
      // Admin is joining
      roomInfo.adminConnected = true;
      admins.set(socket.id, roomId);
    } else if (teamToken) {
      // Team is joining with a token
      if (!teamTokens.has(teamToken)) {
        socket.emit('error', { message: 'Invalid team token' });
        return;
      }
      
      const tokenInfo = teamTokens.get(teamToken);
      if (tokenInfo.roomId !== roomId) {
        socket.emit('error', { message: 'Token does not match this room' });
        return;
      }
      
      // Set the team based on the token
      team = tokenInfo.team;
      
      // Update room data based on which team joined
      if (tokenInfo.isTeam1) {
        roomInfo.team1Connected = true;
      } else {
        roomInfo.team2Connected = true;
      }
    } else {
      // No token provided - reject the connection
      socket.emit('error', { message: 'Team token is required to join a room' });
      return;
    }
    
    socket.join(roomId);
    
    // Update room data
    rooms.set(roomId, roomInfo);
    
    // Notify all clients in the room about the join
    io.to(roomId).emit('room_update', roomInfo);
    
    socket.emit('joined_room', { roomId, roomInfo, isAdmin });
    
    if (isAdmin) {
      console.log(`Admin joined room: ${roomId}`);
    } else {
      console.log(`${team} joined room: ${roomId}`);
    }
  });

  // Start the game
  socket.on('start_game', ({ roomId }) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }
    
    const roomInfo = rooms.get(roomId);
    roomInfo.gameStarted = true;
    
    rooms.set(roomId, roomInfo);
    
    // Notify all clients in the room that the game has started
    io.to(roomId).emit('game_started', roomInfo);
    
    console.log(`Game started in room: ${roomId}`);
  });

  // Update rope position
  socket.on('update_rope', ({ roomId, teamAnswering }) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }
    
    const roomInfo = rooms.get(roomId);
    const pullStrength = 5;
    
    // Update rope position based on which team answered correctly
    if (teamAnswering === 'A') {
      roomInfo.ropePosition = Math.max(roomInfo.ropePosition - pullStrength, -50);
      roomInfo.team1Score += 1;
    } else if (teamAnswering === 'B') {
      roomInfo.ropePosition = Math.min(roomInfo.ropePosition + pullStrength, 50);
      roomInfo.team2Score += 1;
    }
    
    // Check for winner
    if (roomInfo.ropePosition <= -50) {
      roomInfo.winner = roomInfo.team1;
    } else if (roomInfo.ropePosition >= 50) {
      roomInfo.winner = roomInfo.team2;
    }
    
    rooms.set(roomId, roomInfo);
    
    // Broadcast the updated rope position to all clients in the room
    io.to(roomId).emit('rope_updated', roomInfo);
    
    console.log(`Rope updated in room ${roomId}: ${roomInfo.ropePosition}`);
  });

  // Reset game
  socket.on('reset_game', ({ roomId }) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }
    
    const roomInfo = rooms.get(roomId);
    roomInfo.ropePosition = 0;
    roomInfo.team1Score = 0;
    roomInfo.team2Score = 0;
    roomInfo.winner = null;
    roomInfo.gameStarted = false;
    
    rooms.set(roomId, roomInfo);
    
    // Broadcast the reset to all clients in the room
    io.to(roomId).emit('game_reset', roomInfo);
    
    console.log(`Game reset in room: ${roomId}`);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Check if this was an admin
    if (admins.has(socket.id)) {
      const roomId = admins.get(socket.id);
      if (rooms.has(roomId)) {
        const roomInfo = rooms.get(roomId);
        roomInfo.adminConnected = false;
        rooms.set(roomId, roomInfo);
        
        // Notify room that admin disconnected
        io.to(roomId).emit('admin_disconnected', { roomId });
        console.log(`Admin disconnected from room: ${roomId}`);
      }
      
      admins.delete(socket.id);
    }
    
    // Note: In a production app, you might want to handle team disconnects as well
  });
});

// Generate a random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Generate a unique token for team authentication
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
