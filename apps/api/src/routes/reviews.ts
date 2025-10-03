import { Router } from 'express';
import * as db from '@ember-society/database';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { notifyMentionedUsers } from '../services/notificationService.js';

const router = Router();
const prisma = db.prisma;

// Get all reviews (with optional filtering)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { category, clubSlug, limit = '20', offset = '0' } = req.query;

    const where: any = {};

    // Filter by category
    if (category && typeof category === 'string') {
      where.category = category;
    }

    // Filter by club
    if (clubSlug && typeof clubSlug === 'string') {
      const club = await prisma.club.findUnique({
        where: { slug: clubSlug as string },
        select: { id: true },
      });
      if (club) {
        where.clubId = club.id;
      }
    }

    const reviews = await prisma.review.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get a single review by ID
router.get('/:reviewId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
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
      },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Create a new review
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, rating, category, productName, brand, imageUrl, clubId } = req.body;
    const authorId = req.user!.userId;

    // Validate required fields
    if (!title || !content || !rating || !category || !productName) {
      return res.status(400).json({
        error: 'Title, content, rating, category, and product name are required',
      });
    }

    // Validate rating range (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Validate category
    const validCategories = ['PIPE_TOBACCO', 'CIGAR', 'PIPE', 'ACCESSORY'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // If clubId provided, verify club exists
    if (clubId) {
      const club = await prisma.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        return res.status(404).json({ error: 'Club not found' });
      }
    }

    const review = await prisma.review.create({
      data: {
        title,
        content,
        rating: parseInt(rating),
        category,
        productName,
        brand: brand || null,
        imageUrl: imageUrl || null,
        clubId: clubId || null,
        authorId,
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
      },
    });

    // Send notifications to mentioned users
    notifyMentionedUsers(content, authorId, {
      title: 'You were mentioned in a review',
      message: `${review.author.displayName || review.author.username} mentioned you in a review of ${productName}`,
      linkUrl: `/reviews`,
    }).catch((err) => console.error('Error sending mention notifications:', err));

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update a review
router.patch('/:reviewId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { reviewId } = req.params;
    const { title, content, rating, category, productName, brand, imageUrl } = req.body;
    const userId = req.user!.userId;

    // Verify the user owns this review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { authorId: true },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingReview.authorId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(rating !== undefined && { rating: parseInt(rating) }),
        ...(category !== undefined && { category }),
        ...(productName !== undefined && { productName }),
        ...(brand !== undefined && { brand }),
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
      },
    });

    // Send notifications to mentioned users if content was updated
    if (content !== undefined) {
      notifyMentionedUsers(content, userId, {
        title: 'You were mentioned in a review',
        message: `${updatedReview.author.displayName || updatedReview.author.username} mentioned you in a review of ${updatedReview.productName}`,
        linkUrl: `/reviews`,
      }).catch((err) => console.error('Error sending mention notifications:', err));
    }

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:reviewId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.userId;

    // Verify the user owns this review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { authorId: true },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingReview.authorId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get reviews by user
router.get('/user/:username', authenticate, async (req: AuthRequest, res) => {
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

    const reviews = await prisma.review.findMany({
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
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

export default router;
