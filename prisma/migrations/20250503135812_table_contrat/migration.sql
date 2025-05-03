-- CreateTable
CREATE TABLE "Contrats" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "prestataireid" TEXT NOT NULL,
    "organisateurid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contrats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contrats_paymentId_key" ON "Contrats"("paymentId");

-- AddForeignKey
ALTER TABLE "Contrats" ADD CONSTRAINT "Contrats_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrats" ADD CONSTRAINT "Contrats_organisateurid_fkey" FOREIGN KEY ("organisateurid") REFERENCES "Organisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrats" ADD CONSTRAINT "Contrats_prestataireid_fkey" FOREIGN KEY ("prestataireid") REFERENCES "Prestataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
