-- Script SQL pour créer l'utilisateur admin
-- À exécuter dans le SQL Editor de Supabase

-- Hash bcrypt valide pour le mot de passe "admin123"
-- Ce hash a été généré avec bcrypt (cost 10)

INSERT INTO "User" (
    "id",
    "email",
    "password",
    "firstName",
    "lastName",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin',
    'User',
    'ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("email") DO UPDATE SET
    "password" = EXCLUDED."password",
    "role" = EXCLUDED."role",
    "isActive" = EXCLUDED."isActive";

-- Créer les paramètres par défaut de l'agence
INSERT INTO "AgencySettings" (
    "id",
    "name",
    "email",
    "phone",
    "createdAt",
    "updatedAt"
) VALUES (
    'default',
    'Mon Agence Immobilière',
    'contact@agence.com',
    '+33 1 23 45 67 89',
    NOW(),
    NOW()
) ON CONFLICT ("id") DO NOTHING;

-- Vérifier que l'utilisateur a été créé
SELECT "id", "email", "firstName", "lastName", "role", "isActive" 
FROM "User" 
WHERE "email" = 'admin@example.com';

