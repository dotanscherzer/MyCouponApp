# Coupon Manager — HLD (High-Level Design)
תאריך: 2025-12-29

## 1) תקציר
אפליקציה לניהול קופונים/תווים עבור משתמשים וקבוצות. המערכת תומכת:
- קופון לחנות ספציפית (**SINGLE**)
- תו/מולטי-קופון שמיועד למספר חנויות (**MULTI**)
- סכום מלא / סכום נוצל / סכום נותר
- סטטוסים (פעיל/נוצל חלקית/נוצל/פג תוקף/בוטל)
- תמונות לקופון (לסריקה מהירה בקופה)
- קבוצות, הזמנות במייל, ניהול הרשאות (צפייה/עריכה/אדמין)
- לוגין/הרשמה (אימייל+סיסמה או Google)
- התראות מייל על קופונים שעומדים לפוג לפי הגדרת משתמש
- תהליך יומי שמריץ בדיקות תפוגה ושולח התראות

פריסה:
- Client: Netlify
- Server: Render
- DB: MongoDB (Atlas מומלץ)

## 2) ישויות עסקיות
- **User**: משתמש מערכת (auth, פרופיל, העדפות התראות)
- **Group**: קבוצה (משפחה/חברים/צוות)
- **GroupMember**: חברות בקבוצה + הרשאה
- **Store**: חנות (קטלוג גלובלי, מנוהל אדמין)
- **MultiCouponDefinition**: מיפוי `multiCouponName -> storeIds[]` (מנוהל אדמין)
- **Coupon**: קופון/תו (SINGLE/MULTI) + סכומים + תוקף + תמונות + סטטוס
- **Invitation**: הזמנה לקבוצה לפי מייל
- **UnmappedMultiCouponEvent**: אירוע/רישום מולטי-קופון שלא ממופה (למייל לאדמין + מעקב)
- (אופציונלי) **AuditLog**: תיעוד פעולות רגישות (שימוש/שינוי סטטוס/מחיקות)

## 3) כללי Multi Coupon (לפי הדרישות שלך)
### 3.1 יצירה
המשתמש מזין רק `multiCouponName`.
- אם קיימת הגדרה ב-`MultiCouponDefinition`:
  - הקופון נשמר עם `mappingStatus=MAPPED`
  - ונשמר snapshot של החנויות ב-`resolvedStoreIds`
- אם **אין** הגדרה:
  - הקופון עדיין נשמר עם `mappingStatus=UNMAPPED`
  - `resolvedStoreIds=[]`
  - נוצרת רשומה ב-`UnmappedMultiCouponEvent`
  - נשלח מייל ל-**super_admin**(ים): "נוצר מולטי-קופון לא ממופה: <name>"

### 3.2 עדכון מיפוי (אדמין)
כאשר אדמין מוסיף/מעדכן MultiCouponDefinition:
- אפשרות (מומלץ) להריץ פעולה/Job שמנסה "לפתור" קופונים ישנים עם `mappingStatus=UNMAPPED`
  - מעדכן להם `resolvedStoreIds` ו-`mappingStatus=MAPPED`
  - (שומר trace באודיט/אירועים)

## 4) חיפוש לפי חנות (תוספת #6)
כאשר מחפשים קופונים לפי חנות (Store):
- מוחזרים **גם**:
  1. קופונים ישירים (`type=SINGLE` ו-`storeId==<store>`)
  2. מולטי-קופונים שהחנות נמצאת אצלם ב-`resolvedStoreIds`  
     (אם הקופון UNMAPPED ואין snapshot — לא יופיע בחיפוש חנות עד שימופה)

## 5) Auto-complete (תוספת #7)
- השלמה אוטומטית ל-**שם חנות**: חיפוש טקסטואלי ב-`Store.name`
- השלמה אוטומטית ל-**שם מולטי-קופון**: חיפוש טקסטואלי ב-`MultiCouponDefinition.name`
- ההשלמה נועדה לשימוש ב-UI בעת יצירת קופון/סינון/חיפוש

## 6) ארכיטקטורה (רכיבים)
### 6.1 Frontend (Netlify)
- React + TypeScript (Vite)
- מסכים עיקריים:
  - Login / Register
  - Coupons Table (עם פילטרים: קבוצה/סטטוס/חנות/תוקף)
  - Coupon Details (כולל גלריית תמונות + עדכון שימוש)
  - Groups (יצירה, הזמנות, ניהול חברים)
  - Admin Panel (ל-super_admin): Stores + MultiCouponDefinitions + Unmapped Events

### 6.2 Backend (Render)
- Node.js + Express + TypeScript
- מודולים:
  - Auth (JWT + Google OAuth)
  - RBAC (super_admin) + Group RBAC (viewer/editor/admin)
  - Coupons service
  - Stores & MultiCouponDefinitions service
  - Notifications service (מיילים) + Daily job
  - Upload integration (Cloudinary/S3)
  - Internal Jobs endpoints (מאובטחים ב-secret)

### 6.3 MongoDB
Collections לפי ה-ERD.

### 6.4 שירותי צד ג'
- Email: Resend / SendGrid (לבחירתך)
- Storage תמונות: Cloudinary / S3 (מומלץ Cloudinary)

## 7) אבטחה והרשאות
- JWT Access קצר (למשל 15 דק׳) + Refresh token
- Roles:
  - App role: `user | super_admin`
  - Group role: `viewer | editor | admin`
- כל endpoint של קבוצה דורש חברות בקבוצה וה-role המתאים
- Admin endpoints (Stores/Multi/Unmapped) דורשים `super_admin`

## 8) דרישות לא פונקציונליות
- ביצועים: אינדקסים על (groupId, status, expiryDate)
- אמינות: מניעת ניצול יתר (usedAmount <= totalAmount)
- עקביות: עדכוני שימוש אטומיים
- תיעוד: AuditLog מומלץ לפעולות קריטיות
