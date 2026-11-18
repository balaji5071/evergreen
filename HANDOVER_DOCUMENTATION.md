# Evergreen Handover Documentation

## Project architecture

Evergreen is a restaurant ordering application implemented as a Next.js App Router project:

- `src/app`: customer, staff, and admin pages plus API route handlers.
- `src/app/api`: same-origin REST-style endpoints.
- `src/components`: reusable interface components.
- `src/context`: shared React application state.
- `src/lib`: database connection, authentication, validation, pricing, notifications, and shared utilities.
- `src/lib/models`: Mongoose models persisted in MongoDB.

The frontend calls the application's own `/api/*` endpoints. MongoDB access is provided by Mongoose. Authentication uses a JWT cookie and role checks. Vercel is the configured deployment target.

## Technology stack

- Node.js / npm
- Next.js 16.4.6
- React 19
- TypeScript
- MongoDB and Mongoose 8
- Tailwind CSS
- JWT authentication
- Optional Cloudinary uploads and Web Push

The repository pins Node `20.11.1` in `.nvmrc` and declares Node `>=20.9.0` in `package.json`. Day 3 checks emitted an engine warning for a transitive lint dependency that expects a newer Node 20 release. A Node 20.19+ runtime is recommended until the repository's version declarations are aligned.

## Prerequisites

- A supported Node.js 20 installation and npm.
- MongoDB database for data-backed features.
- Environment variables described below.
- Optional Cloudinary and Web Push credentials if those features are enabled.

## Environment variables

Create a local `.env.local` from `.env.example` and set values using a secure local or deployment secret manager. Do not commit `.env.local` or place secret values in documentation.

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection URI; required for database-backed routes |
| `JWT_SECRET` | Secret used to sign/verify authentication tokens |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used for site metadata/configuration |
| `NEXT_PUBLIC_APP_URL` | Public application origin used by app integrations |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name for image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret; keep private |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public VAPID key for browser push subscriptions |
| `VAPID_PRIVATE_KEY` | Private VAPID key used to send push notifications; keep private |
| `VAPID_SUBJECT` | Contact subject/URI required by Web Push |
| `ADMIN_EMAIL` | Admin account/configuration email |
| `ADMIN_PASSWORD` | Admin account/configuration password; use a strong unique value |
| `ADMIN_NAME` | Display name used by seed setup |
| `ADMIN_PHONE` | Phone value used by seed setup |

**Important configuration mismatch:** `.env.example` labels the admin variables optional, but the current login route requires both `ADMIN_EMAIL` and `ADMIN_PASSWORD` before processing any login. Until that is corrected, set both in local and deployed environments or login may return HTTP 503 for all users.

## Local setup

In PowerShell from the repository root:

```powershell
npm ci
Copy-Item .env.example .env.local
```

Edit `.env.local` locally and provide valid values. Do not use production credentials or a production database for development or testing.

Start the development server:

```powershell
npm run dev
```

The app is served on the local Next.js development URL shown in the terminal.

## Available commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run build` | Build the production application |
| `npm run start` | Start the previously built production application |
| `npm run vercel-build` | Run the Vercel build command |
| `npm run seed` | Run `scripts/seed.mjs` |

There is no `npm test` script configured. The repository has a focused test file at `src/lib/orderNotifications.test.ts`, but it was run during Day 3 using a temporary alias-aware loader rather than a checked-in standard test command.

### Seed safety

Do **not** run `npm run seed` against production or any database containing data to preserve. The script deletes existing users, menu categories, menu items, banners, and coupons before creating seed records. It also contains fallback account credentials. Use only a disposable local database and provide secure account values.

## Database configuration

The application uses MongoDB through Mongoose. Set `MONGODB_URI` to a dedicated local or staging database for development and testing. The database connection and data-backed API behavior were not verified against a reachable database during Day 3; use a disposable staging database to validate authentication, menu retrieval, cart persistence, checkout, orders, and notifications before release.

Never point seed or destructive test workflows at production data.

## API endpoint overview

All endpoints are same-origin under `/api`. Access to protected and administrative endpoints depends on authentication/authorization.

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/auth/signup` | POST | Register an account |
| `/api/auth/login` | POST | Authenticate |
| `/api/auth/logout` | POST | End the current session |
| `/api/auth/me` | GET | Read current user |
| `/api/auth/change-password` | POST | Change password |
| `/api/auth/change-phone` | POST | Change phone |
| `/api/menu` | GET, POST | List/create menu items |
| `/api/menu/[id]` | GET, PUT, DELETE | Read/update/delete a menu item |
| `/api/menu/categories` | GET, POST | List/create categories |
| `/api/menu/categories/[id]` | PUT, DELETE | Update/delete a category |
| `/api/cart` | GET, PUT | Read/update cart |
| `/api/cart/merge` | POST | Merge cart state |
| `/api/addresses` | GET, POST, PUT, DELETE | Manage saved addresses |
| `/api/orders` | GET, POST | List/create orders |
| `/api/orders/[id]` | GET, PUT | Read/update an order |
| `/api/staff/orders` | GET, PUT | Staff order workflows |
| `/api/staff/profile` | GET, PUT | Staff profile |
| `/api/admin/orders` | GET | Admin order listing |
| `/api/admin/users` | GET, POST, PUT, DELETE | Admin user management |
| `/api/admin/metrics` | GET | Admin metrics |
| `/api/admin/seed-menu` | POST | Admin menu-seeding workflow |
| `/api/banners` | GET, POST, PUT, DELETE | Banner management |
| `/api/coupons` | GET, POST, PUT, DELETE | Coupon management |
| `/api/coupons/available` | GET | List available coupons |
| `/api/coupons/validate` | POST | Validate a coupon |
| `/api/notifications` | GET, PUT | Read/update notifications |
| `/api/push/subscribe` | POST | Register a push subscription |
| `/api/push/send` | POST | Send a push notification |
| `/api/settings` | GET, PUT | Read/update application settings |
| `/api/location/search` | GET | Search for location data |
| `/api/upload` | POST | Upload an image |

The endpoint list is an orientation aid, not a guarantee of live service availability. Database-dependent routes require a working MongoDB connection and valid application configuration.

## Production build

Run the checks and build from the repository root:

```powershell
npm run typecheck
npm run lint
npm run build
```

Start the build locally with:

```powershell
npm run start
```

Day 3 typecheck and build passed; lint completed with 26 warnings and zero errors.

## Deployment instructions

The repository's `vercel.json` configures:

- Install command: `npm ci`
- Build command: `npm run vercel-build`
- Output directory: `.next`

For a Vercel deployment:

1. Configure the required environment variables (`MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_APP_URL`) in the project's environment settings.
2. Configure optional Cloudinary/Web Push variables only if those integrations are enabled.
3. Set both admin environment variables until the login configuration mismatch is resolved.
4. Use a dedicated production database and do not run the seed script against it.
5. Build and verify in a staging environment before promoting to production.
6. Verify deployed frontend routes, authentication, APIs, database connectivity, checkout, and notifications.

No deployment was performed during Day 3. Live deployment and production service behavior remain unverified.

## Troubleshooting

- **Database-backed API requests fail:** Check that `MONGODB_URI` is set and reachable from the runtime; use a non-production test database for diagnostics.
- **Login returns HTTP 503:** Confirm both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set. Current code checks these before processing login for any user.
- **Protected API returns HTTP 401:** Authenticate and confirm the session cookie is present.
- **Administrative API returns HTTP 403:** Confirm the account's role and route-level authorization.
- **Image uploads fail:** Verify Cloudinary configuration and upload settings.
- **Push notifications do not arrive:** Verify VAPID configuration and browser subscription state.
- **Real-time notification connection fails:** Socket.IO client attempts were observed, but a server initializer was not found. Treat real-time delivery as unverified.
- **Lint reports warnings:** Day 3 lint passed with 26 warnings; inspect current output before release.
- **Seed data needs resetting:** Use only a disposable database. The seed script deletes multiple collections.

## Important technical notes

- Successful account, cart, and order flows require MongoDB and were not validated end-to-end in Day 3.
- Delivery is expected to require an address; Takeaway accepts a null address at the model validation layer. Browser/API order creation for either type still needs staging verification.
- No standard `npm test` command exists.
- The current permission helper is used only on selected menu routes; review authorization coverage before adding new privileged endpoints.
- Do not infer production readiness from a successful local build.
