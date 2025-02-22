-- CreateTable
CREATE TABLE "Organisateurs" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(191) NOT NULL,
    "prenom" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "password" TEXT NOT NULL,
    "numTel" INTEGER NOT NULL,
    "numCin" INTEGER NOT NULL,
    "adress" TEXT NOT NULL,
    "pdProfile" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evennements" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lieu" TEXT NOT NULL,
    "budgetTotale" DOUBLE PRECISION NOT NULL,
    "organisateurid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evennements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisateurs_email_key" ON "Organisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organisateurs_numTel_key" ON "Organisateurs"("numTel");

-- CreateIndex
CREATE UNIQUE INDEX "Organisateurs_numCin_key" ON "Organisateurs"("numCin");

-- AddForeignKey
ALTER TABLE "Evennements" ADD CONSTRAINT "Evennements_organisateurid_fkey" FOREIGN KEY ("organisateurid") REFERENCES "Organisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
