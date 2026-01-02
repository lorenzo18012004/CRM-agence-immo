import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all appointments
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, status, userId, page = '1', limit = '50' } = req.query;

    const where: any = {};
    
    // Filtrer par agence (sauf super admin)
    if (!req.isSuperAdmin && req.agencyId) {
      where.agencyId = req.agencyId;
    }
    
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate as string);
      if (endDate) where.startDate.lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
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
              phone: true,
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
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      appointments,
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

// Get single appointment
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        client: true,
        property: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && (appointment as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create appointment
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty(),
    body('startDate').notEmpty(),
    body('endDate').notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const appointment = await prisma.appointment.create({
        data: {
          ...req.body,
          userId: req.userId!,
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          client: true,
          property: true,
        },
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update appointment
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && (appointment as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const data = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const updated = await prisma.appointment.update({
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

// Delete appointment
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && (appointment as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await prisma.appointment.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Rendez-vous supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

