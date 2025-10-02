import { Router } from 'express';
import * as db from '@ember-society/database';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = db.prisma;

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ error: 'VAPID public key not configured' });
  }
  res.json({ publicKey });
});

// Get user's notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { limit = '20', offset = '0' } = req.query;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Get notification preferences
router.get('/preferences', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update notification preferences
router.patch('/preferences', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const {
      pushEnabled,
      newFollower,
      newPostInClub,
      newComment,
      newReply,
      postMention,
      eventReminder,
      clubInvite,
      newMessage,
    } = req.body;

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        pushEnabled,
        newFollower,
        newPostInClub,
        newComment,
        newReply,
        postMention,
        eventReminder,
        clubInvite,
        newMessage,
      },
      update: {
        ...(pushEnabled !== undefined && { pushEnabled }),
        ...(newFollower !== undefined && { newFollower }),
        ...(newPostInClub !== undefined && { newPostInClub }),
        ...(newComment !== undefined && { newComment }),
        ...(newReply !== undefined && { newReply }),
        ...(postMention !== undefined && { postMention }),
        ...(eventReminder !== undefined && { eventReminder }),
        ...(clubInvite !== undefined && { clubInvite }),
        ...(newMessage !== undefined && { newMessage }),
      },
    });

    res.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Subscribe to push notifications
router.post('/push/subscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { endpoint, keys, userAgent } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      return res.json({ message: 'Already subscribed' });
    }

    await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
    });

    res.json({ message: 'Successfully subscribed to push notifications' });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from push notifications
router.post('/push/unsubscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });

    res.json({ message: 'Successfully unsubscribed from push notifications' });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

export default router;
