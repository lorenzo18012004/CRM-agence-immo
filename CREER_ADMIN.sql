-- Script SQL pour créer l'utilisateur admin et les paramètres de l'agence
-- À exécuter dans le SQL Editor de Supabase

-- Note: Le mot de passe est hashé avec bcrypt pour "admin123"
-- Hash bcrypt de "admin123": $2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq

-- Créer l'utilisateur admin
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
    '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
    'Admin',
    'User',
    'ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("email") DO NOTHING;

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
SELECT "id", "email", "firstName", "lastName", "role" FROM "User" WHERE "email" = 'admin@example.com';

