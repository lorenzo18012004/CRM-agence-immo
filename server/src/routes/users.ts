import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users
router.get('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    // Super admin can see all users, others only see users from their agency
    const where: any = {};
    if (!req.isSuperAdmin && req.agencyId) {
      where.agencyId = req.agencyId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        avatar: true,
        agencyId: true,
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
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
        agencyId: true,
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
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

    // Check access: users can see themselves, admins can see users from their agency, super admin can see all
    if (user.id !== req.userId && !req.isSuperAdmin) {
      if (!req.agencyId || user.agencyId !== req.agencyId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create user (admin/managers only)
router.post(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  async (req: AuthRequest, res) => {
    try {
      const { email, password, firstName, lastName, phone, role, agencyId } = req.body;

      // Non-super-admin can only create users in their agency
      const userAgencyId = req.isSuperAdmin ? (agencyId || req.agencyId) : req.agencyId;
      
      if (!userAgencyId) {
        return res.status(400).json({ error: 'Agence requise' });
      }

      // Verify agency exists
      const agency = await prisma.agency.findUnique({ where: { id: userAgencyId } });
      if (!agency) {
        return res.status(404).json({ error: 'Agence non trouvée' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: role || 'AGENT',
          agencyId: userAgencyId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          avatar: true,
          agencyId: true,
        },
      });

      res.status(201).json(user);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update user
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userToUpdate = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, agencyId: true },
    });

    if (!userToUpdate) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Check access
    if (req.params.id !== req.userId && !req.isSuperAdmin) {
      if (!['ADMIN', 'MANAGER'].includes(req.userRole || '')) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
      // Admins can only update users from their agency
      if (req.agencyId !== userToUpdate.agencyId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
    }

    const data: any = { ...req.body };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Only super admin and admins can change roles
    if (data.role && !req.isSuperAdmin && !['ADMIN', 'MANAGER'].includes(req.userRole || '')) {
      delete data.role;
    }

    // Only super admin can change agency
    if (data.agencyId && !req.isSuperAdmin) {
      delete data.agencyId;
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
        agencyId: true,
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

