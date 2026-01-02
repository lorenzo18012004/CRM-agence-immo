import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all payments
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

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          contract: {
            select: {
              id: true,
              contractNumber: true,
              type: true,
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
      prisma.payment.count({ where }),
    ]);

    res.json({
      payments,
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

// Get single payment
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        contract: true,
        client: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    if (!req.isSuperAdmin && (payment as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create payment
router.post(
  '/',
  authenticate,
  [
    body('amount').isFloat({ min: 0 }),
    body('type').notEmpty(),
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

      const count = await prisma.payment.count({
        where: { agencyId: req.agencyId },
      });
      const paymentNumber = `PAY-${String(count + 1).padStart(6, '0')}`;

      const payment = await prisma.payment.create({
        data: {
          paymentNumber,
          amount: parseFloat(req.body.amount),
          status: req.body.status || 'PENDING',
          type: req.body.type,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
          paidDate: req.body.paidDate ? new Date(req.body.paidDate) : null,
          method: req.body.method,
          reference: req.body.reference,
          notes: req.body.notes,
          userId: req.userId!,
          contractId: req.body.contractId,
          clientId: req.body.clientId,
          agencyId: req.agencyId,
        },
        include: {
          user: true,
          contract: true,
          client: true,
        },
      });

      res.status(201).json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update payment
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    if (!req.isSuperAdmin && (payment as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const data: any = {
      amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
      status: req.body.status,
      type: req.body.type,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      method: req.body.method,
      reference: req.body.reference,
      notes: req.body.notes,
    };

    if (req.body.status === 'PAID' && payment.status !== 'PAID') {
      data.paidDate = new Date();
    }

    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data,
      include: {
        user: true,
        contract: true,
        client: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete payment
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    if (!req.isSuperAdmin && (payment as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await prisma.payment.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Paiement supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;


