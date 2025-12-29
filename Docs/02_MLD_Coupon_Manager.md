# Coupon Manager — MLD (Mid-Level Design)
תאריך: 2025-12-29

## 1) Stack מומלץ
### Server
- Node.js + Express + TypeScript
- Mongoose (MongoDB)
- Zod (validation)
- jsonwebtoken, bcrypt
- Passport / google-auth-library (Google OAuth)
- Nodemailer/Resend/SendGrid SDK (מיילים)

### Client
- React + TypeScript (Vite)
- React Router
- TanStack Query (data fetching)
- UI kit: MUI / Chakra / shadcn (לבחירתך)

### Storage תמונות
- Cloudinary (פשוט ומהיר) או S3 עם Signed URLs

### Jobs
- Render Cron (מומלץ) שקורא endpoint פנימי
- או node-cron בתוך השרת (פחות מומלץ בפלטפורמות scale)

## 2) מבנה Repo
- `/server`
  - `/src`
    - `/config` (env, db)
    - `/models`
    - `/routes`
    - `/controllers`
    - `/services`
    - `/middlewares`
    - `/jobs`
    - `/utils`
- `/client`
  - `/src`
    - `/api`
    - `/pages`
    - `/components`
    - `/routes`
    - `/auth`
    - `/state`

## 3) לוגיקת Coupon Status
סטטוסים:
- `ACTIVE`
- `PARTIALLY_USED`
- `USED`
- `EXPIRED`
- `CANCELLED`

חוקים:
- בעדכון שימוש:
  - used=0 -> ACTIVE
  - 0<used<total -> PARTIALLY_USED
  - used==total -> USED
- בתהליך יומי:
  - אם expiryDate < now וגם status לא USED/CANCELLED -> EXPIRED

## 4) עדכון שימוש (סכום בלבד)
API ייעודי: `/coupons/:id/usage`
מצבים:
- `ADD` (הוסף amount ל-usedAmount)
- `SET` (קבע usedAmount לערך)

Validation:
- amount >= 0
- usedAmount <= totalAmount (לא לאפשר חריגה)

Atomic update (המלצה):
- `findOneAndUpdate` עם תנאי (מניעת overuse)
- אם כשל תנאי -> 409 Conflict

## 5) Multi Coupon — mapped/unmapped + התראות לאדמין
### 5.1 יצירת MULTI
- חפש `MultiCouponDefinition` לפי name (case-insensitive מומלץ)
- אם נמצא:
  - mappingStatus=MAPPED
  - resolvedStoreIds = definition.storeIds (snapshot)
- אם לא נמצא:
  - mappingStatus=UNMAPPED
  - resolvedStoreIds=[]
  - צור `UnmappedMultiCouponEvent`
  - שלח מייל לכל `User.appRole==super_admin`

### 5.2 רזולוציה בדיעבד (אדמין)
ב-Admin Panel:
- יצירה/עדכון MultiCouponDefinition
- כפתור: "Resolve previous unmapped coupons"
  - finds coupons with mappingStatus=UNMAPPED AND multiCouponName == name
  - updates resolvedStoreIds & mappingStatus=MAPPED
  - מסמן events כ-handled

## 6) חיפוש קופונים לפי Store
בשרת, כשמגיע filter `storeId`:
- בנה query שמחזיר:
  - SINGLE: `storeId == X`
  - MULTI: `resolvedStoreIds contains X` AND mappingStatus==MAPPED
- לשאילתות מהירות: אינדקס multikey על `resolvedStoreIds`

## 7) Auto-complete (Stores + MultiCouponDefinition)
Endpoints:
- `/lookup/stores?query=sh&limit=10`
- `/lookup/multi-coupons?query=תו&limit=10`

Implementation:
- Regex prefix / text index
- תעדוף "מתחיל ב" על פני "מכיל"

## 8) תמונות קופון — תהליך
1) Client מבקש `init-upload`
2) Server מחזיר signed payload/URL
3) Client מעלה ישירות ל-storage
4) Client מודיע לשרת לשייך את ה-URL לקופון

## 9) Notifications — תזכורות תפוגה
- Preference לכל משתמש: enabled + daysBefore[] + timezone
- Job יומי:
  - מאתר קופונים בקבוצות שהמשתמש חבר בהן, שיפוגו בעוד N ימים
  - שולח מייל למשתמש (Digest)

## 10) הרשאות (RBAC)
### Group roles
- viewer: GET בלבד (כולל תמונות) ✅
- editor: יצירה/עדכון קופונים, usage, תמונות
- admin: הכל + חברים/הזמנות + מחיקה

### App role
- super_admin: Stores, MultiCouponDefinitions, Unmapped events
