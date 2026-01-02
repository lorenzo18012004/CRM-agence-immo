import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all saved searches
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};
    
    if (!req.isSuperAdmin && req.agencyId) {
      where.agencyId = req.agencyId;
    }
    
    // Par défaut, récupérer seulement les recherches de l'utilisateur
    if (!req.isSuperAdmin) {
      where.userId = req.userId;
    }

    const searches = await prisma.savedSearch.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    res.json(searches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create saved search
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty(),
    body('filters').notEmpty(),
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

      const search = await prisma.savedSearch.create({
        data: {
          name: req.body.name,
          filters: typeof req.body.filters === 'string' ? req.body.filters : JSON.stringify(req.body.filters),
          isActive: req.body.isActive !== undefined ? req.body.isActive : true,
          userId: req.userId!,
          agencyId: req.agencyId,
        },
        include: {
          user: true,
        },
      });

      res.status(201).json(search);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update saved search
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const search = await prisma.savedSearch.findUnique({
      where: { id: req.params.id },
    });

    if (!search) {
      return res.status(404).json({ error: 'Recherche non trouvée' });
    }

    if (!req.isSuperAdmin && search.userId !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await prisma.savedSearch.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        filters: req.body.filters ? (typeof req.body.filters === 'string' ? req.body.filters : JSON.stringify(req.body.filters)) : undefined,
        isActive: req.body.isActive,
      },
      include: {
        user: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete saved search
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const search = await prisma.savedSearch.findUnique({
      where: { id: req.params.id },
    });

    if (!search) {
      return res.status(404).json({ error: 'Recherche non trouvée' });
    }

    if (!req.isSuperAdmin && search.userId !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await prisma.savedSearch.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Recherche supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;


