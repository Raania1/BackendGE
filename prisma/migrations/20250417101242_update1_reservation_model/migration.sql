/*
  Warnings:

  - You are about to drop the column `dateFin` on the `Reservations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reservations" DROP COLUMN "dateFin",
ADD COLUMN     "demande" TEXT NOT NULL DEFAULT 'Une description longue du service...Une description longue du service...Une description longue du service...Une description longue du service...Une description longue du service...';
