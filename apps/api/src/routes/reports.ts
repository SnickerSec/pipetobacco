import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/reports - Create a new report
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reason, description, reportedUserId, reportedPostId, reportedCommentId } = req.body;

    // Validate reason
    const validReasons = ['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'MISINFORMATION', 'OTHER'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid report reason' });
    }

    // Must report at least one thing
    if (!reportedUserId && !reportedPostId && !reportedCommentId) {
      return res.status(400).json({ error: 'Must specify what you are reporting' });
    }

    // Verify reported content exists
    if (reportedUserId) {
      const user = await prisma.user.findUnique({ where: { id: reportedUserId } });
      if (!user) {
        return res.status(404).json({ error: 'Reported user not found' });
      }
    }

    if (reportedPostId) {
      const post = await prisma.post.findUnique({ where: { id: reportedPostId } });
      if (!post) {
        return res.status(404).json({ error: 'Reported post not found' });
      }
    }

    if (reportedCommentId) {
      const comment = await prisma.comment.findUnique({ where: { id: reportedCommentId } });
      if (!comment) {
        return res.status(404).json({ error: 'Reported comment not found' });
      }
    }

    const report = await prisma.report.create({
      data: {
        reason,
        description,
        reporterId: userId,
        reportedUserId,
        reportedPostId,
        reportedCommentId,
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        reportedUser: {
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

    res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// GET /api/reports - Get all reports (admin only)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin (you'll need to add isAdmin field to User model or check role)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    // For now, we'll allow all authenticated users to see reports
    // TODO: Add admin check when admin roles are implemented

    const { status, limit = '50', offset = '0' } = req.query;

    const where: any = {};
    if (status && typeof status === 'string') {
      const validStatuses = ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
      if (validStatuses.includes(status)) {
        where.status = status;
      }
    }

    const reports = await prisma.report.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        reportedUser: {
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

    // Fetch post and comment data separately since they're not direct relations
    const reportsWithContent = await Promise.all(
      reports.map(async (report) => {
        let reportedPost = null;
        let reportedComment = null;

        if (report.reportedPostId) {
          reportedPost = await prisma.post.findUnique({
            where: { id: report.reportedPostId },
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
        }

        if (report.reportedCommentId) {
          reportedComment = await prisma.comment.findUnique({
            where: { id: report.reportedCommentId },
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
        }

        return {
          ...report,
          reportedPost,
          reportedComment,
        };
      })
    );

    res.json(reportsWithContent);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/:reportId - Get a single report
router.get('/:reportId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reportId } = req.params;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        reportedUser: {
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

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Fetch related content
    let reportedPost = null;
    let reportedComment = null;

    if (report.reportedPostId) {
      reportedPost = await prisma.post.findUnique({
        where: { id: report.reportedPostId },
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
    }

    if (report.reportedCommentId) {
      reportedComment = await prisma.comment.findUnique({
        where: { id: report.reportedCommentId },
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
    }

    res.json({
      ...report,
      reportedPost,
      reportedComment,
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// PATCH /api/reports/:reportId - Update report status (admin only)
router.patch('/:reportId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // TODO: Add admin check when admin roles are implemented

    const { reportId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        reportedUser: {
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

    res.json(updatedReport);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// DELETE /api/reports/:reportId - Delete a report (admin only)
router.delete('/:reportId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // TODO: Add admin check when admin roles are implemented

    const { reportId } = req.params;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await prisma.report.delete({
      where: { id: reportId },
    });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
