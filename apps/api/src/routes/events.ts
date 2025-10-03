import { Router } from 'express';
import * as db from '@ember-society/database';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = db.prisma;

// Get all events for a club
router.get('/clubs/:slug/events', async (req, res) => {
  try {
    const { slug } = req.params;

    const club = await prisma.club.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    const events = await prisma.event.findMany({
      where: { clubId: club.id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        rsvps: {
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
            rsvps: {
              where: {
                status: 'GOING',
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get a single event
router.get('/events/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        rsvps: {
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
            rsvps: {
              where: {
                status: 'GOING',
              },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create an event (must be club member)
router.post('/clubs/:slug/events', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user!.userId;
    const { title, description, location, startTime, endTime, isPublic } = req.body;

    // Validate required fields
    if (!title || !startTime) {
      return res.status(400).json({ error: 'Title and start time are required' });
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

    // Check if user is a member of the club
    if (club.members.length === 0) {
      return res.status(403).json({ error: 'You must be a member of this club to create events' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        isPublic: isPublic !== undefined ? isPublic : true,
        clubId: club.id,
        creatorId: userId,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            rsvps: {
              where: {
                status: 'GOING',
              },
            },
          },
        },
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update an event (must be creator or club admin)
router.patch('/events/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { title, description, location, startTime, endTime, isPublic } = req.body;

    // Find the event with creator and club info
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        club: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or a club admin/owner
    const membership = event.club.members[0];
    const isCreator = event.creatorId === userId;
    const isAdmin = membership && ['ADMIN', 'OWNER'].includes(membership.role);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to edit this event' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: endTime ? new Date(endTime) : null }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            rsvps: {
              where: {
                status: 'GOING',
              },
            },
          },
        },
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete an event (must be creator or club admin)
router.delete('/events/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Find the event with creator and club info
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        club: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or a club admin/owner
    const membership = event.club.members[0];
    const isCreator = event.creatorId === userId;
    const isAdmin = membership && ['ADMIN', 'OWNER'].includes(membership.role);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this event' });
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// RSVP to an event
router.post('/events/:id/rsvp', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { status } = req.body;

    if (!status || !['GOING', 'MAYBE', 'NOT_GOING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid RSVP status' });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Create or update RSVP
    const rsvp = await prisma.eventRSVP.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
      create: {
        eventId: id,
        userId,
        status,
      },
      update: {
        status,
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

    res.json(rsvp);
  } catch (error: any) {
    console.error('Error creating RSVP:', error);
    res.status(500).json({ error: 'Failed to create RSVP' });
  }
});

// Remove RSVP
router.delete('/events/:id/rsvp', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await prisma.eventRSVP.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    res.json({ message: 'RSVP removed successfully' });
  } catch (error) {
    console.error('Error removing RSVP:', error);
    res.status(500).json({ error: 'Failed to remove RSVP' });
  }
});

// Get user's RSVP for an event
router.get('/events/:id/rsvp/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const rsvp = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    res.json(rsvp);
  } catch (error) {
    console.error('Error fetching RSVP:', error);
    res.status(500).json({ error: 'Failed to fetch RSVP' });
  }
});

export default router;
