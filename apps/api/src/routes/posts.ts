import { Router } from 'express';
import * as db from '@ember-society/database';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { notifyClubMembers, createNotification, notifyMentionedUsers } from '../services/notificationService.js';

const router = Router();
const prisma = db.prisma;

// Get feed for authenticated user (posts and events from joined clubs only)
router.get('/feed', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { limit = '50', offset = '0' } = req.query;

    // Get clubs that the current user is a member of
    const memberships = await prisma.clubMember.findMany({
      where: { userId },
      select: { clubId: true },
    });
    const clubIds = memberships.map((m) => m.clubId);

    // Fetch posts only from joined clubs
    const posts = await prisma.post.findMany({
      where: {
        clubId: { in: clubIds },
      },
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
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
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

    // Check which posts the current user has liked
    const likedPosts = await prisma.like.findMany({
      where: {
        userId,
        postId: { in: posts.map((p) => p.id) },
      },
      select: { postId: true },
    });
    const likedPostIds = new Set(likedPosts.map((l) => l.postId));

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      type: 'post',
      isLikedByUser: likedPostIds.has(post.id),
    }));

    // Fetch upcoming events from joined clubs
    const events = await prisma.event.findMany({
      where: {
        clubId: { in: clubIds },
        startTime: { gte: new Date() }, // Only upcoming events
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
            rsvps: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
      take: 10, // Limit events to avoid overwhelming feed
    });

    const eventsWithType = events.map((event) => ({
      ...event,
      type: 'event',
    }));

    // Combine posts and events, then sort by creation/start time
    const feedItems = [...postsWithLikeStatus, ...eventsWithType].sort((a, b) => {
      const aDate = a.type === 'post' ? new Date(a.createdAt) : new Date(a.startTime);
      const bDate = b.type === 'post' ? new Date(b.createdAt) : new Date(b.startTime);
      return bDate.getTime() - aDate.getTime();
    });

    res.json(feedItems);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Create a new post
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, imageUrl, clubId } = req.body;
    const authorId = req.user!.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // clubId is now required - users must post to a club
    if (!clubId) {
      return res.status(400).json({ error: 'You must select a club to post to. Please join a club first.' });
    }

    // Verify membership
    const membership = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId: authorId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'You must be a member of this club to post' });
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId,
        clubId,
      },
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
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Send notifications to club members if posted in a club
    if (clubId && post.club) {
      notifyClubMembers(clubId, authorId, {
        type: 'NEW_POST_IN_CLUB',
        title: `New post in ${post.club.name}`,
        message: `${post.author.displayName || post.author.username} posted in ${post.club.name}`,
        linkUrl: `/posts/${post.id}`,
      }).catch((err) => console.error('Error sending notifications:', err));
    }

    // Send notifications to mentioned users
    notifyMentionedUsers(content, authorId, {
      title: 'You were mentioned in a post',
      message: `${post.author.displayName || post.author.username} mentioned you in a post`,
      linkUrl: `/posts/${post.id}`,
    }).catch((err) => console.error('Error sending mention notifications:', err));

    res.status(201).json({ ...post, isLikedByUser: false });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get a single post by ID
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
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
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Update a post
router.patch('/:postId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const { content, imageUrl } = req.body;
    const userId = req.user!.userId;

    // Verify the user owns this post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(content !== undefined && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
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
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/:postId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    // Verify the user owns this post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Like a post
router.post('/:postId/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create like
    await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    res.json({ message: 'Post liked successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'You already liked this post' });
    }
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Unlike a post
router.delete('/:postId/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

// Get comments for a post
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const comments = await prisma.comment.findMany({
      where: { postId },
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
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a comment on a post
router.post('/:postId/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const authorId = req.user!.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // If this is a reply, check if parent comment exists
    let parentComment = null;
    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });

      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId,
        postId,
        parentId: parentId || null,
      },
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
      },
    });

    // Send notification to post author if it's a comment (not reply)
    if (!parentId && post.authorId !== authorId) {
      createNotification({
        userId: post.authorId,
        type: 'NEW_COMMENT',
        title: 'New comment on your post',
        message: `${comment.author.displayName || comment.author.username} commented on your post`,
        linkUrl: `/posts/${postId}`,
      }).catch((err) => console.error('Error sending notification:', err));
    }

    // Send notification to parent comment author if it's a reply
    if (parentId && parentComment && parentComment.authorId !== authorId) {
      createNotification({
        userId: parentComment.authorId,
        type: 'NEW_REPLY',
        title: 'New reply to your comment',
        message: `${comment.author.displayName || comment.author.username} replied to your comment`,
        linkUrl: `/posts/${postId}`,
      }).catch((err) => console.error('Error sending notification:', err));
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

export default router;
