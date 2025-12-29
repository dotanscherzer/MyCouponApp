# Coupon Manager — API Spec (REST)
תאריך: 2025-12-29

Base: `/api`  
Auth: `Authorization: Bearer <accessToken>`

## Auth
### POST `/auth/register`
```json
{"email":"a@b.com","password":"123456","displayName":"Dotan"}
```

### POST `/auth/login`
```json
{"email":"a@b.com","password":"123456"}
```

### GET `/auth/google/start`
### GET `/auth/google/callback`
### POST `/auth/refresh`
### POST `/auth/logout`

## Lookup / Autocomplete (תוספת #7)
### GET `/lookup/stores?query=<text>&limit=10`
```json
{"items":[{"id":"...","name":"שופרסל"}]}
```

### GET `/lookup/multi-coupons?query=<text>&limit=10`
```json
{"items":[{"name":"תו הזהב","isActive":true}]}
```

## Me / Preferences
### GET `/me`
### PUT `/me`
### GET `/me/notifications`
### PUT `/me/notifications`
```json
{"enabled":true,"daysBefore":[3,7],"timezone":"Asia/Jerusalem","emailDigest":true}
```

## Groups
### POST `/groups`
### GET `/groups`
### GET `/groups/:groupId`
### PUT `/groups/:groupId` (admin)
### DELETE `/groups/:groupId` (admin/owner)

## Invitations / Members
### POST `/groups/:groupId/invitations` (admin)
```json
{"email":"x@y.com","role":"editor"}
```
### POST `/invitations/accept`
```json
{"token":"<token-from-email>"}
```
### GET `/groups/:groupId/members` (admin)
### PATCH `/groups/:groupId/members/:userId` (admin)
### DELETE `/groups/:groupId/members/:userId` (admin)

## Coupons
### GET `/groups/:groupId/coupons`
Query params:
- `storeId=<storeId>` ✅ תוספת #6: מחזיר גם SINGLE וגם MULTI שמכיל את החנות
- `status=ACTIVE|PARTIALLY_USED|USED|EXPIRED|CANCELLED`
- `mappingStatus=MAPPED|UNMAPPED`
- `expiringInDays=7`
- `search=<text>`
- `sort=expiryDate|remainingAmount|createdAt`
- `order=asc|desc`

### POST `/groups/:groupId/coupons` (editor+)
#### SINGLE
```json
{"type":"SINGLE","title":"קופון שופרסל 100","storeId":"<storeId>","expiryDate":"2026-01-15","totalAmount":100,"currency":"ILS"}
```
#### MULTI (כולל לא ממופה)
```json
{"type":"MULTI","title":"תו הזהב","multiCouponName":"תו הזהב","expiryDate":"2026-02-01","totalAmount":1000,"currency":"ILS"}
```
Behavior:
- אם name קיים בהגדרות -> `mappingStatus=MAPPED` + `resolvedStoreIds`
- אם לא קיים -> `mappingStatus=UNMAPPED`, `resolvedStoreIds=[]`
  - create `UnmappedMultiCouponEvent`
  - send email to `super_admin` users (תוספת #4)

### GET `/groups/:groupId/coupons/:couponId`
### PUT `/groups/:groupId/coupons/:couponId` (editor+)

### POST `/groups/:groupId/coupons/:couponId/usage` (editor+)
```json
{"mode":"ADD","amount":50}
```
or
```json
{"mode":"SET","amount":200}
```

### POST `/groups/:groupId/coupons/:couponId/cancel` (editor+)
### DELETE `/groups/:groupId/coupons/:couponId` (admin)

## Coupon Images
### POST `/groups/:groupId/coupons/:couponId/images/init-upload` (editor+)
### POST `/groups/:groupId/coupons/:couponId/images` (editor+)
### DELETE `/groups/:groupId/coupons/:couponId/images/:imageId` (editor+)

## Admin (super_admin)
### Stores
- GET `/admin/stores`
- POST `/admin/stores`
- PUT `/admin/stores/:storeId`
- DELETE `/admin/stores/:storeId`

### MultiCouponDefinitions
- GET `/admin/multi-coupons`
- POST `/admin/multi-coupons`
- PUT `/admin/multi-coupons/:id`
- DELETE `/admin/multi-coupons/:id`
- POST `/admin/multi-coupons/:id/resolve-unmapped` ✅ resolve old UNMAPPED

### Unmapped Multi Events
- GET `/admin/unmapped-multi-events?status=open|handled|ignored`
- PATCH `/admin/unmapped-multi-events/:id`

## Internal Jobs (Render Cron)
### POST `/internal/jobs/daily`
Headers: `X-JOB-SECRET`
Return: `{"expiredUpdated":12,"emailsSent":31}`
