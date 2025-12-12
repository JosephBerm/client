# Next.js 16 Upgrade Guide — MedSource Pro

> **Document Version:** 4.0 (Revised)  
> **From Version:** Next.js 15.5.6  
> **To Version:** Next.js 16.0.10  
> **Last Updated:** December 2024  
> **Official Source:** [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)

---

## Executive Summary

This document outlines the complete upgrade from Next.js 15 to 16 for MedSource Pro. The upgrade brings **significant performance improvements** critical for our scaling architecture (see `business_flow.md` §5.8 "Unlimited Growth Mindset"):

- **Turbopack as default bundler** → Faster dev builds for rapid feature development
- **Improved routing/prefetching** → Better UX for quote/order workflows
- **Cache Components** → Future optimization for product catalog and pricing data
- **React Compiler support** → Automatic memoization for complex data grids

---

## Table of Contents

1. [Pre-Flight Checklist](#1-pre-flight-checklist)
2. [Phase 1: Critical Breaking Changes](#phase-1-critical-breaking-changes-priority-p0)
3. [Phase 2: Configuration Updates](#phase-2-configuration-updates-priority-p1)
4. [Phase 3: Code Audit & Fixes](#phase-3-code-audit--fixes-priority-p1)
5. [Phase 4: Testing & Deployment](#phase-4-testing--deployment-priority-p0)
6. [Phase 5: Performance Optimizations](#phase-5-performance-optimizations-priority-p2)
7. [Phase 6: Future Modernization](#phase-6-future-modernization-priority-p3)
8. [Quick Reference](#quick-reference)
9. [Business Impact Analysis](#business-impact-analysis)

---

## 1. Pre-Flight Checklist

### Environment Requirements

| Requirement | Minimum | Your Current | Status |
|-------------|---------|--------------|--------|
| **Node.js** | 20.9.0 | v23.6.0 | ✅ OK |
| **TypeScript** | 5.1.0 | ^5 | ✅ OK |
| **React** | 19.x | ^19.2.3 | ✅ OK |
| **React DOM** | 19.x | ^19.2.3 | ✅ OK |
| **ESLint** | 9.x | ^9.39.1 | ✅ OK |

### Browser Support (Next.js 16)

| Browser | Minimum | Impact |
|---------|---------|--------|
| Chrome | 111+ | Most healthcare facilities use modern browsers |
| Edge | 111+ | Enterprise healthcare IT standard |
| Firefox | 111+ | Secondary browser support |
| Safari | 16.4+ | iOS/macOS medical devices |

> **Business Note:** Per `business_flow.md`, our target customers are healthcare professionals using modern devices. These browser requirements align with our market.

### Pre-Upgrade Steps

```bash
# 1. Create backup branch
git checkout -b backup/pre-nextjs-16
git push origin backup/pre-nextjs-16

# 2. Return to your working branch
git checkout main

# 3. Verify Node.js version (must be >= 20.9.0)
node -v
```

---

## Phase 1: Critical Breaking Changes (Priority: P0)

**Timeline:** Immediate - Must complete before deployment  
**Risk:** Build failures, runtime errors

### 1.1 Dependencies Update ✅ COMPLETED

```bash
npm install next@16.0.10 react@latest react-dom@latest eslint-config-next@16.0.10
```

**Current `package.json` state:**
```json
{
  "dependencies": {
    "next": "^16.0.10",
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "eslint": "^9.39.1",
    "eslint-config-next": "^16.0.10"
  }
}
```

### 1.2 ESLint Migration ✅ COMPLETED

**Breaking Change:** The `next lint` command has been **REMOVED** in Next.js 16.

| Before (15.x) | After (16.x) |
|---------------|--------------|
| `next lint` | Use ESLint directly |
| `.eslintrc.json` | `eslint.config.mjs` (flat config) |

**Your current setup** uses ESLint 9 flat config (`eslint.config.mjs`) with:
- `@next/eslint-plugin-next` for Next.js rules
- `defineConfig` from `eslint/config`
- All custom MedSource Pro rules preserved

**Updated scripts in `package.json`:**
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix --cache --cache-location .eslintcache",
    "lint:ci": "eslint . --max-warnings=0"
  }
}
```

### 1.3 Middleware → Proxy Migration ✅ COMPLETED

**Breaking Change:** `middleware.ts` renamed to `proxy.ts`

| Change | Status |
|--------|--------|
| File moved to `proxy.ts` at root | ✅ Done |
| Function renamed to `proxy()` | ✅ Done |
| Runtime changed to Node.js (not Edge) | ✅ Acknowledged |

**Final `proxy.ts` location:** Project root (not in `app/`)

**Important Notes:**
- Proxy runs on **Node.js runtime** (not Edge)
- Cannot be configured to use Edge runtime
- If Edge runtime is required, keep using `middleware.ts` (deprecated but supported)

### 1.4 Remove `--turbo` Flag ✅ COMPLETED

**Breaking Change:** Turbopack is now the **DEFAULT bundler**.

```diff
- "dev": "next dev --turbo"
+ "dev": "next dev"
```

---

## Phase 2: Configuration Updates (Priority: P1) ✅ COMPLETED

**Timeline:** Within 1 week of upgrade  
**Risk:** Suboptimal performance, potential warnings  
**Status:** ✅ All configuration updates completed

### 2.1 `next.config.mjs` Updates ✅ COMPLETED

All Next.js 16 configuration options have been applied:

| Setting | Value | Next.js 16 Default | Status |
|---------|-------|-------------------|--------|
| `turbopack` | Top-level | Top-level | ✅ Configured |
| `reactStrictMode` | `true` | `false` | ✅ Added (best practice) |
| `images.qualities` | `[75,80,85,90,95,100]` | `[75]` only | ✅ Explicit |
| `images.imageSizes` | Includes `16` | `16` removed | ✅ Explicit |
| `images.minimumCacheTTL` | `60` | `14400` (4 hours) | ✅ Keep for MVP |
| `images.formats` | `['avif', 'webp']` | Same | ✅ Optimal |
| `images.dangerouslyAllowLocalIP` | `isDevelopment` | `false` | ✅ Added |
| `images.remotePatterns` | With `pathname` | Required | ✅ Updated |
| `typescript.ignoreBuildErrors` | `false` | `false` | ✅ Explicit |
| `poweredByHeader` | `false` | `true` | ✅ Security |
| `compress` | `true` | `true` | ✅ Performance |

### 2.2 Image Cache TTL Decision ✅ DECIDED

**Decision:** Keep `60` seconds for MVP phase.

**Business Context:** Per `business_flow.md`, product images may change when:
- Vendors update product photos
- New products added to catalog
- Product variants with different images

**Future Optimization Path:**

| Phase | TTL | When to Apply |
|-------|-----|---------------|
| MVP (current) | `60` | Now - fresh images priority |
| Stable Catalog | `3600` | After product catalog stabilizes |
| Production Scale | `14400` | High traffic, CDN in front |

### 2.3 Local Development Image Setting ✅ COMPLETED

**Next.js 16 Breaking Change:** `images.dangerouslyAllowLocalIP` now defaults to `false`.

**Applied Configuration:**
```javascript
const nextConfig = {
  images: {
    // Next.js 16: Now required for localhost images in development
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
  },
}
```

### 2.4 Removed Deprecated Options ✅ COMPLETED

**Next.js 16 Breaking Change:** `eslint` key in `next.config.mjs` is no longer supported.

| Removed | Reason | Alternative |
|---------|--------|-------------|
| `eslint.ignoreDuringBuilds` | Deprecated in Next.js 16 | Use `eslint.config.mjs` |
| `eslint.dirs` | Deprecated in Next.js 16 | Use ESLint CLI with glob patterns |

ESLint is now configured entirely via `eslint.config.mjs` (flat config).

---

## Phase 3: Code Audit & Fixes (Priority: P1)

**Timeline:** Within 2 weeks of upgrade  
**Risk:** Runtime errors, broken features

### 3.1 Async Request APIs

**Breaking Change:** Synchronous access to these APIs is **REMOVED**:
- `params`
- `searchParams`
- `cookies()`
- `headers()`
- `draftMode()`

**Your Status:**

| File | API | Current | Status |
|------|-----|---------|--------|
| Dynamic routes | `params` | `await params` | ✅ Already async |
| Client components | `useSearchParams()` | Hook | ✅ N/A (client hook) |

**Codemod available:**
```bash
npx @next/codemod@canary async-request-api .
```

### 3.2 Parallel Routes

**Breaking Change:** All parallel route slots require explicit `default.js` files.

**Your Status:** ✅ No parallel routes (`@` directories) found. No action needed.

### 3.3 Removed APIs Check

| Removed API | Your Usage | Status |
|-------------|------------|--------|
| `useAmp` / AMP support | Not used | ✅ OK |
| `serverRuntimeConfig` | Not used | ✅ OK |
| `publicRuntimeConfig` | Not used | ✅ OK |
| `next/legacy/image` | Not used | ✅ OK |
| `next lint` command | Removed | ✅ Migrated to ESLint |

### 3.4 React Hooks Violations ✅ FIXED

**Issue Found:** `AccountActivityTab.tsx` had conditional hook calls.

**Fix Applied:** Moved `useMemo` hooks before early return statement.

---

## Phase 4: Testing & Deployment (Priority: P0)

**Timeline:** Before any production deployment  
**Risk:** Customer-facing issues

### 4.1 Local Build Test

```bash
# Clean install
rm -rf node_modules .next
npm install

# Type check
npm run type-check

# Lint (0 errors required)
npm run lint

# Build
npm run build

# Start and test
npm run start
```

### 4.2 Verification Checklist

**Critical Paths (aligned with `business_flow.md`):**

| Test | Business Impact | Status |
|------|-----------------|--------|
| Home page loads | Customer first impression | ✅ Passed |
| Product catalog loads | Core shopping experience | ✅ Passed (447 products) |
| Product detail page | Purchase decision point | ✅ Passed |
| Add to cart works | Quote request flow | ✅ Passed |
| Quote submission | **Revenue generation** | ✅ Form available |
| Protected route redirects | Security | ✅ Passed |
| Login modal opens | Authentication | ✅ Passed |
| Dashboard loads | Admin/sales rep workflow | ⬜ Requires auth |
| Orders page loads | Order management | ⬜ Requires auth |
| Images load correctly | Product presentation | ✅ Passed |
| Navigation works | User experience | ✅ Passed |
| API calls succeed | Backend integration | ✅ Passed |

**Automated Tests (Phase 4.1):**

| Test | Command | Status |
|------|---------|--------|
| TypeScript compilation | `npm run type-check` | ✅ 0 errors |
| ESLint | `npm run lint` | ✅ 0 errors (655 warnings) |
| Production build | `npm run build` | ✅ Success |
| Dev server starts | `npm run dev` | ✅ Running |

### 4.3 Deployment

```bash
git add .
git commit -m "chore: upgrade Next.js 15.5.6 → 16.0.10

BREAKING CHANGES:
- Migrated ESLint to flat config (eslint.config.mjs)
- Renamed middleware.ts to proxy.ts (Next.js 16 requirement)
- Removed --turbo flag (Turbopack now default)
- Fixed React hooks violation in AccountActivityTab

Performance:
- Turbopack default bundler (faster dev builds)
- Improved routing/prefetching"

git push origin main
```

---

## Phase 5: Performance Optimizations (Priority: P2) ✅ COMPLETED

**Timeline:** Within 1 month of stable upgrade  
**Business Impact:** Improved UX for quote workflow, faster page loads

### 5.1 React Compiler ✅ ENABLED

**Status:** Now stable in Next.js 16 (promoted from experimental)

**What we did:**
```bash
npm install -D babel-plugin-react-compiler
```

```javascript
// next.config.mjs
const nextConfig = {
  reactCompiler: true, // Top-level, NOT experimental
}
```

**Benefits for MedSource Pro:**
- Automatic memoization - eliminates need for manual `useMemo`/`useCallback`
- DataGrid/DivTable components benefit most (complex rendering)
- Quote/Order tables with many columns
- Product filtering and sorting

**Note:** Compile times may be slightly higher as React Compiler uses Babel.

### 5.2 Turbopack File System Caching ✅ AUTOMATIC

**Next.js 16 Status:**
- `turbopackFileSystemCacheForDev`: **ENABLED BY DEFAULT** (no config needed!)
- `turbopackFileSystemCacheForBuild`: Requires Next.js canary (not stable yet)

**Benefit:** Faster rebuilds during development by caching compiler artifacts to disk.

**Future:** When `turbopackFileSystemCacheForBuild` becomes stable, add:
```javascript
experimental: {
  turbopackFileSystemCacheForBuild: true,
}
```

### 5.3 Layout Deduplication ✅ AUTOMATIC

**Next.js 16 Enhancement:** When prefetching multiple URLs sharing a layout, the layout is downloaded once.

**Impact for MedSource Pro:**
- Faster navigation in `/app/*` routes (orders, quotes, customers share layout)
- Better UX for sales reps managing multiple quotes

No code changes required - automatic benefit.

### 5.4 Image Optimization ✅ CONFIGURED

**Business Context:** Product images are critical for the quote request flow.

Current config is optimized. Monitor:
- Image load times on product pages
- LCP (Largest Contentful Paint) scores
- Consider CDN for product images at scale

---

## Phase 6: Future Modernization (Priority: P3)

**Timeline:** Implement as needed for specific features  
**Business Context:** These align with `business_flow.md` scaling goals

### 6.1 Cache Components (`"use cache"` Directive)

**Best For:** Product catalog, pricing data, vendor information

**Enable:**
```javascript
const nextConfig = {
  cacheComponents: true, // Replaces old experimental.dynamicIO
}
```

**Usage Example (Product List):**
```typescript
"use cache"

import { cacheTag, cacheLife } from 'next/cache' // No more unstable_ prefix!

export default async function ProductList({ category }: { category: string }) {
  cacheTag('products', `category-${category}`)
  cacheLife('hours') // Products don't change frequently
  
  const products = await fetchProducts(category)
  return <ProductGrid products={products} />
}
```

**Business Impact:**
- Faster product browsing
- Reduced API calls
- Better experience for repeat visitors

**Note:** This replaces the old PPR (Partial Pre-Rendering) approach.

### 6.2 New Caching APIs (Stable in Next.js 16)

**Note:** `cacheLife` and `cacheTag` no longer need `unstable_` prefix!

| API | Purpose | MedSource Pro Use Case |
|-----|---------|------------------------|
| `updateTag(tag)` | Read-your-writes (Server Actions only) | After quote status change, immediately show new status |
| `revalidateTag(tag, profile?)` | Stale-while-revalidate | Product prices (show stale, update background) |
| `refresh()` | Refresh client router from Server Action | Force refresh order status |
| `cacheTag(tag)` | Tag cached data for invalidation | Tag product catalog by category |
| `cacheLife(profile)` | Set cache duration | 'hours' for products, 'minutes' for quotes |

**Example - Quote Status Update (read-your-writes):**
```typescript
'use server'
import { updateTag } from 'next/cache'

export async function updateQuoteStatus(quoteId: string, status: string) {
  await db.quotes.update(quoteId, { status })
  // User sees their change immediately
  updateTag(`quote-${quoteId}`)
}
```

**Example - Product Catalog (stale-while-revalidate):**
```typescript
'use server'
import { revalidateTag } from 'next/cache'

export async function refreshProducts(category: string) {
  // Users see stale data while fresh data loads in background
  revalidateTag(`products-${category}`, 'max')
}
```

### 6.4 Next.js DevTools MCP

**Already configured in `.mcp.json`:**
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
# Automated upgrade (if starting fresh)
npx @next/codemod@canary upgrade latest

# Manual upgrade
npm install next@16.0.10 react@latest react-dom@latest eslint-config-next@16.0.10

# Verify
npm run type-check
npm run lint
npm run build
```

### Files Changed

| File | Change | Status |
|------|--------|--------|
| `package.json` | Dependencies + scripts + babel-plugin-react-compiler | ✅ Done |
| `eslint.config.mjs` | New ESLint 9 flat config | ✅ Done |
| `.eslintrc.json` | Deleted (migrated to flat config) | ✅ Done |
| `proxy.ts` | Created at root (from middleware.ts) | ✅ Done |
| `app/middleware.ts` | Deleted | ✅ Done |
| `next.config.mjs` | Full Next.js 16 config + reactCompiler enabled | ✅ Done |
| `app/_features/accounts/components/AccountActivityTab.tsx` | Fixed hooks violation | ✅ Done |

### Breaking Changes Summary

| Change | Required | Status |
|--------|----------|--------|
| Node.js ≥20.9.0 | ✅ | ✅ v23.6.0 |
| `next lint` → ESLint | ✅ | ✅ Migrated |
| `--turbo` flag removed | ✅ | ✅ Removed |
| `middleware.ts` → `proxy.ts` | ✅ | ✅ Migrated |
| React Compiler stable | Optional | ✅ Enabled |
| `turbopackFileSystemCacheForDev` | Auto | ✅ Default |
| ESLint flat config | ✅ | ✅ Implemented |
| Async params | ✅ | ✅ Already compliant |
| Parallel route default.js | If using | ✅ N/A |

---

## Business Impact Analysis

### Alignment with `business_flow.md`

| Business Goal | Next.js 16 Feature | Impact |
|---------------|-------------------|--------|
| **Unlimited scaling** (§5.8) | Turbopack, improved prefetching | Faster dev, better UX at scale |
| **Fast quote response** (§5.8) | Layout deduplication | Sales reps navigate faster |
| **Product catalog performance** | Cache Components | Faster browsing, less API load |
| **AI-assisted pricing** (future) | React Compiler | Efficient complex calculations |
| **Mobile-first** (§1) | Improved routing | Better mobile navigation |

### Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Build failures | Low | ✅ All breaking changes addressed |
| Runtime errors | Low | ✅ Hooks violation fixed |
| Performance regression | Very Low | Turbopack is improvement |
| Browser compatibility | Very Low | Target market uses modern browsers |

---

## Resources

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [ESLint Flat Config Migration](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Turbopack Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)
- [React Compiler](https://react.dev/learn/react-compiler)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 4.0 | Dec 2024 | Major revision: Updated for 16.0.10, ESLint flat config, business alignment |
| 3.0 | Dec 2024 | Initial 16.0.8 guide |

---

**Document Maintainer:** MedSource Pro Frontend Team  
**Last Updated:** December 2024
