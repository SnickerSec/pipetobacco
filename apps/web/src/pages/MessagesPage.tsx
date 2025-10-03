import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { renderTextWithMentions } from '../utils/mentions';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}

interface Conversation {
  id: string;
  type?: 'DIRECT' | 'GROUP';
  messages: Message[];
  otherParticipant?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  club?: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
  };
  unreadCount?: number;
  lastMessageAt: string;
}

export default function MessagesPage() {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load current user
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Load conversations list
  useEffect(() => {
    loadConversations();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Load specific conversation when username changes
  useEffect(() => {
    if (username) {
      loadConversation(username);
    } else {
      setCurrentConversation(null);
    }
  }, [username]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (username: string) => {
    setError(null);
    try {
      const data = await api.getConversation(username);
      setCurrentConversation(data);

      // Mark as read
      if (data.id) {
        await api.markConversationRead(data.id);
        // Update conversations list to reflect read status
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === data.id ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      setError(`User "${username}" not found. Please check the username and try again.`);
      setCurrentConversation(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !username) return;

    setIsSending(true);
    try {
      const message = await api.sendMessage(username, newMessage);

      // Add message to current conversation
      if (currentConversation) {
        setCurrentConversation({
          ...currentConversation,
          messages: [...currentConversation.messages, message],
        });
      }

      setNewMessage('');

      // Reload conversations to update the list
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleStartConversation = (username: string) => {
    setShowNewMessageModal(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/messages/${username}`);
  };

  // Search users as the user types
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await api.searchUsers(searchQuery);
        // Filter out the current user from search results
        const filteredResults = currentUser
          ? results.filter((user) => user.id !== currentUser.id)
          : results;
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentUser]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Conversations List - Hidden on mobile when viewing a conversation */}
      <div className={`w-full md:w-80 border-r border-gray-200 bg-white overflow-y-auto ${
        username ? 'hidden md:block' : 'block'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="New Message"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Send a message to start a conversation</p>
          </div>
        ) : (
          <div>
            {conversations.map((conv) => {
              // Handle GROUP conversations (clubs)
              if (conv.type === 'GROUP' && conv.club) {
                return (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/clubs/${conv.club!.slug}/messages`)}
                    className="w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          conv.club.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${conv.club.name}`
                        }
                        alt={conv.club.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conv.club.name}
                          </p>
                          {conv.messages.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {formatTime(conv.messages[0].createdAt)}
                            </span>
                          )}
                        </div>
                        {conv.messages.length > 0 && (
                          <p className="text-sm text-gray-500 truncate">
                            {conv.messages[0].sender?.displayName || conv.messages[0].sender?.username}: {conv.messages[0].content}
                          </p>
                        )}
                      </div>
                      {(conv.unreadCount || 0) > 0 && (
                        <div className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                );
              }

              // Handle DIRECT conversations
              if (conv.otherParticipant) {
                return (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/messages/${conv.otherParticipant!.username}`)}
                    className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                      username === conv.otherParticipant.username ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          conv.otherParticipant.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${conv.otherParticipant.displayName || conv.otherParticipant.username}`
                        }
                        alt={conv.otherParticipant.username}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conv.otherParticipant.displayName || conv.otherParticipant.username}
                          </p>
                          {conv.messages.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {formatTime(conv.messages[0].createdAt)}
                            </span>
                          )}
                        </div>
                        {conv.messages.length > 0 && (
                          <p className="text-sm text-gray-500 truncate">
                            {conv.messages[0].content}
                          </p>
                        )}
                      </div>
                      {(conv.unreadCount || 0) > 0 && (
                        <div className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>

      {/* Chat Area - Full width on mobile when viewing a conversation */}
      <div className={`flex-1 flex flex-col bg-gray-50 ${
        !username ? 'hidden md:flex' : 'flex'
      }`}>
        {error ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center max-w-md mx-4">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  navigate('/messages');
                }}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Back to Messages
              </button>
            </div>
          </div>
        ) : !currentConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="mt-2 text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                {/* Back button - only on mobile */}
                <button
                  onClick={() => navigate('/messages')}
                  className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <img
                  src={
                    currentConversation.otherParticipant.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${currentConversation.otherParticipant.displayName || currentConversation.otherParticipant.username}`
                  }
                  alt={currentConversation.otherParticipant.username}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {currentConversation.otherParticipant.displayName ||
                      currentConversation.otherParticipant.username}
                  </h3>
                  <p className="text-xs text-gray-500">
                    @{currentConversation.otherParticipant.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                currentConversation.messages.map((message, index) => {
                  const isCurrentUser = message.sender.id === message.senderId;
                  const showAvatar =
                    index === 0 ||
                    currentConversation.messages[index - 1].senderId !== message.senderId;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && showAvatar && (
                        <img
                          src={
                            message.sender.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${message.sender.displayName || message.sender.username}`
                          }
                          alt={message.sender.username}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                      )}
                      {!isCurrentUser && !showAvatar && <div className="w-8 mr-2" />}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {renderTextWithMentions(message.content)}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-orange-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
                <button
                  onClick={() => {
                    setShowNewMessageModal(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Search for a user to start a conversation
              </p>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />

              {/* Search Results */}
              <div className="mt-4 max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="text-center py-4 text-gray-500">Searching...</div>
                ) : searchQuery.length > 0 && searchQuery.length < 2 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Type at least 2 characters to search
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleStartConversation(user.username)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <img
                          src={
                            user.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${user.displayName || user.username}`
                          }
                          alt={user.username}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center space-x-1">
                            <p className="text-sm font-medium text-gray-900">
                              {user.displayName || user.username}
                            </p>
                            {user.isVerified && (
                              <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No users found
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewMessageModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
