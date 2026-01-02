import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all communications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, clientId, propertyId, page = '1', limit = '20' } = req.query;

    const where: any = {};
    
    if (!req.isSuperAdmin && req.agencyId) {
      where.agencyId = req.agencyId;
    }
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (propertyId) where.propertyId = propertyId;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          client: {
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
              reference: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.communication.count({ where }),
    ]);

    res.json({
      communications,
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

// Create communication
router.post(
  '/',
  authenticate,
  [
    body('type').notEmpty(),
    body('recipient').notEmpty(),
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

      const communication = await prisma.communication.create({
        data: {
          type: req.body.type,
          subject: req.body.subject,
          content: req.body.content,
          recipient: req.body.recipient,
          status: req.body.status || 'SENT',
          sentAt: new Date(),
          userId: req.userId!,
          clientId: req.body.clientId,
          propertyId: req.body.propertyId,
          agencyId: req.agencyId,
        },
        include: {
          user: true,
          client: true,
          property: true,
        },
      });

      res.status(201).json(communication);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update communication status
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const communication = await prisma.communication.findUnique({
      where: { id: req.params.id },
    });

    if (!communication) {
      return res.status(404).json({ error: 'Communication non trouvée' });
    }

    if (!req.isSuperAdmin && (communication as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await prisma.communication.update({
      where: { id: req.params.id },
      data: {
        status: req.body.status,
      },
      include: {
        user: true,
        client: true,
        property: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;


