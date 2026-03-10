# ThriftLoyalty API Specification

Base URL: `https://thriftloyalty.com/api`

---

## Authentication

Every request from the app includes two layers of authentication:

### 1. App-Level Authentication (all requests)

Every request includes these headers to verify it's coming from the official ThriftLoyalty app:

| Header | Value | Purpose |
|---|---|---|
| `X-API-Key` | `THRIFTLOYALTY_APP_2026` | Static API key identifying the app. Reject requests without a valid key. |
| `X-Client-Platform` | `thriftloyalty-app` | Identifies the client. Could be useful if you add a web client later. |
| `Content-Type` | `application/json` | All requests and responses use JSON. |

> **Note:** The `X-API-Key` value should be changed before going to production. You may also want to rotate it periodically. The app will need a matching update when rotated. Consider making this an environment variable on the API side.

### 2. User-Level Authentication (authenticated requests)

After login, requests include:

| Header | Value |
|---|---|
| `Authorization` | `Bearer <jwt_token>` |

The JWT token is returned by the OTP verification endpoint. The API should validate it on every authenticated request. Recommended JWT payload:

```json
{
  "sub": "user_id",
  "phone": "+15551234567",
  "iat": 1710000000,
  "exp": 1712592000
}
```

Recommended token expiry: 30 days. The app stores the token locally and sends it with every authenticated request.

---

## Error Format

All error responses should use this consistent format:

```json
{
  "error": {
    "code": "INVALID_OTP",
    "message": "The verification code is invalid or expired."
  }
}
```

### Standard Error Codes

| HTTP Status | Code | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Missing or malformed fields |
| 401 | `UNAUTHORIZED` | Missing or invalid `Authorization` token |
| 401 | `INVALID_API_KEY` | Missing or invalid `X-API-Key` header |
| 401 | `INVALID_OTP` | Wrong or expired OTP code |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `ALREADY_EXISTS` | Duplicate resource (e.g. phone already registered) |
| 429 | `RATE_LIMITED` | Too many requests (especially OTP sends) |
| 500 | `INTERNAL_ERROR` | Server-side failure |

---

## Endpoints

### POST /auth/otp/request

Send a one-time verification code via SMS to the provided phone number. If no account exists for this phone number, one should be created automatically (sign-up and sign-in are the same flow).

**Auth required:** App-level only (no Bearer token)

**Request:**

```json
{
  "phone": "5551234567"
}
```

The phone number is sent as digits only (no country code, no dashes). The API should normalize and store in E.164 format (e.g. `+15551234567`).

**Response (200):**

```json
{
  "success": true
}
```

Don't reveal whether the phone number is new or existing (privacy).

**Rate limiting:** Max 3 OTP requests per phone number per 10-minute window. Return 429 if exceeded.

---

### POST /auth/otp/verify

Verify the OTP code and return a JWT token.

**Auth required:** App-level only (no Bearer token)

**Request:**

```json
{
  "phone": "5551234567",
  "code": "482901"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "isNewUser": true
}
```

| Field | Type | Description |
|---|---|---|
| `token` | string | JWT token for subsequent authenticated requests |
| `isNewUser` | boolean | `true` if this phone number just created an account. The app uses this to decide whether to show a welcome/onboarding flow. |

**Error (401):**

```json
{
  "error": {
    "code": "INVALID_OTP",
    "message": "The verification code is invalid or expired."
  }
}
```

OTP codes should expire after 10 minutes. Max 5 verification attempts per code before invalidating it.

---

### GET /me

Get the authenticated user's profile, including all stores they belong to.

**Auth required:** App-level + Bearer token

**Response (200):**

```json
{
  "id": "usr_abc123",
  "phone": "+15551234567",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "activeStoreId": "str_xyz789",
  "stores": [
    {
      "id": "str_xyz789",
      "name": "Goodwill Downtown",
      "address": "123 Main St, Springfield, IL 62701",
      "phone": "(555) 987-6543",
      "logoUrl": "https://thriftloyalty.com/logos/str_xyz789.png"
    },
    {
      "id": "str_def456",
      "name": "Salvation Army East",
      "address": "456 Oak Ave, Springfield, IL 62702",
      "phone": null,
      "logoUrl": null
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique user ID |
| `phone` | string | E.164 format |
| `firstName` | string or null | May be null if user hasn't set it yet |
| `lastName` | string or null | May be null if user hasn't set it yet |
| `email` | string or null | Optional |
| `activeStoreId` | string or null | The user's most recently selected store. Null if they haven't picked one yet. |
| `stores` | array | All stores this user has a loyalty account with. Could be empty for brand new users. |

Each store object:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique store ID |
| `name` | string | Store display name |
| `address` | string | Full address |
| `phone` | string or null | Store phone number |
| `logoUrl` | string or null | URL to store logo image. Null if not set. |

---

### PATCH /me

Update the authenticated user's profile.

**Auth required:** App-level + Bearer token

**Request (all fields optional):**

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com"
}
```

Only include fields being changed. Omitted fields are left unchanged.

**Response (200):**

```json
{
  "success": true
}
```

---

### PUT /me/active-store

Set the user's active (most recently used) store. The app calls this when the user switches stores.

**Auth required:** App-level + Bearer token

**Request:**

```json
{
  "storeId": "str_xyz789"
}
```

The API should verify the user actually belongs to this store.

**Response (200):**

```json
{
  "success": true
}
```

**Error (404):** If the user doesn't have a loyalty account at this store.

---

### GET /stores/:storeId/balances

Get the user's loyalty balances at a specific store. The response format is flexible because each store configures its own loyalty program.

**Auth required:** App-level + Bearer token

**Response (200):**

```json
{
  "balances": [
    {
      "label": "Store Credit",
      "value": 24.50,
      "type": "dollar",
      "displayValue": "$24.50"
    },
    {
      "label": "Reward Points",
      "value": 1350,
      "type": "points",
      "displayValue": "1,350 pts"
    },
    {
      "label": "Visits This Month",
      "value": 7,
      "type": "visits",
      "displayValue": "7 visits"
    }
  ]
}
```

Each balance object:

| Field | Type | Description |
|---|---|---|
| `label` | string | Human-readable label. Configured by the store. |
| `value` | number | Raw numeric value (for sorting, calculations) |
| `type` | string | One of: `dollar`, `points`, `visits`, `custom` |
| `displayValue` | string | Pre-formatted string for display. The API controls the formatting so it's consistent with what the store shows at the POS. |

The app displays whatever balances the API returns. If a store only uses dollar-based loyalty, it returns one item. If they use points + visits, it returns two. This keeps the app flexible without code changes.

---

### GET /stores/:storeId/transactions

Get the user's transaction and reward history at a specific store.

**Auth required:** App-level + Bearer token

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | Number of transactions to return |
| `offset` | integer | 0 | Pagination offset |

**Response (200):**

```json
{
  "transactions": [
    {
      "id": "txn_001",
      "date": "2026-03-09T14:32:00Z",
      "description": "Purchase - Register 2",
      "amount": -12.47,
      "pointsEarned": 12,
      "type": "purchase"
    },
    {
      "id": "txn_002",
      "date": "2026-03-05T10:15:00Z",
      "description": "Loyalty Reward Applied",
      "amount": 5.00,
      "pointsEarned": null,
      "type": "reward"
    },
    {
      "id": "txn_003",
      "date": "2026-03-01T09:00:00Z",
      "description": "Balance adjustment by store",
      "amount": 2.00,
      "pointsEarned": null,
      "type": "adjustment"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

Each transaction object:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique transaction ID |
| `date` | string | ISO 8601 timestamp (UTC) |
| `description` | string | Human-readable description |
| `amount` | number or null | Dollar amount. Negative for purchases/debits, positive for rewards/credits. Null if not applicable. |
| `pointsEarned` | number or null | Points earned in this transaction. Null if not applicable. |
| `type` | string | One of: `purchase`, `reward`, `adjustment` |

Pagination fields:

| Field | Type | Description |
|---|---|---|
| `total` | integer | Total number of transactions |
| `limit` | integer | Current page size |
| `offset` | integer | Current offset |

---

### GET /stores/:storeId/offers

Get active offers/coupons available to this user at a specific store.

**Auth required:** App-level + Bearer token

**Response (200):**

```json
{
  "offers": [
    {
      "id": "ofr_001",
      "title": "20% Off Your Next Purchase",
      "description": "Valid on any single item. Cannot be combined with other offers.",
      "expiresAt": "2026-03-31T23:59:59Z",
      "imageUrl": "https://thriftloyalty.com/offers/ofr_001.jpg"
    },
    {
      "id": "ofr_002",
      "title": "Double Points Weekend",
      "description": "Earn 2x points on all purchases this Saturday and Sunday.",
      "expiresAt": null,
      "imageUrl": null
    }
  ]
}
```

Each offer object:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique offer ID |
| `title` | string | Short offer headline |
| `description` | string | Full details / terms |
| `expiresAt` | string or null | ISO 8601 expiration. Null if no expiration. |
| `imageUrl` | string or null | Optional promotional image URL |

The app displays these as cards. Offers with no `expiresAt` are shown without an expiration line.

---

### GET /me/qr

Get the data the app should encode into the user's QR code for scanning at the POS.

**Auth required:** App-level + Bearer token

**Response (200):**

```json
{
  "qrData": "TL:usr_abc123:str_xyz789:1710086400:a3f8c1",
  "expiresAt": "2026-03-10T16:00:00Z"
}
```

| Field | Type | Description |
|---|---|---|
| `qrData` | string | The exact string to encode into the QR code. The POS decodes this to look up the customer. |
| `expiresAt` | string | When this QR data expires. The app should refresh before this time. |

The `qrData` format is up to you, but the suggested format is: `TL:<userId>:<activeStoreId>:<timestamp>:<signature>` where the signature is a truncated HMAC so the POS can verify it wasn't fabricated. This way the QR code is time-limited and tied to a specific store.

The app should call this endpoint each time the user opens the Loyalty Card screen, and refresh if the current QR has less than 5 minutes remaining.

---

### GET /stores/search

Search for stores by name or location. Used when a user wants to add a new store to their account.

**Auth required:** App-level + Bearer token

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search query (store name, city, zip code, etc.). Minimum 2 characters. |

**Response (200):**

```json
{
  "stores": [
    {
      "id": "str_xyz789",
      "name": "Goodwill Downtown",
      "address": "123 Main St, Springfield, IL 62701",
      "phone": "(555) 987-6543",
      "logoUrl": "https://thriftloyalty.com/logos/str_xyz789.png",
      "isMember": true
    },
    {
      "id": "str_abc111",
      "name": "Goodwill Eastside",
      "address": "789 Elm St, Springfield, IL 62703",
      "phone": "(555) 111-2222",
      "logoUrl": null,
      "isMember": false
    }
  ]
}
```

Each store object includes all the standard store fields plus:

| Field | Type | Description |
|---|---|---|
| `isMember` | boolean | Whether the authenticated user already has a loyalty account at this store. The app uses this to show "Joined" vs a "Join" button. |

Return up to 20 results, ordered by relevance. The search should match against store name, city, state, and zip code.

---

### POST /stores/:storeId/join

Add a store to the user's loyalty account. This creates a new loyalty membership at the specified store.

**Auth required:** App-level + Bearer token

**Request:** No body required. The store ID is in the URL path.

**Response (200):**

```json
{
  "success": true
}
```

**Error (409):** If the user is already a member of this store.

```json
{
  "error": {
    "code": "ALREADY_EXISTS",
    "message": "You are already a member of this store."
  }
}
```

---

### POST /stores/:storeId/leave

Remove a store from the user's loyalty account. The store may retain the loyalty data in case the user re-joins later (up to you on the backend).

**Auth required:** App-level + Bearer token

**Request:** No body required. The store ID is in the URL path.

**Response (200):**

```json
{
  "success": true
}
```

If the user leaves their active store, the API should set `activeStoreId` to the next most recent store, or null if they have no remaining stores.

**Error (404):** If the user isn't a member of this store.

---

## Summary Table

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/otp/request` | API key only | Send OTP code |
| POST | `/auth/otp/verify` | API key only | Verify OTP, get JWT |
| GET | `/me` | API key + JWT | Get user profile + stores |
| PATCH | `/me` | API key + JWT | Update profile |
| PUT | `/me/active-store` | API key + JWT | Set active store |
| GET | `/stores/:storeId/balances` | API key + JWT | Get loyalty balances |
| GET | `/stores/:storeId/transactions` | API key + JWT | Get transaction history |
| GET | `/stores/:storeId/offers` | API key + JWT | Get available offers |
| GET | `/me/qr` | API key + JWT | Get QR code data for POS scanning |
| GET | `/stores/search?q=...` | API key + JWT | Search for stores to join |
| POST | `/stores/:storeId/join` | API key + JWT | Join a store's loyalty program |
| POST | `/stores/:storeId/leave` | API key + JWT | Leave a store's loyalty program |
