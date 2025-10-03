import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export default function MentionTextarea({
  value,
  onChange,
  onFocus,
  placeholder,
  rows = 4,
  className = '',
  disabled = false,
}: MentionTextareaProps) {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (mentionQuery.length > 0) {
      // Debounce the search
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        try {
          const users = await api.searchUsers(mentionQuery);
          setSuggestions(users);
          setShowSuggestions(users.length > 0);
          setSelectedIndex(0);
        } catch (error) {
          console.error('Failed to search users:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      clearTimeout(debounceTimer.current);
    };
  }, [mentionQuery]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;

    onChange(newValue);
    setCursorPosition(newCursorPosition);

    // Check if we're typing a mention
    const textBeforeCursor = newValue.substring(0, newCursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);

      // Check if there's a space after the @ (which means we're not mentioning anymore)
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt);
        return;
      }
    }

    // No active mention
    setMentionQuery('');
    setShowSuggestions(false);
  };

  const insertMention = (user: User) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      const beforeMention = textBeforeCursor.substring(0, lastAtSymbol);
      const mention = `@${user.username} `;
      const newValue = beforeMention + mention + textAfterCursor;
      const newCursorPosition = (beforeMention + mention).length;

      onChange(newValue);
      setShowSuggestions(false);
      setMentionQuery('');

      // Set cursor position after the mention
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setMentionQuery('');
      }
    }
  };

  // Get textarea position for positioning suggestions
  const getCaretCoordinates = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };

    const textBeforeCursor = value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLineNumber = lines.length - 1;

    // Approximate position (this is simplified - for production you might want a library)
    const lineHeight = 24; // Approximate line height
    const top = (currentLineNumber + 1) * lineHeight;

    return { top, left: 0 };
  };

  const caretPos = getCaretCoordinates();

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
        rows={rows}
        className={className}
        disabled={disabled}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{
            top: `${caretPos.top}px`,
            left: `${caretPos.left}px`,
            minWidth: '250px',
          }}
        >
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-gray-100' : ''
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <img
                src={
                  user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${user.displayName || user.username}&size=32&background=ea580c&color=fff`
                }
                alt={user.displayName || user.username}
                className="h-8 w-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName || user.username}
                  </p>
                  {user.isVerified && (
                    <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-600">@{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
