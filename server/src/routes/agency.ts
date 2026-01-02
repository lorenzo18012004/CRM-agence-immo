import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all agencies (super admin only)
router.get('/', authenticate, requireRole('SUPER_ADMIN'), async (req: AuthRequest, res) => {
  try {
    const agencies = await prisma.agency.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            properties: true,
            clients: true,
            contracts: true,
          },
        },
      },
    });

    res.json(agencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get single agency
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const agency = await prisma.agency.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            users: true,
            properties: true,
            clients: true,
            contracts: true,
          },
        },
      },
    });

    if (!agency) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }

    // Super admin can see all, others only their agency
    if (!req.isSuperAdmin && req.agencyId !== agency.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(agency);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create agency (super admin only)
router.post(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN'),
  [
    body('name').notEmpty(),
    body('code').notEmpty(),
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Vérifier que le code n'existe pas déjà
      const existingAgency = await prisma.agency.findUnique({
        where: { code: req.body.code },
      });

      if (existingAgency) {
        return res.status(400).json({ error: 'Ce code agence existe déjà' });
      }

      const agency = await prisma.agency.create({
        data: {
          code: req.body.code,
          name: req.body.name,
          address: req.body.address,
          city: req.body.city,
          postalCode: req.body.postalCode,
          country: req.body.country || 'France',
          phone: req.body.phone,
          email: req.body.email,
          website: req.body.website,
          description: req.body.description,
          siret: req.body.siret,
          isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        },
      });

      res.status(201).json(agency);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Ce code agence existe déjà' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update agency
router.put(
  '/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'),
  async (req: AuthRequest, res) => {
    try {
      const agency = await prisma.agency.findUnique({
        where: { id: req.params.id },
      });

      if (!agency) {
        return res.status(404).json({ error: 'Agence non trouvée' });
      }

      // Non-super-admin can only update their own agency
      if (!req.isSuperAdmin && req.agencyId !== agency.id) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      const updated = await prisma.agency.update({
        where: { id: req.params.id },
        data: {
          name: req.body.name,
          address: req.body.address,
          city: req.body.city,
          postalCode: req.body.postalCode,
          country: req.body.country,
          phone: req.body.phone,
          email: req.body.email,
          website: req.body.website,
          logo: req.body.logo,
          description: req.body.description,
          siret: req.body.siret,
          // Only super admin can change isActive
          ...(req.isSuperAdmin && req.body.isActive !== undefined ? { isActive: req.body.isActive } : {}),
        },
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Get current user's agency settings
router.get('/settings/current', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.agencyId) {
      return res.status(400).json({ error: 'Vous n\'êtes pas associé à une agence' });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: req.agencyId },
    });

    if (!agency) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }

    res.json(agency);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update current user's agency settings
router.put('/settings/current', authenticate, requireRole('ADMIN', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    if (!req.agencyId) {
      return res.status(400).json({ error: 'Vous n\'êtes pas associé à une agence' });
    }

    const agency = await prisma.agency.update({
      where: { id: req.agencyId },
      data: {
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        postalCode: req.body.postalCode,
        country: req.body.country,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        logo: req.body.logo,
        description: req.body.description,
        siret: req.body.siret,
      },
    });

    res.json(agency);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get dashboard statistics (filtered by agency)
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.agencyId && !req.isSuperAdmin) {
      return res.status(400).json({ error: 'Vous n\'êtes pas associé à une agence' });
    }

    // Build where clause based on user role
    const whereClause: any = {};
    if (!req.isSuperAdmin && req.agencyId) {
      whereClause.agencyId = req.agencyId;
    }

    const [
      totalProperties,
      availableProperties,
      soldProperties,
      totalContracts,
      activeContracts,
      totalClients,
      totalAppointments,
      upcomingAppointments,
    ] = await Promise.all([
      prisma.property.count({ where: whereClause }),
      prisma.property.count({ where: { ...whereClause, status: 'AVAILABLE' } }),
      prisma.property.count({ where: { ...whereClause, status: 'SOLD' } }),
      prisma.contract.count({ where: whereClause }),
      prisma.contract.count({ where: { ...whereClause, status: 'ACTIVE' } }),
      prisma.client.count({ where: whereClause }),
      prisma.appointment.count({ where: whereClause }),
      prisma.appointment.count({
        where: {
          ...whereClause,
          startDate: {
            gte: new Date(),
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
      }),
    ]);

    // Get recent properties
    const recentProperties = await prisma.property.findMany({
      where: whereClause,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        photos: {
          where: { isMain: true },
          take: 1,
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get upcoming appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        ...whereClause,
        startDate: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      take: 5,
      orderBy: { startDate: 'asc' },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        property: {
          select: {
            title: true,
            address: true,
          },
        },
      },
    });

    res.json({
      properties: {
        total: totalProperties,
        available: availableProperties,
        sold: soldProperties,
      },
      contracts: {
        total: totalContracts,
        active: activeContracts,
      },
      clients: {
        total: totalClients,
      },
      appointments: {
        total: totalAppointments,
        upcoming: upcomingAppointments,
      },
      recentProperties,
      upcomingAppointments: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
