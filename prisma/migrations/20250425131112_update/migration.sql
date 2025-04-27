/*
  Warnings:

  - The `Status` column on the `Reservations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `approoved` on the `Services` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED');

-- AlterTable
ALTER TABLE "Reservations" DROP COLUMN "Status",
ADD COLUMN     "Status" "Status" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Services" DROP COLUMN "approoved",
ADD COLUMN     "Status" "Status" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "ReservationStatus";
