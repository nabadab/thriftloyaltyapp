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
      "logoUrl": "https://thriftloyalty.com/logos/str_xyz789.png",
      "customerId": "48291"
    },
    {
      "id": "str_def456",
      "name": "Salvation Army East",
      "address": "456 Oak Ave, Springfield, IL 62702",
      "phone": null,
      "logoUrl": null,
      "customerId": "10553"
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
| `customerId` | string | The user's ThriftCart internal customer ID at this store. Used by the app to generate the QR code for POS scanning. The QR code encodes the string `loyapp<customerId>` (e.g., `loyapp48291`). |

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

Get the user's loyalty balances and available rewards at a specific store. Each store can have multiple point types (e.g., "Points", "Appliance Points"), and each point type has its own balance and list of redeemable rewards.

**Auth required:** App-level + Bearer token

**Response (200):**

```json
{
  "welcomeMessage": "Welcome to the Demo Thrift Store Loyalty Program! See your balances below!",
  "pointTypes": [
    {
      "name": "Points",
      "balance": 230.00,
      "displayBalance": "230.00",
      "rewards": [
        {
          "id": "rwd_001",
          "name": "$10 off",
          "cost": "Use 200.00 points",
          "redeemable": true,
          "status": null
        },
        {
          "id": "rwd_002",
          "name": "10% off",
          "cost": "Use 200.00 points",
          "redeemable": true,
          "status": null
        },
        {
          "id": "rwd_003",
          "name": "Test!",
          "cost": "Use up to 230.00 points",
          "redeemable": true,
          "status": null
        },
        {
          "id": "rwd_004",
          "name": "$5 off",
          "cost": "Use 100.00 points",
          "redeemable": true,
          "status": null
        },
        {
          "id": "rwd_005",
          "name": "$10 off",
          "cost": "Use up to 230.00 points",
          "redeemable": true,
          "status": null
        },
        {
          "id": "rwd_006",
          "name": "Redeem all",
          "cost": "Use up to 230.00 points",
          "redeemable": true,
          "status": null
        },
        {
          "id": "rwd_007",
          "name": "Tender points",
          "cost": "Use up to 230.00 points",
          "redeemable": true,
          "status": null
        },
        {
          "id": "rwd_008",
          "name": "Birthday Bonus",
          "cost": "Use 0.00 points",
          "redeemable": true,
          "status": null
        },
        {
          "id": "rwd_009",
          "name": "$15 off",
          "cost": "Requires 300.00 points",
          "redeemable": false,
          "status": "Insufficient points to redeem"
        }
      ]
    },
    {
      "name": "Appliance Points",
      "balance": 2120.00,
      "displayBalance": "2,120.00",
      "rewards": [
        {
          "id": "rwd_010",
          "name": "$10 off",
          "cost": "Use 100.00 points",
          "redeemable": true,
          "status": null
        }
      ]
    }
  ]
}
```

Top-level fields:

| Field | Type | Description |
|---|---|---|
| `welcomeMessage` | string or null | Optional store-configured welcome message. Displayed at the top of the loyalty screen. Null if the store hasn't set one. |
| `pointTypes` | array | All point categories for this store's loyalty program. |

Each point type object:

| Field | Type | Description |
|---|---|---|
| `name` | string | The name of this point category (e.g., "Points", "Appliance Points"). |
| `balance` | number | The user's current numeric balance in this point type. |
| `displayBalance` | string | Pre-formatted balance string for display (e.g., "2,120.00"). |
| `rewards` | array | Available rewards that can be redeemed with this point type. |

Each reward object:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique reward ID. |
| `name` | string | Reward name (e.g., "$10 off", "10% off", "Redeem all"). |
| `cost` | string | Human-readable cost description (e.g., "Use 200.00 points", "Requires 300.00 points"). This string comes from the POS configuration. |
| `redeemable` | boolean | Whether the user currently has enough points to redeem this reward. |
| `status` | string or null | Status message when not redeemable (e.g., "Insufficient points to redeem"). Null when redeemable. |

The app renders each point type as a card with the balance, followed by its reward list. Rewards that are `redeemable: false` are shown dimmed with the `status` text. The number of point types and rewards varies per store -- the app just renders whatever the API returns.

---

### GET /stores/:storeId/transactions

Get the user's full transaction history at a specific store. Each transaction includes the complete receipt: line items, totals, payment methods, and point changes.

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
      "type": "purchase",
      "lineItems": [
        {
          "name": "Men's Dress Shirt",
          "quantity": 1,
          "price": 5.99,
          "displayPrice": "$5.99"
        },
        {
          "name": "Women's Jeans",
          "quantity": 1,
          "price": 7.99,
          "displayPrice": "$7.99"
        },
        {
          "name": "Hardcover Books",
          "quantity": 3,
          "price": 5.97,
          "displayPrice": "$5.97"
        }
      ],
      "subtotal": 19.95,
      "displaySubtotal": "$19.95",
      "salesTax": 1.50,
      "displaySalesTax": "$1.50",
      "grandTotal": 21.45,
      "displayGrandTotal": "$21.45",
      "tenders": [
        {
          "type": "Visa •••• 4242",
          "amount": 21.45,
          "displayAmount": "$21.45"
        }
      ],
      "pointChanges": [
        {
          "pointType": "Points",
          "change": 21,
          "displayChange": "+21",
          "reason": "1 point per dollar spent"
        }
      ]
    },
    {
      "id": "txn_002",
      "date": "2026-03-05T10:15:00Z",
      "description": "Loyalty Reward Redeemed",
      "type": "reward",
      "lineItems": [],
      "subtotal": null,
      "displaySubtotal": null,
      "salesTax": null,
      "displaySalesTax": null,
      "grandTotal": null,
      "displayGrandTotal": null,
      "tenders": [],
      "pointChanges": [
        {
          "pointType": "Points",
          "change": -200,
          "displayChange": "-200",
          "reason": "$10 off reward redeemed"
        }
      ]
    },
    {
      "id": "txn_003",
      "date": "2026-03-01T09:00:00Z",
      "description": "Purchase - Register 1",
      "type": "purchase",
      "lineItems": [
        {
          "name": "Kitchen Mixer",
          "quantity": 1,
          "price": 12.99,
          "displayPrice": "$12.99"
        }
      ],
      "subtotal": 12.99,
      "displaySubtotal": "$12.99",
      "salesTax": 0.97,
      "displaySalesTax": "$0.97",
      "grandTotal": 13.96,
      "displayGrandTotal": "$13.96",
      "tenders": [
        {
          "type": "Cash",
          "amount": 10.00,
          "displayAmount": "$10.00"
        },
        {
          "type": "Visa •••• 4242",
          "amount": 3.96,
          "displayAmount": "$3.96"
        }
      ],
      "pointChanges": [
        {
          "pointType": "Points",
          "change": 13,
          "displayChange": "+13",
          "reason": "1 point per dollar spent"
        },
        {
          "pointType": "Appliance Points",
          "change": 100,
          "displayChange": "+100",
          "reason": "Appliance purchase bonus"
        }
      ]
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
| `description` | string | Summary line (e.g., "Purchase - Register 2", "Loyalty Reward Redeemed") |
| `type` | string | One of: `purchase`, `reward`, `adjustment` |
| `lineItems` | array | Items purchased. Empty array for reward/adjustment transactions. |
| `subtotal` | number or null | Pre-tax total. Null for non-purchase transactions. |
| `displaySubtotal` | string or null | Formatted subtotal (e.g., "$19.95"). |
| `salesTax` | number or null | Tax amount. Null for non-purchase transactions. |
| `displaySalesTax` | string or null | Formatted tax (e.g., "$1.50"). |
| `grandTotal` | number or null | Final total including tax. Null for non-purchase transactions. |
| `displayGrandTotal` | string or null | Formatted grand total (e.g., "$21.45"). |
| `tenders` | array | Payment methods used. Empty array for non-purchase transactions. |
| `pointChanges` | array | Point balance changes from this transaction. Empty array if none. |

Each line item:

| Field | Type | Description |
|---|---|---|
| `name` | string | Item description |
| `quantity` | integer | Quantity purchased |
| `price` | number | Total price for this line (quantity x unit price) |
| `displayPrice` | string | Formatted price (e.g., "$5.99") |

Each tender:

| Field | Type | Description |
|---|---|---|
| `type` | string | Payment method description (e.g., "Cash", "Visa •••• 4242", "Store Credit") |
| `amount` | number | Amount paid with this tender |
| `displayAmount` | string | Formatted amount (e.g., "$21.45") |

Each point change:

| Field | Type | Description |
|---|---|---|
| `pointType` | string | Which point category (matches names from `/stores/:storeId/balances`) |
| `change` | number | Positive for earned, negative for redeemed/deducted |
| `displayChange` | string | Formatted with sign (e.g., "+21", "-200") |
| `reason` | string or null | Explanation (e.g., "1 point per dollar spent", "$10 off reward redeemed"). Null if no specific reason. |

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

### QR Code (Loyalty Card)

The QR code is generated client-side using the `customerId` field from the user's store object (returned by `GET /me`). No separate API endpoint is needed.

**QR code format:** `loyapp<customerId>`

For example, if the user's `customerId` at their active store is `48291`, the QR code encodes the string `loyapp48291`. The POS scans this and strips the `loyapp` prefix to look up the customer.

The app refreshes the customer ID whenever the user profile is loaded (on login, store switch, or manual refresh).

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
| -- | QR code | Generated client-side | `loyapp<customerId>` from `/me` store data |
| GET | `/stores/search?q=...` | API key + JWT | Search for stores to join |
| POST | `/stores/:storeId/join` | API key + JWT | Join a store's loyalty program |
| POST | `/stores/:storeId/leave` | API key + JWT | Leave a store's loyalty program |
