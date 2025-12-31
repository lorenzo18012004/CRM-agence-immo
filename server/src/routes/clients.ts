import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all clients
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { clientType, search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (clientType) where.clientType = clientType;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              properties: true,
              contracts: true,
              appointments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      clients,
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

// Get single client
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        properties: {
          include: {
            photos: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
        contracts: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                reference: true,
              },
            },
          },
        },
        appointments: true,
        documents: true,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create client
router.post(
  '/',
  authenticate,
  [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('phone').notEmpty(),
    body('clientType').notEmpty(),
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const client = await prisma.client.create({
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

      res.status(201).json(client);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update client
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const updated = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
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

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete client
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.client.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Client supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

