/*
  Warnings:

  - Added the required column `customerName` to the `reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."reservation" DROP CONSTRAINT "reservation_userId_fkey";

-- AlterTable
ALTER TABLE "public"."reservation" ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "specialRequests" TEXT,
ADD COLUMN     "tableNumber" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."reservation" ADD CONSTRAINT "reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
