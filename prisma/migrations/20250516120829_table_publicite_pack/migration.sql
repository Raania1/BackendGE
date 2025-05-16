-- CreateTable
CREATE TABLE "PublicitePack" (
    "id" TEXT NOT NULL,
    "DatePublic" TIMESTAMP(3) NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "Status" "Status" NOT NULL DEFAULT 'PENDING',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "packid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicitePack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PublicitePack" ADD CONSTRAINT "PublicitePack_packid_fkey" FOREIGN KEY ("packid") REFERENCES "Pack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
