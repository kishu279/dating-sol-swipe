/*
  Warnings:

  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_toUserId_fkey";

-- DropTable
DROP TABLE "Like";
