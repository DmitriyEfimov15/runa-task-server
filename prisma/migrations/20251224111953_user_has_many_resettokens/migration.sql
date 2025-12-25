-- DropIndex
DROP INDEX "reset_password_userId_key";

-- AlterTable
ALTER TABLE "reset_password" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "reset_password_userId_idx" ON "reset_password"("userId");
