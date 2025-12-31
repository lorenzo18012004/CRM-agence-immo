import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users
router.get('/', authenticate, requireRole('ADMIN', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get single user
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            properties: true,
            contracts: true,
            clients: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update user
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    // Users can only update themselves unless they're admin/manager
    if (req.params.id !== req.userId && !['ADMIN', 'MANAGER'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const data: any = { ...req.body };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Only admins can change roles
    if (data.role && !['ADMIN', 'MANAGER'].includes(req.userRole || '')) {
      delete data.role;
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        avatar: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete user
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

