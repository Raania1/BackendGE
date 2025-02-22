-- CreateTable
CREATE TABLE "Prestataires" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "password" TEXT NOT NULL,
    "travail" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "numTel" INTEGER NOT NULL,
    "numCin" INTEGER NOT NULL,
    "ville" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "pdProfile" TEXT NOT NULL DEFAULT 'https://th.bing.com/th/id/OIP.lvzPu-WOW4Iv7QyjP-IkrgHaHa?rs=1&pid=ImgDetMain',
    "fichierConfirmation" TEXT[],
    "approoved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prestataires_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prestataires_email_key" ON "Prestataires"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Prestataires_numTel_key" ON "Prestataires"("numTel");

-- CreateIndex
CREATE UNIQUE INDEX "Prestataires_numCin_key" ON "Prestataires"("numCin");
