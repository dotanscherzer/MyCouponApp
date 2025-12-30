# הנחיות ליצירת Credentials

מדריך זה מסביר איך ליצור את כל ה-credentials הנדרשים לאפליקציה.

## תוכן עניינים

1. [Cloudinary](#cloudinary)
2. [Google OAuth](#google-oauth)
3. [JWT Secrets](#jwt-secrets)
4. [JOB_SECRET](#job_secret)
5. [URLs](#urls)

---

## Cloudinary

Cloudinary משמש לאחסון ועיבוד תמונות (תמונות קופונים).

### שלב 1: יצירת חשבון

1. היכנס ל-[Cloudinary](https://cloudinary.com/)
2. לחץ על **"Sign Up"** (או **"Sign Up for Free"**)
3. מלא את הפרטים:
   - **Email**: הכנס את ה-email שלך
   - **Full Name**: הכנס את השם המלא שלך
   - **Password**: צור סיסמה חזקה
4. לחץ על **"Create Account"**
5. אשר את ה-email שלך (אם נדרש)

### שלב 2: קבלת Credentials

1. לאחר ההתחברות, תועבר ל-Dashboard
2. במסך הראשי, תראה את ה-**Account Details**:
   - **Cloud Name**: זהו ה-`CLOUDINARY_CLOUD_NAME`
   - **API Key**: זהו ה-`CLOUDINARY_API_KEY`
   - **API Secret**: לחץ על **"Reveal"** כדי לראות את ה-`CLOUDINARY_API_SECRET`

3. העתק את כל שלושת הערכים:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### שלב 3: הגדרה ב-Render

1. עבור ל-Render Dashboard
2. עבור ל-Web Service שלך
3. לחץ על **"Environment"**
4. הוסף את שלושת משתני הסביבה:
   - `CLOUDINARY_CLOUD_NAME` = הערך מ-Cloudinary Dashboard
   - `CLOUDINARY_API_KEY` = הערך מ-Cloudinary Dashboard
   - `CLOUDINARY_API_SECRET` = הערך מ-Cloudinary Dashboard

### טיפים

- **אבטחה**: לעולם אל תחלוק את ה-API Secret בפומבי
- **Free Tier**: התוכנית החינמית כוללת 25GB storage ו-25GB bandwidth בחודש
- **Settings**: תוכל לשנות הגדרות תחת **"Settings"** → **"Security"** (למשל: להגביל uploads רק מ-domains מסוימים)

---

## Google OAuth

Google OAuth משמש לאימות משתמשים דרך Google.

### שלב 1: יצירת פרויקט ב-Google Cloud Console

1. היכנס ל-[Google Cloud Console](https://console.cloud.google.com/)
2. אם אין לך פרויקט, לחץ על **"Select a project"** → **"New Project"**
3. מלא את הפרטים:
   - **Project name**: `Coupon Manager` (או שם אחר)
   - **Organization**: השאר את הערך המוצע (או בחר organization)
   - **Location**: בחר את המיקום המתאים
4. לחץ על **"Create"**
5. המתן עד שהפרויקט נוצר (כמה שניות)

### שלב 2: הפעלת Google+ API

1. בתפריט השמאלי, לחץ על **"APIs & Services"** → **"Library"**
2. חפש **"Google+ API"** או **"Google Identity"**
3. לחץ על **"Google+ API"** (או **"Google Identity Services API"**)
4. לחץ על **"Enable"**

**הערה**: Google+ API הופסק, אבל Google Identity Services API הוא החלופה המודרנית. אם אתה משתמש ב-`google-auth-library`, הוא יעבוד עם Google Identity Services.

### שלב 3: יצירת OAuth 2.0 Client ID

1. בתפריט השמאלי, לחץ על **"APIs & Services"** → **"Credentials"**
2. לחץ על **"Create Credentials"** → **"OAuth client ID"**
3. אם זה הפעם הראשונה, תתבקש להגדיר **OAuth consent screen**:
   - **User Type**: בחר **"External"** (או **"Internal"** אם אתה משתמש ב-Google Workspace)
   - לחץ על **"Create"**
   - מלא את הפרטים:
     - **App name**: `Coupon Manager` (או שם אחר)
     - **User support email**: הכנס את ה-email שלך
     - **Developer contact information**: הכנס את ה-email שלך
   - לחץ על **"Save and Continue"**
   - תחת **"Scopes"**, לחץ על **"Save and Continue"** (או הוסף scopes לפי הצורך)
   - תחת **"Test users"**, לחץ על **"Save and Continue"** (או הוסף test users)
   - לחץ על **"Back to Dashboard"**

4. חזור ל-**"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
5. בחר את סוג האפליקציה:
   - **Application type**: `Web application`
   - **Name**: `Coupon Manager Web Client` (או שם אחר)
6. תחת **"Authorized redirect URIs"**, לחץ על **"Add URI"** והוסף:
   ```
   https://your-render-url.onrender.com/api/auth/google/callback
   ```
   **הערה**: החלף את `your-render-url` ב-URL האמיתי של ה-Web Service שלך ב-Render. אם עדיין לא יצרת את ה-Service, תוכל להוסיף את ה-URI מאוחר יותר.
7. לחץ על **"Create"**
8. תראה חלון עם ה-Credentials:
   - **Your Client ID**: זהו ה-`GOOGLE_CLIENT_ID`
   - **Your Client Secret**: זהו ה-`GOOGLE_CLIENT_SECRET`

9. העתק את שני הערכים (או לחץ על **"Download JSON"** לשמירה)

### שלב 4: הגדרה ב-Render

1. עבור ל-Render Dashboard
2. עבור ל-Web Service שלך
3. לחץ על **"Environment"**
4. הוסף את שני משתני הסביבה:
   - `GOOGLE_CLIENT_ID` = ה-Client ID מ-Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` = ה-Client Secret מ-Google Cloud Console
5. (אופציונלי) הוסף גם:
   - `GOOGLE_REDIRECT_URI` = `https://your-render-url.onrender.com/api/auth/google/callback`

### שלב 5: עדכון Redirect URI (אם נדרש)

אם שינית את ה-URL של Render או שכחת להוסיף את ה-Redirect URI:

1. חזור ל-Google Cloud Console
2. עבור ל-**"APIs & Services"** → **"Credentials"**
3. לחץ על ה-OAuth 2.0 Client ID שיצרת
4. תחת **"Authorized redirect URIs"**, לחץ על **"Add URI"** והוסף את ה-URL החדש
5. לחץ על **"Save"**

### טיפים

- **Testing**: במצב Testing, רק test users יכולים להתחבר. כדי לאפשר לכל המשתמשים, תצטרך לפרסם את ה-App (תחת **"OAuth consent screen"** → **"Publish App"**)
- **Production**: ב-Production, כל משתמש עם Google account יוכל להתחבר
- **Security**: לעולם אל תחלוק את ה-Client Secret בפומבי

---

## JWT Secrets

JWT Secrets משמשים לחתימת Access Tokens ו-Refresh Tokens.

### שלב 1: יצירת JWT_ACCESS_SECRET

יש לך כמה אפשרויות:

#### אפשרות א': שימוש ב-OpenSSL (מומלץ)

אם יש לך OpenSSL מותקן (Windows/Mac/Linux):

```bash
openssl rand -base64 32
```

זה ייצור מחרוזת אקראית של 32 תווים (base64 encoded).

#### אפשרות ב': שימוש ב-Node.js

אם יש לך Node.js מותקן:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### אפשרות ג': שימוש ב-Online Generator

1. היכנס ל-[RandomKeygen](https://randomkeygen.com/) או [Generate Secret](https://generate-secret.vercel.app/32)
2. העתק מחרוזת אקראית (לפחות 32 תווים)

#### אפשרות ד': שימוש ב-Python

אם יש לך Python מותקן:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### שלב 2: יצירת JWT_REFRESH_SECRET

חזור על שלב 1 עם פקודה חדשה כדי ליצור secret שונה לחלוטין.

**חשוב**: `JWT_REFRESH_SECRET` צריך להיות שונה מ-`JWT_ACCESS_SECRET`.

### שלב 3: הגדרה ב-Render

1. עבור ל-Render Dashboard
2. עבור ל-Web Service שלך
3. לחץ על **"Environment"**
4. הוסף את שני משתני הסביבה:
   - `JWT_ACCESS_SECRET` = ה-secret שיצרת בשלב 1
   - `JWT_REFRESH_SECRET` = ה-secret שיצרת בשלב 2

### טיפים

- **אורך**: מומלץ להשתמש ב-secrets של לפחות 32 תווים
- **אקראיות**: ודא שה-secrets אקראיים לחלוטין - אל תשתמש בערכים צפויים
- **אבטחה**: לעולם אל תחלוק את ה-secrets בפומבי
- **שמירה**: שמור את ה-secrets במקום בטוח (Password Manager, Encrypted File וכו')

---

## JOB_SECRET

JOB_SECRET משמש לאימות Cron Jobs (למשל: בדיקת תאריכי תפוגה יומית).

### שלב 1: יצירת JOB_SECRET

השתמש באותן שיטות כמו ל-JWT Secrets:

#### אפשרות א': שימוש ב-OpenSSL

```bash
openssl rand -base64 32
```

#### אפשרות ב': שימוש ב-Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### אפשרות ג': שימוש ב-Online Generator

1. היכנס ל-[RandomKeygen](https://randomkeygen.com/) או [Generate Secret](https://generate-secret.vercel.app/32)
2. העתק מחרוזת אקראית (לפחות 32 תווים)

### שלב 2: הגדרה ב-Render

1. עבור ל-Render Dashboard
2. עבור ל-Web Service שלך
3. לחץ על **"Environment"**
4. הוסף את משתנה הסביבה:
   - `JOB_SECRET` = ה-secret שיצרת

### שלב 3: שימוש ב-Cron Job

אם אתה מגדיר Cron Job ב-Render:

1. עבור ל-**"Cron Jobs"** (או **"Scheduled Jobs"**)
2. בעת הגדרת ה-Command, השתמש ב-`JOB_SECRET`:
   ```
   curl -X POST https://your-render-url.onrender.com/internal/jobs/daily -H "X-JOB-SECRET: your-job-secret-here"
   ```
   **הערה**: החלף את `your-job-secret-here` בערך של `JOB_SECRET` שהגדרת.

**חשוב**: ה-`JOB_SECRET` ב-Environment Variables צריך להיות זהה לערך שתשתמש בו ב-Cron Job Command.

### טיפים

- **אבטחה**: JOB_SECRET מגן על ה-endpoints הפנימיים שלך - ודא שהוא חזק ואקראי
- **שימוש**: השתמש ב-JOB_SECRET רק ל-Cron Jobs פנימיים - אל תחשוף אותו ל-clients

---

## URLs

הסבר איך לקבוע את הכתובות (Render URL, Netlify URL) ואיך להשתמש בהן.

### Render URL

1. לאחר יצירת ה-Web Service ב-Render, תקבל URL אוטומטי:
   - **פורמט**: `https://your-service-name.onrender.com`
   - **דוגמה**: `https://coupon-manager-api.onrender.com`

2. ה-URL נשאר קבוע גם אחרי Deploy מחדש.

3. **שימושים**:
   - **GOOGLE_REDIRECT_URI**: `https://your-service-name.onrender.com/api/auth/google/callback`
   - **VITE_API_BASE_URL** (ב-Netlify): `https://your-service-name.onrender.com/api`
   - **Cron Job Command**: `https://your-service-name.onrender.com/internal/jobs/daily`

### Netlify URL

1. לאחר יצירת ה-Site ב-Netlify, תקבל URL אוטומטי:
   - **פורמט**: `https://your-site-name.netlify.app`
   - **דוגמה**: `https://coupon-manager.netlify.app`

2. ה-URL נשאר קבוע גם אחרי Deploy מחדש.

3. **שימושים**:
   - **FRONTEND_URL** (ב-Render): `https://your-site-name.netlify.app`

### Custom Domains

אם אתה משתמש ב-Custom Domain:

- **Render**: הגדר את ה-Custom Domain תחת **"Settings"** → **"Custom Domains"**
- **Netlify**: הגדר את ה-Custom Domain תחת **"Site settings"** → **"Domain management"**

**חשוב**: אם אתה משתמש ב-Custom Domain, עדכן את כל ה-URLs בהתאם:
- `FRONTEND_URL` ב-Render
- `GOOGLE_REDIRECT_URI` ב-Render וב-Google Cloud Console
- `VITE_API_BASE_URL` ב-Netlify (אם ה-API גם על Custom Domain)

### טיפים

- **שמירה**: שמור את כל ה-URLs במקום נגיש - תצטרך אותם להגדרת משתני הסביבה
- **עדכון**: אם אתה משנה את ה-URLs, ודא לעדכן את כל המקומות הרלוונטיים:
  - Render Environment Variables
  - Netlify Environment Variables
  - Google Cloud Console (OAuth Redirect URIs)
  - Cron Job Commands

---

## סיכום

לאחר יצירת כל ה-Credentials:

1. **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
2. **Google OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
3. **JWT Secrets**: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
4. **JOB_SECRET**: `JOB_SECRET`
5. **URLs**: Render URL, Netlify URL

הגדר את כל המשתנים ב-Render Dashboard (ראה `DEPLOYMENT_RENDER.md`) וב-Netlify Dashboard (ראה `DEPLOYMENT_NETLIFY.md`).

לאחר מכן, השתמש ב-`DEPLOYMENT_CHECKLIST.md` כדי לוודא שהכל הוגדר נכון.

