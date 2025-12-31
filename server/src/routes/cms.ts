import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// ========== PAGES ==========

// Get all pages
router.get('/pages', authenticate, async (req: AuthRequest, res) => {
  try {
    const { isPublished, search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [pages, total] = await Promise.all([
      prisma.cMSPage.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.cMSPage.count({ where }),
    ]);

    res.json({
      pages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get single page (public)
router.get('/pages/:slug', async (req, res) => {
  try {
    const page = await prisma.cMSPage.findUnique({
      where: { slug: req.params.slug },
    });

    if (!page || !page.isPublished) {
      return res.status(404).json({ error: 'Page non trouvée' });
    }

    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create page
router.post(
  '/pages',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  [body('title').notEmpty(), body('slug').notEmpty(), body('content').notEmpty()],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = await prisma.cMSPage.create({
        data: {
          ...req.body,
          userId: req.userId!,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(201).json(page);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update page
router.put('/pages/:id', authenticate, requireRole('ADMIN', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const page = await prisma.cMSPage.findUnique({
      where: { id: req.params.id },
    });

    if (!page) {
      return res.status(404).json({ error: 'Page non trouvée' });
    }

    const updated = await prisma.cMSPage.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete page
router.delete('/pages/:id', authenticate, requireRole('ADMIN', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    await prisma.cMSPage.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Page supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========== POSTS ==========

// Get all posts
router.get('/posts', authenticate, async (req: AuthRequest, res) => {
  try {
    const { isPublished, search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      prisma.cMSPost.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.cMSPost.count({ where }),
    ]);

    res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get single post (public)
router.get('/posts/:slug', async (req, res) => {
  try {
    const post = await prisma.cMSPost.findUnique({
      where: { slug: req.params.slug },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!post || !post.isPublished) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create post
router.post(
  '/posts',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  [body('title').notEmpty(), body('slug').notEmpty(), body('content').notEmpty()],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = {
        ...req.body,
        userId: req.userId!,
        publishedAt: req.body.isPublished ? new Date() : null,
      };

      const post = await prisma.cMSPost.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(201).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update post
router.put('/posts/:id', authenticate, requireRole('ADMIN', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const post = await prisma.cMSPost.findUnique({
      where: { id: req.params.id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    const data = { ...req.body };
    if (data.isPublished && !post.publishedAt) {
      data.publishedAt = new Date();
    }

    const updated = await prisma.cMSPost.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete post
router.delete('/posts/:id', authenticate, requireRole('ADMIN', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    await prisma.cMSPost.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Article supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

