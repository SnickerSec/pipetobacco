import { Router } from 'express';
import * as db from '@ember-society/database';
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth.js';
import * as dailyService from '../services/dailyService.js';

const prisma = db.prisma;
const router = Router();

/**
 * Create a new herf session
 * POST /api/herf/sessions
 */
router.post('/sessions', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { title, description, scheduledFor, maxParticipants = 8, isPrivate = false, clubId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // If clubId provided, verify user is a member
    if (clubId) {
      const membership = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: { clubId, userId },
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a member of this club' });
      }
    }

    // Create the session
    const session = await prisma.herfSession.create({
      data: {
        title,
        description,
        hostId: userId,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        maxParticipants: Math.min(maxParticipants, 20), // Cap at 20
        isPrivate,
        clubId,
        status: 'SCHEDULED',
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Create herf session error:', error);
    res.status(500).json({ error: 'Failed to create herf session' });
  }
});

/**
 * Get all herf sessions (with optional filters)
 * GET /api/herf/sessions
 */
router.get('/sessions', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { status, clubId, upcoming } = req.query;
    const userId = req.user?.userId;

    const where: any = {};

    // Only show public sessions to non-authenticated users
    if (!userId) {
      where.isPrivate = false;
    } else {
      // For authenticated users, show public sessions + private sessions they host/participate in
      where.OR = [
        { isPrivate: false },
        { hostId: userId },
        { participants: { some: { userId } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (clubId) {
      where.clubId = clubId;
    }

    if (upcoming === 'true') {
      where.status = { in: ['SCHEDULED', 'LIVE'] };
      where.OR = [
        { scheduledFor: { gte: new Date() } },
        { scheduledFor: null, status: 'LIVE' },
      ];
    }

    const sessions = await prisma.herfSession.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        participants: {
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
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: [{ scheduledFor: 'asc' }, { createdAt: 'desc' }],
      take: 50,
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get herf sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch herf sessions' });
  }
});

/**
 * Get a specific herf session
 * GET /api/herf/sessions/:id
 */
router.get('/sessions/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const session = await prisma.herfSession.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        participants: {
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
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Herf session not found' });
    }

    // Check if user can view private session
    if (session.isPrivate && userId) {
      const canView =
        session.hostId === userId ||
        session.participants.some((p) => p.userId === userId) ||
        (session.clubId &&
          (await prisma.clubMember.findUnique({
            where: {
              clubId_userId: { clubId: session.clubId, userId },
            },
          })));

      if (!canView) {
        return res.status(403).json({ error: 'You do not have access to this session' });
      }
    } else if (session.isPrivate) {
      return res.status(403).json({ error: 'This is a private session' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get herf session error:', error);
    res.status(500).json({ error: 'Failed to fetch herf session' });
  }
});

/**
 * Start a herf session (creates Daily.co room)
 * POST /api/herf/sessions/:id/start
 */
router.post('/sessions/:id/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const session = await prisma.herfSession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Herf session not found' });
    }

    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can start the session' });
    }

    if (session.status !== 'SCHEDULED') {
      return res.status(400).json({ error: 'Session has already started or ended' });
    }

    // Create Daily.co room
    const { roomName, roomUrl } = await dailyService.createRoom({
      sessionId: id,
      maxParticipants: session.maxParticipants,
      isPrivate: session.isPrivate,
    });

    // Update session
    const updatedSession = await prisma.herfSession.update({
      where: { id },
      data: {
        status: 'LIVE',
        startedAt: new Date(),
        roomUrl,
        roomName,
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('Start herf session error:', error);
    res.status(500).json({ error: 'Failed to start herf session' });
  }
});

/**
 * Join a herf session (get meeting token)
 * POST /api/herf/sessions/:id/join
 */
router.post('/sessions/:id/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const session = await prisma.herfSession.findUnique({
      where: { id },
      include: {
        participants: true,
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Herf session not found' });
    }

    if (session.status !== 'LIVE') {
      return res.status(400).json({ error: 'Session is not currently live' });
    }

    // Check capacity
    if (session.participants.length >= session.maxParticipants && session.hostId !== userId) {
      return res.status(400).json({ error: 'Session is at full capacity' });
    }

    // Check access for private sessions
    if (session.isPrivate) {
      const hasAccess =
        session.hostId === userId ||
        session.participants.some((p) => p.userId === userId) ||
        (session.clubId &&
          (await prisma.clubMember.findUnique({
            where: {
              clubId_userId: { clubId: session.clubId, userId },
            },
          })));

      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this session' });
      }
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create meeting token
    const token = await dailyService.createMeetingToken(
      session.roomName!,
      userId,
      user.displayName || user.username,
      session.hostId === userId
    );

    // Add participant record
    await prisma.herfParticipant.upsert({
      where: {
        sessionId_userId: { sessionId: id, userId },
      },
      create: {
        sessionId: id,
        userId,
      },
      update: {
        leftAt: null,
      },
    });

    res.json({
      token,
      roomUrl: session.roomUrl,
      sessionId: id,
      isHost: session.hostId === userId,
    });
  } catch (error) {
    console.error('Join herf session error:', error);
    res.status(500).json({ error: 'Failed to join herf session' });
  }
});

/**
 * Leave a herf session
 * POST /api/herf/sessions/:id/leave
 */
router.post('/sessions/:id/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const participant = await prisma.herfParticipant.findUnique({
      where: {
        sessionId_userId: { sessionId: id, userId },
      },
    });

    if (participant) {
      await prisma.herfParticipant.update({
        where: {
          sessionId_userId: { sessionId: id, userId },
        },
        data: {
          leftAt: new Date(),
        },
      });
    }

    res.json({ message: 'Left session successfully' });
  } catch (error) {
    console.error('Leave herf session error:', error);
    res.status(500).json({ error: 'Failed to leave herf session' });
  }
});

/**
 * End a herf session (host only)
 * POST /api/herf/sessions/:id/end
 */
router.post('/sessions/:id/end', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const session = await prisma.herfSession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Herf session not found' });
    }

    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can end the session' });
    }

    if (session.status !== 'LIVE') {
      return res.status(400).json({ error: 'Session is not currently live' });
    }

    // Delete Daily.co room
    if (session.roomName) {
      await dailyService.endMeeting(session.roomName);
    }

    // Update session
    const updatedSession = await prisma.herfSession.update({
      where: { id },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('End herf session error:', error);
    res.status(500).json({ error: 'Failed to end herf session' });
  }
});

/**
 * Cancel a herf session (host only)
 * DELETE /api/herf/sessions/:id
 */
router.delete('/sessions/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const session = await prisma.herfSession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Herf session not found' });
    }

    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can cancel the session' });
    }

    // Delete Daily.co room if it exists
    if (session.roomName && session.status === 'LIVE') {
      await dailyService.deleteRoom(session.roomName);
    }

    // Update status to cancelled
    await prisma.herfSession.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    res.json({ message: 'Session cancelled successfully' });
  } catch (error) {
    console.error('Cancel herf session error:', error);
    res.status(500).json({ error: 'Failed to cancel herf session' });
  }
});

/**
 * Get chat messages for a session
 * GET /api/herf/sessions/:id/messages
 */
router.get('/sessions/:id/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify user has access to this session
    const session = await prisma.herfSession.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Herf session not found' });
    }

    const hasAccess =
      session.hostId === userId || session.participants.some((p) => p.userId === userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this session' });
    }

    const messages = await prisma.herfChatMessage.findMany({
      where: { sessionId: id },
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

    res.json(messages);
  } catch (error) {
    console.error('Get herf messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
