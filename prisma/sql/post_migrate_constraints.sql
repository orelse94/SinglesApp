-- Run this SQL after Prisma creates base tables/migrations.
-- It enforces invariants Prisma schema cannot express directly.

ALTER TABLE "UserBlock"
  ADD CONSTRAINT "UserBlock_no_self_block"
  CHECK ("blockerUserId" <> "blockedUserId");

ALTER TABLE "ChatRequest"
  ADD CONSTRAINT "ChatRequest_no_self_request"
  CHECK ("fromUserId" <> "toUserId");

ALTER TABLE "ChatRequest"
  ADD CONSTRAINT "ChatRequest_pending_key_matches_status"
  CHECK (
    ("status" = 'PENDING' AND "pendingKey" IS NOT NULL)
    OR ("status" <> 'PENDING' AND "pendingKey" IS NULL)
  );

ALTER TABLE "PhotoAccessRequest"
  ADD CONSTRAINT "PhotoAccessRequest_no_self_request"
  CHECK ("requesterUserId" <> "ownerUserId");

ALTER TABLE "PhotoAccessRequest"
  ADD CONSTRAINT "PhotoAccessRequest_pending_key_matches_status"
  CHECK (
    ("status" = 'PENDING' AND "pendingKey" IS NOT NULL)
    OR ("status" <> 'PENDING' AND "pendingKey" IS NULL)
  );

ALTER TABLE "GroupJoinRequest"
  ADD CONSTRAINT "GroupJoinRequest_pending_key_matches_status"
  CHECK (
    ("status" = 'PENDING' AND "pendingKey" IS NOT NULL)
    OR ("status" <> 'PENDING' AND "pendingKey" IS NULL)
  );

ALTER TABLE "Post"
  ADD CONSTRAINT "Post_anonymous_only_in_global_feed"
  CHECK (NOT "isAnonymous" OR "contextType" = 'GLOBAL_FEED');

ALTER TABLE "Report"
  ADD CONSTRAINT "Report_exactly_one_target_matches_type"
  CHECK (
    (
      "targetType" = 'USER'
      AND "targetUserId" IS NOT NULL
      AND "targetPostId" IS NULL
      AND "targetCommentId" IS NULL
      AND "targetMessageId" IS NULL
      AND "targetGroupId" IS NULL
    ) OR (
      "targetType" = 'POST'
      AND "targetUserId" IS NULL
      AND "targetPostId" IS NOT NULL
      AND "targetCommentId" IS NULL
      AND "targetMessageId" IS NULL
      AND "targetGroupId" IS NULL
    ) OR (
      "targetType" = 'COMMENT'
      AND "targetUserId" IS NULL
      AND "targetPostId" IS NULL
      AND "targetCommentId" IS NOT NULL
      AND "targetMessageId" IS NULL
      AND "targetGroupId" IS NULL
    ) OR (
      "targetType" = 'MESSAGE'
      AND "targetUserId" IS NULL
      AND "targetPostId" IS NULL
      AND "targetCommentId" IS NULL
      AND "targetMessageId" IS NOT NULL
      AND "targetGroupId" IS NULL
    ) OR (
      "targetType" = 'GROUP'
      AND "targetUserId" IS NULL
      AND "targetPostId" IS NULL
      AND "targetCommentId" IS NULL
      AND "targetMessageId" IS NULL
      AND "targetGroupId" IS NOT NULL
    )
  );