/*
  Warnings:

  - Added the required column `file_size` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_name` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_request_id_fkey";

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "file_size" INTEGER NOT NULL,
ADD COLUMN     "original_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "provider" SET DEFAULT 'local';

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
