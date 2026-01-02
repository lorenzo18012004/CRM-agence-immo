import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for property photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
    }
  },
});

// Get all properties with filters
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      status,
      type,
      city,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const where: any = {};

    // Filtrer par agence (sauf super admin)
    if (!req.isSuperAdmin && req.agencyId) {
      where.agencyId = req.agencyId;
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice as string) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
    if (minSurface) where.surface = { ...where.surface, gte: parseFloat(minSurface as string) };
    if (maxSurface) where.surface = { ...where.surface, lte: parseFloat(maxSurface as string) };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { reference: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          photos: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              contracts: true,
              documents: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      properties,
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

// Get single property
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        photos: {
          orderBy: { order: 'asc' },
        },
        contracts: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        documents: true,
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Bien non trouvé' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && (property as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create property
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty(),
    body('type').notEmpty(),
    body('address').notEmpty(),
    body('city').notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('surface').isFloat({ min: 0 }),
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

      const data = req.body;
      
      // Generate reference (unique par agence)
      const count = await prisma.property.count({
        where: { 
          agencyId: req.agencyId,
        } as any,
      });
      const reference = `PROP-${String(count + 1).padStart(6, '0')}`;

      const property = await prisma.property.create({
        data: {
          ...data,
          reference,
          userId: req.userId!,
          agencyId: req.agencyId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          photos: true,
        },
      });

      res.status(201).json(property);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Update property
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
    });

    if (!property) {
      return res.status(404).json({ error: 'Bien non trouvé' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && (property as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        photos: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete property
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        agencyId: true,
      } as any,
    });

    if (!property) {
      return res.status(404).json({ error: 'Bien non trouvé' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && (property as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await prisma.property.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Bien supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Upload property photo
router.post('/:id/photos', authenticate, upload.single('photo'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        agencyId: true,
      } as any,
    });

    if (!property) {
      // Delete uploaded file if property doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Bien non trouvé' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && (property as any).agencyId !== req.agencyId) {
      // Delete uploaded file if access denied
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Get current max order for this property
    const maxOrder = await prisma.propertyPhoto.findFirst({
      where: { propertyId: req.params.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const photo = await prisma.propertyPhoto.create({
      data: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        propertyId: req.params.id,
        isMain: maxOrder === null, // First photo is main by default
        order: maxOrder ? maxOrder.order + 1 : 0,
      },
    });

    res.status(201).json(photo);
  } catch (error: any) {
    console.error(error);
    // Delete uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// Delete property photo
router.delete('/:id/photos/:photoId', authenticate, async (req: AuthRequest, res) => {
  try {
    const photo = await prisma.propertyPhoto.findUnique({
      where: { id: req.params.photoId },
      include: {
        property: {
          select: {
            id: true,
            agencyId: true,
          } as any,
        },
      },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && (photo.property as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.propertyPhoto.delete({
      where: { id: req.params.photoId },
    });

    // If deleted photo was main, set first remaining photo as main
    if (photo.isMain) {
      const firstPhoto = await prisma.propertyPhoto.findFirst({
        where: { propertyId: req.params.id },
        orderBy: { order: 'asc' },
      });
      if (firstPhoto) {
        await prisma.propertyPhoto.update({
          where: { id: firstPhoto.id },
          data: { isMain: true },
        });
      }
    }

    res.json({ message: 'Photo supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Set main photo
router.patch('/:id/photos/:photoId/set-main', authenticate, async (req: AuthRequest, res) => {
  try {
    const photo = await prisma.propertyPhoto.findUnique({
      where: { id: req.params.photoId },
      include: {
        property: {
          select: {
            id: true,
            agencyId: true,
          } as any,
        },
      },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }

    // Vérifier l'accès
    if (!req.isSuperAdmin && (photo.property as any).agencyId !== req.agencyId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Unset all main photos for this property
    await prisma.propertyPhoto.updateMany({
      where: { propertyId: req.params.id, isMain: true },
      data: { isMain: false },
    });

    // Set this photo as main
    const updated = await prisma.propertyPhoto.update({
      where: { id: req.params.photoId },
      data: { isMain: true },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

