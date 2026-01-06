/*
  Warnings:

  - A unique constraint covering the columns `[transactionUuid]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."PaymentMethod" ADD VALUE 'KHALTI';

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "transactionUuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionUuid_key" ON "public"."Payment"("transactionUuid");
