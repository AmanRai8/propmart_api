/*
  Warnings:

  - The values [AVAILABLE,SOLD,RENTED] on the enum `PropertyStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [APARTMENT,HOUSE,LAND] on the enum `PropertyType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN,OWNER,CUSTOMER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PropertyStatus_new" AS ENUM ('Available', 'Sold', 'Rent');
ALTER TABLE "public"."properties" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."properties" ALTER COLUMN "status" TYPE "public"."PropertyStatus_new" USING ("status"::text::"public"."PropertyStatus_new");
ALTER TYPE "public"."PropertyStatus" RENAME TO "PropertyStatus_old";
ALTER TYPE "public"."PropertyStatus_new" RENAME TO "PropertyStatus";
DROP TYPE "public"."PropertyStatus_old";
ALTER TABLE "public"."properties" ALTER COLUMN "status" SET DEFAULT 'Available';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PropertyType_new" AS ENUM ('Apartment', 'House', 'Land');
ALTER TABLE "public"."properties" ALTER COLUMN "type" TYPE "public"."PropertyType_new" USING ("type"::text::"public"."PropertyType_new");
ALTER TYPE "public"."PropertyType" RENAME TO "PropertyType_old";
ALTER TYPE "public"."PropertyType_new" RENAME TO "PropertyType";
DROP TYPE "public"."PropertyType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('Admin', 'Owner', 'Customer');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'Customer';
COMMIT;

-- AlterTable
ALTER TABLE "public"."properties" ALTER COLUMN "status" SET DEFAULT 'Available';

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'Customer';
