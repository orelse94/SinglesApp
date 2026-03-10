# Security & Privacy – V1

## עקרונות יסוד
- Security by default
- Privacy by design
- Authorization on server side only
- Auditability מלאה לפעולות רגישות

## Authentication
- Password hashing חזק
- Secure session handling
- CSRF protection לפי הצורך
- Rate limiting על login endpoints
- Session invalidation

## Authorization
- כל endpoint חייב בדיקת הרשאות
- אין להסתמך על UI להסתרת גישה
- הרשאות אדמין מבודדות וברורות
- Group Manager מוגבל לקבוצה שלו בלבד

## Media Security
- אין לחשוף URLs פתוחים לקבצים פרטיים
- שימוש ב-signed URLs בלבד
- אחסון פרטי לקבצי מדיה
- מניעת indexing
- מניעת caching לא מבוקר של תוכן רגיש

## Privacy Rules
### גלריה פרטית
- רק verified users יכולים לבקש גישה
- רק בעל הפרופיל יכול לאשר
- עצם קיום הגלריה עשוי להיות גלוי, אך לא התוכן שלה

### בקשת צ'אט
- דורשת חשיפה מינימלית לפרופיל הנמען
- אין הודעות חופשיות לפני אישור
- Rate limiting למניעת spam

### אנונימיות
- אפשרית בפיד הכללי בלבד
- לא אפשרית בקבוצות קטנות / סגורות

## Audit Log
יש לתעד:
- שינוי סטטוס משתמש
- אישור אימות
- מחיקת / הסתרת תוכן
- גישת אדמין חריגה
- עקיפת הרשאות חריגה
- טיפול בדיווח

## Admin Security
- Admin route protection
- 2FA readiness לאדמינים
- הרשאות granular
- Audit מלא לפעולות רגישות

## Abuse Prevention
- Rate limiting לבקשות צ'אט
- Rate limiting לבקשות גישה לגלריה
- זיהוי פניות סדרתיות חריגות
- חסימה זמנית להתנהגות חריגה

## Monitoring
- ניטור ניסיונות גישה חריגים
- ניטור כשלי התחברות
- ניטור פעולות אדמין חריגות
- ניטור קצב חריג של בקשות צ'אט / בקשות גישה

## Data Protection
- TLS בלבד
- הצפנת נתונים רגישים לפי צורך
- גיבויים מוצפנים
- ניהול secrets תקין
- מינימום חשיפת מידע אישי

