import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ---------------------------------------------------------
// CORS CONFIGURATION FOR PRODUCTION & DEVELOPMENT
// ---------------------------------------------------------
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

// Comma-separated list of allowed origins from environment variable
const envOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, same-origin)
    if (!origin) {
      return callback(null, true);
    }

    // In development mode, allow localhost and configured origins
    if (NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // In production, strictly match against allowed origins or wildcard
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    console.warn(`[CORS Blocked] Origin not allowed by CORS policy: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ---------------------------------------------------------
// IN-MEMORY MESSAGE STORE
// ---------------------------------------------------------
const INITIAL_MESSAGES = [
  {
    id: 'seed-1',
    user: 'Alan',
    text: 'Welcome to Team Chat. 👋👋 Send a message now to start interacting with other users in the app. ⬇️',
    likes: 0,
    timestamp: '12:16 PM',
  },
  {
    id: 'seed-2',
    user: 'Bob',
    text: 'Hey everyone! Excited to join the Exactspace team!',
    likes: 0,
    timestamp: '12:18 PM',
  },
  {
    id: 'seed-3',
    user: 'Elin',
    text: 'Oh hi @Bob! Rolande is around, too... Great to have you with us!',
    likes: 0,
    timestamp: '12:20 PM',
  },
];

let messages = [...INITIAL_MESSAGES];

// ---------------------------------------------------------
// SOCKET.IO INITIALIZATION
// ---------------------------------------------------------
const io = new Server(server, {
  cors: corsOptions,
  // Guarantee support for WebSocket with automatic polling fallback
  transports: ['websocket', 'polling'],
  pingTimeout: 20000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id} (transport: ${socket.conn.transport.name})`);

  // Handle transport upgrade logging (polling -> websocket)
  socket.conn.on('upgrade', (transport) => {
    console.log(`[Socket.IO] Transport upgraded for ${socket.id} to: ${transport.name}`);
  });

  // Synchronize existing message history to the newly connected client
  socket.emit('chat:sync', messages);

  // Client sent a new message
  socket.on('chat:message', (incomingMessage) => {
    if (!incomingMessage || !incomingMessage.text || !incomingMessage.text.trim()) {
      return;
    }

    const newMessage = {
      id: incomingMessage.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user: incomingMessage.user || 'Alan',
      text: incomingMessage.text.trim(),
      likes: typeof incomingMessage.likes === 'number' ? incomingMessage.likes : 0,
      timestamp: incomingMessage.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    messages.push(newMessage);
    // Limit memory store to last 200 messages
    if (messages.length > 200) {
      messages.shift();
    }

    // Broadcast new message to all connected clients
    io.emit('chat:message', newMessage);
    console.log(`[Socket.IO] Message from ${newMessage.user}: "${newMessage.text}"`);
  });

  // Client liked a message
  socket.on('chat:like', ({ id }) => {
    const target = messages.find((m) => m.id === id);
    if (target) {
      target.likes += 1;
      // Broadcast updated count to all clients
      io.emit('chat:like', { id: target.id, likes: target.likes });
      console.log(`[Socket.IO] Like incremented for ${target.id} -> ${target.likes}`);
    }
  });

  // Client requested reset
  socket.on('chat:reset', () => {
    messages = [...INITIAL_MESSAGES];
    io.emit('chat:sync', messages);
    console.log('[Socket.IO] Chat reset to initial seed');
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (reason: ${reason})`);
  });
});

// ---------------------------------------------------------
// REST API ENDPOINTS
// ---------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: NODE_ENV,
    port: PORT,
    connectedClients: io.engine.clientsCount,
    messagesCount: messages.length,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// ---------------------------------------------------------
// STATIC CLIENT HOSTING (PRODUCTION MONOLITHIC DEPLOYMENT)
// Serves built frontend files if dist/ directory exists
// ---------------------------------------------------------
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  console.log(`[Static] Serving production frontend build from ${distPath}`);
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'Exactspace Chat Backend Server running',
      environment: NODE_ENV,
      connectedClients: io.engine.clientsCount,
      allowedOrigins,
      timestamp: new Date().toISOString(),
    });
  });
}

// ---------------------------------------------------------
// SERVER LIFECYCLE
// ---------------------------------------------------------
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Exactspace Chat Server running in [${NODE_ENV.toUpperCase()}] mode`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  console.log(`Transports supported: WebSocket + Polling fallback`);
  console.log(`===============================================`);
});

// Graceful termination handling
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
});
