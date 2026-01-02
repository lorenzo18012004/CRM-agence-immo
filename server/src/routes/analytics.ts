import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { format } from 'date-fns';

const router = express.Router();
const prisma = new PrismaClient();

// Get analytics dashboard data
router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.agencyId && !req.isSuperAdmin) {
      return res.status(400).json({ error: 'Vous n\'êtes pas associé à une agence' });
    }

    console.log('Dashboard request from user:', req.userId, 'agency:', req.agencyId);

    const whereClause: any = {};
    if (!req.isSuperAdmin && req.agencyId) {
      whereClause.agencyId = req.agencyId;
    }

    // Paramètres de période
    const { period = 'year', startDate, endDate } = req.query;
    const now = new Date();
    
    let periodStart: Date;
    let periodEnd: Date = now;
    
    if (startDate && endDate) {
      // Dates personnalisées
      periodStart = new Date(startDate as string);
      periodEnd = new Date(endDate as string);
    } else {
      // Période prédéfinie
      switch (period) {
        case 'week':
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
        default:
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
      }
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenus mensuels
    const monthlyRevenue = await prisma.contract.aggregate({
      where: {
        ...whereClause,
        status: 'COMPLETED',
        signedDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        commission: true,
      },
    });

    // Revenus de l'année
    const yearlyRevenue = await prisma.contract.aggregate({
      where: {
        ...whereClause,
        status: 'COMPLETED',
        signedDate: {
          gte: startOfYear,
        },
      },
      _sum: {
        commission: true,
      },
    });

    // Revenus du mois dernier
    const lastMonthRevenue = await prisma.contract.aggregate({
      where: {
        ...whereClause,
        status: 'COMPLETED',
        signedDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        commission: true,
      },
    });

    // Paiements en attente
    const pendingPayments = await prisma.payment.aggregate({
      where: {
        ...whereClause,
        status: 'PENDING',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Paiements payés ce mois
    const paidThisMonth = await prisma.payment.aggregate({
      where: {
        ...whereClause,
        status: 'PAID',
        paidDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Ventes ce mois
    const salesThisMonth = await prisma.contract.count({
      where: {
        ...whereClause,
        type: 'SALE',
        status: 'COMPLETED',
        signedDate: {
          gte: startOfMonth,
        },
      },
    });

    // Locations ce mois
    const rentalsThisMonth = await prisma.contract.count({
      where: {
        ...whereClause,
        type: 'RENTAL',
        status: 'COMPLETED',
        signedDate: {
          gte: startOfMonth,
        },
      },
    });

    // Récupérer tous les utilisateurs de l'agence (agents actifs)
    const agencyUsers = await prisma.user.findMany({
      where: {
        ...(req.isSuperAdmin ? {} : { agencyId: req.agencyId }),
        isActive: true,
        role: { in: ['AGENT', 'MANAGER', 'ADMIN'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Performance des agents - inclure tous les utilisateurs même sans contrats
    const agentDetails = await Promise.all(
      agencyUsers.map(async (user) => {
        const contracts = await prisma.contract.aggregate({
          where: {
            ...whereClause,
            userId: user.id,
            status: 'COMPLETED',
            signedDate: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          _sum: {
            commission: true,
          },
          _count: true,
        });

        return {
          user,
          totalCommission: contracts._sum.commission || 0,
          totalContracts: contracts._count,
        };
      })
    );

    // Trier par commission décroissante
    agentDetails.sort((a, b) => b.totalCommission - a.totalCommission);

    // Revenus par période selon le filtre
    let monthlyRevenues = [];
    
    if (period === 'week' || (startDate && endDate)) {
      // Pour une semaine ou période personnalisée, on fait par jour
      const daysDiff = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
      const maxDays = Math.min(daysDiff, 30); // Limiter à 30 jours max
      
      for (let i = maxDays - 1; i >= 0; i--) {
        const dayStart = new Date(periodEnd);
        dayStart.setDate(periodEnd.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const revenue = await prisma.contract.aggregate({
          where: {
            ...whereClause,
            status: 'COMPLETED',
            signedDate: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
          _sum: {
            commission: true,
          },
          _count: true,
        });

        monthlyRevenues.push({
          month: dayStart.toISOString().slice(0, 10),
          revenue: revenue._sum.commission || 0,
          count: revenue._count,
        });
      }
    } else if (period === 'month') {
      // Pour un mois, on fait par jour
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), day);
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), day, 23, 59, 59);
        
        const revenue = await prisma.contract.aggregate({
          where: {
            ...whereClause,
            status: 'COMPLETED',
            signedDate: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
          _sum: {
            commission: true,
          },
          _count: true,
        });

        monthlyRevenues.push({
          month: dayStart.toISOString().slice(0, 10),
          revenue: revenue._sum.commission || 0,
          count: revenue._count,
        });
      }
    } else {
      // Pour une année, on fait par mois (12 derniers mois)
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const revenue = await prisma.contract.aggregate({
          where: {
            ...whereClause,
            status: 'COMPLETED',
            signedDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            commission: true,
          },
          _count: true,
        });

        monthlyRevenues.push({
          month: monthStart.toISOString().slice(0, 7),
          revenue: revenue._sum.commission || 0,
          count: revenue._count,
        });
      }
    }

    // Statistiques des biens
    const propertyStats = await prisma.property.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    });

    // Nouveaux mandats ce mois
    const newMandatesThisMonth = await prisma.mandate.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Nouveaux mandats le mois dernier
    const newMandatesLastMonth = await prisma.mandate.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Ventes finalisées ce mois
    const completedSalesThisMonth = salesThisMonth;
    const completedSalesLastMonth = await prisma.contract.count({
      where: {
        ...whereClause,
        type: 'SALE',
        status: 'COMPLETED',
        signedDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Taux de conversion (ventes finalisées / nouveaux mandats ce mois)
    // Si pas de nouveaux mandats, on utilise les mandats actifs comme base
    const conversionRate = newMandatesThisMonth > 0 
      ? ((completedSalesThisMonth / newMandatesThisMonth) * 100)
      : 0;
    const conversionRateLastMonth = newMandatesLastMonth > 0
      ? ((completedSalesLastMonth / newMandatesLastMonth) * 100)
      : 0;

    // Revenus par jour du mois actuel (pour le graphique)
    // Optimisation : récupérer tous les contrats du mois en une seule requête
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const contractsThisMonth = await prisma.contract.findMany({
      where: {
        ...whereClause,
        status: 'COMPLETED',
        signedDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        signedDate: true,
        commission: true,
      },
    });

    // Grouper par jour
    const dailyRevenuesMap = new Map<number, number>();
    contractsThisMonth.forEach((contract) => {
      if (contract.signedDate) {
        const day = contract.signedDate.getDate();
        const current = dailyRevenuesMap.get(day) || 0;
        dailyRevenuesMap.set(day, current + (contract.commission || 0));
      }
    });

    // Créer le tableau avec tous les jours du mois
    const dailyRevenues = [];
    const targetPerDay = (monthlyRevenue._sum.commission || 0) / daysInMonth;
    for (let day = 1; day <= daysInMonth; day++) {
      dailyRevenues.push({
        name: String(day).padStart(2, '0'),
        value: dailyRevenuesMap.get(day) || 0,
        targets: targetPerDay,
      });
    }

    // Répartition par type de bien
    const propertyTypeStats = await prisma.property.groupBy({
      by: ['type'],
      where: whereClause,
      _count: true,
    });

    const propertyTypeData = propertyTypeStats.map((stat) => {
      const typeNames: Record<string, string> = {
        APARTMENT: 'Appartements',
        HOUSE: 'Maisons',
        LAND: 'Terrains',
        COMMERCIAL: 'Commerces',
        OFFICE: 'Bureaux',
        VILLA: 'Villas',
        STUDIO: 'Studios',
      };
      return {
        name: typeNames[stat.type] || stat.type,
        value: stat._count,
      };
    });

    // Transactions récentes (contrats récents)
    const recentContracts = await prisma.contract.findMany({
      where: whereClause,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            id: true,
            title: true,
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
    });

    // Activité de l'équipe (derniers mandats créés)
    const recentMandates = await prisma.mandate.findMany({
      where: whereClause,
      take: 5,
      orderBy: { createdAt: 'desc' },
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
          },
        },
      },
    });

    // Calcul des pourcentages de changement
    const revenueChange = lastMonthRevenue._sum.commission 
      ? (((monthlyRevenue._sum.commission || 0) - (lastMonthRevenue._sum.commission || 0)) / (lastMonthRevenue._sum.commission || 1)) * 100
      : 0;
    
    const mandatesChange = newMandatesLastMonth
      ? ((newMandatesThisMonth - newMandatesLastMonth) / newMandatesLastMonth) * 100
      : 0;
    
    const salesChange = completedSalesLastMonth
      ? ((completedSalesThisMonth - completedSalesLastMonth) / completedSalesLastMonth) * 100
      : 0;
    
    const conversionChange = conversionRateLastMonth > 0
      ? (conversionRate - conversionRateLastMonth)
      : 0;

    res.json({
      period: {
        type: period,
        startDate: periodStart.toISOString(),
        endDate: periodEnd.toISOString(),
      },
      kpi: [
        {
          label: 'Revenu Mensuel',
          value: monthlyRevenue._sum.commission || 0,
          change: revenueChange,
          type: 'currency',
        },
        {
          label: 'Nouveaux Mandats',
          value: newMandatesThisMonth,
          change: mandatesChange,
          type: 'number',
        },
        {
          label: 'Ventes Finalisées',
          value: completedSalesThisMonth,
          change: salesChange,
          type: 'number',
        },
        {
          label: 'Taux de Conversion',
          value: conversionRate,
          change: conversionChange,
          type: 'percent',
        },
      ],
      revenueData: dailyRevenues,
      propertyTypeData,
      recentDeals: recentContracts.map((contract) => {
        const dateToFormat = contract.signedDate || contract.createdAt;
        return {
          id: contract.id,
          property: contract.property?.title || 'N/A',
          client: contract.client ? `${contract.client.firstName} ${contract.client.lastName}` : 'N/A',
          amount: contract.price || 0,
          status: contract.status === 'COMPLETED' ? 'Signed' : contract.status === 'ACTIVE' ? 'Negotiation' : 'Pending',
          date: dateToFormat ? format(new Date(dateToFormat), 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
        };
      }),
      teamActivity: recentMandates.map((mandate) => ({
        id: mandate.id,
        user: {
          firstName: mandate.user?.firstName || 'N/A',
          lastName: mandate.user?.lastName || 'N/A',
        },
        property: mandate.property?.title || 'N/A',
        createdAt: mandate.createdAt.toISOString(),
      })),
      revenue: {
        currentMonth: monthlyRevenue._sum.commission || 0,
        lastMonth: lastMonthRevenue._sum.commission || 0,
        yearToDate: yearlyRevenue._sum.commission || 0,
        monthlyTrend: monthlyRevenues,
      },
      payments: {
        pending: {
          amount: pendingPayments._sum.amount || 0,
          count: pendingPayments._count,
        },
        paidThisMonth: paidThisMonth._sum.amount || 0,
      },
      contracts: {
        salesThisMonth,
        rentalsThisMonth,
      },
      agentPerformance: agentDetails,
      propertyStats: propertyStats.map((stat) => ({
        status: stat.status,
        count: stat._count,
      })),
    });
  } catch (error: any) {
    console.error('Error in analytics dashboard:', error);
    console.error('Error message:', error.message);
    console.error('Stack:', error.stack);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors du chargement des données',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get revenue report
router.get('/revenue', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.agencyId && !req.isSuperAdmin) {
      return res.status(400).json({ error: 'Vous n\'êtes pas associé à une agence' });
    }

    const { startDate, endDate, groupBy = 'month' } = req.query;

    const whereClause: any = {
      status: 'COMPLETED',
    };
    
    if (!req.isSuperAdmin && req.agencyId) {
      whereClause.agencyId = req.agencyId;
    }

    if (startDate) {
      whereClause.signedDate = { ...whereClause.signedDate, gte: new Date(startDate as string) };
    }
    if (endDate) {
      whereClause.signedDate = { ...whereClause.signedDate, lte: new Date(endDate as string) };
    }

    const contracts = await prisma.contract.findMany({
      where: whereClause,
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
      orderBy: {
        signedDate: 'desc',
      },
    });

    res.json({ contracts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get operational dashboard data (for the new dashboard design)
router.get('/operational-dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.agencyId && !req.isSuperAdmin) {
      return res.status(400).json({ error: 'Vous n\'êtes pas associé à une agence' });
    }

    const whereClause: any = {};
    if (!req.isSuperAdmin && req.agencyId) {
      whereClause.agencyId = req.agencyId;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    // Stats opérationnelles
    const [callsToMake, emailsUnread, todaysAppointments, pendingDeals] = await Promise.all([
      // Tâches non complétées avec priorité haute ou urgente (considérées comme appels à passer)
      prisma.task.count({
        where: {
          ...whereClause,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          priority: { in: ['HIGH', 'URGENT'] },
        },
      }),
      // Communications emails non lues (status SENT ou DELIVERED = non lu)
      prisma.communication.count({
        where: {
          ...whereClause,
          type: 'EMAIL',
          status: { in: ['SENT', 'DELIVERED'] },
        },
      }),
      // Rendez-vous d'aujourd'hui
      prisma.appointment.count({
        where: {
          ...whereClause,
          startDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),
      // Contrats en cours (non complétés)
      prisma.contract.count({
        where: {
          ...whereClause,
          status: { in: ['DRAFT', 'ACTIVE'] },
        },
      }),
    ]);

    // Tâches du jour (priorité haute d'abord)
    const tasks = await prisma.task.findMany({
      where: {
        ...whereClause,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: {
          lte: endOfToday,
        },
      },
      take: 10,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        property: {
          select: {
            title: true,
          },
        },
      },
    });

    // Messages récents (communications)
    const communications = await prisma.communication.findMany({
      where: {
        ...whereClause,
        type: 'EMAIL',
      },
      take: 5,
      orderBy: { sentAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Agenda d'aujourd'hui
    const appointments = await prisma.appointment.findMany({
      where: {
        ...whereClause,
        startDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      orderBy: { startDate: 'asc' },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
          },
        },
      },
    });

    // Revenus de la semaine (pour le graphique)
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

      const revenue = await prisma.contract.aggregate({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          signedDate: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        _sum: {
          commission: true,
        },
      });

      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      revenueData.push({
        name: dayNames[day.getDay()],
        value: revenue._sum.commission || 0,
      });
    }

    // Mapper les tâches
    const mappedTasks = tasks.map((task) => {
      let taskType: 'call' | 'visit' | 'admin' = 'admin';
      const titleLower = task.title.toLowerCase();
      if (titleLower.includes('appel') || titleLower.includes('rappeler') || titleLower.includes('appeler')) {
        taskType = 'call';
      } else if (titleLower.includes('visite') || titleLower.includes('rdv')) {
        taskType = 'visit';
      }

      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (task.priority === 'URGENT' || task.priority === 'HIGH') {
        priority = 'high';
      } else if (task.priority === 'LOW') {
        priority = 'low';
      }

      return {
        id: task.id,
        title: task.title,
        time: task.dueDate ? format(new Date(task.dueDate), 'HH:mm', { locale: fr }) : '--:--',
        priority,
        completed: task.status === 'COMPLETED',
        type: taskType,
      };
    });

    // Mapper les messages
    const mappedMessages = communications.map((comm) => {
      const senderName = comm.user ? `${comm.user.firstName} ${comm.user.lastName}` : 'Système';
      const preview = comm.subject || comm.content?.substring(0, 50) || 'Sans sujet';
      const sentDate = new Date(comm.sentAt);
      const diffInMinutes = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60));
      
      let timeAgo = '';
      if (diffInMinutes < 60) {
        timeAgo = `${diffInMinutes} min`;
      } else if (diffInMinutes < 1440) {
        timeAgo = `${Math.floor(diffInMinutes / 60)}h`;
      } else {
        timeAgo = `${Math.floor(diffInMinutes / 1440)}j`;
      }

      return {
        id: comm.id,
        sender: senderName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=0f172a&color=fff`,
        preview,
        time: timeAgo,
        unread: comm.status === 'SENT' || comm.status === 'DELIVERED',
      };
    });

    // Mapper l'agenda
    const mappedAgenda = appointments.map((apt) => {
      const startDate = new Date(apt.startDate);
      const endDate = new Date(apt.endDate);
      const timeStr = `${format(startDate, 'HH:mm', { locale: fr })} - ${format(endDate, 'HH:mm', { locale: fr })}`;
      
      let type: 'visite' | 'signature' | 'estimation' = 'visite';
      const titleLower = apt.title.toLowerCase();
      if (titleLower.includes('signature')) {
        type = 'signature';
      } else if (titleLower.includes('estimation') || titleLower.includes('estimer')) {
        type = 'estimation';
      }

      const clientName = apt.client 
        ? `${apt.client.firstName} ${apt.client.lastName}`
        : 'Client non spécifié';
      
      const location = apt.location || (apt.property ? `${apt.property.city || ''}` : 'Non spécifié');

      return {
        id: apt.id,
        title: apt.title,
        client: clientName,
        time: timeStr,
        location,
        type,
      };
    });

    res.json({
      stats: {
        callsToMake,
        emailsUnread,
        todaysAppointments,
        pendingDeals,
      },
      tasks: mappedTasks,
      messages: mappedMessages,
      agenda: mappedAgenda,
      revenueData,
    });
  } catch (error: any) {
    console.error('Error in operational dashboard:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors du chargement des données',
    });
  }
});

export default router;


