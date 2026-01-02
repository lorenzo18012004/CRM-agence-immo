import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all mandates
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;

    const where: any = {};
    
    if (!req.isSuperAdmin && req.agencyId) {
      where.agencyId = req.agencyId;
    }
    
    if (status) where.status = status;
    if (type) where.type = type;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [mandates, total] = await Promise.all([
      prisma.mandate.findMany({
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.mandate.count({ where }),
    ]);

    res.json({
      mandates,
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

// Get single mandate
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const mandate = await prisma.mandate.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        property: true,
        client: true,
      },
    });

    if (!mandate) {
      return res.status(404).json({ error: 'Mandat non trouvé' });
    }

    if (!req.isSuperAdmin && (mandate as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(mandate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create mandate
router.post(
  '/',
  authenticate,
  [
    body('type').notEmpty(),
    body('startDate').notEmpty(),
    body('propertyId').notEmpty(),
    body('clientId').notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.agencyId) {
        return res.status(400).json({ error: 'Vous n\'êtes pas associé à une agence' });
      }

      const count = await prisma.mandate.count({
        where: { agencyId: req.agencyId },
      });
      const mandateNumber = `MAND-${String(count + 1).padStart(6, '0')}`;

      const mandate = await prisma.mandate.create({
        data: {
          mandateNumber,
          type: req.body.type,
          startDate: new Date(req.body.startDate),
          endDate: req.body.endDate ? new Date(req.body.endDate) : null,
          price: req.body.price,
          commissionRate: req.body.commissionRate,
          status: req.body.status || 'ACTIVE',
          notes: req.body.notes,
          userId: req.userId!,
          propertyId: req.body.propertyId,
          clientId: req.body.clientId,
          agencyId: req.agencyId,
        },
        include: {
          user: true,
          property: true,
          client: true,
        },
      });

      res.status(201).json(mandate);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update mandate
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const mandate = await prisma.mandate.findUnique({
      where: { id: req.params.id },
    });

    if (!mandate) {
      return res.status(404).json({ error: 'Mandat non trouvé' });
    }

    if (!req.isSuperAdmin && (mandate as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await prisma.mandate.update({
      where: { id: req.params.id },
      data: {
        type: req.body.type,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        price: req.body.price,
        commissionRate: req.body.commissionRate,
        status: req.body.status,
        notes: req.body.notes,
      },
      include: {
        user: true,
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

// Delete mandate
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const mandate = await prisma.mandate.findUnique({
      where: { id: req.params.id },
    });

    if (!mandate) {
      return res.status(404).json({ error: 'Mandat non trouvé' });
    }

    if (!req.isSuperAdmin && (mandate as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await prisma.mandate.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Mandat supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;


