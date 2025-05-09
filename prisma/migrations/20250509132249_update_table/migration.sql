/*
  Warnings:

  - You are about to drop the column `approoved` on the `Prestataires` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prestataires" DROP COLUMN "approoved",
ADD COLUMN     "Status" "Status" NOT NULL DEFAULT 'PENDING';
