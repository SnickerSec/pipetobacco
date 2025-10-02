import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';
import { createNotification } from '../services/notificationService.js';

const router = Router();
const prisma = new PrismaClient();

// Get all clubs (public and user's private clubs)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    const clubs = await prisma.club.findMany({
      where: userId ? {
        OR: [
          { isPrivate: false },
          { members: { some: { userId } } },
        ],
      } : { isPrivate: false },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// Get single club by slug
router.get('/:slug', async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.userId;

    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isVerified: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Check if private club and user is not a member
    if (club.isPrivate) {
      const isMember = club.members.some(m => m.userId === userId);
      if (!isMember) {
        return res.status(403).json({ error: 'This club is private' });
      }
    }

    // Add user membership info if authenticated
    const userMembership = userId
      ? club.members.find(m => m.userId === userId)
      : null;

    res.json({
      ...club,
      userMembership: userMembership || null,
    });
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ error: 'Failed to fetch club' });
  }
});

// Create a new club
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, slug, description, isPrivate, avatarUrl, coverUrl } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    // Check if slug is already taken
    const existing = await prisma.club.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'This slug is already taken' });
    }

    // Create club and add creator as owner in a transaction
    const club = await prisma.$transaction(async (tx) => {
      const newClub = await tx.club.create({
        data: {
          name,
          slug,
          description,
          isPrivate: isPrivate || false,
          avatarUrl,
          coverUrl,
          creatorId: userId,
          memberCount: 1,
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              members: true,
              posts: true,
            },
          },
        },
      });

      // Add creator as owner member
      await tx.clubMember.create({
        data: {
          clubId: newClub.id,
          userId,
          role: 'OWNER',
        },
      });

      return newClub;
    });

    res.status(201).json(club);
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ error: 'Failed to create club' });
  }
});

// Update club
router.patch('/:slug', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const { name, description, isPrivate, avatarUrl, coverUrl } = req.body;
    const userId = req.user!.userId;

    // Check if user is owner or admin
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

    const membership = club.members[0];
    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only club owners and admins can update club settings' });
    }

    // Update club
    const updatedClub = await prisma.club.update({
      where: { slug },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(coverUrl !== undefined && { coverUrl }),
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    res.json(updatedClub);
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ error: 'Failed to update club' });
  }
});

// Delete club
router.delete('/:slug', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user!.userId;

    // Check if user is owner
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

    const membership = club.members[0];
    if (!membership || membership.role !== 'OWNER') {
      return res.status(403).json({ error: 'Only the club owner can delete the club' });
    }

    await prisma.club.delete({ where: { slug } });

    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ error: 'Failed to delete club' });
  }
});

// Join a club
router.post('/:slug/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user!.userId;

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

    // Check if user is already a member
    if (club.members.length > 0) {
      return res.status(400).json({ error: 'You are already a member of this club' });
    }

    // Private clubs require invitation (will be implemented later)
    if (club.isPrivate) {
      return res.status(403).json({ error: 'This club is private and requires an invitation' });
    }

    // Add member and increment count
    await prisma.$transaction([
      prisma.clubMember.create({
        data: {
          clubId: club.id,
          userId,
          role: 'MEMBER',
        },
      }),
      prisma.club.update({
        where: { id: club.id },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    res.json({ message: 'Successfully joined club' });
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({ error: 'Failed to join club' });
  }
});

// Leave a club
router.post('/:slug/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user!.userId;

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
      return res.status(400).json({ error: 'You are not a member of this club' });
    }

    const membership = club.members[0];

    // Owner cannot leave
    if (membership.role === 'OWNER') {
      return res.status(400).json({ error: 'Club owner cannot leave. Transfer ownership or delete the club.' });
    }

    // Remove member and decrement count
    await prisma.$transaction([
      prisma.clubMember.delete({
        where: { id: membership.id },
      }),
      prisma.club.update({
        where: { id: club.id },
        data: { memberCount: { decrement: 1 } },
      }),
    ]);

    res.json({ message: 'Successfully left club' });
  } catch (error) {
    console.error('Error leaving club:', error);
    res.status(500).json({ error: 'Failed to leave club' });
  }
});

// Update member role (admin/moderator management)
router.patch('/:slug/members/:memberId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user!.userId;

    if (!['ADMIN', 'MODERATOR', 'MEMBER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user is owner or admin
    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        members: {
          where: {
            OR: [
              { userId },
              { id: memberId },
            ],
          },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    const userMembership = club.members.find(m => m.userId === userId);
    const targetMembership = club.members.find(m => m.id === memberId);

    if (!userMembership || (userMembership.role !== 'OWNER' && userMembership.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only owners and admins can change member roles' });
    }

    if (!targetMembership) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Cannot change owner role
    if (targetMembership.role === 'OWNER') {
      return res.status(400).json({ error: 'Cannot change owner role' });
    }

    // Update role
    await prisma.clubMember.update({
      where: { id: memberId },
      data: { role },
    });

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Get club posts
router.get('/:slug/posts', async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const userId = req.user?.userId;

    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        members: userId ? {
          where: { userId },
        } : false,
      },
    });

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Check if private and user is not a member
    if (club.isPrivate) {
      const isMember = userId && club.members && club.members.length > 0;
      if (!isMember) {
        return res.status(403).json({ error: 'This club is private' });
      }
    }

    const posts = await prisma.post.findMany({
      where: { clubId: club.id },
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
      take: limit,
      skip: offset,
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching club posts:', error);
    res.status(500).json({ error: 'Failed to fetch club posts' });
  }
});

// ============================================================================
// CLUB INVITATIONS
// ============================================================================

// Create club invitation
router.post('/:slug/invites', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const { email } = req.body;
    const userId = req.user!.userId;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user is admin or owner
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

    const membership = club.members[0];
    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only club owners and admins can send invitations' });
    }

    // Check if user with email already exists and is a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        clubMemberships: {
          where: { clubId: club.id },
        },
      },
    });

    if (existingUser && existingUser.clubMemberships.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this club' });
    }

    // Check for existing pending invitation
    const existingInvite = await prisma.clubInvite.findFirst({
      where: {
        clubId: club.id,
        email,
        accepted: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return res.status(400).json({ error: 'An invitation for this email already exists' });
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invitation = await prisma.clubInvite.create({
      data: {
        clubId: club.id,
        email,
        invitedBy: userId,
        token,
        expiresAt,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        inviter: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    });

    // If the invited email belongs to an existing user, send notification
    if (existingUser) {
      createNotification({
        userId: existingUser.id,
        type: 'CLUB_INVITE',
        title: 'Club invitation',
        message: `${invitation.inviter.displayName || invitation.inviter.username} invited you to join ${invitation.club.name}`,
        linkUrl: `/clubs/${invitation.club.slug}/invite/${token}`,
      }).catch((err) => console.error('Error sending notification:', err));
    }

    res.status(201).json(invitation);
  } catch (error) {
    console.error('Error creating club invitation:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

// Get club invitations (admin only)
router.get('/:slug/invites', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user!.userId;

    // Check if user is admin or owner
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

    const membership = club.members[0];
    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only club owners and admins can view invitations' });
    }

    const invitations = await prisma.clubInvite.findMany({
      where: {
        clubId: club.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching club invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Accept club invitation
router.post('/invites/:token/accept', authenticate, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params;
    const userId = req.user!.userId;

    // Find invitation
    const invitation = await prisma.clubInvite.findUnique({
      where: { token },
      include: {
        club: true,
      },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Check if already accepted
    if (invitation.accepted) {
      return res.status(400).json({ error: 'Invitation has already been accepted' });
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clubMemberships: {
          where: { clubId: invitation.clubId },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user email matches invitation
    if (user.email !== invitation.email) {
      return res.status(403).json({ error: 'This invitation is for a different email address' });
    }

    // Check if already a member
    if (user.clubMemberships.length > 0) {
      return res.status(400).json({ error: 'You are already a member of this club' });
    }

    // Accept invitation - add as member and mark invitation as accepted
    await prisma.$transaction([
      prisma.clubMember.create({
        data: {
          clubId: invitation.clubId,
          userId,
          role: 'MEMBER',
        },
      }),
      prisma.club.update({
        where: { id: invitation.clubId },
        data: { memberCount: { increment: 1 } },
      }),
      prisma.clubInvite.update({
        where: { id: invitation.id },
        data: { accepted: true },
      }),
    ]);

    res.json({ message: 'Invitation accepted successfully', club: invitation.club });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Revoke/delete club invitation (admin only)
router.delete('/:slug/invites/:inviteId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug, inviteId } = req.params;
    const userId = req.user!.userId;

    // Check if user is admin or owner
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

    const membership = club.members[0];
    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only club owners and admins can revoke invitations' });
    }

    // Delete invitation
    await prisma.clubInvite.delete({
      where: {
        id: inviteId,
        clubId: club.id,
      },
    });

    res.json({ message: 'Invitation revoked successfully' });
  } catch (error) {
    console.error('Error revoking invitation:', error);
    res.status(500).json({ error: 'Failed to revoke invitation' });
  }
});

// Get invitation by token (public, for preview)
router.get('/invites/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.clubInvite.findUnique({
      where: { token },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            avatarUrl: true,
            isPrivate: true,
            memberCount: true,
          },
        },
      },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Check if already accepted
    if (invitation.accepted) {
      return res.status(400).json({ error: 'Invitation has already been accepted' });
    }

    res.json({
      club: invitation.club,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({ error: 'Failed to fetch invitation' });
  }
});

export default router;
