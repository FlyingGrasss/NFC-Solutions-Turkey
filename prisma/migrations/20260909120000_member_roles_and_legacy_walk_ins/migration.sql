CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'REVIEW_AGENT');
ALTER TABLE "Member" ADD COLUMN "role" "MemberRole" NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "Member" ADD COLUMN "passwordHash" TEXT;

-- Bring legacy cold walk-ins into the current analytics and assign them to Başar.
INSERT INTO "LeadParticipant" ("leadId", "memberId")
SELECT l."id", m."id"
FROM "Lead" l
CROSS JOIN "Member" m
WHERE l."source" = 'COLD_WALK_IN'
  AND lower(m."name") = lower(U&'Ba\015Far')
  AND NOT EXISTS (SELECT 1 FROM "LeadParticipant" p WHERE p."leadId" = l."id")
ON CONFLICT DO NOTHING;

UPDATE "Lead"
SET "wasSold" = CASE WHEN "stage" = 'ORDER_CONFIRMED' THEN true ELSE false END
WHERE "source" = 'COLD_WALK_IN' AND "googlePlaceId" IS NULL;
