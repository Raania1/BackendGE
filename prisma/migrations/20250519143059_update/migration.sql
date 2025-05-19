-- DropForeignKey
ALTER TABLE "Reservations" DROP CONSTRAINT "Reservations_serviceid_fkey";

-- AlterTable
ALTER TABLE "Reservations" ADD COLUMN     "dateFin" TIMESTAMP(3),
ADD COLUMN     "packid" TEXT,
ALTER COLUMN "serviceid" DROP NOT NULL,
ALTER COLUMN "demande" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservations" ADD CONSTRAINT "Reservations_serviceid_fkey" FOREIGN KEY ("serviceid") REFERENCES "Services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservations" ADD CONSTRAINT "Reservations_packid_fkey" FOREIGN KEY ("packid") REFERENCES "Pack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
