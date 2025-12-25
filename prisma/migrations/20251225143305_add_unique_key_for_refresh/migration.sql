/*
  Warnings:

  - A unique constraint covering the columns `[userId,device_info]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_userId_device_info_key" ON "refresh_tokens"("userId", "device_info");
