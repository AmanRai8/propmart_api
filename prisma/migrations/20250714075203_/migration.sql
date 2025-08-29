/*
  Warnings:

  - You are about to drop the column `latitude` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `properties` table. All the data in the column will be lost.
  - Added the required column `location` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_ownerId_fkey";

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "ownerId",
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
