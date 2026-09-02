# Evergreen Restaurant

Next.js app configured for Vercel deployment.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with live credentials before using API routes that require the database.

## Vercel Setup

Set these environment variables in Vercel Project Settings before deploying:

```bash
MONGODB_URI
JWT_SECRET
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_APP_URL
```

Optional features:

```bash
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_NAME
ADMIN_PHONE
```

Vercel uses `npm ci` and `npm run vercel-build`, which runs a webpack-backed Next production build.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```
