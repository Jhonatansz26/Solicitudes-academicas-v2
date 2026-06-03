-- CreateEnum
CREATE TYPE "OfficialDocumentType" AS ENUM ('CERTIFICATE', 'TRANSCRIPT', 'RESOLUTION', 'CONSTANCY', 'OTHER');

-- CreateTable
CREATE TABLE "official_documents" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "type" "OfficialDocumentType" NOT NULL,
    "snapshot_data" JSONB,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "generated_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "official_documents_request_id_version_key" ON "official_documents"("request_id", "version");

-- CreateIndex
CREATE INDEX "official_documents_request_id_idx" ON "official_documents"("request_id");

-- CreateIndex
CREATE INDEX "official_documents_request_id_version_idx" ON "official_documents"("request_id", "version" DESC);

-- CreateIndex
CREATE INDEX "official_documents_type_idx" ON "official_documents"("type");

-- CreateIndex
CREATE INDEX "official_documents_created_at_idx" ON "official_documents"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "official_documents" ADD CONSTRAINT "official_documents_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "official_documents" ADD CONSTRAINT "official_documents_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
