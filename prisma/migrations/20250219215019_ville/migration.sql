/*
  Warnings:

  - Added the required column `ville` to the `Organisateurs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organisateurs" ADD COLUMN     "ville" TEXT NOT NULL;
