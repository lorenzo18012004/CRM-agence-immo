-- Migration SQL pour ajouter SUPER_ADMIN à l'enum UserRole
-- À exécuter dans Supabase SQL Editor

ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

