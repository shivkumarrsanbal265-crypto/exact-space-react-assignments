import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, AtSign } from 'lucide-react';
import { USER_LIST } from '../constants/users';
import EmojiPicker from './EmojiPicker';
import MentionsDropdown from './MentionsDropdown';

export default function ChatInput({ onSendMessage }) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionState, setMentionState] = useState({
    isOpen: false,
    query: '',
    startIndex: -1,
  });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  const inputRef = useRef(null);

  // Focus input on initial mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filtered users for mentions based on query
  const filteredUsers = USER_LIST.filter((username) =>
    username.toLowerCase().startsWith(mentionState.query.toLowerCase())
  );

  // Check text changes to detect '@' symbol for mentions
  const handleInputChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setText(value);

    // Look backward from cursor position to find if an '@' was typed
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Check if '@' is at the start or preceded by a space
      const charBeforeAt = lastAtIndex === 0 ? ' ' : textBeforeCursor[lastAtIndex - 1];
      const query = textBeforeCursor.slice(lastAtIndex + 1);

      // Only open if there are no spaces in the query and preceded by whitespace
      if (/\s/.test(charBeforeAt) && !/\s/.test(query)) {
        setMentionState({
          isOpen: true,
          query,
          startIndex: lastAtIndex,
        });
        setSelectedMentionIndex(0);
        return;
      }
    }

    if (mentionState.isOpen) {
      setMentionState({ isOpen: false, query: '', startIndex: -1 });
    }
  };

  // Insert mention into input text
  const handleSelectMention = (username) => {
    if (mentionState.startIndex === -1) return;

    const before = text.slice(0, mentionState.startIndex);
    const cursorPos = inputRef.current ? inputRef.current.selectionStart : text.length;
    const after = text.slice(cursorPos);
    const newText = `${before}@${username} ${after}`;

    setText(newText);
    setMentionState({ isOpen: false, query: '', startIndex: -1 });

    // Focus input and set cursor after inserted mention
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = before.length + username.length + 2;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  // Insert emoji at cursor position
  const handleSelectEmoji = (emoji) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setText(newText);
      const newPos = start + emoji.length;
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(newPos, newPos);
      }, 10);
    } else {
      setText((prev) => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  // Trigger @ mention manually via the @ toolbar button
  const handleTriggerMentionBtn = () => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const needsLeadingSpace = start > 0 && text[start - 1] !== ' ';
    const insertText = needsLeadingSpace ? ' @' : '@';
    const newText = text.substring(0, start) + insertText + text.substring(end);
    setText(newText);
    const newPos = start + insertText.length;
    setMentionState({
      isOpen: true,
      query: '',
      startIndex: newPos - 1,
    });
    setSelectedMentionIndex(0);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Keyboard navigation & sending
  const handleKeyDown = (e) => {
    // If mentions dropdown is active, intercept arrow keys and Enter
    if (mentionState.isOpen && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selectedUser = filteredUsers[selectedMentionIndex];
        if (selectedUser) {
          handleSelectMention(selectedUser);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionState({ isOpen: false, query: '', startIndex: -1 });
        return;
      }
    }

    // Enter key submits the message (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Send message
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setText('');
    setMentionState({ isOpen: false, query: '', startIndex: -1 });
    setShowEmojiPicker(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isSendDisabled = text.trim().length === 0;

  return (
    <div className="chat-input-wrapper">
      {/* Popovers */}
      {mentionState.isOpen && (
        <MentionsDropdown
          query={mentionState.query}
          selectedIndex={selectedMentionIndex}
          onSelectUser={handleSelectMention}
          onClose={() =>
            setMentionState({ isOpen: false, query: '', startIndex: -1 })
          }
        />
      )}

      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Main Input Container */}
      <form
        className="chat-input-container"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        role="search"
      >
        <div className="input-toolbar-left">
          <button
            type="button"
            className="action-icon-btn"
            title="Mention a team member (@)"
            aria-label="Mention a team member"
            onClick={handleTriggerMentionBtn}
          >
            <AtSign size={18} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          className="chat-text-input"
          placeholder="Type message... (Press Enter to send, type @ to mention)"
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-label="Type your message"
          autoComplete="off"
        />

        <div className="input-toolbar-right">
          <button
            type="button"
            className={`action-icon-btn ${showEmojiPicker ? 'active' : ''}`}
            title="Add emoji"
            aria-label="Add emoji"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile size={19} />
          </button>

          <button
            type="submit"
            className="chat-send-btn"
            disabled={isSendDisabled}
            aria-label="Send message"
            title={isSendDisabled ? 'Type a message to send' : 'Send message (Enter)'}
          >
            <Send size={15} />
            <span className="send-btn-label">Send</span>
          </button>
        </div>
      </form>

      <div className="input-hint-row">
        <span>
          Press <kbd>Enter</kbd> to send &bull; Type <kbd>@</kbd> to mention team members
        </span>
        <span className="hint-sub">Random username assigned on send</span>
      </div>
    </div>
  );
}

