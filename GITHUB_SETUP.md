# העלאת הפרויקט ל-GitHub

הפרויקט מוכן להעלאה! בצע את השלבים הבאים:

## שלב 1: הוסף את ה-remote של GitHub

הרץ את הפקודה הבאה (החלף `YOUR_USERNAME` בשם המשתמש שלך ב-GitHub):

```bash
git remote add origin https://github.com/YOUR_USERNAME/MycouponApp.git
```

או אם אתה משתמש ב-SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/MycouponApp.git
```

## שלב 2: בדוק שה-remote נוסף

```bash
git remote -v
```

## שלב 3: דחף את הקוד ל-GitHub

```bash
git push -u origin main
```

אם זה לא עובד, נסה:
```bash
git push -u origin master
```

## הערות

- אם ה-repository ב-GitHub עדיין ריק, GitHub עשוי להציע לך להוסיף README או .gitignore - אל תעשה זאת, כי יש לנו כבר את הקבצים האלה
- אם יש שגיאת authentication, תצטרך להגדיר GitHub credentials או להשתמש ב-GitHub CLI
