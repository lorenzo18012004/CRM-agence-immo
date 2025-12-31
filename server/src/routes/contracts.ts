import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all contracts
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, status, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              reference: true,
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
          _count: {
            select: {
              documents: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.contract.count({ where }),
    ]);

    res.json({
      contracts,
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

// Get single contract
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const contract = await prisma.contract.findUnique({
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
        property: {
          include: {
            photos: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
        client: true,
        documents: true,
      },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    res.json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create contract
router.post(
  '/',
  authenticate,
  [
    body('type').notEmpty(),
    body('startDate').notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('propertyId').notEmpty(),
    body('clientId').notEmpty(),
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = req.body;

      // Generate contract number
      const count = await prisma.contract.count();
      const contractNumber = `CTR-${String(count + 1).padStart(6, '0')}`;

      const contract = await prisma.contract.create({
        data: {
          ...data,
          contractNumber,
          userId: req.userId!,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          signedDate: data.signedDate ? new Date(data.signedDate) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          property: true,
          client: true,
        },
      });

      res.status(201).json(contract);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update contract
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    const data = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.signedDate) data.signedDate = new Date(data.signedDate);

    const updated = await prisma.contract.update({
      where: { id: req.params.id },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        property: true,
        client: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete contract
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.contract.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Contrat supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

