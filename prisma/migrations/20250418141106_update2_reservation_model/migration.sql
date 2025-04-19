/*
  Warnings:

  - Added the required column `prix` to the `Reservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservations" ADD COLUMN     "prix" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "demande" DROP DEFAULT;
