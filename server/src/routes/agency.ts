import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get agency settings
router.get('/settings', authenticate, async (req: AuthRequest, res) => {
  try {
    let settings = await prisma.agencySettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.agencySettings.create({
        data: {
          id: 'default',
          name: 'Mon Agence Immobilière',
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update agency settings
router.put('/settings', authenticate, requireRole('ADMIN', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    let settings = await prisma.agencySettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.agencySettings.create({
        data: {
          id: 'default',
          ...req.body,
        },
      });
    } else {
      settings = await prisma.agencySettings.update({
        where: { id: 'default' },
        data: req.body,
      });
    }

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get dashboard statistics
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
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
      prisma.property.count(),
      prisma.property.count({ where: { status: 'AVAILABLE' } }),
      prisma.property.count({ where: { status: 'SOLD' } }),
      prisma.contract.count(),
      prisma.contract.count({ where: { status: 'ACTIVE' } }),
      prisma.client.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
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

