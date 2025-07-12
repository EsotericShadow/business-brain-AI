/*
  Warnings:

  - You are about to drop the column `forwarding_address` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_forwarding_address_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "forwarding_address";

-- CreateTable
CREATE TABLE "ForwardingAddress" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForwardingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ForwardingAddress_email_key" ON "ForwardingAddress"("email");

-- CreateIndex
CREATE INDEX "ForwardingAddress_userId_idx" ON "ForwardingAddress"("userId");

-- AddForeignKey
ALTER TABLE "ForwardingAddress" ADD CONSTRAINT "ForwardingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
