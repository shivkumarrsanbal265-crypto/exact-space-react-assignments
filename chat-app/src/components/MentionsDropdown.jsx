import React, { useEffect, useRef } from 'react';
import { AtSign } from 'lucide-react';
import { USER_LIST, getUserProfile } from '../constants/users';

export default function MentionsDropdown({
  query,
  selectedIndex,
  onSelectUser,
  onClose,
}) {
  const dropdownRef = useRef(null);

  // Filter users based on query after @
  const filteredUsers = USER_LIST.filter((username) =>
    username.toLowerCase().startsWith(query.toLowerCase())
  );

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filteredUsers.length === 0) {
    return (
      <div ref={dropdownRef} className="mention-dropdown">
        <div className="mention-header">
          <AtSign size={13} aria-hidden="true" />
          <span>Mention Team Member</span>
        </div>
        <div className="mention-empty">No matching users</div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="mention-dropdown"
      role="listbox"
      aria-label="Mention a user"
    >
      <div className="mention-header">
        <AtSign size={13} aria-hidden="true" />
        <span>Mention Team Member</span>
      </div>
      <div className="mention-list">
        {filteredUsers.map((username, index) => {
          const profile = getUserProfile(username);
          const isSelected = index === selectedIndex;
          return (
            <div
              key={username}
              role="option"
              aria-selected={isSelected}
              className={`mention-item ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectUser(username)}
            >
              <div
                className="mention-avatar"
                style={{ backgroundColor: profile.color }}
              >
                {profile.initials}
              </div>
              <div className="mention-info">
                <span className="mention-name">{username}</span>
                <span className="mention-handle">@{username.toLowerCase()} &bull; {profile.role}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mention-footer">
        Use <kbd>&uarr;</kbd> <kbd>&darr;</kbd> to navigate, <kbd>Enter</kbd> to select
      </div>
    </div>
  );
}

