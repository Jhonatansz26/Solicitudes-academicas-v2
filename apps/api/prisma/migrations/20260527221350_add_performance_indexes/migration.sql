-- CreateIndex
CREATE INDEX "attachments_request_id_idx" ON "attachments"("request_id");

-- CreateIndex
CREATE INDEX "attachments_request_id_created_at_idx" ON "attachments"("request_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "attachments_uploaded_by_idx" ON "attachments"("uploaded_by");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_request_id_idx" ON "notifications"("request_id");

-- CreateIndex
CREATE INDEX "notifications_sent_idx" ON "notifications"("sent");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "request_history_request_id_idx" ON "request_history"("request_id");

-- CreateIndex
CREATE INDEX "request_history_request_id_created_at_idx" ON "request_history"("request_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "requests_user_id_idx" ON "requests"("user_id");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- CreateIndex
CREATE INDEX "requests_request_type_id_idx" ON "requests"("request_type_id");

-- CreateIndex
CREATE INDEX "requests_created_at_idx" ON "requests"("created_at" DESC);

-- CreateIndex
CREATE INDEX "requests_user_id_status_created_at_idx" ON "requests"("user_id", "status", "created_at" DESC);
