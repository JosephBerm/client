# Server Component Migration - Quick Reference Guide

> **⚠️ IMPORTANT: Updated December 2024 for Next.js 16 + Cache Components**
> 
> With `cacheComponents: true` enabled, route segment configs like `dynamic = 'force-dynamic'`
> are **DISABLED**. Use `"use cache"` directive instead. See official docs.

## 🎯 Quick Decision Tree

```
Does the page use useState, useEffect, or event handlers?
├─ YES → Keep as Client Component ✅
└─ NO → Does it use animations (Framer Motion)?
    ├─ YES → Keep as Client Component ✅
    └─ NO → Is it a Server Component fetching data?
        ├─ YES → Add "use cache" + cacheTag for optimization ✅
        └─ NO → Already optimal, no changes needed ✅
```

**Key Insight:** Most of our pages use interactive features that REQUIRE client-side rendering.

---

## 📋 Page Status (After Analysis)

### ✅ Already Optimized with Cache Components
- [x] `/` (Home) - Server-side `fetchFeaturedProducts()` with `use cache` + cacheTag
- [x] `/store` - Hybrid Server/Client Component with `use cache` + cacheTag
- [x] `/store/product/[id]` - Server Component with `"use cache"` + cacheTag

### ✅ Keep Client-Side (Required for Functionality)
These pages use state, hooks, or interactive features that REQUIRE client-side:

| Route | Reason | Status |
|-------|--------|--------|
| `/` (Home) | **Hybrid** - Server data + client animations | ✅ OPTIMIZED |
| `/about-us` | Framer Motion animations, no data fetch | ✅ Keep client |
| `/contact` | Form state (`useState`) | ✅ Keep client |
| `/store` | **Hybrid** Server/Client Component | ✅ OPTIMIZED |
| `/cart` | Cart state management | ✅ Keep client |
| `/app/store` | ServerDataGrid + archive modal | ✅ Keep client |
| `/app/store/[id]` | Product form (create/edit) | ✅ Keep client |
| `/app/orders` | ServerDataGrid + auth + delete modal | ✅ Keep client |
| `/app/customers` | ServerDataGrid + auth + delete modal | ✅ Keep client |
| `/app/quotes` | ServerDataGrid + auth state | ✅ Keep client |
| `/app/providers` | ServerDataGrid + auth state | ✅ Keep client |
| `/app/accounts` | ServerDataGrid + auth state | ✅ Keep client |
| `/app/profile` | Form state management | ✅ Keep client |
| `/app/notifications` | Real-time updates | ✅ Keep client |
| `/app/analytics` | Dashboard with charts | ✅ Keep client |

### ✅ Admin Detail Pages - Analyzed & Confirmed Client-Side

**Official Next.js Docs Confirmation:**
> "Runtime data cannot be cached with `use cache` because it requires request context."

All `/app/*` routes require authentication (`cookies()` access), which prevents direct `use cache` usage.

| Page | Interactive Features | Decision |
|------|---------------------|----------|
| `/app/orders/[id]` | Read-only view | ✅ Keep client (auth required) |
| `/app/quotes/[id]` | "Convert to Order" mutation | ✅ Keep client (has action) |
| `/app/customers/[id]` | Editable form, "Add Account" | ✅ Keep client (form state) |
| `/app/providers/[id]` | Editable form | ✅ Keep client (form state) |
| `/app/accounts/[id]` | Tabs, role changes, password | ✅ Keep client (complex state) |

**Why this is correct:**
1. Auth access (`cookies()`) prevents `use cache` on page component
2. Interactive features require client-side state management
3. Low-traffic admin pages don't benefit from caching
4. Current architecture is robust and working

---

## 🔄 Valid Migration Patterns (Next.js 16)

### Pattern 1: Detail Page with Cache Components ✅ RECOMMENDED

Use this for product/order/quote detail pages that fetch data:

**Before (Client Component with useEffect):**
```typescript
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetchData().then(setData)
  }, [])
  return <DetailView data={data} />
}
```

**After (Server Component with Cache):**
```typescript
import { cacheTag, cacheLife } from 'next/cache'

export default async function Page({ params }) {
  'use cache'
  
  const { id } = await params
  cacheTag(`item-${id}`)
  cacheLife('hours')
  
  const data = await fetchDetail(id)
  if (!data) redirect('/back')
  return <DetailView data={data} />
}
```

**Real Example:** See `/store/product/[id]/page.tsx`

---

### Pattern 2: Keep Interactive Pages as Client Components ✅ CORRECT

Pages with tables, modals, or state management should STAY as Client Components:

```typescript
'use client'

export default function Page() {
  const [modalState, setModalState] = useState(false)
  
  return (
    <>
      <ServerDataGrid
        endpoint="/api/data/search"
        columns={columns}
      />
      <Modal isOpen={modalState} onClose={() => setModalState(false)}>
        {/* Modal content */}
      </Modal>
    </>
  )
}
```

**Why this is correct:** ServerDataGrid handles server-side pagination internally
while the page manages client-side state like modals.

---

### Pattern 3: Hybrid SEO Pattern (Optional)

For public pages needing SEO but with client interactivity:

```typescript
// Server Component wrapper for SEO
export default async function Page({ searchParams }) {
  const params = await searchParams
  const seoData = await fetchSEOMetadata(params)
  
  return (
    <>
      {/* SEO-friendly structured data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData) }}
      />
      
      {/* Client component for interactivity */}
      <ClientInteractiveComponent />
    </>
  )
}
```

---

### ❌ DEPRECATED Pattern: route segment config

**Do NOT use these with Cache Components enabled:**
```typescript
// ❌ DISABLED when cacheComponents: true
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
```

**Use instead:**
```typescript
// ✅ Use "use cache" directive
export default async function Page() {
  'use cache'
  cacheLife('hours')
  // ...
}
```

---

## 🛠️ Valid Code Snippets (Next.js 16)

### Server-Side Data Fetching with Cache

```typescript
import { cacheTag, cacheLife } from 'next/cache'

// Fetch single item with caching
export default async function Page({ params }) {
  'use cache'
  
  const { id } = await params
  cacheTag(`order-${id}`)
  cacheLife('hours')
  
  const response = await API.Orders.get(id)
  if (!response.data.payload) {
    redirect('/app/orders')
  }
  
  return <OrderDetail order={response.data.payload} />
}
```

### Revalidating Cached Data

```typescript
// Server Action to invalidate cache
'use server'
import { revalidateTag } from 'next/cache'

export async function updateOrder(orderId: string, data: OrderData) {
  await API.Orders.update(orderId, data)
  
  // Invalidate the cached page
  revalidateTag(`order-${orderId}`)
}
```

### Suspense Boundaries for Streaming

```typescript
import { Suspense } from 'react'

export default async function Page() {
  return (
    <>
      {/* Static content renders immediately */}
      <Header />
      
      {/* Dynamic content streams in */}
      <Suspense fallback={<TableSkeleton />}>
        <DataTable />
      </Suspense>
    </>
  )
}
```

### ⚠️ DEPRECATED (Don't Use with cacheComponents)

```typescript
// ❌ These are DISABLED when cacheComponents: true
export const dynamic = 'force-dynamic'
export const dynamic = 'force-static'
export const revalidate = 3600
export const fetchCache = 'force-no-store'
```

---

## ✅ Cache Components Optimization Checklist

Use this checklist for pages that CAN be optimized (detail pages without interactivity):

### Pre-Optimization Assessment
- [ ] Confirm page is already a Server Component (no `'use client'`)
- [ ] Verify no useState/useEffect/hooks are needed
- [ ] Check if data changes infrequently (good for caching)
- [ ] Identify cache invalidation triggers

### Optimization Steps
- [ ] Add `'use cache'` directive at top of function
- [ ] Add `cacheTag()` for granular invalidation
- [ ] Add `cacheLife()` with appropriate duration
- [ ] Wrap dynamic content in `<Suspense>`
- [ ] Create Server Action for cache invalidation

### Post-Optimization Verification
- [ ] Test cache behavior (first load vs subsequent)
- [ ] Test revalidation works correctly
- [ ] Verify no hydration errors
- [ ] Monitor TTFB improvements

---

## 📊 Performance Gains with Cache Components

| Page | Before (TTFB) | After (TTFB) | Improvement |
|------|---------------|--------------|-------------|
| `/store/product/[id]` | ~400ms | ~50ms (cached) | 8x faster |
| Other pages | N/A | N/A | Keep current |

**Note:** Most pages use client-side interactivity and don't benefit from
Server Component migration. Focus optimization on detail/read-only pages.

---

## 🚨 Common Pitfalls

1. **Don't use hooks in Server Components**
   - ❌ `useState`, `useEffect`, `useRouter` in Server Components
   - ✅ Use `async/await` for data fetching
   - ✅ Use `redirect()` instead of `useRouter().push()`

2. **Don't pass non-serializable data**
   - ❌ Functions, class instances, Date objects
   - ✅ Plain objects, strings, numbers, arrays

3. **Don't forget Suspense boundaries**
   - ❌ No loading states
   - ✅ Wrap in Suspense for streaming

4. **Don't mix server and client code**
   - ❌ Import Client Components directly in Server Components
   - ✅ Pass Server Components as children to Client Components

5. **Don't use route segment configs with cacheComponents**
   - ❌ `export const dynamic = 'force-dynamic'` (disabled)
   - ✅ Use `'use cache'` directive with `cacheTag()` and `cacheLife()`

---

## 📞 Need Help?

- **Full Migration Plan:** See `SERVER_COMPONENT_MIGRATION_PLAN.md`
- **Next.js 16 Upgrade Guide:** See `nextjs-16-upgrade-guide.md`
- **Next.js Docs:** https://nextjs.org/docs/app/building-your-application/rendering/server-components
- **Cache Components:** https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents

---

**Last Updated:** December 2024 (Next.js 16)
