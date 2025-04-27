/*
  Warnings:

  - Made the column `serviceid` on table `Reservations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Reservations" DROP CONSTRAINT "Reservations_serviceid_fkey";

-- AlterTable
ALTER TABLE "Reservations" ALTER COLUMN "serviceid" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservations" ADD CONSTRAINT "Reservations_serviceid_fkey" FOREIGN KEY ("serviceid") REFERENCES "Services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
