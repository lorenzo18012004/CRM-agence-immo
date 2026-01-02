import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all offers
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, propertyId, clientId, page = '1', limit = '20' } = req.query;

    const where: any = {};
    
    if (!req.isSuperAdmin && req.agencyId) {
      where.agencyId = req.agencyId;
    }
    
    if (status) where.status = status;
    if (propertyId) where.propertyId = propertyId;
    if (clientId) where.clientId = clientId;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
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
              price: true,
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
        orderBy: { submittedDate: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.offer.count({ where }),
    ]);

    res.json({
      offers,
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

// Get single offer
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        property: true,
        client: true,
      },
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    if (!req.isSuperAdmin && (offer as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(offer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create offer
router.post(
  '/',
  authenticate,
  [
    body('amount').isFloat({ min: 0 }),
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

      const count = await prisma.offer.count({
        where: { agencyId: req.agencyId },
      });
      const offerNumber = `OFF-${String(count + 1).padStart(6, '0')}`;

      const offer = await prisma.offer.create({
        data: {
          offerNumber,
          amount: parseFloat(req.body.amount),
          status: req.body.status || 'PENDING',
          conditions: req.body.conditions,
          notes: req.body.notes,
          submittedDate: new Date(),
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

      res.status(201).json(offer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update offer
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    if (!req.isSuperAdmin && (offer as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const data: any = {
      amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
      status: req.body.status,
      conditions: req.body.conditions,
      notes: req.body.notes,
    };

    if (req.body.status && ['ACCEPTED', 'REJECTED', 'COUNTER_OFFER'].includes(req.body.status)) {
      data.responseDate = new Date();
    }

    const updated = await prisma.offer.update({
      where: { id: req.params.id },
      data,
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

// Delete offer
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    if (!req.isSuperAdmin && (offer as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await prisma.offer.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Offre supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;


