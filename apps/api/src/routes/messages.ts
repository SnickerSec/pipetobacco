import { Router } from 'express';
import * as db from '@ember-society/database';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

const router = Router();
const prisma = db.prisma;

// Get all conversations for the authenticated user
router.get('/conversations', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Find all conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get last message
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isVerified: true,
              },
            },
            receiver: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Get the other participant's details for each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipantId =
          conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;

        const otherParticipant = await prisma.user.findUnique({
          where: { id: otherParticipantId },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        });

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            isRead: false,
          },
        });

        return {
          ...conv,
          otherParticipant,
          unreadCount,
        };
      })
    );

    res.json(conversationsWithParticipants);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get or create a conversation with another user
router.get('/conversations/:username', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { username } = req.params;

    // Find the other user
    const otherUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isVerified: true,
      },
    });

    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (otherUser.id === userId) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    // Try to find existing conversation (order-independent)
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: otherUser.id },
          { participant1Id: otherUser.id, participant2Id: userId },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: otherUser.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                  isVerified: true,
                },
              },
            },
          },
        },
      });
    }

    res.json({
      ...conversation,
      otherParticipant: otherUser,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Send a message
router.post('/conversations/:username/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { username } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Find the other user
    const otherUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (otherUser.id === userId) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: otherUser.id },
          { participant1Id: otherUser.id, participant2Id: userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: otherUser.id,
        },
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        conversationId: conversation.id,
        senderId: userId,
        receiverId: otherUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Send notification to receiver
    createNotification({
      userId: otherUser.id,
      type: 'NEW_MESSAGE',
      title: 'New message',
      message: `${message.sender.displayName || message.sender.username} sent you a message`,
      linkUrl: `/messages/${message.sender.username}`,
    }).catch((err) => console.error('Error sending notification:', err));

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.post('/conversations/:conversationId/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Mark all messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router;
