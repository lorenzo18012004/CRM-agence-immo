-- Migration SQL pour ajouter le champ code à Agency
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne code
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- Créer un index unique sur code
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_code_key" ON "Agency"("code");

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "Agency_code_idx" ON "Agency"("code");

-- Mettre à jour l'agence "default" avec un code (exemple: 6165)
UPDATE "Agency" SET "code" = '6165' WHERE "id" = 'default' AND "code" IS NULL;

-- Si vous avez d'autres agences, ajoutez des codes uniques pour chacune


