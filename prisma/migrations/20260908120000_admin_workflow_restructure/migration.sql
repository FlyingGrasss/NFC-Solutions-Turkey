-- Separate transaction entry ownership and sales analytics from profit sharing.
ALTER TABLE "Transaction" ADD COLUMN "createdByMemberId" TEXT;

CREATE TABLE "TransactionSeller" (
  "transactionId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  CONSTRAINT "TransactionSeller_pkey" PRIMARY KEY ("transactionId", "memberId")
);

CREATE INDEX "Transaction_createdByMemberId_idx" ON "Transaction"("createdByMemberId");
CREATE INDEX "TransactionSeller_memberId_idx" ON "TransactionSeller"("memberId");

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdByMemberId_fkey"
  FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransactionSeller" ADD CONSTRAINT "TransactionSeller_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransactionSeller" ADD CONSTRAINT "TransactionSeller_memberId_fkey"
  FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill the member who entered each transaction and the known legacy solo seller.
UPDATE "Transaction" t SET "createdByMemberId" = m."id"
FROM "Member" m WHERE lower(t."createdByName") = lower(m."name");
INSERT INTO "TransactionSeller" ("transactionId", "memberId")
SELECT "id", "soldByMemberId" FROM "Transaction"
WHERE "type" = 'INCOME' AND "saleMode" = 'SOLO' AND "soldByMemberId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Google review generation becomes the source of cold walk-in records.
ALTER TABLE "Lead" ADD COLUMN "googlePlaceId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "googleReviewUrl" TEXT;
ALTER TABLE "Lead" ADD COLUMN "sourceMapsUrl" TEXT;
ALTER TABLE "Lead" ADD COLUMN "wasSold" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "Lead_userId_googlePlaceId_key" ON "Lead"("userId", "googlePlaceId");

CREATE TABLE "LeadParticipant" (
  "leadId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  CONSTRAINT "LeadParticipant_pkey" PRIMARY KEY ("leadId", "memberId")
);
CREATE INDEX "LeadParticipant_memberId_idx" ON "LeadParticipant"("memberId");
ALTER TABLE "LeadParticipant" ADD CONSTRAINT "LeadParticipant_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadParticipant" ADD CONSTRAINT "LeadParticipant_memberId_fkey"
  FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "LeadNote" (
  "id" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leadId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LeadNote_leadId_createdAt_idx" ON "LeadNote"("leadId", "createdAt");
CREATE INDEX "LeadNote_userId_createdAt_idx" ON "LeadNote"("userId", "createdAt");
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_memberId_fkey"
  FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
