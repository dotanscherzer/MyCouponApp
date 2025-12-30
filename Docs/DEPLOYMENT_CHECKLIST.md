# רשימת בדיקה להגדרת Deployment

רשימת בדיקה מסודרת לוודא שכל המשתנים וההגדרות הוגדרו נכון.

## לפני שמתחילים

- [ ] יש לך חשבון ב-Render
- [ ] יש לך חשבון ב-Netlify
- [ ] יש לך MongoDB Database (Render Database או MongoDB Atlas)
- [ ] יש לך גישה ל-Git Repository

---

## Render Dashboard - משתני סביבה

### משתנים חובה

- [ ] `MONGODB_URI` - Connection String מה-MongoDB Database
  - [ ] הערך מתחיל ב-`mongodb://` או `mongodb+srv://`
  - [ ] כולל username ו-password
  - [ ] כולל את שם ה-database

- [ ] `JWT_ACCESS_SECRET` - Secret לחתימת Access Tokens
  - [ ] לפחות 32 תווים
  - [ ] אקראי ומאובטח
  - [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף JWT Secrets

- [ ] `JWT_REFRESH_SECRET` - Secret לחתימת Refresh Tokens
  - [ ] לפחות 32 תווים
  - [ ] אקראי ומאובטח
  - [ ] שונה מ-`JWT_ACCESS_SECRET`
  - [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף JWT Secrets

- [ ] `FRONTEND_URL` - כתובת ה-URL של Netlify
  - [ ] מתחיל ב-`https://`
  - [ ] מסתיים ב-`.netlify.app` (או Custom Domain)
  - [ ] דוגמה: `https://your-app-name.netlify.app`

- [ ] `JOB_SECRET` - Secret לאימות Cron Jobs
  - [ ] לפחות 32 תווים
  - [ ] אקראי ומאובטח
  - [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף JOB_SECRET

- [ ] `GOOGLE_CLIENT_ID` - Client ID מ-Google Cloud Console
  - [ ] מתחיל ב-מספרים ומסתיים ב-`.apps.googleusercontent.com`
  - [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Google OAuth

- [ ] `GOOGLE_CLIENT_SECRET` - Client Secret מ-Google Cloud Console
  - [ ] מתחיל ב-`GOCSPX-`
  - [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Google OAuth

- [ ] `CLOUDINARY_CLOUD_NAME` - Cloud Name מ-Cloudinary
  - [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Cloudinary

- [ ] `CLOUDINARY_API_KEY` - API Key מ-Cloudinary
  - [ ] מספר ארוך
  - [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Cloudinary

- [ ] `CLOUDINARY_API_SECRET` - API Secret מ-Cloudinary
  - [ ] מחרוזת ארוכה
  - [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Cloudinary

### משתנים אופציונליים

- [ ] `NODE_ENV` - מוגדר ל-`production` (מומלץ)
- [ ] `PORT` - מוגדר ל-`3000` (אופציונלי, Render מגדיר אוטומטית)
- [ ] `JWT_ACCESS_EXPIRES_IN` - מוגדר ל-`15m` (אופציונלי, ברירת מחדל)
- [ ] `JWT_REFRESH_EXPIRES_IN` - מוגדר ל-`7d` (אופציונלי, ברירת מחדל)
- [ ] `GOOGLE_REDIRECT_URI` - מוגדר ל-`https://your-render-url.onrender.com/api/auth/google/callback` (אופציונלי, ברירת מחדל)

---

## Render Dashboard - הגדרות נוספות

### Web Service

- [ ] Web Service נוצר ב-Render
- [ ] Name: `coupon-manager-api` (או שם אחר)
- [ ] Environment: `Node`
- [ ] Build Command: `cd server && npm install && npm run build`
- [ ] Start Command: `cd server && npm start`
- [ ] Repository מחובר
- [ ] Branch: `main` (או `master`)

### MongoDB Database

- [ ] MongoDB Database נוצר ב-Render (או MongoDB Atlas)
- [ ] Connection String הועתק
- [ ] Database Name מוגדר

### Cron Job (אופציונלי)

- [ ] Cron Job נוצר (אם נדרש)
- [ ] Name: `daily-expiry-check` (או שם אחר)
- [ ] Schedule: `0 9 * * *` (או schedule אחר)
- [ ] Command כולל את ה-URL הנכון של Render
- [ ] Command כולל את ה-`JOB_SECRET` הנכון

---

## Netlify Dashboard - משתני סביבה

### משתנים חובה

- [ ] `VITE_API_BASE_URL` - כתובת ה-URL של ה-API ב-Render + `/api`
  - [ ] מתחיל ב-`https://`
  - [ ] מסתיים ב-`/api`
  - [ ] דוגמה: `https://coupon-manager-api.onrender.com/api`

---

## Netlify Dashboard - הגדרות נוספות

### Site

- [ ] Site נוצר ב-Netlify
- [ ] Repository מחובר (או Deploy מ-Folder)
- [ ] Branch: `main` (או `master`)

### Build Settings

- [ ] Base directory: `client` (אם ה-repo כולל גם server)
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: `18` (מוגדר ב-`netlify.toml`)

### Redirects

- [ ] Redirects מוגדרים (אוטומטית מ-`netlify.toml`):
  - [ ] From: `/*`
  - [ ] To: `/index.html`
  - [ ] Status: `200`

---

## Credentials - יצירה ובדיקה

### Cloudinary

- [ ] חשבון Cloudinary נוצר
- [ ] Cloud Name הועתק
- [ ] API Key הועתק
- [ ] API Secret הועתק
- [ ] כל שלושת הערכים הוגדרו ב-Render
- [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Cloudinary

### Google OAuth

- [ ] פרויקט נוצר ב-Google Cloud Console
- [ ] Google+ API (או Google Identity Services API) מופעל
- [ ] OAuth consent screen הוגדר
- [ ] OAuth 2.0 Client ID נוצר
- [ ] Client ID הועתק
- [ ] Client Secret הועתק
- [ ] Authorized redirect URI הוגדר:
  - [ ] `https://your-render-url.onrender.com/api/auth/google/callback`
- [ ] Client ID ו-Client Secret הוגדרו ב-Render
- [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Google OAuth

### JWT Secrets

- [ ] `JWT_ACCESS_SECRET` נוצר (לפחות 32 תווים)
- [ ] `JWT_REFRESH_SECRET` נוצר (לפחות 32 תווים)
- [ ] שני ה-Secrets שונים זה מזה
- [ ] שני ה-Secrets הוגדרו ב-Render
- [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף JWT Secrets

### JOB_SECRET

- [ ] `JOB_SECRET` נוצר (לפחות 32 תווים)
- [ ] `JOB_SECRET` הוגדר ב-Render
- [ ] `JOB_SECRET` זהה לערך ב-Cron Job Command (אם יש Cron Job)
- [ ] ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף JOB_SECRET

---

## URLs - בדיקה ועדכון

### Render URL

- [ ] Render URL הועתק: `https://your-service-name.onrender.com`
- [ ] Render URL הוגדר ב-`GOOGLE_REDIRECT_URI` (אם נדרש)
- [ ] Render URL הוגדר ב-`VITE_API_BASE_URL` ב-Netlify (עם `/api` בסוף)
- [ ] Render URL הוגדר ב-Cron Job Command (אם יש Cron Job)

### Netlify URL

- [ ] Netlify URL הועתק: `https://your-site-name.netlify.app`
- [ ] Netlify URL הוגדר ב-`FRONTEND_URL` ב-Render

### Google Cloud Console

- [ ] Authorized redirect URI ב-Google Cloud Console תואם ל-Render URL:
  - [ ] `https://your-render-url.onrender.com/api/auth/google/callback`

---

## בדיקות סופיות

### Render

- [ ] Web Service עולה בהצלחה (בדוק ב-Logs)
- [ ] Health Check endpoint עובד: `https://your-render-url.onrender.com/health`
- [ ] MongoDB מחובר (בדוק ב-Logs)
- [ ] אין שגיאות ב-Logs

### Netlify

- [ ] Site נבנה בהצלחה (בדוק ב-Build Logs)
- [ ] Site נגיש ב-URL: `https://your-site-name.netlify.app`
- [ ] אין שגיאות ב-Build Logs

### אינטגרציה

- [ ] Frontend יכול להתחבר ל-Backend (בדוק ב-Network tab)
- [ ] אין שגיאות CORS
- [ ] Authentication עובד (Login/Register)
- [ ] Google OAuth עובד (אם מוגדר)
- [ ] Image uploads עובדים (אם מוגדר Cloudinary)

---

## בעיות נפוצות - בדיקה

אם יש בעיות, בדוק:

### Render לא עולה

- [ ] כל משתני הסביבה החובה הוגדרו
- [ ] `MONGODB_URI` נכון ומחובר
- [ ] `JWT_ACCESS_SECRET` ו-`JWT_REFRESH_SECRET` הוגדרו
- [ ] בדוק את ה-Logs לפרטים נוספים

### שגיאת CORS

- [ ] `FRONTEND_URL` ב-Render תואם ל-Netlify URL
- [ ] `FRONTEND_URL` מתחיל ב-`https://`
- [ ] אין שגיאות כתיב ב-URL

### שגיאת Google OAuth

- [ ] `GOOGLE_CLIENT_ID` ו-`GOOGLE_CLIENT_SECRET` נכונים
- [ ] `GOOGLE_REDIRECT_URI` ב-Google Cloud Console תואם ל-Render URL
- [ ] OAuth consent screen פורסם (אם נדרש)

### שגיאת Cloudinary

- [ ] כל שלושת משתני Cloudinary הוגדרו
- [ ] הערכים נכונים (בדוק ב-Cloudinary Dashboard)

### Frontend לא מתחבר ל-Backend

- [ ] `VITE_API_BASE_URL` ב-Netlify נכון
- [ ] `VITE_API_BASE_URL` מסתיים ב-`/api`
- [ ] Backend עובד (בדוק Health Check endpoint)
- [ ] אין שגיאות CORS

---

## סיכום

לאחר שסיימת את כל הבדיקות:

1. **Render**: כל משתני הסביבה הוגדרו, Web Service עולה, MongoDB מחובר
2. **Netlify**: כל משתני הסביבה הוגדרו, Site נבנה, נגיש ב-URL
3. **Credentials**: כל ה-Credentials נוצרו והוגדרו
4. **URLs**: כל ה-URLs נכונים ומסונכרנים
5. **אינטגרציה**: Frontend ו-Backend עובדים יחד

אם יש בעיות, חזור ל-`DEPLOYMENT_RENDER.md`, `DEPLOYMENT_NETLIFY.md`, ו-`DEPLOYMENT_CREDENTIALS.md` לפרטים נוספים.

---

## הערות

- **אבטחה**: לעולם אל תחלוק את ה-Credentials או Secrets בפומבי
- **גיבוי**: שמור את כל ה-Credentials במקום בטוח (Password Manager, Encrypted File וכו')
- **עדכונים**: אם אתה משנה URLs או Credentials, ודא לעדכן את כל המקומות הרלוונטיים

