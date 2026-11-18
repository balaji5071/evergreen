# Day 2 - Implementation Report

**Date:** 2026-11-18  
**Scope:** Security and integrity fixes, missing address functionality, frontend/backend performance improvements, database indexes, dependency upgrades, and verification.

## 1. Issues Addressed

The implementation focused on the confirmed P0/P1 findings from `DAY1_AUDIT_REPORT.md` and all findings selected by the security-review follow-up:

- Unauthenticated store-settings updates
- Hard-coded fallback admin credentials
- Client-controlled order totals and item prices
- Client-controlled coupon subtotals
- Client-controlled cart quantities/prices/totals
- Arbitrary delivery assignment
- Arbitrary order status transitions
- Stored permissions not being enforced
- Notification updates not scoped to the authenticated owner
- Stale JWT authorization fallback
- Weak field and password validation
- Missing address update/delete functionality
- Missing database indexes
- Excessive notification polling and cart writes
- Vulnerable direct Next.js/Mongoose dependencies

## 2. Bugs Fixed

| Improvement | Original problem | Solution | Verification |
|---|---|---|---|
| Store-settings authorization | `/api/settings PUT` accepted unauthenticated changes | Requires an authenticated admin, whitelists mutable fields, validates ranges and enum values | Runtime smoke test returned 403 for unauthenticated PUT |
| Server-owned order pricing | Order item prices and totals came from the checkout request | Order creation now loads the authenticated user's cart and live menu items, validates availability, and recalculates fees/tax/coupon/server total | Production build passed; route was traced and typechecked |
| Server-owned coupons | Coupon logic used client-provided subtotal | Coupon validation now loads the server-side cart and live menu prices | Production build/typecheck passed |
| Cart integrity | Cart PUT/merge trusted client prices and quantities | Added ObjectId, positive integer, quantity, duplicate, and availability validation; recalculated totals from menu prices | Production build/typecheck passed |
| Address CRUD | No API or UI delete operation existed | Added authenticated PUT/DELETE address routes and a delete action in the saved-address UI | Typecheck/build passed; route generated in Next build |
| Notification ownership | Notification ID could be marked read without ownership | Notification update now includes both notification ID and authenticated user ID | Production build/typecheck passed |
| Order transitions | Routes accepted arbitrary status jumps | Added shared status enum and legal transition map; routes now return 409 for illegal transitions | Production build/typecheck passed |
| Delivery assignment | Staff could assign arbitrary `deliveredBy` IDs | Assignment is restricted to admins, validates the target user role, and prevents invalid ObjectIds | Production build/typecheck passed |
| Stale auth fallback | `/api/auth/me` could return JWT role/permission fields when DB lookup failed | Removed stale JWT fallback; missing/deleted database users receive 401 | Production build/typecheck passed |
| Insecure admin fallback | Missing environment variables used `admin@evergreen.com` / `admin123` | Removed password and email fallbacks; missing admin configuration returns 503 | Typecheck/build passed |
| Login abuse | Login had no attempt throttling | Added a per-email 5-attempt/15-minute in-memory guard with successful-login reset | Production build/typecheck passed |
| Password validation | Signup/password changes accepted weak or malformed values | Added email, phone, name, and 8-128-character password validation | Production build/typecheck passed |

## 3. Features Implemented

- Authenticated address edit/delete API.
- Saved-address delete UI.
- Delivery role support in user types and authorization.
- Shared server-side pricing and cart normalization utilities.
- Shared order-status transition policy.
- Central staff permission helper (`requirePermission`).
- Server-side coupon validation for the logged-in user's real cart.
- Login attempt throttling.

No mock integrations or production data changes were introduced.

## 4. Frontend Optimizations

### Implemented

- Cart database writes are debounced for 250 ms instead of firing on every cart mutation.
- Menu search API requests are debounced for 300 ms.
- Notification fallback polling changed from 4 seconds to 30 seconds; Socket.IO remains the real-time path.
- Checkout now sends the applied coupon code to the order API so server-side coupon validation can be completed.
- Saved-address page now exposes delete with confirmation.

### Existing warnings retained

Lint still reports 26 warnings, primarily:

- Plain `<img>` usage in several pages
- Missing React hook dependencies
- Custom font loading warning
- Internal `window.location.href` navigation

These remain because they require broader UI-specific changes or visual verification. No warnings were converted to fabricated fixes.

## 5. Backend Optimizations

- Added `src/lib/pricing.ts` for normalized cart and authoritative checkout calculations.
- Added `src/lib/orderStatus.ts` for centralized status-transition rules.
- Added `requirePermission(permission)` for staff permission checks.
- Coupon, cart, settings, menu, address, notification, and order routes now perform more specific validation.
- `/api/coupons` now requires an admin for the complete coupon-management GET.
- Database-backed authorization is used instead of JWT fallback fields for current user state.
- Menu and coupon mutation routes reject invalid prices, names, and percentage values.

## 6. Database Improvements

Explicit indexes added:

- Orders: `(userId, createdAt)`, `(orderStatus, createdAt)`, `(deliveredBy, orderStatus)`
- Menu items: `(categoryId, available, createdAt)`
- Notifications: `(userId, read, createdAt)`
- Addresses: `(userId, createdAt)`

Cart items and order items continue to use Mongoose ObjectId/item relationships.

## 7. API Modifications

### Updated routes

- `POST /api/orders`
- `PUT /api/orders/[id]`
- `PUT /api/staff/orders`
- `PUT /api/settings`
- `PUT/DELETE /api/notifications`
- `PUT /api/cart`
- `POST /api/cart/merge`
- `POST /api/coupons/validate`
- `GET/PUT/POST/DELETE /api/coupons`
- `POST/PUT /api/menu`
- `PUT/DELETE /api/menu/[id]`
- `POST/PUT/DELETE /api/addresses`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/change-password`
- `GET /api/auth/me`

No route response was replaced with mock success data.

## 8. Files Created

- `src/lib/pricing.ts`
- `src/lib/orderStatus.ts`
- `DAY2_IMPLEMENTATION_REPORT.md`

The existing `DAY1_AUDIT_REPORT.md` remains present and unchanged.

## 9. Files Modified

### Core Day 2 implementation

- `src/lib/auth.ts`
- `src/lib/models/Address.ts`
- `src/lib/models/MenuItem.ts`
- `src/lib/models/Notification.ts`
- `src/lib/models/Order.ts`
- `src/lib/models/User.ts`
- `src/context/AuthContext.tsx`
- `src/context/CartContext.tsx`
- `src/context/SocketContext.tsx`
- `src/app/checkout/page.tsx`
- `src/app/menu/page.tsx`
- `src/app/profile/addresses/page.tsx`
- `src/app/api/addresses/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/cart/merge/route.ts`
- `src/app/api/cart/route.ts`
- `src/app/api/coupons/route.ts`
- `src/app/api/coupons/validate/route.ts`
- `src/app/api/menu/[id]/route.ts`
- `src/app/api/menu/route.ts`
- `src/app/api/notifications/route.ts`
- `src/app/api/orders/[id]/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/settings/route.ts`
- `src/app/api/staff/orders/route.ts`
- `package.json`
- `package-lock.json`

Several additional files were already modified in the worktree before Day 2. Those pre-existing changes were preserved and were not reverted.

## 10. Dependencies Changed

- Upgraded `next` from `16.3.3` to `16.4.6`.
- Upgraded `mongoose` from `^8.10.0` to `^8.24.7`.
- Updated `eslint-config-next` to `16.4.6`.
- `npm audit --omit=dev` now reports **0 production vulnerabilities**.

The full development dependency tree still has transitive npm advisories that require separate major-toolchain decisions. No breaking Tailwind upgrade was forced.

## 11. Verification Performed

- `npm run typecheck`: passed after build/type artifacts stabilized.
- `npm run build`: passed with Next.js 16.4.6.
- `npm run lint`: completed with 0 errors and 26 warnings.
- `npm audit --omit=dev`: passed with 0 vulnerabilities.
- Development server started successfully on port 3000.
- `/menu`: HTTP 200.
- `/api/settings`: HTTP 200 GET.
- `/api/banners`: HTTP 200.
- Unauthenticated `PUT /api/settings`: HTTP 403.
- Production build generated all 58 configured routes successfully.
- No production database mutation or deployment was performed.

## 12. Remaining Issues

The following items need separate verification or architecture work:

- Socket.IO server initialization is still absent in the repository. The browser client and emit assumptions remain, but a Vercel-compatible real-time server/adapter requires a deployment decision.
- Full React `<img>` optimization and hook dependency cleanup remain as lint warnings.
- Admin metrics still performs potentially expensive full-order scans and could benefit from aggregation pipelines.
- Pagination is not yet implemented for large menu/order/admin result sets.
- Password recovery, email/SMS verification, payment gateway integration, delivery zones, and real delivery tracking were not implemented because they require product/provider decisions not present in the codebase.
- Login throttling is process-local and should be moved to Redis or a shared edge rate limiter for multi-instance/serverless deployments.
- Address edit UI is not yet implemented, although authenticated edit API support now exists.
- Payment status delivered/cancelled workflows need end-to-end product and accounting review.
- Development dependencies still report transitive advisories; resolving them may require breaking Tailwind/lint upgrades.
