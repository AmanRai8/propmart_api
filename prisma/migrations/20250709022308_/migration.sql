/*
  Warnings:

  - You are about to drop the column `Role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "Role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CUSTOMER';
