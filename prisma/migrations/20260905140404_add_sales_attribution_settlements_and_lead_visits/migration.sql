-- CreateEnum
CREATE TYPE "SaleMode" AS ENUM ('UNASSIGNED', 'SOLO', 'JOINT');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('COLD_WALK_IN', 'MESSAGE', 'CALL', 'MAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('UNCLASSIFIED', 'REFUSED', 'DECISION_MAKER_ABSENT', 'STAFF_LIKED', 'STAFF_EXPECTS_BOSS_INTEREST', 'FOLLOW_UP_REQUESTED', 'ORDER_INTENT', 'ORDER_CONFIRMED');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "createdByMemberId" TEXT,
ADD COLUMN     "source" "LeadSource" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "stage" "LeadStage" NOT NULL DEFAULT 'UNCLASSIFIED';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "leadId" TEXT,
ADD COLUMN     "saleMode" "SaleMode" NOT NULL DEFAULT 'UNASSIGNED',
ADD COLUMN     "soldByMemberId" TEXT;

-- CreateTable
CREATE TABLE "LeadVisit" (
    "id" TEXT NOT NULL,
    "stage" "LeadStage" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spokeToDecisionMaker" BOOLEAN NOT NULL DEFAULT false,
    "followUpAt" TIMESTAMP(3),
    "contactInfo" TEXT,
    "details" TEXT,
    "leadId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LeadVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByName" TEXT NOT NULL DEFAULT 'Bilinmiyor',
    "fromMemberId" TEXT NOT NULL,
    "toMemberId" TEXT NOT NULL,
    "createdByMemberId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadVisit_leadId_occurredAt_idx" ON "LeadVisit"("leadId", "occurredAt");

-- CreateIndex
CREATE INDEX "LeadVisit_userId_occurredAt_idx" ON "LeadVisit"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "LeadVisit_memberId_occurredAt_idx" ON "LeadVisit"("memberId", "occurredAt");

-- CreateIndex
CREATE INDEX "Settlement_userId_date_idx" ON "Settlement"("userId", "date");

-- CreateIndex
CREATE INDEX "Settlement_fromMemberId_date_idx" ON "Settlement"("fromMemberId", "date");

-- CreateIndex
CREATE INDEX "Settlement_toMemberId_date_idx" ON "Settlement"("toMemberId", "date");

-- CreateIndex
CREATE INDEX "Lead_userId_source_stage_idx" ON "Lead"("userId", "source", "stage");

-- CreateIndex
CREATE INDEX "Lead_createdByMemberId_idx" ON "Lead"("createdByMemberId");

-- CreateIndex
CREATE INDEX "Transaction_soldByMemberId_idx" ON "Transaction"("soldByMemberId");

-- CreateIndex
CREATE INDEX "Transaction_leadId_idx" ON "Transaction"("leadId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_soldByMemberId_fkey" FOREIGN KEY ("soldByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadVisit" ADD CONSTRAINT "LeadVisit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadVisit" ADD CONSTRAINT "LeadVisit_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadVisit" ADD CONSTRAINT "LeadVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_fromMemberId_fkey" FOREIGN KEY ("fromMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_toMemberId_fkey" FOREIGN KEY ("toMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
