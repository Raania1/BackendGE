-- CreateTable
CREATE TABLE "PaymentPub" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "Status" TEXT NOT NULL DEFAULT 'PENDING',
    "flouciId" TEXT,
    "publiciteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentPub_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentPub" ADD CONSTRAINT "PaymentPub_publiciteId_fkey" FOREIGN KEY ("publiciteId") REFERENCES "PublicitePack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
