import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all tasks
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, userId, dueDate, page = '1', limit = '50' } = req.query;

    const where: any = {};
    
    if (!req.isSuperAdmin && req.agencyId) {
      where.agencyId = req.agencyId;
    }
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (userId) where.userId = userId;
    
    if (dueDate) {
      where.dueDate = {
        lte: new Date(dueDate as string),
      };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
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
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
        skip,
        take: limitNum,
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
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

// Get single task
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        property: true,
        client: true,
        contract: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    if (!req.isSuperAdmin && (task as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create task
router.post(
  '/',
  authenticate,
  [body('title').notEmpty()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.agencyId) {
        return res.status(400).json({ error: 'Vous n\'êtes pas associé à une agence' });
      }

      const task = await prisma.task.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          status: req.body.status || 'PENDING',
          priority: req.body.priority || 'MEDIUM',
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
          userId: req.body.userId || req.userId!,
          propertyId: req.body.propertyId,
          clientId: req.body.clientId,
          contractId: req.body.contractId,
          agencyId: req.agencyId,
        },
        include: {
          user: true,
        },
      });

      res.status(201).json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update task
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    if (!req.isSuperAdmin && (task as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const data: any = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
    };

    if (req.body.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      data.completedAt = new Date();
    } else if (req.body.status !== 'COMPLETED') {
      data.completedAt = null;
    }

    const updated = await prisma.task.update({
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

// Delete task
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    if (!req.isSuperAdmin && (task as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;


