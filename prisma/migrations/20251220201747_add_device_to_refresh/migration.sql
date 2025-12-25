/*
  Warnings:

  - Added the required column `device_info` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "device_info" TEXT NOT NULL;
