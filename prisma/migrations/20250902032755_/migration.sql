-- AlterTable
ALTER TABLE "public"."properties" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;
