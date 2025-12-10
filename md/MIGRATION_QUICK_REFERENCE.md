# Server Component Migration - Quick Reference Guide

## 🎯 Quick Decision Tree

```
Is the page public-facing or SEO critical?
├─ YES → Migrate to Server Component (P0/P1)
└─ NO → Does it fetch data on initial load?
    ├─ YES → Migrate to Server Component (P1/P2)
    └─ NO → Does it need real-time state/interactivity?
        ├─ YES → Keep as Client Component ✅
        └─ NO → Migrate to Server Component (P3)
```

---

## 📋 Page Priority Checklist

### P0 - Critical (Do First)
- [ ] `/store` - Public store catalog
- [ ] `/app/orders` - High-traffic admin page
- [ ] `/app/customers` - High-traffic admin page
- [ ] `/app/quotes` - High-traffic admin page

### P1 - High Priority (Do Second)
- [ ] `/app/dashboard` - Dashboard with multiple data sources
- [ ] `/app/analytics` - Analytics page
- [ ] `/app/orders/[id]` - Order detail page
- [ ] `/app/quotes/[id]` - Quote detail page
- [ ] `/about-us` - Public page
- [ ] `/contact` - Public page

### P2 - Medium Priority (Do Third)
- [ ] `/app/store` - Admin product management
- [ ] `/app/providers` - Provider management
- [ ] `/app/accounts` - Account management
- [ ] `/app/customers/[id]` - Customer detail
- [ ] `/app/providers/[id]` - Provider detail
- [ ] `/app/accounts/[id]` - Account detail

### P3 - Low Priority (Do Last)
- [ ] `/app/notifications/[id]` - Notification detail

### ✅ Keep Client-Side (No Migration)
- [x] `/cart` - Real-time cart state
- [x] `/app/profile` - Form state management
- [x] `/app/notifications` - Real-time notifications

---

## 🔄 Migration Pattern Templates

### Pattern 1: Public Catalog Page

**Before:**
```typescript
'use client'
const Page = () => <StorePageContainer />
```

**After:**
```typescript
export default async function Page({ searchParams }) {
  const params = await searchParams
  const data = await fetchDataServer(params)
  return <StorePageContainer initialData={data} />
}
```

---

### Pattern 2: Admin Table Page

**Before:**
```typescript
'use client'
export default function Page() {
  const fetchData = createServerTableFetcher('/endpoint')
  return <ServerDataGrid fetchData={fetchData} />
}
```

**After:**
```typescript
export default async function Page({ searchParams }) {
  const params = await searchParams
  const initialData = await fetchTableDataServer('/endpoint', params)
  return <PageClient initialData={initialData} />
}
```

---

### Pattern 3: Detail Page

**Before:**
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

**After:**
```typescript
export default async function Page({ params }) {
  const { id } = await params
  const data = await fetchDetail(id)
  if (!data) redirect('/back')
  return <DetailView data={data} />
}
```

---

## 🛠️ Common Code Snippets

### Server-Side Data Fetching

```typescript
// Fetch products
const products = await fetchProductsServer({
  page: 1,
  pageSize: 20,
  search: searchParams.search,
  categories: searchParams.categories?.split(',')
})

// Fetch table data
const tableData = await fetchTableDataServer<Order>('/orders/search', {
  page: parseInt(searchParams.page || '1'),
  pageSize: 10,
  sortBy: searchParams.sortBy,
  sortOrder: searchParams.sortOrder || 'desc'
})

// Fetch single item
const item = await API.Orders.get(id)
if (!item.data.payload) {
  redirect('/app/orders')
}
```

### Suspense Boundaries

```typescript
import { SuspenseBoundary } from '@_components/common/SuspenseBoundary'

<SuspenseBoundary>
  <YourComponent />
</SuspenseBoundary>
```

### Dynamic Rendering

```typescript
// For pages with searchParams
export const dynamic = 'force-dynamic'

// For static pages
export const dynamic = 'force-static'
```

---

## ✅ Migration Checklist (Per Page)

### Pre-Migration
- [ ] Identify data sources
- [ ] List all client-side hooks used
- [ ] Document interactive features
- [ ] Check authentication requirements
- [ ] Review SEO requirements

### Migration Steps
- [ ] Remove `'use client'` from page
- [ ] Make page function `async`
- [ ] Create server-side fetch function
- [ ] Fetch data in page component
- [ ] Extract interactive parts to Client Component
- [ ] Pass initial data as props
- [ ] Add Suspense boundary
- [ ] Add error handling
- [ ] Update TypeScript types

### Post-Migration
- [ ] Test all functionality
- [ ] Check performance metrics
- [ ] Verify SEO (if public page)
- [ ] Test with different user roles
- [ ] Check error states
- [ ] Update documentation
- [ ] Deploy and monitor

---

## 📊 Performance Targets

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| TTI | 4.3s | 1.6s | ⏳ |
| LCP | 3.9s | 0.8s | ⏳ |
| Bundle | 500KB | 100KB | ⏳ |
| Score | 78 | 97 | ⏳ |

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

---

## 📞 Need Help?

- **Full Migration Plan:** See `SERVER_COMPONENT_MIGRATION_PLAN.md`
- **Next.js Docs:** https://nextjs.org/docs/app/building-your-application/rendering/server-components
- **Pattern Examples:** See migration plan document

---

**Last Updated:** 2025-01-XX
