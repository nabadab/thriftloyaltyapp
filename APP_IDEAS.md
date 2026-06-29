# ThriftLoyalty — App Feature Ideas

A backlog of feature ideas for the customer-facing **ThriftLoyalty** mobile app
(Expo / React Native). Ideas are grouped by how much backend work they need and
prioritized within each group. Each idea notes the **POS data/capability that
already backs it** in the ThriftCart system, so we know what's realistic.

> Context: ThriftCart (the POS) already tracks customers, purchase history,
> loyalty points/balances/rewards, store credit, gift cards, donations,
> discounts/coupons, marketing campaigns, multi-store data, and store info.
> The app today surfaces: phone login, a QR loyalty card, point balances +
> rewards, transaction history, and multi-store membership.

---

## Tier 1 — High impact, mostly backed by existing POS data

These need new app screens + (in most cases) new read-only API endpoints, but
the underlying data already exists in ThriftCart.

### 1. Donation impact & tax receipts ⭐
Thrift shoppers are often donors too. Surface a "My Donations" tab showing
pickups, drop-offs, and monetary donations with running totals and downloadable
year-end tax summaries.
- **Backed by:** `mydonationrecordapi.php` (donation history by phone/email).
- **Why it wins:** emotional + practical (taxes); unique to the nonprofit-thrift niche.

### 2. Rewards progress & "next reward" nudges
Today rewards list as redeemable/locked. Add a progress bar to the next reward
("You're 40 pts from $5 off") and a celebratory state when something unlocks.
- **Backed by:** loyalty balances + redemption rules (`backend/loyalty.php`).

### 3. Personalized offers / coupons inbox
A dedicated offers screen (the API already defines `getOffers`). Show active
coupons, color-tag rotation sales, and targeted promos with expiry countdowns.
- **Backed by:** `discount` table, coupon rule sets, `loyaltymarketingcampaign`.
- **Note:** app already has an unused `getOffers` endpoint — wire it up.

### 4. Store credit & gift card wallet
Show store-credit balance and any gift cards, with transaction ledger. Optional:
buy/reload a gift card in-app.
- **Backed by:** `storecredit` table, `giftcardapiv1.php` (Stripe purchase).

### 5. Digital receipts: search, filter, share
Transaction history exists; add search by date/amount/item, and a "share/export
receipt" action for returns or expense tracking.
- **Backed by:** `purchase` / `purchaseitem`, `thriftreceiptapi.php`.

### 6. Profile & preferences screen
The navigator has a `// TODO: Add Profile screen`. Build it: edit name/email,
manage SMS/email marketing opt-in, notification preferences, privacy controls.
- **Backed by:** `updateProfile` (already in api.ts) + `customerattribute` opt-ins.

---

## Tier 2 — Medium effort, high engagement

Need light new backend endpoints or data plumbing, plus app UI.

### 7. Push notifications
Points earned, reward unlocked, offer expiring, sale starting near you.
- **Backed by:** existing SMS/drip-campaign triggers (signup, purchase,
  milestone, points-expiring) — mirror them to push.
- **App work:** add `expo-notifications`, register device tokens.

### 8. Store finder (locations, hours, directions)
Map + list of stores with hours and "open now" status; tap to navigate.
- **Backed by:** `siteinfo` / location config (address, hours per location).

### 9. Sale & color-tag calendar
Thrift stores rotate color-tag discounts. Show "this week's colors" and an
upcoming-sales calendar so shoppers plan trips.
- **Backed by:** discount schedules / coupon rule date windows.

### 10. Loyalty tiers / VIP status
Bronze→Silver→Gold based on spend or points, with perks (bonus multipliers,
early sale access). Adds a progression hook.
- **Backed by:** purchase totals + loyalty transactions; tiers may need a new
  config table in POS.

### 11. Birthday & anniversary rewards
Auto bonus points or a birthday coupon. Collect birthday in profile.
- **Backed by:** `customerattribute` + campaign engine; small schema add for DOB.

### 12. Referral program
"Invite a friend, you both get points." Share a code; credit on first purchase.
- **Backed by:** loyalty transactions; needs a referral-code table in POS.

---

## Tier 3 — Advanced, needs POS enhancement

Higher value but require new POS capabilities or near-real-time inventory.

### 13. Browse / search store inventory
Let shoppers see what's in stock at a nearby store (or recently added).
- **Backed by:** `item` table (description, price, category, location, status),
  AI item tagging. Needs a public, performant inventory endpoint.

### 14. Item hold / reserve
Reserve a found item for pickup within N hours.
- **Backed by:** item status; needs hold workflow + staff notification in POS.

### 15. Wish list & price-drop alerts
Tag categories or items; get notified when matching items arrive or tags rotate
onto sale.
- **Backed by:** item categories + color-tag rotation; needs a watch/alert table.

### 16. "Predictive pricing"
Show when an item's color tag is likely to be discounted next.
- **Backed by:** color-tag rotation schedule (deterministic, so very doable).

---

## Tier 4 — Mission & differentiation

Lean into the nonprofit-thrift identity; great for retention and brand.

### 17. Sustainability impact tracker
Estimate landfill diverted / CO₂ saved from the user's thrift purchases and
donations. Shareable milestone cards.
- **Backed by:** purchase + donation history (item counts/weights as proxy).

### 18. Cause / impact storytelling
Show where proceeds go ("your shopping funded X meals/hours"). Optional
round-up-to-donate at the register or in-app.
- **Backed by:** SMS/donation infra; impact figures from the nonprofit.

### 19. Volunteer / community hours
Many thrift nonprofits track volunteer & community-service hours. Let users see
logged hours and sign up for shifts.
- **Backed by:** ThriftCart timesheet/volunteer-hours system.

---

## Quick wins already half-built in the app

- **Wire up `getOffers`** — endpoint exists in `src/services/api.ts`, no UI yet.
- **Build the Profile screen** — route is stubbed (`// TODO: Add Profile screen`).
- **Surface `LoyaltyCardScreen`** — a full-screen card screen exists but isn't in
  the navigator; add a "Show card" shortcut from Home.
- **Welcome message** — `welcomeMessage` is fetched and shown; expand into a
  small onboarding/announcements card.

---

## Suggested near-term sequence

1. Profile screen (unblocks notifications + marketing prefs) — *quick win.*
2. Offers inbox (wire existing `getOffers`) — *quick win, high visibility.*
3. Donation impact & tax receipts — *differentiator, data already exists.*
4. Push notifications — *retention multiplier.*
5. Store credit / gift card wallet — *clear utility.*

_Last updated: 2026-06-29._
