/*
  Warnings:

  - Added the required column `publicId` to the `property_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "property_images" ADD COLUMN     "publicId" TEXT NOT NULL;
