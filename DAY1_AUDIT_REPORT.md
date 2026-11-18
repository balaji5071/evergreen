# Day 1 - Codebase Audit and Analysis

**Audit date:** 2026-11-17  
**Repository:** balaji206/evergreen  
**Scope:** Static analysis, route/component tracing, database model review, build/typecheck/lint execution, and production dependency audit. No application code was modified.

## 1. Project Overview

Evergreen is a restaurant ordering application built with Next.js 16 App Router, React 19, and MongoDB/Mongoose. It provides customer menu browsing and cart/checkout flows, order tracking, customer addresses and notifications, staff order handling, and an admin dashboard for catalog, promotions, users, metrics, and store settings.

The application is primarily a monolithic full-stack Next.js repository. UI pages and API route handlers live in the same project and share Mongoose models and utility modules.

## 2. Technology Stack

### Frontend

- Next.js 16.3.3 App Router
- React 19
- TypeScript 5.7.3
- Tailwind CSS 3.4.17
- Framer Motion
- Lucide React
- Socket.IO client
- Browser Web Push API

### Backend

- Next.js Route Handlers
- Mongoose 8.x
- MongoDB
- JSON Web Tokens with `jsonwebtoken`
- `jose` for proxy JWT verification
- bcryptjs
- Cloudinary
- Web Push

### Infrastructure and Integrations

- Vercel configuration
- MongoDB Atlas or MongoDB-compatible database
- Cloudinary image hosting
- Browser push notifications
- Socket.IO client integration
- Photon, Nominatim, and Indian postal pincode APIs for location search
- Google Fonts

## 3. Architecture Analysis

### Routing

The Next.js App Router defines customer, checkout, order, profile, login/signup, staff, delivery, and admin pages. API endpoints are route handlers under `src/app/api`.

`src/proxy.ts` protects `/admin/:path*` at the route layer by checking the `evergreen_token` cookie and the JWT `role` claim. API routes perform separate database-backed authorization checks.

### State and Providers

The root layout wraps the application in:

- `AuthProvider`
- `CartProvider`
- `SocketProvider`

`AuthContext` obtains the current user from `/api/auth/me`. `CartContext` combines local guest cart state with a MongoDB cart for authenticated users. `SocketContext` listens for socket events and polls `/api/notifications` every four seconds.

### Database Models

Confirmed Mongoose collections/models:

- `User`
- `Address`
- `Cart`
- `Coupon`
- `Banner`
- `MenuCategory`
- `MenuItem`
- `Notification`
- `Order`
- `PushSubscription`
- `StoreSettings`

The primary relationships are:

- User -> many Addresses
- User -> one Cart
- User -> many Orders
- User -> many Notifications
- User -> many PushSubscriptions
- MenuCategory -> many MenuItems
- Order -> one User and optionally a deliveredBy/staff User
- Cart items -> MenuItems

### API and Frontend Communication

Pages use browser `fetch()` calls directly to same-origin `/api/*` route handlers. Authentication is cookie-based through an HTTP-only JWT cookie. Cart, orders, addresses, notifications, settings, menu, coupons, and push subscriptions are persisted through MongoDB.

## 4. Existing Features

Confirmed:

- Customer signup/login/logout and password/phone updates
- Guest and authenticated carts
- Menu category/search filtering
- Delivery and takeaway checkout
- Saved addresses and pincode/address lookup
- Coupon validation and coupon management
- Order placement and order status tracking
- Cash-on-delivery order creation
- Admin dashboard metrics
- Admin menu, category, banner, coupon, user, order, and settings management
- Staff order list, status updates, profile, and work history
- In-app notifications
- Web push subscriptions and broadcast notifications
- Socket.IO event listeners on the frontend
- SEO metadata, sitemap, robots, JSON-LD, and PWA manifest/service worker
- Image upload through Cloudinary

## 5. Application Workflow

1. `AuthProvider` checks `/api/auth/me`.
2. Customers browse `/menu`; the menu API returns available items and categories.
3. `CartContext` stores guest carts in localStorage or loads/merges authenticated carts through `/api/cart` and `/api/cart/merge`.
4. Checkout sends cart items and the calculated client total to `/api/orders`.
5. The order route creates an order, clears the database cart, saves a delivery address, and attempts notifications.
6. Staff/admin routes retrieve orders and update status.
7. Status updates create in-app notifications, web push notifications, and Socket.IO emission attempts.
8. Admin routes manage operational data and metrics.

## 6. Identified Bugs and Security Issues

Classification: **Confirmed** means directly demonstrated by code review; **Potential** means not proven at runtime but is a credible risk.

| ID | Priority | Classification | Issue | Affected file/component | Root cause | Proposed solution | Effort |
|---|---|---|---|---|---|---|---|
| DAY1-001 | P0 | Confirmed | Store settings update is unauthenticated. | `src/app/api/settings/route.ts:PUT` | The settings route has no `requireAdminUser()` check. | Require an admin before parsing or applying settings; validate allowed fields and numeric ranges. | Small |
| DAY1-002 | P0 | Confirmed | Order totals and item prices are accepted from the client. | `src/app/api/orders/route.ts:POST`, `src/app/checkout/page.tsx` | It creates orders using request `items` and `totalAmount` instead of querying menu prices and recalculating server-side. | Fetch each menu item, verify availability/ObjectIds/quantities, calculate subtotal/fees/tax/coupon server-side, and reject mismatches. | Medium |
| DAY1-003 | P0 | Confirmed | A known fallback admin credential pair exists if environment values are missing. | `src/app/api/auth/login/route.ts` | `ADMIN_EMAIL` and `ADMIN_PASSWORD` fall back to `admin@evergreen.com` and `admin123`. | Remove insecure fallbacks; require configured admin credentials and fail closed during startup. | Small |
| DAY1-004 | P0 | Confirmed dependency risk | Next.js 16.3.3 is affected by published critical RCE and cache/image vulnerabilities. | `package.json`, `package-lock.json` | Installed Next.js version is below fixes such as 16.3.8/16.4.6 recommended by npm audit. | Upgrade Next.js and lockfile-compatible React/ESLint packages; rerun build and audit. | Medium |
| DAY1-005 | P1 | Confirmed | Notification read operations can affect another user's notification. | `src/app/api/notifications/route.ts:PUT` | `notificationId` is updated without `{ userId: user._id }`. | Constrain updates/deletes with both notification ID and authenticated user ID. | Small |
| DAY1-006 | P1 | Confirmed | Staff/admin permission arrays are stored but not enforced. | `src/lib/auth.ts`, `src/app/admin/*`, `src/app/api/**/*` | Authorization tests only role, never `permissions`. | Define a permission policy and enforce it for every relevant mutation route. | Medium |
| DAY1-007 | P1 | Confirmed | Order status updates accept arbitrary values. | `src/app/api/orders/[id]/route.ts:PUT`, `src/app/api/staff/orders/route.ts:PUT` | Request status is assigned directly with no enum or transition validation. | Validate against allowed statuses and enforce legal state transitions. | Small |
| DAY1-008 | P1 | Confirmed | Cart save and merge accept arbitrary quantities, prices, and item IDs. | `src/app/api/cart/route.ts:PUT`, `src/app/api/cart/merge/route.ts:POST` | Cart total and item references are based on request data. | Normalize quantities and ObjectIds, verify live menu items/prices, and recalculate server totals. | Medium |
| DAY1-009 | P1 | Potential | Login and signup have no rate limiting or brute-force protection. | `src/app/api/auth/login/route.ts`, `src/app/api/auth/signup/route.ts`, proxy/routing layer | No throttling, lockout, CAPTCHA, or abuse controls exist. | Add IP/account rate limits, progressive backoff, and abuse monitoring. | Medium |
| DAY1-010 | P1 | Confirmed | Password strength and identity-field validation are weak. | `src/app/api/auth/signup/route.ts`, `src/app/api/auth/change-password/route.ts` | Signup checks only presence; password minimum is only enforced by change-password route. | Centralize validation for email, phone, password strength, and field length. | Small |
| DAY1-011 | P1 | Confirmed | Real-time Socket.IO feature has no server initialization in this repository. | `src/lib/socket.ts`, `src/context/SocketContext.tsx`, notification helpers | The server emits to `(globalThis).__socketIoServer`, but no custom server or socket initialization file exists. | Use a supported separate Socket.IO service or custom server architecture and authenticated rooms. | Large |
| DAY1-012 | P1 | Confirmed | Coupon validation accepts a client-submitted subtotal. | `src/app/api/coupons/validate/route.ts` | Coupon eligibility and discount are calculated from request `subtotal`. | Recalculate cart subtotal from the database/menu on the server and validate coupon usage. | Medium |
| DAY1-013 | P1 | Potential | JWT payload role/permissions can become stale after account changes. | `src/lib/auth.ts`, login route | `requireAuthUser()` queries the DB, but `/api/auth/me` can fall back to JWT fields after DB lookup failure. | Do not trust JWT authorization fields for sensitive operations; optionally rotate/revoke tokens after role changes. | Medium |
| DAY1-014 | P1 | Confirmed | Staff can set an arbitrary `deliveredBy` value. | `src/app/api/staff/orders/route.ts:PUT` | The request `deliveredBy` is assigned without verifying a valid staff account or assignment privilege. | Resolve and validate staff ownership/role and restrict reassignment to admins. | Medium |
| DAY1-015 | P2 | Confirmed | Public/settings mutation lacks server-side numeric validation. | `src/app/api/settings/route.ts:PUT`, settings model | `Object.assign()` accepts arbitrary values and negative/invalid fields can reach Mongoose. | Whitelist fields and enforce finite, non-negative ranges and enum values. | Small |
| DAY1-016 | P2 | Confirmed | Menu/coupon numeric fields are under-validated. | `src/app/api/menu/route.ts`, `src/app/api/coupons/route.ts`, models | Negative prices, percentage values over 100, invalid dates/types, and invalid category references can be accepted. | Add shared Zod/manual validation and schema-level constraints/min/max. | Medium |
| DAY1-017 | P2 | Confirmed | Cart and menu operations do not paginate or bound search results. | `src/app/api/menu/route.ts`, `src/app/api/orders/route.ts`, `src/app/api/admin/orders/route.ts` | Entire filtered collections and order lists are returned in some flows. | Add cursor/page pagination and field projections. | Medium |
| DAY1-018 | P2 | Potential | Menu search is unbounded and uses MongoDB `$regex` from user input. | `src/app/api/menu/route.ts` | Repeated search requests are issued as users type and regex can scan large collections. | Debounce input, escape/normalize regex, and add text/category indexes. | Medium |
| DAY1-019 | P2 | Confirmed | Notification polling creates an API request every four seconds per logged-in client. | `src/context/SocketContext.tsx` | In addition to socket listeners, `fetchNotifications()` runs on a fixed interval. | Remove polling after implementing a stable Socket.IO channel or use a longer exponential-polling fallback. | Small |
| DAY1-020 | P2 | Confirmed | Cart database writes occur on every quantity mutation. | `src/context/CartContext.tsx` | `saveDBCart()` is called inside add/remove/update functions with no debounce or batching. | Batch writes/debounce saves and preserve optimistic UI with failure recovery. | Medium |
| DAY1-021 | P2 | Confirmed | Several admin metrics queries load full order sets and aggregate in JavaScript. | `src/app/api/admin/metrics/route.ts`, `src/app/api/admin/users/route.ts` | User metrics loop through users and issue per-user order queries. | Use MongoDB aggregation pipelines and grouped indexes. | Medium |
| DAY1-022 | P2 | Confirmed | Database schemas lack explicit indexes for common filtered/sorted fields. | Mongoose model files | Only unique indexes on email/coupon code/cart user ID are obvious; status/user/date/category queries have no explicit indexes. | Add indexes for order `(userId, createdAt)`, `(orderStatus, createdAt)`, menu category/availability, and notification `(userId, read, createdAt)`. | Medium |
| DAY1-023 | P2 | Confirmed | Many UI images use plain `<img>` instead of Next.js image optimization. | Menu, cart, home, banners, and admin pages | Remote images are not consistently sized or optimized; no explicit `next/image` migration was applied. | Convert appropriate images to `next/image`, set sizes/width/height, and lazy load below-the-fold assets. | Medium |
| DAY1-024 | P2 | Confirmed | React hook effects have stale-function dependencies and possible stale closures. | Admin menu, order detail/invoice, cart, socket, location, and staff pages | ESLint reports 7+ missing-hook-dependency warnings. | Stabilize callbacks with `useCallback` or inline complete dependencies and verify rerender behavior. | Medium |
| DAY1-025 | P2 | Confirmed | Internal navigation uses `window.location.href` in a few Next.js client components. | `src/context/AuthContext.tsx`, `src/app/signup/page.tsx` | This bypasses client routing behavior and causes full reloads. | Replace with `useRouter().push()` or `replace()`. | Small |
| DAY1-026 | P2 | Potential | Cloudinary upload fallback returns raw/base64 input if credentials are unavailable. | `src/lib/cloudinary.ts`, `src/app/api/upload/route.ts` | Upload failures are converted to successful-looking image strings. | Fail closed if image storage is misconfigured and enforce upload size/type/limits. | Medium |
| DAY1-027 | P2 | Confirmed | Address update/delete operations are incomplete. | `src/app/api/addresses/route.ts`, profile address UI | The route only supports GET/POST; no update/delete route exists. | Add authenticated PUT/DELETE handlers constrained to `userId`. | Medium |
| DAY1-028 | P2 | Confirmed | The declared seed script does not match the repository file. | `package.json`, `scripts/seed_full_menu.js` | `npm run seed` references `scripts/seed.mjs`, which is absent. | Rename or add the intended seed entry point and document safe dev-only execution. | Small |
| DAY1-029 | P3 | Confirmed | Mongoose model cache is manually deleted in development in some models but not consistently. | `User.ts`, `Order.ts`, `Coupon.ts` | HMR cache handling is inconsistent and unusual. | Prefer the standard `mongoose.models.Model || mongoose.model(...)` pattern everywhere and remove forced deletions. | Small |
| DAY1-030 | P3 | Confirmed | Employee ID generation is vulnerable to race conditions. | `src/lib/models/User.ts`, admin/staff profile and user routes | Multiple count-and-set sequences can generate duplicate employee IDs. | Generate IDs atomically or use an independent counter/sequence collection and a unique index. | Medium |
| DAY1-031 | P3 | Confirmed | There are many broad `catch` blocks and console-only failures. | API routes and client contexts | Many catches hide partial failures or expose generic 500 responses. | Add structured logging and consistent typed error responses; distinguish external integration failures. | Medium |
| DAY1-032 | P3 | Potential | API endpoints have no explicit request body size limits or CORS/rate-limit controls. | Route handler layer | Next.js defaults may not be sufficient for high-risk JSON/base64/upload operations. | Add payload limits, rate limits for public mutations, and request logging. | Medium |

## 7. Performance Bottlenecks

### Confirmed frontend

- Notification polling every four seconds for every logged-in session.
- Cart database PUT on every add/remove/quantity action.
- Plain `<img>` usage in menu, cart, home, and admin surfaces.
- Missing debouncing around menu search in API usage.
- Missing React hook dependencies can cause stale or duplicate fetch behavior.
- No explicit route-level code splitting implementation; Next.js may provide route chunking, but large admin/client pages should be reviewed with bundle analysis.

### Confirmed backend

- Several API routes load full collections and aggregate them in memory.
- Admin user metrics perform N+1-style per-user order queries.
- Staff profile builds a day-by-day history in a loop and loads all delivered orders for the user.
- Common order, notification, menu, and cart queries lack explicit supporting indexes.
- Menu search uses `$regex` and category/search requests are not paginated.

## 8. Database and API Issues

### Database

- User email is unique and lowercase, but phone uniqueness is only checked before creation and not enforced by a unique schema index.
- Cart has a unique `userId` index.
- Coupon code is unique and normalized.
- Order status/payment enums exist, but API request values are not fully validated.
- Numeric fields lack enough constraints (price, quantity, fees, taxes, discounts).
- Employee IDs are generated with count queries, which are race-prone.
- Address, cart, notification, order, and menu relationships are otherwise clear.

### API

- Checkout trusts client totals and item data.
- Coupon validation trusts client subtotal.
- Settings PUT is unauthenticated.
- Some mutation routes permit broad field updates.
- Notification PUT lacks ownership constraints.
- `/api/coupons` exposes all coupons rather than only active/valid ones; it appears intended only for admin UI but has no route auth.
- Location search uses multiple third-party APIs and has no server-side cache or rate limit.
- The Socket.IO integration has no server implementation in this repository.

## 9. Security Concerns

### Confirmed

- Public store-settings mutation.
- Hard-coded fallback admin credentials if configuration is absent.
- Client-controlled order and coupon calculations.
- Notification cross-user update.
- Missing permission enforcement despite permission fields.
- Staff can arbitrarily assign `deliveredBy`.
- Arbitrary order status values.
- Published dependency vulnerabilities, including critical Next.js advisories.
- JWT authorization fields can remain stale after role/profile changes.
- No login/signup brute-force controls.

### Environment and secrets

- `.env.local` is ignored by `.gitignore`, and `.env.example` contains placeholders rather than live credentials.
- `MONGODB_URI`, `JWT_SECRET`, Cloudinary, VAPID, and admin credentials are read from environment variables.
- No live secrets were displayed or reported during this audit.
- `JWT_SECRET` and `MONGODB_URI` are fail-fast in modules that import them.

## 10. Missing and Incomplete Functionality

Confirmed gaps:

- Address update/delete API operations.
- A working Socket.IO server implementation.
- Enforced staff permissions.
- Server-owned pricing/fee/coupon calculations.
- Payment gateway integration: only `Cash On Delivery` is set during normal order creation; UPI reference fields exist but no complete client/server payment flow was found.
- Order status transition enforcement.
- Request/rate-limit infrastructure.
- Pagination and search limits.
- Database migrations or seed tooling aligned with package scripts.
- Automated test coverage beyond one notification unit test file.

Potential product gaps requiring owner confirmation:

- Password reset/forgot-password flow was not found.
- Email or SMS verification was not found.
- Refund/cancel policy enforcement was not found.
- Delivery-zone/radius enforcement was not found.
- Real delivery-partner tracking was not found.
- Reservation functionality is only implied by SEO metadata and is not implemented.
- Service availability/open-hours enforcement was not found.
- Idempotency keys for duplicate order submissions were not found.

## 11. Recommended Solutions

1. Immediately require admin authorization and strict validation on store settings.
2. Rebuild order creation and coupon validation around database-authoritative menu/cart values.
3. Remove fallback credentials and upgrade Next.js/Mongoose/engine dependencies.
4. Add centralized authorization, role, permission, ownership, and status-transition policies.
5. Implement notification ownership checks and secure Socket.IO rooms.
6. Add Zod or a shared validation layer to all mutable route inputs.
7. Add pagination, indexes, and MongoDB aggregation pipelines.
8. Debounce menu search, batch cart persistence, and replace polling with stable real-time delivery.
9. Complete address CRUD, secure payment handling, password recovery, and order cancellation rules.
10. Add integration tests for auth, authorization, order pricing, cart merging, status transitions, and settings.

## 12. Implementation Complexity

| Area | Complexity | Why |
|---|---|---|
| Settings authorization/validation | Low | Small route and model-level changes |
| Notification ownership | Low | Filter one update by user ID |
| Status validation | Low-Medium | Central enum and transition policy |
| Fallback credential removal | Low | Remove fallbacks and update deployment checks |
| Order/coupon/cart server recalculation | High | Shared pricing logic plus migration/edge-case testing |
| Permission system | Medium-High | Route inventory and policy mapping |
| Socket.IO architecture | High | Deployment-compatible custom service/adapter and auth |
| Database performance | Medium | Indexes, aggregation, pagination, and query rewrites |
| Dependency upgrade | Medium | Compatibility testing across Next/React/Mongoose |
| Address/payment/recovery features | Medium-High | Product flow, validation, UI, and integration testing |

## Validation Summary

- **TypeScript:** `npm run typecheck` passed.
- **Production build:** `npm run build` passed and generated 58 static/dynamic routes successfully.
- **Lint:** 26 warnings and 0 errors.
- **Dependency audit:** 5 production vulnerabilities reported: 1 critical, 4 high, plus additional moderate/low advisories hidden in the transitive dependency chain.
- **Existing worktree changes:** The audit did not modify or revert pre-existing source changes.

## Prioritized Implementation Sequence

### Day 2 P0/P1

1. Secure settings and remove fallback credentials.
2. Upgrade Next.js and affected dependencies.
3. Make order and coupon calculations server-owned.
4. Repair notification ownership and staff assignment.
5. Add status transition, role/permission, and cart integrity validation.
6. Decide and implement the real-time Socket.IO architecture or remove/replace it cleanly.

### Day 2 P2

7. Add request validation, pagination, indexes, and database aggregations.
8. Replace polling and add cart write batching.
9. Complete address CRUD and payment flow decisions.
10. Optimize images and hook dependencies.

### Day 2 P3

11. Improve error handling/logging.
12. Fix seed tooling and employee ID generation.
13. Add automated tests and CI checks.
