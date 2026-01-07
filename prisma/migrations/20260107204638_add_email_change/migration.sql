-- CreateTable
CREATE TABLE "email_changes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_changes_userId_key" ON "email_changes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_changes_newEmail_key" ON "email_changes"("newEmail");

-- AddForeignKey
ALTER TABLE "email_changes" ADD CONSTRAINT "email_changes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
