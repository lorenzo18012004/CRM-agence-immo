import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, phone, role } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email déjà utilisé' });
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
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
        },
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || '',
        { expiresIn: '7d' }
      );

      res.status(201).json({ user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Verify agency code
router.post(
  '/verify-agency',
  [body('code').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code } = req.body;
      // Trim whitespace and normalize
      const normalizedCode = code.trim();

      console.log('🔍 Verifying agency code:', normalizedCode);

      const agency = await prisma.agency.findUnique({
        where: { code: normalizedCode },
        select: {
          id: true,
          code: true,
          name: true,
          logo: true,
          isActive: true,
        },
      });

      console.log('📋 Agency found:', agency ? { id: agency.id, code: agency.code, name: agency.name, isActive: agency.isActive } : 'null');

      if (!agency) {
        // Try to find all agencies to help debug
        const allAgencies = await prisma.agency.findMany({
          select: { code: true, name: true, isActive: true },
        });
        console.log('📋 All agencies in DB:', allAgencies);
        return res.status(404).json({ error: 'Code agence invalide' });
      }

      if (!agency.isActive) {
        console.log('⚠️ Agency found but inactive:', agency.code);
        return res.status(404).json({ error: 'Code agence invalide ou agence inactive' });
      }

      res.json({
        agency: {
          id: agency.id,
          code: agency.code,
          name: agency.name,
          logo: agency.logo,
        },
      });
    } catch (error: any) {
      console.error('❌ Error in verify-agency:', error);
      console.error('❌ Error name:', error?.name);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      console.error('❌ DATABASE_URL exists:', !!process.env.DATABASE_URL);
      
      // Check if it's a Prisma connection error
      if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database server')) {
        return res.status(500).json({ 
          error: 'Impossible de se connecter à la base de données',
          details: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
      }
      
      // Check if Prisma Client is not generated
      if (error?.message?.includes('PrismaClient') || error?.message?.includes('@prisma/client')) {
        return res.status(500).json({ 
          error: 'Erreur de configuration Prisma',
          details: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
      }
      
      // Log more details in development
      const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Erreur serveur' 
        : error.message || 'Erreur serveur';
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
    body('agencyCode').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, agencyCode } = req.body;

      // Vérifier que l'agence existe et est active
      const agency = await prisma.agency.findUnique({
        where: { code: agencyCode },
      });

      if (!agency || !agency.isActive) {
        return res.status(404).json({ error: 'Code agence invalide ou agence inactive' });
      }

      // Trouver l'utilisateur avec cet email ET cette agence
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Vérifier que l'utilisateur appartient à cette agence (sauf SUPER_ADMIN)
      if (user.role !== 'SUPER_ADMIN' && user.agencyId !== agency.id) {
        return res.status(403).json({ error: 'Vous n\'appartenez pas à cette agence' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role, agencyId: user.agencyId },
        process.env.JWT_SECRET || '',
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          agencyId: user.agencyId,
        },
        agency: {
          id: agency.id,
          code: agency.code,
          name: agency.name,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        agencyId: true,
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
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

export default router;

