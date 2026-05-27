-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('STUDENT', 'STAFF', 'COORDINATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SYSTEM');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" "RoleName" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "student_code" TEXT NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimated_days" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "request_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "user_id" TEXT NOT NULL,
    "request_type_id" TEXT NOT NULL,
    "assigned_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_id" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "request_types_name_key" ON "request_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "requests_tracking_number_key" ON "requests"("tracking_number");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_request_type_id_fkey" FOREIGN KEY ("request_type_id") REFERENCES "request_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
