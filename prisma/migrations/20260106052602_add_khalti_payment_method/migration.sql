/*
  Warnings:

  - The values [APPETIZER,MAIN_COURSE,DESSERT,SNACK] on the enum `MenuCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [MOBILEBANKING,ESEWA] on the enum `OrderPaymentType` will be removed. If these variants are still used in the database, this will fail.
  - The values [STAFF] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ActivityLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."InventoryCategory" ADD VALUE 'MACHINES';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MenuCategory_new" AS ENUM ('COFFEE', 'TEA', 'PASTRY', 'BEVERAGE');
ALTER TYPE "public"."MenuCategory" RENAME TO "MenuCategory_old";
ALTER TYPE "public"."MenuCategory_new" RENAME TO "MenuCategory";
DROP TYPE "public"."MenuCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrderPaymentType_new" AS ENUM ('CASH', 'KHALTI');
ALTER TABLE "public"."Order" ALTER COLUMN "orderPaymentType" DROP DEFAULT;
ALTER TABLE "public"."Order" ALTER COLUMN "orderPaymentType" TYPE "public"."OrderPaymentType_new" USING ("orderPaymentType"::text::"public"."OrderPaymentType_new");
ALTER TYPE "public"."OrderPaymentType" RENAME TO "OrderPaymentType_old";
ALTER TYPE "public"."OrderPaymentType_new" RENAME TO "OrderPaymentType";
DROP TYPE "public"."OrderPaymentType_old";
ALTER TABLE "public"."Order" ALTER COLUMN "orderPaymentType" SET DEFAULT 'CASH';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropTable
DROP TABLE "public"."ActivityLog";
