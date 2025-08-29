/*
  Warnings:

  - You are about to alter the column `location` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Unsupported("geography(point, 4326)")`.

*/
CREATE EXTENSION IF NOT EXISTS postgis;

-- AlterTable
ALTER TABLE "public"."properties" ALTER COLUMN "location" SET DATA TYPE geography(point, 4326)
USING location::geography(point, 4326);
