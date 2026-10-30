import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { EMOJI_CATEGORIES, EMOJI_LIST } from '../constants/emojis';

export default function EmojiPicker({ onSelectEmoji, onClose }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const pickerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter emojis based on category and search
  const filteredEmojis = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return EMOJI_LIST.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = !q || item.name.includes(q) || item.emoji.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div
      ref={pickerRef}
      className="emoji-picker-popover"
      role="dialog"
      aria-label="Emoji Picker"
    >
      <div className="emoji-picker-header">
        <div className="emoji-search-wrapper">
          <Search size={14} className="search-icon" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            className="emoji-search-input"
            placeholder="Search emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search emojis"
          />
        </div>
        <button
          type="button"
          className="emoji-close-btn"
          onClick={onClose}
          aria-label="Close emoji picker"
        >
          <X size={16} />
        </button>
      </div>

      <div className="emoji-tabs" role="tablist">
        {EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`emoji-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="emoji-grid-container">
        {filteredEmojis.length > 0 ? (
          <div className="emoji-grid" role="listbox">
            {filteredEmojis.map((item, idx) => (
              <button
                key={`${item.emoji}-${idx}`}
                type="button"
                className="emoji-item"
                title={item.name}
                aria-label={item.name}
                onClick={() => onSelectEmoji(item.emoji)}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="emoji-empty">No emojis found</div>
        )}
      </div>
    </div>
  );
}

