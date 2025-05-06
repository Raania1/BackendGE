-- AlterTable
ALTER TABLE "Prestataires" ADD COLUMN     "averageRating" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Ratings" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "organisateurid" TEXT NOT NULL,
    "prestataireid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ratings_organisateurid_prestataireid_key" ON "Ratings"("organisateurid", "prestataireid");

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_organisateurid_fkey" FOREIGN KEY ("organisateurid") REFERENCES "Organisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_prestataireid_fkey" FOREIGN KEY ("prestataireid") REFERENCES "Prestataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
