/*
  Warnings:

  - A unique constraint covering the columns `[activation_link]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activation_code` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activation_link` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activation_code" INTEGER NOT NULL,
ADD COLUMN     "activation_link" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_activation_link_key" ON "users"("activation_link");
