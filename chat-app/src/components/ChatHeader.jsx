import React from 'react';
import { Hash, Users, Wifi, WifiOff, RotateCw, RotateCcw } from 'lucide-react';

export default function ChatHeader({
  isConnected,
  connectionStatus = isConnected ? 'connected' : 'disconnected',
  onResetChat,
  messageCount,
}) {
  const isOnline = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  const pillClass = isOnline
    ? 'online'
    : isConnecting
    ? 'connecting'
    : 'offline';

  const statusLabel = isOnline
    ? 'Live Sync'
    : isConnecting
    ? 'Reconnecting...'
    : 'Local Mode';

  const statusTitle = isOnline
    ? 'Connected to Socket.IO real-time server (Multi-client synced)'
    : isConnecting
    ? 'Attempting to reconnect to backend server...'
    : 'Standalone Local Mode (Socket server offline, messages stored locally)';

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <div className="header-channel-icon">
          <Hash size={22} />
        </div>
        <div className="header-channel-info">
          <h1 className="header-channel-name">Introductions</h1>
          <span className="header-channel-topic">
            This Channel Is For Company Wide Chatter
          </span>
        </div>
      </div>

      <div className="chat-header-right">
        {/* Real-time Socket status indicator */}
        <div
          className={`connection-pill ${pillClass}`}
          title={statusTitle}
          role="status"
          aria-live="polite"
        >
          {isOnline ? (
            <Wifi size={13} />
          ) : isConnecting ? (
            <RotateCw size={13} className="spin-icon" />
          ) : (
            <WifiOff size={13} />
          )}
          <span>{statusLabel}</span>
        </div>

        {/* Member count indicator */}
        <div className="header-members-count" title="5 team members active">
          <Users size={16} />
          <span>5 | 100</span>
        </div>

        {/* Reset / clear button */}
        <button
          type="button"
          className="action-icon-btn"
          onClick={onResetChat}
          title="Reset conversation to initial sample"
          aria-label="Reset conversation"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
}
