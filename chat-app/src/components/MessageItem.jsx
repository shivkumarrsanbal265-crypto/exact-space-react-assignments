import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { getUserProfile, USER_LIST } from '../constants/users';

/**
 * Parses message text and highlights @mentions
 */
function renderFormattedMessage(text) {
  if (!text) return null;

  // Split on words starting with @
  const parts = text.split(/(@[a-zA-Z0-9_-]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const mentionName = part.slice(1);
      const isKnownUser = USER_LIST.some(
        (u) => u.toLowerCase() === mentionName.toLowerCase()
      );

      return (
        <span
          key={index}
          className={`mention-tag ${isKnownUser ? 'known-user' : ''}`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function MessageItem({ message, onLike }) {
  const [animating, setAnimating] = useState(false);
  const profile = getUserProfile(message.user);

  const handleLikeClick = () => {
    onLike(message.id);
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
    }, 250);
  };

  const hasLikes = message.likes > 0;

  return (
    <div className="message-row" id={`msg-${message.id}`}>
      {/* Avatar with user initials and role color */}
      <div
        className="message-avatar"
        style={{ backgroundColor: profile.color }}
        title={`${message.user} (${profile.role})`}
        aria-hidden="true"
      >
        {profile.initials}
      </div>

      <div className="message-content-wrapper">
        <div className="message-header">
          <span className="message-author">{message.user}</span>
          <span className="message-time">{message.timestamp}</span>
        </div>

        <div className="message-bubble-row">
          <div className="message-bubble">
            <p className="message-text">
              {renderFormattedMessage(message.text)}
            </p>
          </div>

          {/* Like button on the right end of chat message */}
          <div className="message-like-section">
            <button
              type="button"
              className={`like-button ${hasLikes ? 'liked' : ''} ${
                animating ? 'anim-pop' : ''
              }`}
              onClick={handleLikeClick}
              title={`Like message by ${message.user} (Current likes: ${message.likes})`}
              aria-label={`Like message by ${message.user}, current count ${message.likes}`}
            >
              <ThumbsUp
                size={14}
                className="like-icon"
                fill={hasLikes ? 'currentColor' : 'none'}
              />
              <span className="like-count">{message.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

