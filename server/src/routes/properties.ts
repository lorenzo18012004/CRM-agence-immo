import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all properties with filters
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      status,
      type,
      city,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice as string) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
    if (minSurface) where.surface = { ...where.surface, gte: parseFloat(minSurface as string) };
    if (maxSurface) where.surface = { ...where.surface, lte: parseFloat(maxSurface as string) };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { reference: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          photos: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              contracts: true,
              documents: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      properties,
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

// Get single property
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        photos: {
          orderBy: { order: 'asc' },
        },
        contracts: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        documents: true,
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Bien non trouvé' });
    }

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create property
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty(),
    body('type').notEmpty(),
    body('address').notEmpty(),
    body('city').notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('surface').isFloat({ min: 0 }),
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = req.body;
      
      // Generate reference
      const count = await prisma.property.count();
      const reference = `PROP-${String(count + 1).padStart(6, '0')}`;

      const property = await prisma.property.create({
        data: {
          ...data,
          reference,
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
          photos: true,
        },
      });

      res.status(201).json(property);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update property
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
    });

    if (!property) {
      return res.status(404).json({ error: 'Bien non trouvé' });
    }

    const updated = await prisma.property.update({
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
        photos: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete property
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.property.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Bien supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

