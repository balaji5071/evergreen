# Final Project Report

## Project introduction

Evergreen is a restaurant ordering application built with Next.js App Router, React, TypeScript, and MongoDB via Mongoose. It supports a customer-facing menu and checkout, customer accounts and order history, staff/admin workflows, coupons, banners, addresses, and notification-related features.

## Original architecture

- **Frontend:** Next.js App Router and React pages/components under `src/app`, with shared state and helpers under `src/context` and `src/lib`.
- **Backend:** Next.js route handlers under `src/app/api`.
- **Persistence:** MongoDB accessed through Mongoose models in `src/lib/models`.
- **Authentication:** JWT-based cookie authentication with role checks.
- **External services:** Optional Cloudinary image upload and Web Push configuration; client code also references Socket.IO.
- **API communication:** Frontend requests use same-origin `/api/*` routes.
- **Deployment configuration:** Vercel configuration builds the Next.js application.

## Day 1 findings

`DAY1_AUDIT_REPORT.md` recorded 32 prioritized findings across security, validation, order integrity, API handling, performance, and incomplete functionality. It distinguished confirmed issues from potential risks and proposed a Day 2 implementation plan.

The audit findings are historical and should be interpreted alongside current verification. For example, the Day 1 report's concern that the `npm run seed` target was missing is not reproduced by the current worktree: `scripts/seed.mjs` exists and is the configured target. The current script does, however, destructively clears several collections before seeding and must only be used with disposable data.

## Day 2 implementation summary

`DAY2_IMPLEMENTATION_REPORT.md` documents the Day 2 work. Reported implementation areas include:

- Server-side cart and order pricing and input validation.
- Order status transition checks and conditional address requirements for Delivery versus Takeaway.
- Authentication and authorization improvements, including permission checks on selected menu operations.
- Address management and login throttling.
- Database model/index changes.
- Frontend request/rendering improvements and notification handling.
- Shared pricing and order-status helpers.
- Dependency updates.

The Takeaway follow-up review found the current order route, model, and checkout logic already permit `address: null` for Takeaway while requiring an address for Delivery. No source changes were necessary during that follow-up.

## Features completed and verified

The codebase contains the customer ordering, account, staff/admin, menu, address, coupon, banner, and notification-related features described above. Day 3 verified that the application starts, the production build completes, selected pages return successfully, unauthenticated API requests are rejected as expected, and the order schema accepts/rejects the tested address cases correctly.

Verification was limited to an isolated local configuration. Database-backed success paths, complete checkout flows, and deployment were not confirmed. Refer to `DAY3_TESTING_REPORT.md` for test-by-test evidence.

## Testing summary

| Area | Result |
|---|---|
| TypeScript typecheck | PASS |
| Lint | PASS with 0 errors and 26 warnings |
| Existing unit tests | PASS, 5/5 using a temporary alias-aware loader |
| Standard `npm test` | NOT CONFIGURED |
| Production build | PASS; 58 routes generated |
| Dependency audit | PASS; 0 vulnerabilities reported |
| Page availability | PASS for tested routes |
| Limited responsive overflow checks | PASS on login/help at five widths |
| Database-backed flows | BLOCKED by intentionally unreachable isolated test database |
| Successful login/signup and checkout | BLOCKED / NOT VERIFIED |
| Deployment verification | NOT PERFORMED |

## Remaining issues and production-readiness risks

| Priority | Issue | Status |
|---|---|---|
| P1 | Login implementation requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` for all login attempts, though `.env.example` labels them optional | Confirmed configuration/behavior mismatch; configure both or correct the gate |
| P1 | Database-backed customer and checkout workflows were not verified against a staging database | BLOCKED; testing required before release |
| P1 | Seed script deletes existing users, menu categories/items, banners, and coupons, and has fallback account credentials | Confirmed operational hazard; do not run against production data |
| P2 | Socket.IO client attempts connections, but no server initializer was found | Real-time functionality not verified |
| P2 | Permission helper use is limited to selected menu routes; broader permission enforcement is not demonstrated | Requires authorization matrix and route review |
| P2 | No standard automated test script is configured | Five tests passed through a temporary runner; repeatable CI test command is absent |
| P2 | Node pin/engine mismatch with a transitive lint dependency | Checks passed, but environment warning remains |
| P3 | Lint reports 26 warnings | Follow-up cleanup recommended |
| — | Deployment configuration and live service behavior | Not verified; no deployment performed |

## Final project status

The code typechecks, lint completes without errors, the existing focused unit tests pass, dependency audits report no vulnerabilities, and the production build succeeds. These results establish local build readiness, not production readiness.

**Production readiness: NOT CONFIRMED.** Before release, verify successful authentication and Delivery/Takeaway checkout against an isolated staging database, resolve or explicitly accept the login configuration gate, validate authorization coverage, and verify deployment and notification behavior in the target environment.

## Future recommendations

1. Add a repeatable test script and integration tests backed by a disposable MongoDB test database.
2. Add end-to-end tests for registration/login, cart persistence, Delivery and Takeaway checkout, and order status changes.
3. Align `.env.example` and login behavior so required variables and their scope are unambiguous.
4. Implement or remove the Socket.IO server/client integration and verify notification delivery.
5. Define an explicit staff/admin permission matrix and apply it consistently to all protected routes.
6. Protect the seed workflow against accidental production use; remove fallback credentials and require explicit confirmation or a non-production environment.
7. Align `.nvmrc`, `engines`, and dependency engine requirements.
8. Run staging deployment, database, responsive, and performance tests before release.
