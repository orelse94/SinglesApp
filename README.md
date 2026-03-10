# Discreet Community MVP (Milestone 1)

This repository now includes Milestone 1 foundation work only:
- Next.js + TypeScript + Tailwind scaffold
- Auth.js with credentials (email/password) and Google only
- Prisma schema draft and post-migration integrity SQL
- Session/auth middleware and admin guard helper
- User settings with light mode default persisted in DB

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - `npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Create/apply base migration from schema:
   - `npm run prisma:migrate`
5. Apply custom integrity SQL:
   - run `prisma/sql/post_migrate_constraints.sql` against your DB
6. Seed interests:
   - `npm run prisma:seed`
7. Start app:
   - `npm run dev`

## Important Integrity Rules

- One active pending join request per `(groupId, applicantUserId)` is enforced via `GroupJoinRequest.pendingKey` plus DB check constraints.
- One active pending chat request per pair is enforced via `ChatRequest.pendingKey` and canonical `pairKey`.
- One active pending photo-access request per requester/owner pair is enforced via `PhotoAccessRequest.pendingKey` and directional `pairKey`.
- `Report` must have exactly one target field populated matching `targetType` (DB check constraint in `prisma/sql/post_migrate_constraints.sql`).
- `ProfileVisibility.PUBLIC` means visible to authenticated members in-app, not open-web indexable:
  - `/users/*` requires authentication middleware
  - `robots.ts` and `X-Robots-Tag` prevent indexing

## Milestone 1 Scope Note

Milestone 1 intentionally does not implement feed/groups/chat/photo workflows yet. It only lays secure foundations for those milestones.