import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as db from '@ember-society/database';
import jwt from 'jsonwebtoken';

const prisma = db.prisma;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthSocket extends Socket {
  userId?: string;
  username?: string;
}

interface JoinSessionData {
  sessionId: string;
}

interface ChatMessageData {
  sessionId: string;
  message: string;
}

/**
 * Initialize Socket.io for herf sessions
 */
export function initializeHerfSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      socket.userId = decoded.userId;
      socket.username = decoded.username;

      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  // Herf namespace
  const herfNamespace = io.of('/herf');

  herfNamespace.on('connection', (socket: AuthSocket) => {
    console.log(`User ${socket.username} connected to herf namespace`);

    // Join a herf session
    socket.on('join-session', async (data: JoinSessionData) => {
      try {
        const { sessionId } = data;

        // Verify user has access to this session
        const session = await prisma.herfSession.findUnique({
          where: { id: sessionId },
          include: {
            participants: true,
          },
        });

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        const hasAccess =
          session.hostId === socket.userId ||
          session.participants.some((p) => p.userId === socket.userId);

        if (!hasAccess && session.isPrivate) {
          // Check if user is in the club
          if (session.clubId) {
            const membership = await prisma.clubMember.findUnique({
              where: {
                clubId_userId: { clubId: session.clubId, userId: socket.userId! },
              },
            });

            if (!membership) {
              socket.emit('error', { message: 'Access denied' });
              return;
            }
          } else {
            socket.emit('error', { message: 'Access denied' });
            return;
          }
        }

        // Join the room
        socket.join(`session:${sessionId}`);

        // Get user info
        const user = await prisma.user.findUnique({
          where: { id: socket.userId! },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        });

        // Notify others in the session
        socket.to(`session:${sessionId}`).emit('user-joined', {
          user,
          timestamp: new Date(),
        });

        // Send existing messages to the user
        const messages = await prisma.herfChatMessage.findMany({
          where: { sessionId },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 100,
        });

        socket.emit('chat-history', messages);

        console.log(`User ${socket.username} joined session ${sessionId}`);
      } catch (error) {
        console.error('Join session error:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Leave a herf session
    socket.on('leave-session', async (data: JoinSessionData) => {
      try {
        const { sessionId } = data;
        socket.leave(`session:${sessionId}`);

        const user = await prisma.user.findUnique({
          where: { id: socket.userId! },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        });

        // Notify others in the session
        socket.to(`session:${sessionId}`).emit('user-left', {
          user,
          timestamp: new Date(),
        });

        console.log(`User ${socket.username} left session ${sessionId}`);
      } catch (error) {
        console.error('Leave session error:', error);
      }
    });

    // Send a chat message
    socket.on('chat-message', async (data: ChatMessageData) => {
      try {
        const { sessionId, message } = data;

        if (!message || message.trim().length === 0) {
          return;
        }

        // Verify user is in the session room
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(`session:${sessionId}`)) {
          socket.emit('error', { message: 'You must join the session first' });
          return;
        }

        // Save message to database
        const chatMessage = await prisma.herfChatMessage.create({
          data: {
            sessionId,
            userId: socket.userId!,
            message: message.trim(),
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        });

        // Broadcast to all users in the session (including sender)
        herfNamespace.to(`session:${sessionId}`).emit('new-message', chatMessage);

        console.log(`Message sent in session ${sessionId} by ${socket.username}`);
      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // User is typing indicator
    socket.on('typing', (data: JoinSessionData) => {
      const { sessionId } = data;
      socket.to(`session:${sessionId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
      });
    });

    // User stopped typing
    socket.on('stop-typing', (data: JoinSessionData) => {
      const { sessionId } = data;
      socket.to(`session:${sessionId}`).emit('user-stop-typing', {
        userId: socket.userId,
        username: socket.username,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected from herf namespace`);
    });
  });

  return io;
}
