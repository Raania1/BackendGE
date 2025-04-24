-- CreateTable
CREATE TABLE "Comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "organisateurid" TEXT NOT NULL,
    "prestataireid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_organisateurid_fkey" FOREIGN KEY ("organisateurid") REFERENCES "Organisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_prestataireid_fkey" FOREIGN KEY ("prestataireid") REFERENCES "Prestataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
