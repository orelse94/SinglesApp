# Technical Spec – V1

## ארכיטקטורת על
- Frontend Web App
- Backend API
- Database
- Storage לתמונות ומדיה
- Admin Panel
- Notification Layer
- Audit & Logging Layer

## Stack מומלץ
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth
- Object Storage פרטי

## Authentication
יש לאפשר:
- Email + Password
- Google Login

אין צורך ב:
- Facebook Login

## Theme
יש לאפשר:
- light
- dark

ברירת מחדל:
- light

ההעדפה תישמר בפרופיל המשתמש.

## ישויות מערכת
- User
- UserProfileMedia
- UserInterest
- VerificationRequest
- Group
- GroupMembership
- GroupJoinQuestion
- GroupJoinAnswer
- Post
- PostMedia
- Comment
- ChatRequest
- Conversation
- Message
- PhotoAccessRequest
- PhotoAccessGrant
- EventPromotion
- EventPromotionPlacement
- Notification
- Report
- AuditLog
- UserSettings

## שדות קריטיים
### User
- id
- email
- phone
- password_hash
- display_name
- bio
- region
- age_verified
- email_verified_at
- phone_verified_at
- verification_status
- verified_badge_visible
- profile_visibility
- chat_request_policy
- photo_request_policy
- activity_visibility
- account_status
- created_at
- updated_at

### UserSettings
- user_id
- theme_preference (light / dark)

### UserProfileMedia
- id
- user_id
- media_type (profile / gallery)
- storage_key
- visibility_level
- sort_order
- is_active

### Group
- id
- name
- slug
- description
- group_type (open / closed / invite_only)
- is_small_private_group
- status

### Post
- id
- author_user_id
- context_type (global_feed / group)
- group_id
- content_text
- is_anonymous
- visibility_status
- moderation_status

### ChatRequest
- id
- from_user_id
- to_user_id
- status
- created_at
- responded_at

### Conversation
- id
- user_a_id
- user_b_id
- status
- created_from_request_id

### PhotoAccessRequest
- id
- requester_user_id
- owner_user_id
- status
- created_at
- responded_at

### EventPromotion
- id
- title
- description
- image_url
- external_link
- coupon_code
- placement_type
- status
- starts_at
- ends_at

## תפקידי מערכת
- Guest
- Registered User
- Verified User
- Group Manager
- Admin
- Super Admin

## לוגיקת פרטיות
### תמונות פרטיות
- רק משתמש verified יכול לבקש גישה
- רק בעל הפרופיל מאשר גישה
- אדמין override רק באופן חריג ומתועד

### בקשת צ'אט
- רק אם השולח מחובר
- לא חסום על ידי הנמען
- עומד במדיניות הפניות
- יש לו חשיפה מינימלית לפרופיל הנמען

### פוסטים אנונימיים
- בפיד הכללי: אפשרי
- בקבוצות קטנות/סגורות: לא אפשרי

## זרימות מערכת
### יצירת חשבון
1. Register
2. Verify email / phone
3. Complete profile
4. Save privacy settings

### בקשת צ'אט
1. User A שולח בקשה
2. בדיקת eligibility
3. יצירת ChatRequest
4. Notification ל-User B
5. אישור -> פתיחת Conversation

### בקשת גישה לגלריה
1. User A חייב להיות verified
2. נשלחת בקשה ל-User B
3. User B מאשר או דוחה
4. אם אושר נוצר PhotoAccessGrant

### הצטרפות לקבוצה
1. Join request
2. GroupMembership pending
3. Manager/Admin approve
4. Status approved

### פרסום פוסט
1. Create post
2. בדיקת context והרשאות
3. אם קבוצה קטנה/סגורה -> אין אנונימיות
4. Save post

## API עיקריים
### Auth
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/verify-email
- POST /auth/verify-phone

### Profile
- GET /me
- PATCH /me
- PATCH /me/privacy
- PATCH /me/settings
- POST /me/media
- DELETE /me/media/:id
- GET /users/:id

### Feed
- GET /feed
- POST /posts
- GET /posts/:id
- POST /posts/:id/comments

### Groups
- GET /groups
- GET /groups/:id
- POST /groups/:id/join-request
- POST /groups/:id/posts

### Chat
- POST /chat-requests
- GET /chat-requests/incoming
- GET /chat-requests/outgoing
- POST /chat-requests/:id/accept
- POST /chat-requests/:id/reject
- GET /conversations
- GET /conversations/:id/messages
- POST /conversations/:id/messages

### Photo Access
- POST /photo-access-requests
- GET /photo-access-requests/incoming
- POST /photo-access-requests/:id/approve
- POST /photo-access-requests/:id/reject

### Notifications
- GET /notifications
- POST /notifications/read-all
- POST /notifications/:id/read

### Admin
- GET /admin/dashboard
- GET /admin/users
- PATCH /admin/users/:id/status
- POST /admin/users/:id/verify
- GET /admin/reports
- PATCH /admin/reports/:id/resolve
- GET /admin/event-promotions
- POST /admin/event-promotions
- PATCH /admin/event-promotions/:id

## Definition of Done ל-V1
- משתמש יכול להירשם ולהתחבר
- יש תמיכה ב-Email/Password וב-Google
- יש פיד עם פוסטים ותגובות
- יש קבוצות פתוחות/סגורות
- יש בקשות צ'אט ואישור הדדי
- משתמש verified יכול לבקש גישה לגלריה
- יש תג מאומת
- יש Light/Dark mode עם ברירת מחדל light
- אדמין יכול לנהל משתמשים, דיווחים, אימותים ואירועים מקודמים
- כל הגישות הרגישות נשמרות עם audit

