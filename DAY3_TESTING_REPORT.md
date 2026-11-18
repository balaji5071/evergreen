# Day 3 Testing Report

## Testing overview

Testing was performed against a locally built Next.js application. To avoid any interaction with production data, the application was started with an unreachable loopback MongoDB URI and a local-only JWT secret. No production credentials or data were used. This isolated setup allowed route, validation, build, and unauthenticated-access checks, but it prevented successful database-backed workflows.

**Overall status: NOT RELEASE-VERIFIED.** Build and static checks passed, but live database, authenticated checkout, and deployment workflows remain unverified.

## Functional test cases

| Test case | Expected result | Actual result | Status | Issues / notes |
|---|---|---|---|---|
| Start development server | App starts and serves pages | Server started successfully | PASS | Local-only test configuration |
| Start built production server | Production build starts and serves pages | Server started successfully | PASS | No deployment performed |
| Request `/`, `/menu`, `/cart`, `/checkout`, `/help`, `/login`, `/signup`, `/orders`, `/profile`, and `/staff/login` | Pages return successfully | All returned HTTP 200 | PASS | Confirms route availability, not all page interactions |
| Request `/admin` without a session | User is redirected to authentication | Returned HTTP 307 | PASS | Redirect behavior observed |
| Inspect primary page navigation | Links are rendered and usable | Navigation was visible in the page snapshot | PASS | Full click-through navigation matrix not completed |
| Submit invalid login payload | Request is rejected with a client error | Returned HTTP 400 | PASS | Successful login was not tested |
| Submit invalid signup payload | Request is rejected with a client error | Returned HTTP 400 | PASS | Successful registration was not tested |
| Read `/api/auth/me` without a session | Request is unauthorized | Returned HTTP 401 | PASS | Expected authorization boundary |
| Read orders, cart, and notifications without a session | Request is unauthorized | Returned HTTP 401 | PASS | Expected authorization boundary |
| Submit an order without a session | Request is unauthorized | Returned HTTP 401 | PASS | Neither Delivery nor Takeaway order creation was reached |
| Update settings / read admin orders without authorization | Request is forbidden | Returned HTTP 403 | PASS | Expected authorization boundary |
| Validate `Order` model: Delivery without address | Validation rejects the order | Rejected as expected | PASS | Direct schema validation; no database write |
| Validate `Order` model: Delivery with address | Validation accepts the order | Accepted as expected | PASS | Direct schema validation; no database write |
| Validate `Order` model: Takeaway with `address: null` | Validation accepts the order | Accepted as expected | PASS | Direct schema validation; no database write |
| Submit Delivery and Takeaway orders through checkout | Valid order is created and UI completes the flow | No successful browser order submission was performed | BLOCKED | No authenticated session or reachable test database |
| Successful signup, login, cart persistence, and order history | Data persists and user sees the expected state | Not exercised against a reachable database | BLOCKED | Requires an isolated test database and valid test account |
| Read database-backed menu, banners, coupons, and settings | API returns configured data | Requests failed with HTTP 500 because the test database was intentionally unreachable | BLOCKED | This is an environment limitation, not evidence of production database failure |
| Verify notification delivery | Notification is persisted/delivered | Not exercised end-to-end | BLOCKED | Requires database and configured delivery infrastructure |
| Verify third-party integrations | Integration calls succeed | Not exercised | BLOCKED | Requires configured integration credentials and services |

### API observations

- Unauthenticated requests to protected customer endpoints returned HTTP 401.
- Unauthenticated requests to privileged endpoints returned HTTP 403.
- Invalid login and signup payloads returned HTTP 400.
- Database-dependent API requests failed under the deliberately disconnected test database; database connectivity in a real environment remains unverified.
- The client emitted database-backed request errors in the isolated run. Browser logs also showed failed Socket.IO WebSocket attempts. No Socket.IO server initializer was found in the repository, so real-time behavior remains unverified.

## Responsive testing

Horizontal overflow was measured at the following viewport widths:

| Page | 360 px | 390 px | 768 px | 1024 px | 1440 px | Result |
|---|---:|---:|---:|---:|---:|---|
| Login | None | None | None | None | None | PASS |
| Help | None | None | None | None | None | PASS |

This is a limited overflow check, not a full device/browser compatibility matrix. Checkout interaction testing was attempted but the browser page navigated away before the Takeaway interaction could be completed. Checkout responsiveness, touch usability, and the complete mobile/tablet/desktop workflow are therefore **BLOCKED / NOT VERIFIED**.

## Code quality and dependency checks

| Check | Result | Status | Notes |
|---|---|---|---|
| `npm run typecheck` | Passed | PASS | No TypeScript errors |
| `npm run lint` | Passed with 0 errors and 26 warnings | PASS WITH WARNINGS | Warnings remain for follow-up |
| Unit tests | 5 of 5 existing tests passed | PASS | `src/lib/orderNotifications.test.ts` was run with a temporary alias-aware TypeScript loader |
| `npm test` | No test script configured | NOT CONFIGURED | No standard test command is available in `package.json` |
| `npm run build` | Passed; Next.js generated 58 routes | PASS | Production build completed |
| `npm audit` | 0 vulnerabilities reported | PASS | Full dependency audit |
| `npm audit --omit=dev` | 0 vulnerabilities reported | PASS | Production dependency audit |

The project pins Node `20.11.1` in `.nvmrc` and declares `>=20.9.0` in `package.json`. The install environment emitted an engine warning for a transitive lint dependency requiring a newer Node 20 release. The checks above nevertheless completed successfully in the available environment.

## Performance and reliability

- Application startup and production build completed locally.
- No controlled load test, API latency benchmark, production network-request profile, or database query benchmark was performed. No performance metrics are claimed.
- Responsive overflow checks passed only for the two pages listed above.
- Real-time socket behavior and database-backed reliability were not verified.

## Production build and deployment

- Production build: **PASS** (`npm run build`).
- Vercel configuration declares `npm ci`, `npm run vercel-build`, and `.next` output.
- Deployment verification: **BLOCKED / NOT PERFORMED**. No deployment access was used, and no deployment or infrastructure change was authorized.
- Production environment configuration, deployed API connectivity, database connectivity, and critical production workflows remain unverified.

## Remaining bugs, risks, and limitations

1. **Login configuration mismatch:** `.env.example` describes admin credentials as optional, while the login route requires both `ADMIN_EMAIL` and `ADMIN_PASSWORD` before processing any login. If either is absent, customer and staff login attempts can be rejected with HTTP 503. Configure both until the implementation or documentation is corrected.
2. **Real-time notifications:** Client-side Socket.IO usage exists, but no server initializer was found. Socket.IO connection attempts failed locally; real-time delivery is not verified.
3. **Authorization coverage:** The shared permission helper is used by menu item update/delete routes, while other staff routes use role checks. Permission-level enforcement across all staff operations has not been demonstrated.
4. **Database-backed workflows:** Signup, successful authentication, cart persistence, order creation, order retrieval, and notification persistence could not be exercised without an isolated reachable MongoDB instance.
5. **Takeaway checkout:** Model validation confirms Takeaway accepts a null address, but the complete authenticated browser checkout and order-creation flow remains unverified.
6. **Test automation:** There is no `test` script in `package.json`; the five existing tests require a custom runner.
7. **Lint warnings:** 26 warnings remain despite zero lint errors.
8. **Seed safety:** `npm run seed` targets `scripts/seed.mjs`. That script deletes existing user, category, menu item, banner, and coupon collections before creating seed data, and contains fallback account credentials. Do not run it against production or any database containing data to preserve.
9. **Node engine alignment:** The pinned Node version is older than the transitive lint dependency's stated engine requirement; align the supported Node version and lockfile as a follow-up.

## Final status

Static checks and the production build passed. Limited route, validation, and responsive checks passed. Database-dependent application flows and deployment verification are blocked or unverified. The project is **not confirmed production-ready** until those checks are completed in a safe staging environment and the login configuration and real-time notification limitations are resolved or accepted.
