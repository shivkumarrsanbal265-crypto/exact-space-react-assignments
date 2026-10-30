import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { getRandomUser } from './constants/users';
import './App.css';

// Initial welcoming messages matching assignment GIF style
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

/**
 * Resolves the Socket.IO server URL dynamically:
 * 1. Checks VITE_SOCKET_URL from environment variables (e.g. deployed backend URL).
 * 2. If running on a deployed host without VITE_SOCKET_URL, falls back to same-origin window.location.origin.
 * 3. In local development, defaults to http://localhost:5000.
 */
function getSocketServerUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      return window.location.origin;
    }
  }
  return 'http://localhost:5000';
}

export default function App() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // Initialize Socket.IO connection with production resilience
  useEffect(() => {
    const serverUrl = getSocketServerUrl();
    console.log(`[Socket.IO] Initializing connection to: ${serverUrl}`);

    const socket = io(serverUrl, {
      // Prioritize WebSocket with automatic polling fallback in restricted network environments
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[Socket.IO] Connected to chat server (transport: ${socket.io.engine.transport.name})`);
      setIsConnected(true);
      setConnectionStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[Socket.IO] Disconnected from server (${reason}); falling back to local state`);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`[Socket.IO] Attempting reconnection (#${attempt})...`);
      setConnectionStatus('connecting');
    });

    socket.on('reconnect', (attempt) => {
      console.log(`[Socket.IO] Reconnected successfully after ${attempt} attempts`);
      setIsConnected(true);
      setConnectionStatus('connected');
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket.IO] Reconnection failed; operating in offline local mode');
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      // Quiet fallback when backend server is offline or unreachable
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    // Synchronize full message history from server on connect
    socket.on('chat:sync', (syncedMessages) => {
      if (Array.isArray(syncedMessages) && syncedMessages.length > 0) {
        setMessages(syncedMessages);
      }
    });

    // Incoming new message from any connected client
    socket.on('chat:message', (newMessage) => {
      setMessages((prev) => {
        // Prevent duplicate append if message already exists locally
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    // Incoming like update from any connected client
    socket.on('chat:like', ({ id, likes }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, likes } : msg))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Format current timestamp
  const formatCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Send a new message
  const handleSendMessage = useCallback(
    (text) => {
      // Assign random username from user_list: ["Alan", "Bob", "Carol", "Dean", "Elin"]
      const randomUser = getRandomUser();
      const newMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        user: randomUser,
        text,
        likes: 0,
        timestamp: formatCurrentTime(),
      };

      if (isConnected && socketRef.current) {
        // Publish to Socket.IO server for real-time broadcast
        socketRef.current.emit('chat:message', newMessage);
      } else {
        // Local mode fallback: append immutably
        setMessages((prev) => [...prev, newMessage]);
      }
    },
    [isConnected]
  );

  // Like a message
  const handleLikeMessage = useCallback(
    (messageId) => {
      if (isConnected && socketRef.current) {
        // Emit like event to server
        socketRef.current.emit('chat:like', { id: messageId });
      } else {
        // Local mode fallback: immutable state update
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg
          )
        );
      }
    },
    [isConnected]
  );

  // Reset chat thread
  const handleResetChat = useCallback(() => {
    if (isConnected && socketRef.current) {
      socketRef.current.emit('chat:reset');
    } else {
      setMessages(INITIAL_MESSAGES);
    }
  }, [isConnected]);

  return (
    <div className="chat-app-root">
      <main className="chat-main-area" role="main">
        <ChatHeader
          isConnected={isConnected}
          connectionStatus={connectionStatus}
          onResetChat={handleResetChat}
          messageCount={messages.length}
        />
        <div className="chat-thread-container">
          <MessageList
            messages={messages}
            onLike={handleLikeMessage}
          />
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </main>
    </div>
  );
}
