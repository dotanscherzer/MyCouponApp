# הנחיות להגדרת Netlify Dashboard

מדריך זה מסביר איך להגדיר את כל משתני הסביבה הנדרשים ישירות ב-Netlify Dashboard.

## שלב 1: גישה ל-Netlify Dashboard

1. היכנס ל-[Netlify Dashboard](https://app.netlify.com/)
2. התחבר עם החשבון שלך (GitHub/GitLab/Bitbucket/Email)

## שלב 2: יצירת Site חדש (אם לא קיים)

אם עדיין לא יצרת את ה-Site:

### אפשרות א': חיבור מ-Git Repository

1. לחץ על **"Add new site"** → **"Import an existing project"**
2. בחר את ה-Git Provider שלך (GitHub/GitLab/Bitbucket)
3. בחר את ה-repository שלך
4. מלא את הפרטים:
   - **Branch to deploy**: `main` (או `master`)
   - **Base directory**: `client` (אם ה-repo כולל גם את ה-server)
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
5. לחץ על **"Deploy site"**

### אפשרות ב': Deploy מ-Folder

1. לחץ על **"Add new site"** → **"Deploy manually"**
2. גרור את התיקייה `client/dist` (לאחר build מקומי)
3. או השתמש ב-Netlify CLI:
   ```bash
   cd client
   npm install
   npm run build
   npx netlify deploy --prod --dir=dist
   ```

## שלב 3: הגדרת Build Settings (אם לא הוגדרו)

אם יצרת את ה-Site דרך ה-Dashboard ולא דרך `netlify.toml`:

1. עבור ל-Site שלך
2. לחץ על **"Site settings"** → **"Build & deploy"**
3. תחת **"Build settings"**, לחץ על **"Edit settings"**
4. מלא את הפרטים:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
5. לחץ על **"Save"**

**הערה**: אם יש לך קובץ `netlify.toml` ב-root של ה-repo, Netlify ישתמש בו אוטומטית וההגדרות האלה כבר מוגדרות.

## שלב 4: הוספת משתני סביבה ב-Netlify Dashboard

1. עבור ל-Site שלך
2. לחץ על **"Site settings"** בתפריט העליון
3. בתפריט השמאלי, לחץ על **"Environment variables"**
4. לחץ על **"Add a variable"** עבור כל משתנה

### משתני סביבה חובה:

#### 1. `VITE_API_BASE_URL`
- **ערך**: כתובת ה-URL של ה-API ב-Render + `/api`
- **דוגמה**: `https://coupon-manager-api.onrender.com/api`
- **הערה**: החלף את `coupon-manager-api.onrender.com` ב-URL האמיתי של ה-Web Service שלך ב-Render
- **חשוב**: ודא שה-URL כולל את ה-protocol (`https://`) ואת ה-path `/api` בסוף

### משתני סביבה אופציונליים:

Netlify כבר מגדיר אוטומטית:
- `NODE_VERSION` - מוגדר ב-`netlify.toml` כ-`18`

## שלב 5: בדיקת Redirects

ה-Redirects כבר מוגדרים ב-`netlify.toml`:
- כל ה-requests מועברים ל-`/index.html` עם status 200 (SPA routing)

אם אתה רוצה לבדוק או לשנות:

1. עבור ל-**"Site settings"** → **"Build & deploy"**
2. תחת **"Post processing"**, לחץ על **"Redirects"**
3. ודא שיש redirect:
   - **From**: `/*`
   - **To**: `/index.html`
   - **Status**: `200`

**הערה**: אם יש לך `netlify.toml`, ה-Redirects מוגדרים שם ואין צורך להגדיר אותם ב-Dashboard.

## שלב 6: Deploy ו-בדיקה

### Deploy אוטומטי (אם חיברת Git Repository)

1. כל push ל-branch הראשי יגרום ל-Deploy אוטומטי
2. תוכל לראות את ה-Deployments תחת **"Deploys"** בתפריט העליון

### Deploy ידני

1. לחץ על **"Deploys"** בתפריט העליון
2. לחץ על **"Trigger deploy"** → **"Deploy site"**
3. או השתמש ב-Netlify CLI:
   ```bash
   cd client
   npm run build
   npx netlify deploy --prod --dir=dist
   ```

### בדיקה

1. לאחר ה-Deploy, תקבל URL של האפליקציה (למשל: `https://your-app-name.netlify.app`)
2. שמור את ה-URL הזה - תצטרך אותו להגדרת `FRONTEND_URL` ב-Render
3. פתח את ה-URL בדפדפן ובדוק שהאפליקציה עובדת
4. בדוק שה-API calls עובדים (פתח את ה-Developer Tools → Network)

## שלב 7: עדכון FRONTEND_URL ב-Render

לאחר שקיבלת את ה-URL של Netlify:

1. עבור ל-Render Dashboard
2. עבור ל-Web Service שלך
3. לחץ על **"Environment"**
4. עדכן את `FRONTEND_URL` ל-URL של Netlify (למשל: `https://your-app-name.netlify.app`)
5. השירות יתחיל מחדש אוטומטית

## שלב 8: הגדרת Custom Domain (אופציונלי)

אם אתה רוצה להשתמש ב-domain מותאם אישית:

1. עבור ל-**"Site settings"** → **"Domain management"**
2. לחץ על **"Add custom domain"**
3. הזן את ה-domain שלך
4. עקוב אחרי ההוראות להגדרת DNS

## טיפים חשובים

- **Environment Variables**: משתני הסביבה זמינים רק בזמן ה-Build. אם אתה משנה משתנה סביבה, תצטרך לעשות Deploy מחדש.
- **Build Logs**: תמיד בדוק את ה-Build Logs אם יש בעיות - הם יכולים לעזור לזהות בעיות בהגדרות
- **Preview Deploys**: כל Pull Request יוצר Preview Deploy אוטומטי - שימושי לבדיקות
- **URL קבוע**: ה-URL של Netlify (`your-app-name.netlify.app`) נשאר קבוע גם אחרי Deploy מחדש

## בעיות נפוצות

### Build נכשל
- בדוק שה-`VITE_API_BASE_URL` מוגדר נכון
- בדוק את ה-Build Logs לפרטים נוספים
- ודא שה-`package.json` כולל את כל ה-dependencies הנדרשים

### שגיאת CORS ב-API calls
- ודא ש-`FRONTEND_URL` ב-Render מוגדר ל-URL הנכון של Netlify
- ודא שה-URL כולל את ה-protocol (`https://`)

### האפליקציה לא נטענת
- בדוק שה-Redirects מוגדרים נכון (כל ה-routes מועברים ל-`/index.html`)
- בדוק את ה-Console בדפדפן לשגיאות JavaScript

### API calls לא עובדים
- בדוק שה-`VITE_API_BASE_URL` מוגדר נכון
- בדוק שה-API ב-Render עובד (נסה לפתוח את ה-Health Check endpoint)
- בדוק את ה-Network tab ב-Developer Tools לראות מה השגיאה המדויקת

## הגדרות נוספות (אופציונלי)

### Environment Variables לפי Branch

Netlify מאפשר להגדיר משתני סביבה שונים ל-Production, Deploy Previews, ו-Branches ספציפיים:

1. עבור ל-**"Site settings"** → **"Environment variables"**
2. לחץ על **"Add a variable"**
3. בחר את ה-Scope (Production, Deploy Previews, או Branch ספציפי)
4. הזן את ה-Key וה-Value

### Build Hooks

אם אתה רוצה להפעיל Deploy מבחוץ:

1. עבור ל-**"Site settings"** → **"Build & deploy"**
2. תחת **"Build hooks"**, לחץ על **"Add build hook"**
3. תן שם ל-Hook והעתק את ה-URL
4. השתמש ב-URL הזה ל-trigger Deploy (למשל: `curl -X POST -d {} "https://api.netlify.com/build_hooks/YOUR_HOOK_ID"`)

