# Handoff ל-Codex – V1

## מטרת המסמך
המסמך נועד לשמש כבסיס עבודה ישיר ל-Codex לצורך פיתוח V1 של המוצר.

המוצר הוא אתר מובייל-פירסט לקהילה דיסקרטית למבוגרים, עם פיד, קבוצות סגורות, חיבורים פרטיים בהסכמה, גלריית תמונות עם הרשאות צפייה, מערכת אימות, אדמין חזק, ואזור לאירועים מקודמים.

## החלטות מוצר שסוכמו
- אתר מובייל-פירסט
- Email + Password login
- Google login
- בלי Facebook login
- Light / Dark mode, ברירת מחדל light
- דיסקרטיות ופרטיות במרכז
- רק משתמשים מאומתים יכולים לבקש גישה לתמונות פרטיות
- בקשת צ'אט דורשת צפייה מינימלית בפרופיל הנמען
- פיד כללי יכול להיות אנונימי
- קבוצות קטנות/סגורות מחייבות משתמש גלוי
- תג מאומת גלוי במקומות מרכזיים
- אדמין יכול ליצור אירועים מקודמים
- אבטחת מידע ברמה גבוהה היא דרישת בסיס

## Stack מומלץ
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth
- Object Storage פרטי

## Scope של V1
### חובה
- Auth
- User profile
- Privacy settings
- Feed
- Posts + Comments
- Groups
- Chat requests
- Conversations
- Photo access requests
- Notifications
- Verified badge
- Admin dashboard
- Reports
- Verification management
- Event promotions
- Theme preference

### לא חובה
- Native app
- Facebook login
- Matching מורכב
- Video / Live
- Full ticketing

## תוצרי פיתוח נדרשים מ-Codex
1. Project scaffold
2. Database schema
3. Migrations
4. Auth flow
5. Core mobile screens
6. Admin area
7. API routes / server actions
8. Authorization guards
9. Seed data
10. README

## סדר עבודה מומלץ ל-Codex
### שלב 1
- ERD
- Prisma schema
- App structure
- Route map
- Milestone plan

### שלב 2
- Auth
- Profile
- Settings
- Feed
- Groups

### שלב 3
- Verification
- Chat requests
- Conversations
- Photo access requests
- Notifications

### שלב 4
- Admin dashboard
- Reports
- Verifications
- Event promotions
- Audit log

## Prompt מומלץ לפתיחת העבודה עם Codex
Build an MVP mobile-first web application based on the attached product and technical specs.

Core requirements:
- Next.js + TypeScript + Tailwind + shadcn/ui
- PostgreSQL + Prisma
- Auth with email/password and Google login only
- Default theme is light mode, with user-selectable light/dark mode stored in user settings
- Strong privacy and authorization model
- Private profile gallery with approval-based access
- Verified badge support
- Feed, posts, comments
- Public/closed/invite-only groups
- Chat requests that require mutual approval before opening a conversation
- Admin dashboard for users, reports, verifications, and promoted events
- High security baseline

Please start by:
1. Defining the database schema
2. Creating the project structure
3. Implementing auth and user settings
4. Building the core mobile navigation and main screens
5. Implementing authorization guards for profile/media/chat/group access

Prefer simple, production-oriented architecture over over-engineering.
Document setup clearly in README.
________________________________________
מבנה תיקיות מומלץ בתוך ה-repo
docs/
  product/
    prd-v1.md
    ux-wireframes.md
    technical-spec.md
    security.md
  handoff/
    codex-handoff.md
סדר שימוש מומלץ
1.	ליצור repo חדש
2.	לפתוח תיקיית docs
3.	לשמור כל אחד מהקבצים למעלה
4.	לתת ל-Codex קודם לבנות:
o	ERD
o	Prisma schema
o	App structure
o	Route map
o	Milestone plan
רק אחרי שעוברים עליהם, להמשיך לכתיבת הקוד
