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

    // Find all conversations where user is a participant (direct or group)
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
          {
            participants: {
              some: { userId }
            }
          }
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
        // Handle GROUP conversations (clubs)
        if (conv.type === 'GROUP' && conv.clubId) {
          const club = await prisma.club.findUnique({
            where: { id: conv.clubId },
            select: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
            },
          });

          // Count unread messages for group
          const participant = await prisma.conversationParticipant.findUnique({
            where: {
              conversationId_userId: {
                conversationId: conv.id,
                userId,
              },
            },
          });

          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: userId },
              createdAt: participant?.lastReadAt
                ? { gt: participant.lastReadAt }
                : undefined,
            },
          });

          return {
            ...conv,
            club,
            unreadCount,
          };
        }

        // Handle DIRECT conversations
        const otherParticipantId =
          conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;

        const otherParticipant = await prisma.user.findUnique({
          where: { id: otherParticipantId! },
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

// Get or create club conversation
router.get('/clubs/:slug/conversation', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { slug } = req.params;

    // Find the club
    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Check if user is a member
    if (club.members.length === 0) {
      return res.status(403).json({ error: 'You must be a member to access club messages' });
    }

    // Try to find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: 'GROUP',
        clubId: club.id,
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
          type: 'GROUP',
          clubId: club.id,
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

      // Add all club members as participants
      const members = await prisma.clubMember.findMany({
        where: { clubId: club.id },
        select: { userId: true },
      });

      await prisma.conversationParticipant.createMany({
        data: members.map((member) => ({
          conversationId: conversation!.id,
          userId: member.userId,
        })),
      });
    } else {
      // Ensure current user is a participant (in case they joined after conversation was created)
      const existingParticipant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: conversation.id,
            userId,
          },
        },
      });

      if (!existingParticipant) {
        await prisma.conversationParticipant.create({
          data: {
            conversationId: conversation.id,
            userId,
          },
        });
      }
    }

    res.json({
      ...conversation,
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug,
        avatarUrl: club.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching club conversation:', error);
    res.status(500).json({ error: 'Failed to fetch club conversation' });
  }
});

// Send message to club
router.post('/clubs/:slug/conversation/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { slug } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Find the club
    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Check if user is a member
    if (club.members.length === 0) {
      return res.status(403).json({ error: 'You must be a member to send messages' });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: 'GROUP',
        clubId: club.id,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: 'GROUP',
          clubId: club.id,
        },
      });

      // Add all club members as participants
      const members = await prisma.clubMember.findMany({
        where: { clubId: club.id },
        select: { userId: true },
      });

      await prisma.conversationParticipant.createMany({
        data: members.map((member) => ({
          conversationId: conversation!.id,
          userId: member.userId,
        })),
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        conversationId: conversation.id,
        senderId: userId,
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

    // Send notifications to all members except sender
    const members = await prisma.clubMember.findMany({
      where: {
        clubId: club.id,
        userId: { not: userId },
      },
      select: { userId: true },
    });

    const notificationPromises = members.map((member) =>
      createNotification({
        userId: member.userId,
        type: 'NEW_MESSAGE',
        title: `New message in ${club.name}`,
        message: `${message.sender.displayName || message.sender.username} sent a message`,
        linkUrl: `/clubs/${slug}/messages`,
      }).catch((err) => console.error('Error sending notification:', err))
    );

    await Promise.all(notificationPromises);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending club message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark club messages as read
router.post('/clubs/:slug/conversation/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { slug } = req.params;

    // Find the club
    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    if (club.members.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Find conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        type: 'GROUP',
        clubId: club.id,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Update participant's lastReadAt
    await prisma.conversationParticipant.upsert({
      where: {
        conversationId_userId: {
          conversationId: conversation.id,
          userId,
        },
      },
      update: {
        lastReadAt: new Date(),
      },
      create: {
        conversationId: conversation.id,
        userId,
        lastReadAt: new Date(),
      },
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking club messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router;
