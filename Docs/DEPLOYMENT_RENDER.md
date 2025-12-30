# הנחיות להגדרת Render Dashboard

מדריך זה מסביר איך להגדיר את כל משתני הסביבה הנדרשים ישירות ב-Render Dashboard.

## שלב 1: גישה ל-Render Dashboard

1. היכנס ל-[Render Dashboard](https://dashboard.render.com/)
2. התחבר עם החשבון שלך (GitHub/Google/Email)

## שלב 2: יצירת Web Service (אם לא קיים)

אם עדיין לא יצרת את ה-Web Service:

1. לחץ על **"New +"** בפינה הימנית העליונה
2. בחר **"Web Service"**
3. בחר את ה-repository שלך (GitHub/GitLab/Bitbucket)
4. מלא את הפרטים:
   - **Name**: `coupon-manager-api` (או שם אחר לפי בחירתך)
   - **Environment**: `Node`
   - **Region**: בחר את האזור הקרוב אליך
   - **Branch**: `main` (או `master`)
   - **Root Directory**: השאר ריק (או `server` אם ה-repo כולל גם את ה-client)
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Plan**: בחר את התוכנית המתאימה (Free/Starter/Professional)

5. לחץ על **"Create Web Service"**

## שלב 3: חיבור ל-MongoDB Database

אם עדיין לא יצרת את ה-MongoDB Database:

1. לחץ על **"New +"** בפינה הימנית העליונה
2. בחר **"MongoDB"**
3. מלא את הפרטים:
   - **Name**: `coupon-manager-db` (או שם אחר)
   - **Database**: `coupon-manager` (או שם אחר)
   - **User**: השאר את הערך המוצע
   - **Plan**: בחר את התוכנית המתאימה (Free/Starter/Professional)
4. לחץ על **"Create Database"**
5. לאחר יצירת ה-Database, העתק את ה-**Internal Database URL** (או **External Database URL** אם אתה צריך גישה מבחוץ)

**אלטרנטיבה**: אם אתה משתמש ב-MongoDB Atlas:
1. היכנס ל-[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. צור Cluster חדש (או השתמש בקיים)
3. לחץ על **"Connect"** על ה-Cluster
4. בחר **"Connect your application"**
5. העתק את ה-Connection String
6. החלף את `<password>` בסיסמה שיצרת
7. החלף את `<dbname>` בשם ה-database (למשל: `coupon-manager`)

## שלב 4: הוספת משתני סביבה ב-Render Dashboard

1. עבור ל-Web Service שיצרת (`coupon-manager-api`)
2. לחץ על **"Environment"** בתפריט השמאלי
3. לחץ על **"Add Environment Variable"** עבור כל משתנה

### משתני סביבה חובה:

#### 1. `MONGODB_URI`
- **ערך**: ה-Connection String מה-MongoDB Database שיצרת
- **דוגמה**: `mongodb://user:password@dpg-xxxxx-a.oregon-postgres.render.com:27017/coupon-manager`
- **או עבור MongoDB Atlas**: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/coupon-manager?retryWrites=true&w=majority`
- **הערה**: החלף את `username`, `password`, ו-`coupon-manager` בערכים האמיתיים שלך

#### 2. `JWT_ACCESS_SECRET`
- **ערך**: מחרוזת אקראית ומאובטחת (לפחות 32 תווים)
- **איך ליצור**: ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף JWT Secrets
- **דוגמה**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

#### 3. `JWT_REFRESH_SECRET`
- **ערך**: מחרוזת אקראית ומאובטחת שונה מ-`JWT_ACCESS_SECRET` (לפחות 32 תווים)
- **איך ליצור**: ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף JWT Secrets
- **דוגמה**: `z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4`

#### 4. `FRONTEND_URL`
- **ערך**: כתובת ה-URL של האפליקציה ב-Netlify
- **דוגמה**: `https://your-app-name.netlify.app`
- **הערה**: החלף את `your-app-name` בשם האמיתי של האפליקציה ב-Netlify. אם עדיין לא יצרת את האפליקציה ב-Netlify, תוכל לעדכן את הערך הזה מאוחר יותר.

#### 5. `JOB_SECRET`
- **ערך**: מחרוזת אקראית ומאובטחת (לפחות 32 תווים)
- **איך ליצור**: ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף JOB_SECRET
- **דוגמה**: `secret123456789012345678901234567890`
- **הערה חשובה**: הערך הזה צריך להיות זהה לערך שתשתמש בו ב-Cron Job (אם תגדיר אחד)

#### 6. `GOOGLE_CLIENT_ID`
- **ערך**: ה-Client ID מ-Google Cloud Console
- **איך להשיג**: ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Google OAuth
- **דוגמה**: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

#### 7. `GOOGLE_CLIENT_SECRET`
- **ערך**: ה-Client Secret מ-Google Cloud Console
- **איך להשיג**: ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Google OAuth
- **דוגמה**: `GOCSPX-abcdefghijklmnopqrstuvwxyz123456`

#### 8. `CLOUDINARY_CLOUD_NAME`
- **ערך**: ה-Cloud Name מ-Cloudinary Dashboard
- **איך להשיג**: ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Cloudinary
- **דוגמה**: `your-cloud-name`

#### 9. `CLOUDINARY_API_KEY`
- **ערך**: ה-API Key מ-Cloudinary Dashboard
- **איך להשיג**: ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Cloudinary
- **דוגמה**: `123456789012345`

#### 10. `CLOUDINARY_API_SECRET`
- **ערך**: ה-API Secret מ-Cloudinary Dashboard
- **איך להשיג**: ראה `DEPLOYMENT_CREDENTIALS.md` - סעיף Cloudinary
- **דוגמה**: `abcdefghijklmnopqrstuvwxyz123456789`

### משתני סביבה אופציונליים:

#### 11. `NODE_ENV`
- **ערך**: `production`
- **הערה**: מוגדר כברירת מחדל, אבל מומלץ להגדיר במפורש

#### 12. `PORT`
- **ערך**: `3000`
- **הערה**: Render מגדיר את זה אוטומטית, אבל אפשר להגדיר במפורש

#### 13. `JWT_ACCESS_EXPIRES_IN`
- **ערך**: `15m` (15 דקות)
- **הערה**: ברירת מחדל היא `15m`, אבל אפשר לשנות לפי הצורך

#### 14. `JWT_REFRESH_EXPIRES_IN`
- **ערך**: `7d` (7 ימים)
- **הערה**: ברירת מחדל היא `7d`, אבל אפשר לשנות לפי הצורך

#### 15. `GOOGLE_REDIRECT_URI`
- **ערך**: `https://your-render-url.onrender.com/api/auth/google/callback`
- **דוגמה**: `https://coupon-manager-api.onrender.com/api/auth/google/callback`
- **הערה**: החלף את `your-render-url` ב-URL האמיתי של ה-Web Service שלך ב-Render. צריך גם להגדיר את אותו URL ב-Google Cloud Console (ראה `DEPLOYMENT_CREDENTIALS.md`)

## שלב 5: הגדרת Cron Job (אופציונלי)

אם אתה רוצה להגדיר Cron Job לבדיקת תאריכי תפוגה יומית:

1. עבור ל-Web Service שלך
2. לחץ על **"Cron Jobs"** בתפריט השמאלי (או **"Scheduled Jobs"**)
3. לחץ על **"New Cron Job"** או **"Add Cron Job"**
4. מלא את הפרטים:
   - **Name**: `daily-expiry-check`
   - **Schedule**: `0 9 * * *` (כל יום ב-9:00 בבוקר UTC)
   - **Command**: 
     ```
     curl -X POST https://your-render-url.onrender.com/internal/jobs/daily -H "X-JOB-SECRET: your-job-secret-here"
     ```
   - **הערה**: החלף את `your-render-url` ב-URL האמיתי של ה-Web Service שלך, ואת `your-job-secret-here` בערך של `JOB_SECRET` שהגדרת במשתני הסביבה

## שלב 6: בדיקה

לאחר הגדרת כל משתני הסביבה:

1. לחץ על **"Manual Deploy"** → **"Deploy latest commit"** (או שהשירות יתחיל לפרוס אוטומטית)
2. עקוב אחרי ה-Logs כדי לוודא שהשירות עולה בהצלחה
3. בדוק את ה-Health Check endpoint: `https://your-render-url.onrender.com/health`
4. אם יש שגיאות, בדוק את ה-Logs ובדוק שכל משתני הסביבה הוגדרו נכון

## טיפים חשובים

- **אבטחה**: לעולם אל תחלוק את משתני הסביבה שלך בפומבי
- **עדכון משתנים**: אם אתה מעדכן משתנה סביבה, השירות יתחיל מחדש אוטומטית
- **Logs**: תמיד בדוק את ה-Logs אם יש בעיות - הם יכולים לעזור לזהות בעיות בהגדרות
- **URL של השירות**: לאחר הפריסה הראשונה, תקבל URL קבוע. שמור אותו - תצטרך אותו להגדרת `FRONTEND_URL` ב-Netlify ו-`GOOGLE_REDIRECT_URI` ב-Google Cloud Console

## בעיות נפוצות

### השירות לא עולה
- בדוק שה-`MONGODB_URI` נכון ומחובר
- בדוק שה-`JWT_ACCESS_SECRET` ו-`JWT_REFRESH_SECRET` הוגדרו
- בדוק את ה-Logs לפרטים נוספים

### שגיאת CORS
- ודא ש-`FRONTEND_URL` מוגדר נכון ומתאים ל-URL של Netlify
- ודא שה-URL כולל את ה-protocol (`https://`)

### שגיאת Google OAuth
- ודא ש-`GOOGLE_CLIENT_ID` ו-`GOOGLE_CLIENT_SECRET` נכונים
- ודא ש-`GOOGLE_REDIRECT_URI` מוגדר נכון ב-Google Cloud Console

### שגיאת Cloudinary
- ודא שכל שלושת משתני Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) הוגדרו נכון

