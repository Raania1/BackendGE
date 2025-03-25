/*
  Warnings:

  - You are about to drop the column `date` on the `Evennements` table. All the data in the column will be lost.
  - Added the required column `dateDebut` to the `Evennements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateFin` to the `Evennements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evennements" DROP COLUMN "date",
ADD COLUMN     "dateDebut" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dateFin" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "budgetTotale" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "_EvennementsToServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EvennementsToServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EvennementsToServices_B_index" ON "_EvennementsToServices"("B");

-- AddForeignKey
ALTER TABLE "_EvennementsToServices" ADD CONSTRAINT "_EvennementsToServices_A_fkey" FOREIGN KEY ("A") REFERENCES "Evennements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EvennementsToServices" ADD CONSTRAINT "_EvennementsToServices_B_fkey" FOREIGN KEY ("B") REFERENCES "Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
