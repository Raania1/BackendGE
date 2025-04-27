-- DropForeignKey
ALTER TABLE "Reservations" DROP CONSTRAINT "Reservations_serviceid_fkey";

-- AlterTable
ALTER TABLE "Reservations" ALTER COLUMN "serviceid" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservations" ADD CONSTRAINT "Reservations_serviceid_fkey" FOREIGN KEY ("serviceid") REFERENCES "Services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
