# Coupon Manager — ERD (MongoDB Collections)
תאריך: 2025-12-29

> ERD לוגי: Collections + קשרים + אינדקסים מומלצים.

## User
```js
User {
  _id,
  email,              // unique
  passwordHash?,      // nullable if google-only
  googleId?,          // unique sparse
  displayName,
  photoUrl?,
  appRole: "user" | "super_admin",
  createdAt, updatedAt
}
```

## Group
```js
Group {
  _id,
  name,
  ownerUserId,        // ref User
  createdAt, updatedAt
}
```

## GroupMember
```js
GroupMember {
  _id,
  groupId,            // ref Group (index)
  userId,             // ref User (index)
  role: "viewer" | "editor" | "admin",
  status: "active" | "removed",
  createdAt, updatedAt
}
// unique compound: (groupId, userId)
```

## Store (Admin managed)
```js
Store {
  _id,
  name,               // unique
  isActive: boolean,
  createdAt, updatedAt
}
```

## MultiCouponDefinition (Admin managed)
```js
MultiCouponDefinition {
  _id,
  name,               // unique
  storeIds: [ObjectId],   // Store ids
  isActive: boolean,
  createdAt, updatedAt
}
```

## Coupon
```js
Coupon {
  _id,
  groupId,               // ref Group (index)
  createdByUserId,       // ref User

  type: "SINGLE" | "MULTI",
  title,
  storeId?,              // SINGLE
  multiCouponName?,      // MULTI

  mappingStatus: "MAPPED" | "UNMAPPED",    // NEW
  resolvedStoreIds: [ObjectId],            // snapshot for MULTI (multikey index)

  expiryDate,            // index
  totalAmount,
  usedAmount,
  remainingAmount,       // stored for speed
  currency: "ILS" | "USD" | "EUR",

  status: "ACTIVE" | "PARTIALLY_USED" | "USED" | "EXPIRED" | "CANCELLED",

  images: [{
    _id,
    url,
    fileName?,
    mimeType?,
    isPrimary: boolean,
    createdAt
  }],

  notes?,
  createdAt, updatedAt
}
```

## Invitation
```js
Invitation {
  _id,
  groupId,              // ref Group (index)
  invitedEmail,
  role: "viewer" | "editor" | "admin",
  tokenHash,
  expiresAt,
  status: "pending" | "accepted" | "expired" | "cancelled",
  invitedByUserId,      // ref User
  createdAt, updatedAt
}
```

## NotificationPreference
```js
NotificationPreference {
  _id,
  userId,               // ref User (unique)
  enabled: boolean,
  daysBefore: [Number],
  timezone: "Asia/Jerusalem",
  emailDigest: boolean,
  createdAt, updatedAt
}
```

## RefreshToken (recommended)
```js
RefreshToken {
  _id,
  userId,               // ref User (index)
  tokenHash,
  expiresAt,
  revokedAt?,
  createdAt
}
```

## UnmappedMultiCouponEvent (NEW)
```js
UnmappedMultiCouponEvent {
  _id,
  multiCouponName,
  couponId,             // ref Coupon (index)
  groupId,              // ref Group
  createdByUserId,      // ref User
  status: "open" | "handled" | "ignored",
  adminNotifiedAt?,
  handledAt?,
  notes?,
  createdAt, updatedAt
}
```

## Indexes (Recommended)
- User: `{ email: 1 } unique`, `{ googleId: 1 } unique sparse`
- GroupMember: `{ groupId: 1, userId: 1 } unique`
- Coupon:
  - `{ groupId: 1, status: 1 }`
  - `{ groupId: 1, expiryDate: 1 }`
  - `{ resolvedStoreIds: 1 }` (multikey)  ✅ store search includes MULTI
  - `{ groupId: 1, storeId: 1 }`
  - `{ groupId: 1, mappingStatus: 1, multiCouponName: 1 }`
- MultiCouponDefinition: `{ name: 1 } unique`
- UnmappedMultiCouponEvent: `{ status: 1, createdAt: -1 }`, `{ couponId: 1 }`
