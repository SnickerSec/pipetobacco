import { useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { io, Socket } from 'socket.io-client';
import { HerfChatMessage } from '../../services/herfService';

interface HerfSessionProps {
  sessionId: string;
  roomUrl: string;
  token: string;
  meetingToken: string;
  isHost: boolean;
  onLeave: () => void;
}

export default function HerfSession({
  sessionId,
  roomUrl,
  token,
  meetingToken,
  isHost,
  onLeave,
}: HerfSessionProps) {
  const callFrameRef = useRef<DailyCall | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [chatMessages, setChatMessages] = useState<HerfChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<{ [key: string]: string }>({});
  const [showChat, setShowChat] = useState(true);

  // Initialize Daily.co video call
  useEffect(() => {
    if (!videoContainerRef.current) return;

    const callFrame = DailyIframe.createFrame(videoContainerRef.current, {
      showLeaveButton: true,
      showFullscreenButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '8px',
      },
    });

    callFrame.join({ url: roomUrl, token: meetingToken });

    callFrame.on('left-meeting', () => {
      onLeave();
    });

    callFrame.on('error', (error) => {
      console.error('Daily.co error:', error);
    });

    callFrameRef.current = callFrame;

    return () => {
      callFrame.destroy();
    };
  }, [roomUrl, meetingToken, onLeave]);

  // Initialize Socket.io for chat
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    const socket = io(`${SOCKET_URL}/herf`, {
      auth: {
        token,
      },
    });

    socket.on('connect', () => {
      console.log('Connected to herf socket');
      socket.emit('join-session', { sessionId });
    });

    socket.on('chat-history', (messages: HerfChatMessage[]) => {
      setChatMessages(messages);
    });

    socket.on('new-message', (message: HerfChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    socket.on('user-joined', (data: any) => {
      console.log('User joined:', data.user.displayName);
    });

    socket.on('user-left', (data: any) => {
      console.log('User left:', data.user.displayName);
    });

    socket.on('user-typing', (data: { userId: string; username: string }) => {
      setIsTyping((prev) => ({ ...prev, [data.userId]: data.username }));
      setTimeout(() => {
        setIsTyping((prev) => {
          const newTyping = { ...prev };
          delete newTyping[data.userId];
          return newTyping;
        });
      }, 3000);
    });

    socket.on('user-stop-typing', (data: { userId: string }) => {
      setIsTyping((prev) => {
        const newTyping = { ...prev };
        delete newTyping[data.userId];
        return newTyping;
      });
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave-session', { sessionId });
      socket.disconnect();
    };
  }, [sessionId, token]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.emit('chat-message', {
      sessionId,
      message: newMessage.trim(),
    });

    setNewMessage('');
    socketRef.current.emit('stop-typing', { sessionId });
  };

  const handleTyping = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { sessionId });
  };

  const typingUsers = Object.values(isTyping);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Video Section */}
      <div className={`flex-1 ${showChat ? '' : 'w-full'}`}>
        <div
          ref={videoContainerRef}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Chat Section */}
      {showChat && (
        <div className="w-96 bg-gray-800 flex flex-col border-l border-gray-700">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-white font-semibold">Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((message) => (
              <div key={message.id} className="flex flex-col">
                <div className="flex items-start space-x-2">
                  {message.user.avatarUrl ? (
                    <img
                      src={message.user.avatarUrl}
                      alt={message.user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-sm font-semibold">
                      {message.user.displayName[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium text-sm">
                        {message.user.displayName}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2 text-gray-400 text-sm italic">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleTyping}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Show Chat Button (when chat is hidden) */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-4 right-4 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
