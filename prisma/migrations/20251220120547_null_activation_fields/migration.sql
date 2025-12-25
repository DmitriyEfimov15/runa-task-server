-- AlterTable
ALTER TABLE "users" ALTER COLUMN "activation_code" DROP NOT NULL,
ALTER COLUMN "activation_link" DROP NOT NULL;
