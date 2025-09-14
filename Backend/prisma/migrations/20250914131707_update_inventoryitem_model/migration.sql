/*
  Warnings:

  - You are about to drop the column `unit` on the `InventoryItem` table. All the data in the column will be lost.
  - Added the required column `quality` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."InventoryItem" DROP COLUMN "unit",
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "quality" TEXT NOT NULL;
