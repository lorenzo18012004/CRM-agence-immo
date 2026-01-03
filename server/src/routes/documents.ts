import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
// On Vercel, use /tmp which is the only writable directory
// In local development, use the project uploads folder
const uploadsDir = process.env.VERCEL 
  ? '/tmp/uploads' 
  : path.join(__dirname, '../../uploads');

// Only try to create directory if not on Vercel (serverless)
if (!process.env.VERCEL) {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} else {
  // On Vercel, ensure /tmp/uploads exists
  try {
    if (!fs.existsSync('/tmp/uploads')) {
      fs.mkdirSync('/tmp/uploads', { recursive: true });
    }
  } catch (error) {
    // Ignore error if directory creation fails on Vercel
    console.warn('Could not create uploads directory:', error);
  }
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Get all documents
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, propertyId, contractId, clientId, page = '1', limit = '20' } = req.query;

    const where: any = {};
    
    // Filtrer par agence (sauf super admin)
    if (!req.isSuperAdmin && req.agencyId) {
      where.agencyId = req.agencyId;
    }
    
    if (type) where.type = type;
    if (propertyId) where.propertyId = propertyId;
    if (contractId) where.contractId = contractId;
    if (clientId) where.clientId = clientId;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
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
          contract: {
            select: {
              id: true,
              contractNumber: true,
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
      prisma.document.count({ where }),
    ]);

    res.json({
      documents,
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

// Get single document
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        property: true,
        contract: true,
        client: true,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && document.agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Upload document
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { type, description, propertyId, contractId, clientId } = req.body;

    const document = await prisma.document.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        type: type || 'OTHER',
        description,
        userId: req.userId!,
        propertyId: propertyId || null,
        contractId: contractId || null,
        clientId: clientId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete document
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && document.agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.document.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Document supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

