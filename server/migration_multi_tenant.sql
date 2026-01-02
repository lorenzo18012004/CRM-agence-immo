-- Migration SQL pour transformer le CRM en multi-tenant
-- À exécuter dans Supabase SQL Editor

-- 0. Ajouter SUPER_ADMIN à l'enum UserRole
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- 1. Renommer AgencySettings en Agency et ajouter isActive
ALTER TABLE "AgencySettings" RENAME TO "Agency";
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- 2. Transformer l'agence "default" en vraie agence (on garde l'ID "default" pour la compatibilité)
-- L'agence default existe déjà depuis le seed, on ajoute juste isActive

-- 3. Ajouter agencyId à User (nullable pour permettre SUPER_ADMIN sans agence)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyId" TEXT;
CREATE INDEX IF NOT EXISTS "User_agencyId_idx" ON "User"("agencyId");

-- Pour les utilisateurs existants, les associer à l'agence "default"
UPDATE "User" SET "agencyId" = 'default' WHERE "agencyId" IS NULL;

-- 4. Ajouter agencyId à Client
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "agencyId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "Client_agencyId_idx" ON "Client"("agencyId");

-- 5. Ajouter agencyId à Property et modifier la contrainte unique de reference
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "agencyId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "Property_agencyId_idx" ON "Property"("agencyId");
-- Supprimer l'ancienne contrainte unique sur reference
DROP INDEX IF EXISTS "Property_reference_key";
-- Créer une nouvelle contrainte unique composite (agencyId, reference)
CREATE UNIQUE INDEX IF NOT EXISTS "Property_agencyId_reference_key" ON "Property"("agencyId", "reference");

-- 6. Ajouter agencyId à Contract et modifier la contrainte unique de contractNumber
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "agencyId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "Contract_agencyId_idx" ON "Contract"("agencyId");
-- Supprimer l'ancienne contrainte unique sur contractNumber
DROP INDEX IF EXISTS "Contract_contractNumber_key";
-- Créer une nouvelle contrainte unique composite (agencyId, contractNumber)
CREATE UNIQUE INDEX IF NOT EXISTS "Contract_agencyId_contractNumber_key" ON "Contract"("agencyId", "contractNumber");

-- 7. Ajouter agencyId à Document
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "agencyId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "Document_agencyId_idx" ON "Document"("agencyId");

-- 8. Ajouter agencyId à Appointment
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "agencyId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "Appointment_agencyId_idx" ON "Appointment"("agencyId");

-- 9. Ajouter agencyId à CMSPage et modifier la contrainte unique de slug
ALTER TABLE "CMSPage" ADD COLUMN IF NOT EXISTS "agencyId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CMSPage_agencyId_idx" ON "CMSPage"("agencyId");
-- Supprimer l'ancienne contrainte unique sur slug
DROP INDEX IF EXISTS "CMSPage_slug_key";
-- Créer une nouvelle contrainte unique composite (agencyId, slug)
CREATE UNIQUE INDEX IF NOT EXISTS "CMSPage_agencyId_slug_key" ON "CMSPage"("agencyId", "slug");

-- 10. Ajouter agencyId à CMSPost et modifier la contrainte unique de slug
ALTER TABLE "CMSPost" ADD COLUMN IF NOT EXISTS "agencyId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CMSPost_agencyId_idx" ON "CMSPost"("agencyId");
-- Supprimer l'ancienne contrainte unique sur slug
DROP INDEX IF EXISTS "CMSPost_slug_key";
-- Créer une nouvelle contrainte unique composite (agencyId, slug)
CREATE UNIQUE INDEX IF NOT EXISTS "CMSPost_agencyId_slug_key" ON "CMSPost"("agencyId", "slug");

-- 11. Ajouter les contraintes de clé étrangère pour agencyId
-- User -> Agency (nullable, donc pas de contrainte pour l'instant, on la gère en application)

ALTER TABLE "Client" ADD CONSTRAINT "Client_agencyId_fkey" 
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Property" ADD CONSTRAINT "Property_agencyId_fkey" 
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Contract" ADD CONSTRAINT "Contract_agencyId_fkey" 
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Document" ADD CONSTRAINT "Document_agencyId_fkey" 
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_agencyId_fkey" 
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CMSPage" ADD CONSTRAINT "CMSPage_agencyId_fkey" 
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CMSPost" ADD CONSTRAINT "CMSPost_agencyId_fkey" 
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 12. Ajouter la contrainte pour User -> Agency (nullable, donc on peut la faire après)
-- On va créer cette contrainte mais elle peut échouer si des utilisateurs ont agencyId = NULL
-- Pour les SUPER_ADMIN, on gardera agencyId = NULL
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" 
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

