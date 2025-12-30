---
name: Coupon Manager - Implementation Plan
overview: "תוכנית פעולה מפורטת לבניית מערכת ניהול קופונים מלאה: Backend (Node.js+Express+TypeScript+MongoDB), Frontend (React+TypeScript+Vite), אימות, ניהול קבוצות, קופונים יחיד ומולטי, העלאת תמונות, התראות, ולוח בקרה למנהלים."
todos:
  - id: setup-backend
    content: "יצירת Backend project: directory structure, package.json עם כל התלויות, tsconfig.json, .env.example, entry point בסיסי"
    status: pending
  - id: setup-frontend
    content: "יצירת Frontend project: Vite עם React+TypeScript, התקנת תלויות (router, query, UI library), מבנה תיקיות"
    status: pending
  - id: db-connection
    content: "הגדרת MongoDB connection: config file, connection string, error handling"
    status: pending
    dependencies:
      - setup-backend
  - id: create-models
    content: "יצירת כל ה-Mongoose models: User, Group, GroupMember, Store, MultiCouponDefinition, Coupon (עם resolvedStoreIds), Invitation, NotificationPreference, RefreshToken, UnmappedMultiCouponEvent + כל ה-indexes"
    status: pending
    dependencies:
      - db-connection
  - id: auth-service
    content: "יישום Auth Service: JWT generation/verification, password hashing, token utilities"
    status: pending
    dependencies:
      - create-models
  - id: auth-middleware
    content: "יישום Auth Middleware: requireAuth (JWT verification), optionalAuth"
    status: pending
    dependencies:
      - auth-service
  - id: auth-endpoints
    content: "יישום Auth Endpoints: register, login, Google OAuth (start/callback), refresh, logout"
    status: pending
    dependencies:
      - auth-middleware
  - id: rbac-middleware
    content: "יישום RBAC Middlewares: requireRole (super_admin), requireGroupMember, requireGroupRole (viewer/editor/admin)"
    status: pending
    dependencies:
      - auth-middleware
  - id: users-endpoints
    content: "יישום Users APIs: GET/PUT /me, GET/PUT /me/notifications"
    status: pending
    dependencies:
      - rbac-middleware
  - id: groups-crud
    content: "יישום Groups APIs: POST/GET/PUT/DELETE /groups, יצירת GroupMember ל-owner"
    status: pending
    dependencies:
      - rbac-middleware
  - id: invitations-members
    content: "יישום Invitations & Members APIs: POST invitations, POST accept, GET/PATCH/DELETE members"
    status: pending
    dependencies:
      - groups-crud
  - id: coupons-service
    content: "יישום Coupons Service: createCoupon, listCoupons (עם filters כולל storeId+MULTI), getById, update, delete, calculateStatus"
    status: pending
    dependencies:
      - groups-crud
  - id: multi-coupon-logic
    content: "יישום Multi-Coupon Logic: resolveMultiCoupon, handleUnmappedCoupon (יצירת event + מייל), resolveUnmappedCoupons, integration ב-createCoupon"
    status: pending
    dependencies:
      - coupons-service
  - id: coupons-crud-endpoints
    content: "יישום Coupons CRUD Endpoints: GET/POST/PUT/DELETE /groups/:groupId/coupons, GET /groups/:groupId/coupons/:id"
    status: pending
    dependencies:
      - multi-coupon-logic
  - id: coupon-usage
    content: "יישום Usage Endpoint: POST /coupons/:id/usage (ADD/SET modes), atomic update, status calculation, validation"
    status: pending
    dependencies:
      - coupons-crud-endpoints
  - id: coupon-cancel
    content: "יישום Cancel Endpoint: POST /coupons/:id/cancel (עדכון status ל-CANCELLED)"
    status: pending
    dependencies:
      - coupon-usage
  - id: lookup-apis
    content: "יישום Lookup APIs: GET /lookup/stores, GET /lookup/multi-coupons (autocomplete עם text search)"
    status: pending
    dependencies:
      - create-models
  - id: admin-stores
    content: "יישום Admin Stores APIs: GET/POST/PUT/DELETE /admin/stores (super_admin required)"
    status: pending
    dependencies:
      - lookup-apis
      - rbac-middleware
  - id: admin-multi-coupons
    content: "יישום Admin MultiCouponDefinitions APIs: GET/POST/PUT/DELETE /admin/multi-coupons, POST /admin/multi-coupons/:id/resolve-unmapped"
    status: pending
    dependencies:
      - admin-stores
      - multi-coupon-logic
  - id: admin-unmapped-events
    content: "יישום Admin Unmapped Events APIs: GET /admin/unmapped-multi-events, PATCH /admin/unmapped-multi-events/:id"
    status: pending
    dependencies:
      - admin-multi-coupons
  - id: cloudinary-setup
    content: "הגדרת Cloudinary: config, image service (generateUploadSignature, deleteImage)"
    status: pending
    dependencies:
      - setup-backend
  - id: image-endpoints
    content: "יישום Image Endpoints: POST /images/init-upload, POST /images (associate), DELETE /images/:imageId"
    status: pending
    dependencies:
      - cloudinary-setup
      - coupons-crud-endpoints
  - id: email-service
    content: "יישום Email Service: Resend/SendGrid config, sendInvitationEmail, sendExpiryNotificationEmail, sendUnmappedAlertEmail, templates"
    status: pending
    dependencies:
      - setup-backend
  - id: daily-job
    content: "יישום Daily Job: expiry status updates, email notifications לפי preferences, POST /internal/jobs/daily עם X-JOB-SECRET"
    status: pending
    dependencies:
      - email-service
      - coupon-usage
  - id: frontend-auth
    content: "יישום Frontend Auth: AuthContext, useAuth hook, ProtectedRoute, LoginPage, RegisterPage, API client"
    status: pending
    dependencies:
      - setup-frontend
      - auth-endpoints
  - id: frontend-layout
    content: "יישום Frontend Layout: Layout component, Header עם navigation, ErrorBoundary, AppRoutes"
    status: pending
    dependencies:
      - frontend-auth
  - id: frontend-groups
    content: "יישום Groups UI: GroupsPage, GroupDetailsPage, GroupForm, MembersList, InviteMember component, API client"
    status: pending
    dependencies:
      - frontend-layout
      - groups-crud
      - invitations-members
  - id: frontend-coupons-list
    content: "יישום Coupons List UI: CouponsPage, CouponsTable, CouponFilters (store, status, expiry, search, sort), useCoupons hook, API client"
    status: pending
    dependencies:
      - frontend-groups
      - coupons-crud-endpoints
      - lookup-apis
  - id: frontend-coupon-details
    content: "יישום Coupon Details UI: CouponDetailsPage, CouponUsageForm, integration עם images"
    status: pending
    dependencies:
      - frontend-coupons-list
      - coupon-usage
  - id: frontend-coupon-form
    content: "יישום Coupon Form: CouponForm component, SINGLE/MULTI selection, autocomplete (stores + multi-coupons), image upload integration"
    status: pending
    dependencies:
      - frontend-coupon-details
      - image-endpoints
  - id: frontend-admin
    content: "יישום Admin Panel: AdminPanel layout, StoresPage, MultiCouponsPage (עם resolve button), UnmappedEventsPage, API clients"
    status: pending
    dependencies:
      - frontend-layout
      - admin-stores
      - admin-multi-coupons
      - admin-unmapped-events
  - id: frontend-settings
    content: "יישום Settings UI: SettingsPage, NotificationPreferencesPage (enabled, daysBefore, timezone, emailDigest)"
    status: pending
    dependencies:
      - frontend-layout
      - users-endpoints
  - id: error-handling
    content: "יישום Error Handling: Backend error middleware, validation עם Zod, Frontend error handling ב-Query, toast notifications"
    status: pending
    dependencies:
      - daily-job
      - frontend-settings
  - id: deployment
    content: "הגדרת Deployment: Render config (backend + cron job), Netlify config (frontend), MongoDB Atlas setup, environment variables"
    status: pending
    dependencies:
      - error-handling
---

# תוכנית פעולה - Coupon Manager

## סקירה כללית

מערכת ניהול קופונים מלאה עם ארכיטקטורה של Full-Stack:

- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose)
- **Frontend**: React + TypeScript (Vite) + TanStack Query
- **שירותים**: Cloudinary (תמונות), Resend/SendGrid (מיילים)
- **Deployment**: Render (Backend), Netlify (Frontend), MongoDB Atlas

## מבנה הפרויקט

```javascript
Coupon App/
├── server/          # Backend API
│   ├── src/
│   │   ├── config/      # DB, env, Cloudinary config
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # Express routes
│   │   ├── controllers/ # Route handlers
│   │   ├── services/    # Business logic
│   │   ├── middlewares/ # Auth, RBAC, validation
│   │   ├── jobs/        # Background jobs
│   │   └── utils/       # Helpers
│   ├── package.json
│   └── tsconfig.json
├── client/          # Frontend React App
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── routes/      # Route definitions
│   │   ├── auth/        # Auth context/hooks
│   │   └── utils/       # Helpers
│   ├── package.json
│   └── vite.config.ts
└── docs/            # Specifications (קיים)
```



## שלבי יישום

### שלב 1: הגדרת Infrastructure (Backend + Frontend)

#### 1.1 יצירת Backend Project

- יצירת `/server` directory
- `package.json` עם תלויות:
- `express`, `mongoose`, `typescript`, `ts-node`, `nodemon`
- `zod`, `jsonwebtoken`, `bcrypt`, `dotenv`
- `@google-cloud/local-auth`, `google-auth-library` (או `passport-google-oauth20`)
- `@resend/node` (או `@sendgrid/mail`)
- `cloudinary`, `multer`
- `cors`, `helmet`, `express-rate-limit`
- `tsconfig.json` עם הגדרות TypeScript
- `.env.example` עם כל המשתנים הנדרשים
- `src/index.ts` - entry point בסיסי

#### 1.2 יצירת Frontend Project

- יצירת `/client` directory
- יצירת Vite project: `npm create vite@latest . -- --template react-ts`
- התקנת תלויות נוספות:
- `react-router-dom`, `@tanstack/react-query`
- `axios` או `fetch` wrapper
- UI library: `@mui/material` או `chakra-ui` או `shadcn/ui`
- הגדרת `vite.config.ts`
- יצירת מבנה תיקיות

### שלב 2: Database Models & Configuration

#### 2.1 MongoDB Connection

- `server/src/config/database.ts` - Mongoose connection
- הגדרת connection string ב-`.env`

#### 2.2 יצירת כל ה-Models

על פי [ERD](docs/03_ERD_Mongo_Coupon_Manager.md):

- `server/src/models/User.model.ts`
- `server/src/models/Group.model.ts`
- `server/src/models/GroupMember.model.ts`
- `server/src/models/Store.model.ts`
- `server/src/models/MultiCouponDefinition.model.ts`
- `server/src/models/Coupon.model.ts` (עם resolvedStoreIds, mappingStatus)
- `server/src/models/Invitation.model.ts`
- `server/src/models/NotificationPreference.model.ts`
- `server/src/models/RefreshToken.model.ts`
- `server/src/models/UnmappedMultiCouponEvent.model.ts`

כל model יכלול:

- Schema definition עם types
- Indexes (על פי ERD)
- Virtuals אם נדרש
- Methods אם נדרש

### שלב 3: Authentication System

#### 3.1 Backend Auth Infrastructure

- `server/src/config/jwt.config.ts` - JWT secrets ו-config
- `server/src/services/auth.service.ts`:
- `generateTokens(userId)` - access + refresh
- `verifyToken(token)`
- `hashPassword()`, `comparePassword()`
- `server/src/middlewares/auth.middleware.ts`:
- `requireAuth` - verify JWT access token
- `optionalAuth` - optional verification

#### 3.2 Auth Endpoints

- `server/src/routes/auth.routes.ts`:
- `POST /auth/register` - הרשמה (email+password)
- `POST /auth/login` - התחברות (email+password)
- `GET /auth/google/start` - התחלת Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/refresh` - חידוש access token
- `POST /auth/logout` - ביטול refresh token
- `server/src/controllers/auth.controller.ts` - handlers

#### 3.3 Frontend Auth

- `client/src/api/auth.api.ts` - API calls
- `client/src/auth/AuthContext.tsx` - Context provider
- `client/src/auth/useAuth.ts` - Hook
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/RegisterPage.tsx`
- `client/src/components/ProtectedRoute.tsx` - Route wrapper

### שלב 4: RBAC & Authorization

#### 4.1 RBAC Middlewares

- `server/src/middlewares/rbac.middleware.ts`:
- `requireRole(role)` - בדיקת appRole (super_admin)
- `requireGroupMember()` - בדיקת חברות בקבוצה
- `requireGroupRole(roles[])` - בדיקת role בקבוצה (viewer/editor/admin)

#### 4.2 RBAC Utilities

- `server/src/services/rbac.service.ts`:
- `getUserGroupRole(userId, groupId)` - קבלת role בקבוצה
- `checkGroupPermission()` - helper לבדיקת הרשאות

### שלב 5: Users & Groups APIs

#### 5.1 Users Endpoints

- `server/src/routes/users.routes.ts`:
- `GET /me` - פרטי משתמש נוכחי
- `PUT /me` - עדכון פרופיל
- `GET /me/notifications` - העדפות התראות
- `PUT /me/notifications` - עדכון העדפות
- `server/src/controllers/users.controller.ts`

#### 5.2 Groups Endpoints

- `server/src/routes/groups.routes.ts`:
- `POST /groups` - יצירת קבוצה
- `GET /groups` - רשימת קבוצות של המשתמש
- `GET /groups/:groupId` - פרטי קבוצה
- `PUT /groups/:groupId` - עדכון (admin)
- `DELETE /groups/:groupId` - מחיקה (owner/admin)
- `server/src/controllers/groups.controller.ts`
- לוגיקה: יצירת GroupMember עם role=admin ל-owner

#### 5.3 Invitations & Members

- `server/src/routes/invitations.routes.ts`:
- `POST /groups/:groupId/invitations` - שליחת הזמנה (admin)
- `POST /invitations/accept` - קבלת הזמנה
- `server/src/routes/members.routes.ts`:
- `GET /groups/:groupId/members` - רשימת חברים (admin)
- `PATCH /groups/:groupId/members/:userId` - עדכון role (admin)
- `DELETE /groups/:groupId/members/:userId` - הסרת חבר (admin)
- `server/src/services/invitation.service.ts` - יצירת token, שליחת מייל

### שלב 6: Core Coupons APIs

#### 6.1 Coupons CRUD

- `server/src/routes/coupons.routes.ts`:
- `GET /groups/:groupId/coupons` - רשימה עם פילטרים
- `POST /groups/:groupId/coupons` - יצירה
- `GET /groups/:groupId/coupons/:couponId` - פרטי קופון
- `PUT /groups/:groupId/coupons/:couponId` - עדכון (editor+)
- `DELETE /groups/:groupId/coupons/:couponId` - מחיקה (admin)
- `server/src/controllers/coupons.controller.ts`

#### 6.2 Coupons Service Logic

- `server/src/services/coupons.service.ts`:
- `createCoupon()` - יצירה עם validation
- `listCoupons()` - רשימה עם filters (כולל storeId עם MULTI support)
- `getCouponById()`
- `updateCoupon()`
- `deleteCoupon()`
- `calculateStatus()` - חישוב status אוטומטי

#### 6.3 Multi-Coupon Mapping Logic

- `server/src/services/multi-coupon.service.ts`:
- `resolveMultiCoupon(multiCouponName)` - חיפוש MultiCouponDefinition
- `handleUnmappedCoupon(coupon, multiCouponName)` - יצירת event + מייל לאדמין
- `resolveUnmappedCoupons(definitionId)` - פתרון קופונים ישנים
- Integration ב-`createCoupon()`:
- אם MULTI: חיפוש הגדרה
- אם MAPPED: שמירת resolvedStoreIds
- אם UNMAPPED: יצירת UnmappedMultiCouponEvent + שליחת מייל

### שלב 7: Coupon Usage & Status

#### 7.1 Usage Endpoint

- `POST /groups/:groupId/coupons/:couponId/usage` (editor+)
- `server/src/controllers/coupons.controller.ts` - usage handler
- `server/src/services/coupons.service.ts`:
- `updateCouponUsage()` - Atomic update עם validation:
    - mode: ADD/SET
    - Validation: usedAmount <= totalAmount
    - Atomic update עם `findOneAndUpdate` + condition
    - עדכון status אוטומטי (ACTIVE/PARTIALLY_USED/USED)
    - עדכון remainingAmount

#### 7.2 Cancel Endpoint

- `POST /groups/:groupId/coupons/:couponId/cancel` (editor+)
- עדכון status ל-CANCELLED

### שלב 8: Lookup & Autocomplete APIs

- `server/src/routes/lookup.routes.ts`:
- `GET /lookup/stores?query=<text>&limit=10`
- `GET /lookup/multi-coupons?query=<text>&limit=10`
- `server/src/controllers/lookup.controller.ts`
- Text search עם regex (תעדוף "מתחיל ב")

### שלב 9: Admin APIs

#### 9.1 Stores Management

- `server/src/routes/admin/stores.routes.ts`:
- `GET /admin/stores`
- `POST /admin/stores`
- `PUT /admin/stores/:storeId`
- `DELETE /admin/stores/:storeId`
- `server/src/controllers/admin/stores.controller.ts`
- Middleware: `requireRole('super_admin')`

#### 9.2 MultiCouponDefinitions Management

- `server/src/routes/admin/multi-coupons.routes.ts`:
- `GET /admin/multi-coupons`
- `POST /admin/multi-coupons`
- `PUT /admin/multi-coupons/:id`
- `DELETE /admin/multi-coupons/:id`
- `POST /admin/multi-coupons/:id/resolve-unmapped` - פתרון קופונים UNMAPPED
- `server/src/controllers/admin/multi-coupons.controller.ts`

#### 9.3 Unmapped Events

- `server/src/routes/admin/unmapped-events.routes.ts`:
- `GET /admin/unmapped-multi-events?status=<status>`
- `PATCH /admin/unmapped-multi-events/:id`
- `server/src/controllers/admin/unmapped-events.controller.ts`

### שלב 10: Image Upload Integration

#### 10.1 Cloudinary Setup

- `server/src/config/cloudinary.config.ts` - Cloudinary initialization
- `server/src/services/image.service.ts`:
- `generateUploadSignature()` - signed upload URL
- `deleteImage()` - מחיקת תמונה

#### 10.2 Image Endpoints

- `server/src/routes/images.routes.ts`:
- `POST /groups/:groupId/coupons/:couponId/images/init-upload` - קבלת signed URL
- `POST /groups/:groupId/coupons/:couponId/images` - שיוך תמונה לקופון
- `DELETE /groups/:groupId/coupons/:couponId/images/:imageId` - מחיקה
- `server/src/controllers/images.controller.ts`

### שלב 11: Email Service & Notifications

#### 11.1 Email Service

- `server/src/config/email.config.ts` - Resend/SendGrid config
- `server/src/services/email.service.ts`:
- `sendInvitationEmail()`
- `sendExpiryNotificationEmail()` - Digest של קופונים שפוגים
- `sendUnmappedAlertEmail()` - לאדמין
- תבניות מייל (HTML templates או plain text)

#### 11.2 Daily Job

- `server/src/jobs/daily-expiry.job.ts`:
- עדכון status ל-EXPIRED לקופונים שפג תוקף
- שליחת התראות לפי NotificationPreference
- Digest email למשתמשים
- `server/src/routes/internal/jobs.routes.ts`:
- `POST /internal/jobs/daily` - endpoint מאובטח עם `X-JOB-SECRET`
- `server/src/middlewares/job-auth.middleware.ts` - verification של secret

### שלב 12: Frontend - Core UI

#### 12.1 Layout & Navigation

- `client/src/components/Layout.tsx` - Main layout עם header
- `client/src/components/Header.tsx` - Navigation + user menu
- `client/src/components/ErrorBoundary.tsx`
- `client/src/routes/AppRoutes.tsx` - Route definitions

#### 12.2 Groups UI

- `client/src/pages/GroupsPage.tsx` - רשימת קבוצות
- `client/src/pages/GroupDetailsPage.tsx` - פרטי קבוצה
- `client/src/components/GroupForm.tsx` - יצירה/עריכה
- `client/src/components/MembersList.tsx` - ניהול חברים
- `client/src/components/InviteMember.tsx` - שליחת הזמנה
- `client/src/api/groups.api.ts`

#### 12.3 Coupons UI - List & Filters

- `client/src/pages/CouponsPage.tsx` - עמוד ראשי
- `client/src/components/CouponsTable.tsx` - טבלת קופונים
- `client/src/components/CouponFilters.tsx`:
- Filter: storeId (עם autocomplete), status, mappingStatus, expiringInDays
- Search text
- Sort (expiryDate, remainingAmount, createdAt)
- `client/src/api/coupons.api.ts`
- `client/src/hooks/useCoupons.ts` - TanStack Query hooks

#### 12.4 Coupon Details & Forms

- `client/src/pages/CouponDetailsPage.tsx` - פרטי קופון מלאים
- `client/src/components/CouponForm.tsx`:
- בחירת type (SINGLE/MULTI)
- Autocomplete לחנות (SINGLE) - `useStoresAutocomplete`
- Autocomplete למולטי-קופון (MULTI) - `useMultiCouponsAutocomplete`
- Form fields: title, expiryDate, totalAmount, currency, notes
- `client/src/components/CouponUsageForm.tsx` - עדכון שימוש (ADD/SET)
- `client/src/api/lookup.api.ts` - Autocomplete APIs

#### 12.5 Image Management UI

- `client/src/components/ImageUpload.tsx` - העלאת תמונות
- `client/src/components/ImageGallery.tsx` - גלריית תמונות
- Integration ב-CouponForm ו-CouponDetailsPage

### שלב 13: Frontend - Admin Panel

#### 13.1 Admin Layout

- `client/src/pages/admin/AdminPanel.tsx` - Layout עם tabs
- Route protection: בדיקת `appRole === 'super_admin'`

#### 13.2 Stores Management

- `client/src/pages/admin/StoresPage.tsx` - רשימה + CRUD
- `client/src/components/admin/StoreForm.tsx`
- `client/src/api/admin/stores.api.ts`

#### 13.3 MultiCouponDefinitions Management

- `client/src/pages/admin/MultiCouponsPage.tsx` - רשימה + CRUD
- `client/src/components/admin/MultiCouponForm.tsx` - בחירת stores
- `client/src/components/admin/ResolveUnmappedButton.tsx` - כפתור resolve
- `client/src/api/admin/multi-coupons.api.ts`

#### 13.4 Unmapped Events

- `client/src/pages/admin/UnmappedEventsPage.tsx` - רשימת אירועים
- `client/src/components/admin/UnmappedEventCard.tsx`
- `client/src/api/admin/unmapped-events.api.ts`

### שלב 14: Frontend - Settings & Preferences

- `client/src/pages/SettingsPage.tsx` - Profile settings
- `client/src/pages/NotificationPreferencesPage.tsx`:
- enabled toggle
- daysBefore selection (multi-select)
- timezone selector
- emailDigest toggle
- `client/src/api/users.api.ts`

### שלב 15: Error Handling & Validation

#### 15.1 Backend

- `server/src/middlewares/error-handler.middleware.ts` - Global error handler
- `server/src/utils/validation.ts` - Zod schemas לכל endpoint
- Custom error classes

#### 15.2 Frontend

- Error handling ב-TanStack Query
- Toast notifications (success/error)
- Form validation

### שלב 16: Testing & Polish

#### 16.1 Backend Testing

- Unit tests ל-services קריטיים
- Integration tests ל-APIs עיקריים

#### 16.2 Frontend Testing

- Component tests (אופציונלי)
- E2E tests (אופציונלי)

### שלב 17: Deployment Configuration

#### 17.1 Backend (Render)

- `render.yaml` או Render dashboard config:
- Service definition
- Environment variables
- Cron job: `POST /internal/jobs/daily` (daily at 9 AM)
- `.env.production` setup

#### 17.2 Frontend (Netlify)

- `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- Redirects: SPA routing
- Environment variables (API URL)

#### 17.3 MongoDB Atlas

- Cluster creation
- Connection string
- Network access rules
- Database user creation
- Indexes verification (לאחר deployment ראשוני)

## קבצים מרכזיים ליישום

### Backend Core Files

- `server/src/models/Coupon.model.ts` - Schema עם resolvedStoreIds, mappingStatus
- `server/src/services/multi-coupon.service.ts` - לוגיקת MAPPED/UNMAPPED
- `server/src/services/coupons.service.ts` - Business logic לקופונים
- `server/src/services/email.service.ts` - שליחת מיילים
- `server/src/jobs/daily-expiry.job.ts` - Job יומי
- `server/src/middlewares/rbac.middleware.ts` - הרשאות

### Frontend Core Files

- `client/src/pages/CouponsPage.tsx` - עמוד קופונים ראשי
- `client/src/components/CouponForm.tsx` - טופס עם autocomplete
- `client/src/components/CouponDetailsPage.tsx` - פרטי קופון
- `client/src/pages/admin/AdminPanel.tsx` - לוח בקרה