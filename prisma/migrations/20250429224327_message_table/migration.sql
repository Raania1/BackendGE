-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'PAID';

-- CreateTable
CREATE TABLE "Messages" (
    "id" TEXT NOT NULL,
    "NomComplet" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "Sujet" TEXT NOT NULL,
    "Message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);
