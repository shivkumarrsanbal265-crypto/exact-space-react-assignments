import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, ArrowDown } from 'lucide-react';
import MessageItem from './MessageItem';

export default function MessageList({ messages, onLike }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Check scroll position to show/hide the scroll-to-bottom button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 150);
  };

  // Scroll to bottom smoothly
  const scrollToBottom = (smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // Auto-scroll when new messages arrive if near bottom
  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(false);
    }
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      className="message-list-container"
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label="Chat messages thread"
    >
      {messages.length === 0 ? (
        <div className="message-list-empty">
          <MessageSquare size={48} className="empty-icon" strokeWidth={1.5} />
          <h3 className="empty-title">No messages yet</h3>
          <p className="empty-subtitle">
            Start the conversation! Type a message below and hit send.
          </p>
        </div>
      ) : (
        <div className="messages-flow">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onLike={onLike}
            />
          ))}
          <div ref={bottomRef} className="scroll-anchor" />
        </div>
      )}

      {/* Floating button when user has scrolled up */}
      {showScrollBottom && (
        <button
          type="button"
          className="scroll-bottom-floating-btn"
          onClick={() => scrollToBottom(true)}
          aria-label="Scroll to newest messages"
        >
          <ArrowDown size={14} />
          <span>New messages</span>
        </button>
      )}
    </div>
  );
}

