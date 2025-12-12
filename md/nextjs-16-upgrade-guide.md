# Next.js 16.0.8 Upgrade Guide — MedSource Pro

> **Document Version:** 3.0 (Final)  
> **From Version:** Next.js 15.5.6  
> **To Version:** Next.js 16.0.8  
> **Last Updated:** December 2024  
> **Official Source:** [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)

---

## 🚨 Security Context

**CVE-2025-66478 (React2Shell)** affects Next.js 15.0.0 through 16.0.6.  
**Target version 16.0.8** includes the security patch.

---

## Table of Contents

1. [Pre-Flight Checklist](#1-pre-flight-checklist)
2. [Phase 1: Dependencies Update](#phase-1-dependencies-update)
3. [Phase 2: Package Scripts](#phase-2-package-scripts)
4. [Phase 3: Middleware to Proxy Migration](#phase-3-middleware-to-proxy-migration)
5. [Phase 4: Configuration Updates](#phase-4-configuration-updates)
6. [Phase 5: Code Changes Audit](#phase-5-code-changes-audit)
7. [Phase 6: Testing & Deployment](#phase-6-testing--deployment)
8. [Future Modernization](#future-modernization)
9. [Quick Reference](#quick-reference)

---

## 1. Pre-Flight Checklist

### Environment Requirements

| Requirement | Minimum | Your Current | Status |
|-------------|---------|--------------|--------|
| **Node.js** | 20.9.0 | Run `node -v` | ⬜ Verify |
| **TypeScript** | 5.1.0 | ^5 | ✅ OK |
| **React** | 19.x | ^19.1.0 | ✅ OK |
| **React DOM** | 19.x | ^19.1.0 | ✅ OK |

### Browser Support (Next.js 16)

| Browser | Minimum |
|---------|---------|
| Chrome | 111+ |
| Edge | 111+ |
| Firefox | 111+ |
| Safari | 16.4+ |

### Pre-Upgrade Steps

```bash
# 1. Create backup branch
git checkout -b backup/pre-nextjs-16
git push origin backup/pre-nextjs-16

# 2. Return to your working branch
git checkout front-end-modernization

# 3. Verify Node.js version
node -v
# Must be >= 20.9.0
```

---

## Phase 1: Dependencies Update

### Automated Upgrade (Recommended)

```bash
npx @next/codemod@canary upgrade latest
```

**The codemod handles:**
- ✅ Updates `next.config.js` turbopack configuration
- ✅ Migrates `next lint` to ESLint CLI
- ✅ Renames `middleware.ts` to `proxy.ts`
- ✅ Removes `unstable_` prefix from stabilized APIs

### Manual Upgrade

```bash
npm install next@16.0.8 react@latest react-dom@latest eslint-config-next@16.0.8
```

### Expected `package.json` Changes

```diff
  "dependencies": {
-   "next": "15.5.6",
+   "next": "16.0.8",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
  },
  "devDependencies": {
-   "eslint-config-next": "15.5.6",
+   "eslint-config-next": "16.0.8",
  }
```

---

## Phase 2: Package Scripts

### Required Changes

**The `next lint` command has been REMOVED in Next.js 16.**

| Script | Before (15.5.6) | After (16.0.8) |
|--------|-----------------|----------------|
| `lint` | `next lint` | `eslint . --ext .ts,.tsx` |
| `lint:ci` | `next lint --max-warnings=0` | `eslint . --ext .ts,.tsx --max-warnings=0` |
| `dev` | `next dev --turbo` | `next dev` |

### Full `package.json` Scripts Update

```json
{
  "scripts": {
    "dev": "start http://localhost:3000 && next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx --config .eslintrc.json",
    "type-check": "tsc --noEmit --pretty",
    "type-check:watch": "tsc --noEmit --pretty --watch",
    "type-check:ci": "tsc --noEmit --pretty --skipLibCheck",
    "lint:all": "eslint . --ext .ts,.tsx --config .eslintrc.json --format=compact --cache --cache-location .eslintcache",
    "lint:fix": "eslint . --ext .ts,.tsx --config .eslintrc.json --fix --cache --cache-location .eslintcache",
    "lint:strict": "eslint . --ext .ts,.tsx --config .eslintrc.json --max-warnings=0 --cache --cache-location .eslintcache",
    "lint:ci": "eslint . --ext .ts,.tsx --config .eslintrc.json --max-warnings=0",
    "check:all": "npm run type-check && npm run lint:all",
    "check:ci": "npm run type-check:ci && npm run lint:ci",
    "check:watch": "npm run type-check:watch"
  }
}
```

### Key Changes Explained

| Change | Reason (Official Docs) |
|--------|------------------------|
| Remove `--turbo` from dev | Turbopack is now the DEFAULT bundler in Next.js 16 |
| Replace `next lint` | The `next lint` command has been removed. Use ESLint or Biome directly. |
| `next build` no longer runs linting | Linting is now separate from build |

---

## Phase 3: Middleware to Proxy Migration

### Official Documentation States:

> "The middleware filename is deprecated, and has been renamed to proxy to clarify network boundary and routing focus."
>
> "The edge runtime is NOT supported in proxy. The proxy runtime is nodejs, and it cannot be configured. If you want to continue using the edge runtime, keep using middleware."

### Step 1: Move and Rename File

```bash
# Move from app/middleware.ts to root proxy.ts
mv app/middleware.ts proxy.ts
```

### Step 2: Rename Export Function

```diff
  import { NextResponse } from 'next/server'
  import type { NextRequest } from 'next/server'

  const protectedRoutes = ['/app', '/accounts', '/analytics', '/customers', '/orders', '/profile', '/providers', '/quotes']
  const authRoutes = ['/login', '/signup']

- export function middleware(request: NextRequest) {
+ export function proxy(request: NextRequest) {
    const token = request.cookies.get('at')
    const { pathname } = request.nextUrl

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !token) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('login', 'true')
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('login', 'true')
      const redirectTo = request.nextUrl.searchParams.get('redirectTo')
      if (redirectTo) {
        url.searchParams.set('redirectTo', redirectTo)
      }
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
  }
```

### Step 3: Update Comment (Optional)

```diff
- /**
-  * Note: We keep hardcoded strings here because middleware runs in Edge runtime
-  * and importing Routes would add unnecessary bundle size.
-  */
+ /**
+  * Note: proxy.ts runs on Node.js runtime (not Edge).
+  * We keep hardcoded strings here to avoid circular dependencies with Routes.
+  */
```

### Final `proxy.ts` File

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected route patterns - these require authentication
const protectedRoutes = [
  '/app',
  '/accounts',
  '/analytics',
  '/customers',
  '/orders',
  '/profile',
  '/providers',
  '/quotes',
]

/**
 * Auth routes - redirect to home with login modal if accessed directly.
 *
 * These routes are deprecated but kept here for backward compatibility.
 * All new code should use Routes.openLoginModal() instead of navigating to these routes.
 *
 * Note: proxy.ts runs on Node.js runtime (not Edge).
 * We keep hardcoded strings here to avoid circular dependencies with Routes.
 */
const authRoutes = ['/login', '/signup']

export function proxy(request: NextRequest) {
  const token = request.cookies.get('at')
  const { pathname } = request.nextUrl

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect to home with login modal query param if accessing protected route without token
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('login', 'true')
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to home with login modal query param if accessing auth routes
  if (isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('login', 'true')
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    if (redirectTo) {
      url.searchParams.set('redirectTo', redirectTo)
    }
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
```

---

## Phase 4: Configuration Updates

### `next.config.mjs` Analysis

| Setting | Your Current | New Default (16) | Action |
|---------|--------------|------------------|--------|
| `turbopack` location | Top-level ✅ | Top-level | ✅ No change |
| `images.qualities` | `[75,80,85,90,95,100]` | `[75]` only | ✅ Keep (explicit is good) |
| `images.imageSizes` | Includes `16` | Removed `16` | ✅ Keep (explicit is good) |
| `images.minimumCacheTTL` | `60` | `14400` (4 hours) | ⚠️ Decision needed |
| `images.remotePatterns` | Configured | Required | ✅ Already using |
| `images.domains` | Not used | Deprecated | ✅ N/A |

### Decision: `minimumCacheTTL`

**Official docs state:**
> "The default value for images.minimumCacheTTL has changed from 60 seconds to 4 hours (14400 seconds). This reduces revalidation cost for images without cache-control headers."

**Options:**
- **Keep `60`**: Images update more frequently, higher origin load
- **Change to `14400`**: Better caching, images update every 4 hours max

**Recommendation:** Keep `60` for now if product images change frequently, or change to `14400` for better performance.

### Updated `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */

const Environments = {
  development: {
    NEXT_PUBLIC_API_URL: 'http://localhost:5254/api',
    CLIENT_DOMAIN: 'https://localhost:3000',
  },
  production: {
    NEXT_PUBLIC_API_URL: 'https://prod-server20241205193558.azurewebsites.net/api',
    CLIENT_DOMAIN: 'https://www.medsourcepro.com',
  },
}

const nextConfig = {
  env: { ...Environments['production'] },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'prod-server20241205193558.azurewebsites.net' },
    ],
    // Next.js 16: New default is [75] only. We explicitly allow multiple qualities.
    qualities: [75, 80, 85, 90, 95, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Next.js 16: Value 16 removed from default. We explicitly include it.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    // Next.js 16: New default is 14400 (4 hours). Keep 60 for frequent updates.
    minimumCacheTTL: 60,
  },
  // Next.js 16: turbopack is stable and at top-level (moved from experimental)
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
}

export default nextConfig
```

---

## Phase 5: Code Changes Audit

### 5.1 Async Request APIs

**Official docs state:**
> "Starting with Next.js 16, synchronous access is fully removed. These APIs can only be accessed asynchronously."

#### Your Code Status

| File | API | Current | Status |
|------|-----|---------|--------|
| `app/store/product/[id]/page.tsx` | `params` | `await params` ✅ | Already async |
| `app/_components/navigation/Navbar.tsx` | `useSearchParams()` | Hook | ✅ N/A (client hook) |

**Good news:** Your `params` usage is already async! No changes needed.

### 5.2 Parallel Routes

**Official docs state:**
> "All parallel route slots now require explicit default.js files. Builds will fail without them."

**Your project:** No parallel routes (`@` directories) found. ✅ No action needed.

### 5.3 Removed APIs Check

| Removed API | Your Usage | Status |
|-------------|------------|--------|
| `useAmp` / AMP | Not used | ✅ OK |
| `serverRuntimeConfig` | Not used | ✅ OK |
| `publicRuntimeConfig` | Not used | ✅ OK |
| `next/legacy/image` | Not used | ✅ OK |

---

## Phase 6: Testing & Deployment

### 6.1 Local Build Test

```bash
# Clean install
rm -rf node_modules .next
npm install

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start and test
npm run start
```

### 6.2 Verification Checklist

| Test | Status |
|------|--------|
| `npm run build` succeeds | ⬜ |
| Home page loads | ⬜ |
| Protected route redirects work | ⬜ |
| Login modal opens | ⬜ |
| Authentication flow works | ⬜ |
| Dashboard loads after login | ⬜ |
| Images load correctly | ⬜ |
| Navigation works | ⬜ |
| All API calls succeed | ⬜ |

### 6.3 Deployment

```bash
# Commit changes
git add .
git commit -m "chore: upgrade Next.js 15.5.6 → 16.0.8

BREAKING CHANGES:
- Renamed middleware.ts to proxy.ts (Next.js 16 requirement)
- Replaced 'next lint' with direct ESLint commands
- Removed --turbo flag (now default)

Security:
- Patches CVE-2025-66478 (React2Shell vulnerability)"

# Push and deploy
git push origin front-end-modernization
```

---

## Future Modernization

These are **optional** features available in Next.js 16. Implement when ready.

### Cache Components (`"use cache"` Directive)

**Enable in config:**
```javascript
const nextConfig = {
  cacheComponents: true,
}
```

**Usage:**
```typescript
"use cache"

import { cacheTag, cacheLife } from 'next/cache'

export default async function ProductList() {
  cacheTag('products')
  cacheLife('hours')
  const products = await fetchProducts()
  return <div>{/* render */}</div>
}
```

### New Caching APIs

| API | Purpose |
|-----|---------|
| `updateTag(tag)` | Read-your-writes semantics (Server Actions only) |
| `revalidateTag(tag, profile)` | Stale-while-revalidate (requires cacheLife profile) |
| `refresh()` | Refresh uncached data (Server Actions only) |

### React Compiler (Stable)

```javascript
const nextConfig = {
  reactCompiler: true,
}
```

```bash
npm install -D babel-plugin-react-compiler@latest
```

### Turbopack File System Caching (Beta)

```javascript
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
}
```

### Next.js DevTools MCP

Add to MCP client config:
```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

---

## Quick Reference

### Commands Summary

```bash
# Automated upgrade
npx @next/codemod@canary upgrade latest

# Manual upgrade
npm install next@16.0.8 react@latest react-dom@latest eslint-config-next@16.0.8
```

### Files to Change

| File | Change |
|------|--------|
| `package.json` | Update deps, fix scripts |
| `app/middleware.ts` | **DELETE** (move to root) |
| `proxy.ts` | **CREATE** at root |
| `next.config.mjs` | Already compliant |

### Breaking Changes Summary

| Change | Required | Your Status |
|--------|----------|-------------|
| Node.js ≥20.9.0 | ✅ | ⬜ Verify |
| `next lint` → ESLint | ✅ | ⬜ Update scripts |
| `--turbo` flag removed | ✅ | ⬜ Update dev script |
| `middleware.ts` → `proxy.ts` | ✅ | ⬜ Migrate |
| Async params | ✅ | ✅ Already done |
| Parallel route default.js | If using | ✅ N/A |

---

## Resources

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [React2Shell Security Bulletin](https://vercel.com/kb/bulletin/react2shell)
- [Turbopack Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)

---

**Document Maintainer:** MedSource Pro Frontend Team  
**Last Updated:** December 2024
