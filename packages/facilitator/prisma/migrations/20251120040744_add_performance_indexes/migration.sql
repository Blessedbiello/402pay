-- CreateIndex for ApiKey
CREATE INDEX "api_keys_userId_revoked_idx" ON "api_keys"("userId", "revoked");
CREATE INDEX "api_keys_revoked_expiresAt_idx" ON "api_keys"("revoked", "expiresAt");

-- CreateIndex for Subscription
CREATE INDEX "subscriptions_status_currentPeriodEnd_idx" ON "subscriptions"("status", "currentPeriodEnd");
CREATE INDEX "subscriptions_agentId_status_idx" ON "subscriptions"("agentId", "status");

-- CreateIndex for Transaction
CREATE INDEX "transactions_payer_timestamp_idx" ON "transactions"("payer", "timestamp");
CREATE INDEX "transactions_recipient_status_idx" ON "transactions"("recipient", "status");
CREATE INDEX "transactions_timestamp_status_idx" ON "transactions"("timestamp", "status");
CREATE INDEX "transactions_agentId_timestamp_idx" ON "transactions"("agentId", "timestamp");

-- CreateIndex for AnalyticsEvent
CREATE INDEX "analytics_events_type_timestamp_idx" ON "analytics_events"("type", "timestamp");
CREATE INDEX "analytics_events_agentId_type_timestamp_idx" ON "analytics_events"("agentId", "type", "timestamp");

-- CreateIndex for AgentService
CREATE INDEX "agent_services_category_isActive_idx" ON "agent_services"("category", "isActive");
CREATE INDEX "agent_services_isActive_totalJobs_idx" ON "agent_services"("isActive", "totalJobs");
CREATE INDEX "agent_services_isActive_totalEarnings_idx" ON "agent_services"("isActive", "totalEarnings");
CREATE INDEX "agent_services_isActive_priceAmount_idx" ON "agent_services"("isActive", "priceAmount");

-- CreateIndex for JobRequest
CREATE INDEX "job_requests_status_createdAt_idx" ON "job_requests"("status", "createdAt");
CREATE INDEX "job_requests_clientAgentId_status_idx" ON "job_requests"("clientAgentId", "status");
CREATE INDEX "job_requests_providerAgentId_status_idx" ON "job_requests"("providerAgentId", "status");
CREATE INDEX "job_requests_status_deadline_idx" ON "job_requests"("status", "deadline");
CREATE INDEX "job_requests_escrowStatus_status_idx" ON "job_requests"("escrowStatus", "status");
