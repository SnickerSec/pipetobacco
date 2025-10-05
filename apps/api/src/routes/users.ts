import { Router } from 'express';
import * as db from '@ember-society/database';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

const router = Router();
const prisma = db.prisma;

// Search users by username or display name
router.get('/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const searchTerm = q.toLowerCase();

    // Search for users by username or display name
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { displayName: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isVerified: true,
      },
      take: 10,
      orderBy: {
        username: 'asc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        location: true,
        website: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        isVerified: true,
        defaultClubId: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update current user profile
router.patch('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { displayName, bio, location, website, avatarUrl, coverPhotoUrl, defaultClubId } = req.body;

    // If defaultClubId is being set, verify user is a member of that club
    if (defaultClubId !== undefined && defaultClubId !== null) {
      const membership = await prisma.clubMember.findFirst({
        where: {
          userId: req.user!.userId,
          clubId: defaultClubId,
        },
      });

      if (!membership) {
        return res.status(400).json({ error: 'You must be a member of the club to set it as default' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(coverPhotoUrl !== undefined && { coverPhotoUrl }),
        ...(defaultClubId !== undefined && { defaultClubId }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        location: true,
        website: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        isVerified: true,
        defaultClubId: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user profile by username
router.get('/:username', authenticate, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        location: true,
        website: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user is following this profile
    const followRelation = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id,
        },
      },
    });

    res.json({
      ...user,
      isFollowing: !!followRelation,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user's posts
router.get('/:username/posts', authenticate, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Follow a user
router.post('/:username/follow', authenticate, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user!.userId;

    const userToFollow = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, displayName: true },
    });

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToFollow.id === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Get follower info for notification
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { username: true, displayName: true },
    });

    await prisma.follow.create({
      data: {
        followerId,
        followingId: userToFollow.id,
      },
    });

    // Send notification to the user being followed
    if (follower) {
      createNotification({
        userId: userToFollow.id,
        type: 'NEW_FOLLOWER',
        title: 'New follower',
        message: `${follower.displayName || follower.username} started following you`,
        linkUrl: `/u/${follower.username}`,
      }).catch((err) => console.error('Error sending notification:', err));
    }

    res.json({ message: 'Successfully followed user' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already following this user' });
    }
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/:username/follow', authenticate, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user!.userId;

    const userToUnfollow = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userToUnfollow.id,
        },
      },
    });

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get user's followers
router.get('/:username/followers', authenticate, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
          },
        },
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(followers.map(f => f.follower));
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get users being followed
router.get('/:username/following', authenticate, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
          },
        },
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(following.map(f => f.following));
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

export default router;
