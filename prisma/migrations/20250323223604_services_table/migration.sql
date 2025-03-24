-- CreateTable
CREATE TABLE "Services" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "promo" INTEGER NOT NULL,
    "Photos" TEXT[],
    "photoCouverture" TEXT NOT NULL,
    "Prestataireid" TEXT NOT NULL,
    "approoved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_Prestataireid_fkey" FOREIGN KEY ("Prestataireid") REFERENCES "Prestataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
