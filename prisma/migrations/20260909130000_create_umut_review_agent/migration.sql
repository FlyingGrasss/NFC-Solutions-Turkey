-- Repair legacy cold walk-in ownership with an encoding-safe member name.
INSERT INTO "LeadParticipant" ("leadId", "memberId")
SELECT l."id", m."id"
FROM "Lead" l
CROSS JOIN "Member" m
WHERE l."source" = 'COLD_WALK_IN'
  AND lower(m."name") = lower(U&'Ba\015Far')
  AND NOT EXISTS (
    SELECT 1 FROM "LeadParticipant" p WHERE p."leadId" = l."id"
  )
ON CONFLICT DO NOTHING;

INSERT INTO "Member" ("id", "name", "role", "passwordHash", "createdAt")
VALUES (
  'review-agent-umut',
  'Umut',
  'REVIEW_AGENT',
  '$2b$12$enDDyacheh594bZNKF9T..1ZRxgtmROUyvfFBNxZhS9Hade5QfKSS',
  NOW()
)
ON CONFLICT ("id") DO UPDATE
SET "name" = EXCLUDED."name",
    "role" = EXCLUDED."role",
    "passwordHash" = EXCLUDED."passwordHash";
