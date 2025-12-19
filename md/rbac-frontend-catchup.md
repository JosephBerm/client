# RBAC Frontend Catch-Up Plan

> **Goal:** Achieve 10/10 frontend utilization of the RBAC architecture  
> **Current Score:** 7.5/10  
> **Target Score:** 10/10

---

## Current State Analysis

### What's Working ✅

| Feature | Location | Status |
|---------|----------|--------|
| `usePermissions` hook | `@_shared/hooks/usePermissions.ts` | ✅ Complete |
| `PermissionGuard` component | `@_components/common/guards/PermissionGuard.tsx` | ✅ Complete |
| `RoleGuard` component | `@_components/common/guards/RoleGuard.tsx` | ✅ Complete |
| Type definitions | `@_types/rbac.ts` | ✅ Complete |
| RBAC Dashboard | `/app/rbac/page.tsx` | ✅ Complete |
| RBAC Roles Page | `/app/rbac/roles/page.tsx` | ✅ Complete |
| RBAC Permissions Matrix | `/app/rbac/permissions/page.tsx` | ✅ Complete |
| Quote-specific permissions | `useQuotePermissions.ts` | ✅ Complete |

### What's Missing ❌

| Feature | Impact | Priority |
|---------|--------|----------|
| Guards not used in most pages | High | 🔴 Critical |
| No context-aware filtering on lists | High | 🔴 Critical |
| No real-time permission sync | Medium | 🟡 High |
| No permission-based navigation | Medium | 🟡 High |
| No row-level security on tables | Medium | 🟡 High |
| Manual `isAdmin` checks everywhere | Medium | 🟡 High |
| No permission-based column visibility | Low | 🟢 Medium |
| No permission loading states | Low | 🟢 Medium |

---

## Missing Features Implementation Guide

### 1. 🔴 Page-Level Permission Guards

**Problem:** Most pages check permissions manually with `if (!isAdmin)` instead of using guards.

**Current Anti-Pattern:**
```typescript
// orders/page.tsx - Manual check
export default function OrdersPage() {
    const user = useAuthStore((state) => state.user)
    const isAdmin = user?.role === AccountRole.Admin
    
    if (!isAdmin) {
        return <AccessDenied />
    }
}
```

**Required Pattern:**
```typescript
// orders/page.tsx - Using PermissionGuard
import { PermissionGuard, Resources, Actions } from '@_components/common/guards'

export default function OrdersPage() {
    return (
        <PermissionGuard 
            resource={Resources.Orders} 
            action={Actions.Read}
            fallback={<AccessDeniedPage resource="Orders" />}
        >
            <OrdersContent />
        </PermissionGuard>
    )
}
```

#### Files to Update:

| File | Current | Required Guard |
|------|---------|----------------|
| `app/orders/page.tsx` | Manual `isAdmin` | `PermissionGuard: Orders:Read` |
| `app/customers/page.tsx` | Manual `isAdmin` | `PermissionGuard: Customers:Read` |
| `app/accounts/page.tsx` | Manual `isAdmin` | `RoleGuard: SalesManager+` |
| `app/analytics/page.tsx` | Manual `isAdmin` | `PermissionGuard: Analytics:Read` |
| `app/providers/page.tsx` | Manual `isAdmin` | `PermissionGuard: Vendors:Read` |
| `app/internalStore/page.tsx` | No check | `PermissionGuard: Products:Read` |

---

### 2. 🔴 Context-Aware Data Filtering

**Problem:** Lists show all data regardless of user's permission context (Own/Assigned/Team/All).

**Current Anti-Pattern:**
```typescript
// Fetches ALL orders regardless of permission context
const { data: orders } = useQuery(['orders'], () => API.Orders.getAll())
```

**Required Pattern:**
```typescript
// Create a hook that respects permission context
export function useOrdersWithPermissions() {
    const { hasPermission, user, roleLevel } = usePermissions()
    
    // Determine fetch scope based on permissions
    const scope = useMemo(() => {
        if (hasPermission(Resources.Orders, Actions.Read, Contexts.All)) {
            return 'all'
        }
        if (hasPermission(Resources.Orders, Actions.Read, Contexts.Team)) {
            return 'team'
        }
        if (hasPermission(Resources.Orders, Actions.Read, Contexts.Assigned)) {
            return 'assigned'
        }
        return 'own'
    }, [hasPermission])
    
    // Fetch with scope parameter
    return useQuery(
        ['orders', scope, user?.id],
        () => API.Orders.getByScope(scope),
        { enabled: !!user }
    )
}
```

#### Implementation Steps:

1. **Create `useContextualData` hook:**
```typescript
// _shared/hooks/useContextualData.ts
export function useContextualData<T>(
    resource: Resource,
    action: Action,
    fetchers: {
        all?: () => Promise<T[]>
        team?: () => Promise<T[]>
        assigned?: () => Promise<T[]>
        own?: () => Promise<T[]>
    }
) {
    const { hasPermission, user } = usePermissions()
    
    const { scope, fetcher } = useMemo(() => {
        if (hasPermission(resource, action, Contexts.All) && fetchers.all) {
            return { scope: 'all', fetcher: fetchers.all }
        }
        if (hasPermission(resource, action, Contexts.Team) && fetchers.team) {
            return { scope: 'team', fetcher: fetchers.team }
        }
        if (hasPermission(resource, action, Contexts.Assigned) && fetchers.assigned) {
            return { scope: 'assigned', fetcher: fetchers.assigned }
        }
        return { scope: 'own', fetcher: fetchers.own }
    }, [hasPermission, resource, action, fetchers])
    
    // Return query with correct scope
    return { scope, ...useQuery([resource, scope], fetcher) }
}
```

2. **Update API service with scope endpoints:**
```typescript
// api.ts
RBAC: {
    Orders: {
        getAll: () => HttpService.get('/orders'),
        getByScope: (scope: string) => HttpService.get(`/orders?scope=${scope}`),
        getOwn: () => HttpService.get('/orders/own'),
        getAssigned: () => HttpService.get('/orders/assigned'),
        getTeam: () => HttpService.get('/orders/team'),
    }
}
```

---

### 3. 🟡 Permission-Based Navigation

**Problem:** `NavigationService.ts` only checks `isAdmin`, not fine-grained permissions.

**Current Anti-Pattern:**
```typescript
// NavigationService.ts
const isAdmin = userRole === AccountRole.Admin
if (isAdmin) {
    sections.push({ /* management section */ })
}
```

**Required Pattern:**
```typescript
// NavigationService.ts - Permission-based filtering
static getNavigationSections(userRole?: number | null): NavigationSection[] {
    const roleLevel = userRole ?? RoleLevels.Customer
    
    const sections: NavigationSection[] = []
    
    // Main section - Everyone
    sections.push({
        id: 'main',
        routes: [
            { id: 'dashboard', href: Routes.Dashboard.location, ... },
            { id: 'store', href: Routes.Store.location, ... },
        ],
    })
    
    // Orders - Based on permission
    if (hasMinimumRole(roleLevel, RoleLevels.Customer)) {
        sections.push({
            id: 'orders',
            routes: [
                { 
                    id: 'my-orders', 
                    href: Routes.Orders.location,
                    permission: { resource: Resources.Orders, action: Actions.Read },
                },
            ],
        })
    }
    
    // Management - SalesRep+
    if (hasMinimumRole(roleLevel, RoleLevels.SalesRep)) {
        sections.push({
            id: 'management',
            routes: [
                { 
                    id: 'quotes', 
                    href: Routes.Quotes.location,
                    permission: { resource: Resources.Quotes, action: Actions.Read },
                },
            ],
        })
    }
    
    // Admin sections - Admin only
    if (hasMinimumRole(roleLevel, RoleLevels.Admin)) {
        sections.push({
            id: 'admin',
            routes: [
                { id: 'rbac', href: Routes.RBAC.location, ... },
                { id: 'analytics', href: Routes.Analytics.location, ... },
            ],
        })
    }
    
    return sections
}
```

#### Implementation Steps:

1. Add `permission` property to `NavigationRoute` type
2. Update `NavigationService` to filter routes by permission
3. Update Sidebar/Navbar to use filtered routes

---

### 4. 🟡 Domain-Specific Permission Hooks

**Problem:** Only `useQuotePermissions` exists. Other domains lack dedicated hooks.

**Required Hooks:**

```typescript
// Create these hooks following useQuotePermissions pattern:

// app/orders/_hooks/useOrderPermissions.ts
export function useOrderPermissions(order: Order | null): UseOrderPermissionsReturn {
    const { user, hasPermission, hasMinimumRole } = usePermissions()
    
    return useMemo(() => {
        if (!user || !order) return defaultPermissions
        
        const isOwnOrder = user.customerId === order.customerId
        const isAssignedOrder = order.assignedSalesRepId === user.id
        
        return {
            canView: /* ... */,
            canUpdate: /* ... */,
            canConfirmPayment: hasPermission(Resources.Orders, Actions.ConfirmPayment),
            canUpdateTracking: hasPermission(Resources.Orders, Actions.UpdateTracking),
            canDelete: hasPermission(Resources.Orders, Actions.Delete),
            canApprove: hasPermission(Resources.Orders, Actions.Approve),
        }
    }, [user, order, hasPermission, hasMinimumRole])
}

// app/customers/_hooks/useCustomerPermissions.ts
export function useCustomerPermissions(customer: Customer | null): UseCustomerPermissionsReturn

// app/products/_hooks/useProductPermissions.ts
export function useProductPermissions(product: Product | null): UseProductPermissionsReturn

// app/vendors/_hooks/useVendorPermissions.ts
export function useVendorPermissions(vendor: Vendor | null): UseVendorPermissionsReturn
```

---

### 5. 🟡 Row-Level Action Guards in Tables

**Problem:** Table action buttons don't use permission guards.

**Current Anti-Pattern:**
```typescript
// AccountsDataGrid.tsx
{isAdmin && (
    <Button onClick={() => openRoleModal(account)}>Change Role</Button>
)}
```

**Required Pattern:**
```typescript
// AccountsDataGrid.tsx - Using PermissionGuard
<PermissionGuard resource={Resources.Users} action={Actions.Update}>
    <Button onClick={() => openRoleModal(account)}>Change Role</Button>
</PermissionGuard>

<PermissionGuard resource={Resources.Users} action={Actions.Delete}>
    <Button onClick={() => openDeleteModal(account)}>Delete</Button>
</PermissionGuard>
```

#### Files to Update:

| Component | Actions to Guard |
|-----------|------------------|
| `AccountsDataGrid.tsx` | Edit, Delete, Change Role |
| `OrdersDataGrid.tsx` | View, Edit, Delete, Update Status |
| `QuotesDataGrid.tsx` | View, Edit, Delete, Approve, Assign |
| `CustomersDataGrid.tsx` | View, Edit, Delete |
| `ProductsDataGrid.tsx` | View, Edit, Delete |

---

### 6. 🟡 Column Visibility by Permission

**Problem:** Sensitive columns shown to all users regardless of permission.

**Required Pattern:**
```typescript
// Create usePermissionColumns hook
export function usePermissionColumns<T>(
    allColumns: ColumnDef<T>[],
    columnPermissions: Record<string, { resource: Resource; action: Action }>
): ColumnDef<T>[] {
    const { hasPermission } = usePermissions()
    
    return useMemo(() => {
        return allColumns.filter(col => {
            const permission = columnPermissions[col.id as string]
            if (!permission) return true // No permission required
            return hasPermission(permission.resource, permission.action)
        })
    }, [allColumns, columnPermissions, hasPermission])
}

// Usage in DataGrid
const columns = usePermissionColumns(
    [
        { id: 'name', ... },
        { id: 'email', ... },
        { id: 'revenue', ... },  // Only for Analytics:Read
        { id: 'margin', ... },   // Only for Admin
    ],
    {
        revenue: { resource: Resources.Analytics, action: Actions.Read },
        margin: { resource: Resources.Analytics, action: Actions.Read },
    }
)
```

---

### 7. 🟢 Permission Loading States

**Problem:** No loading state while permissions are being determined.

**Required Pattern:**
```typescript
// Update usePermissions to handle async permission loading
export function usePermissions(): UsePermissionsReturn {
    const user = useAuthStore((state) => state.user)
    const isLoading = useAuthStore((state) => state.isLoading)
    
    // ... existing logic
    
    return {
        // ... existing returns
        isLoading,  // Expose loading state
        isReady: !isLoading && user !== undefined,
    }
}

// Usage in components
function ProtectedPage() {
    const { isReady, isAdmin } = usePermissions()
    
    if (!isReady) {
        return <PermissionsSkeleton />
    }
    
    // ... rest of component
}
```

---

### 8. 🟢 Real-Time Permission Sync

**Problem:** Permissions don't update when user's role changes.

**Required Pattern:**
```typescript
// Create permission invalidation mechanism
export function usePermissionSync() {
    const queryClient = useQueryClient()
    const user = useAuthStore((state) => state.user)
    
    useEffect(() => {
        // Listen for role change events (WebSocket or SSE)
        const unsubscribe = subscribeToRoleChanges(user?.id, () => {
            // Invalidate all permission-dependent queries
            queryClient.invalidateQueries({ queryKey: ['permissions'] })
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['quotes'] })
            // Force re-fetch user
            useAuthStore.getState().refreshUser()
        })
        
        return unsubscribe
    }, [user?.id, queryClient])
}
```

---

## Implementation Checklist

### Phase 1: Critical (Week 1)
- [ ] Update all pages to use `PermissionGuard` or `RoleGuard`
- [ ] Create context-aware data hooks for Orders, Quotes, Customers
- [ ] Add permission checks to all table action buttons

### Phase 2: High Priority (Week 2)
- [ ] Create `useOrderPermissions`, `useCustomerPermissions` hooks
- [ ] Update `NavigationService` with permission-based filtering
- [ ] Implement `usePermissionColumns` for sensitive column hiding

### Phase 3: Medium Priority (Week 3)
- [ ] Add permission loading states
- [ ] Implement real-time permission sync
- [ ] Create admin audit log viewer

### Phase 4: Polish (Week 4)
- [ ] Add permission tooltips (explain why action is disabled)
- [ ] Create permission diff utility for role comparison
- [ ] Add comprehensive E2E tests for permission scenarios

---

## Files to Create

```
client/app/
├── _shared/
│   └── hooks/
│       ├── useContextualData.ts       # NEW: Context-aware fetching
│       └── usePermissionSync.ts       # NEW: Real-time sync
├── app/
│   ├── orders/
│   │   └── _hooks/
│   │       └── useOrderPermissions.ts  # NEW: Order-specific perms
│   ├── customers/
│   │   └── _hooks/
│   │       └── useCustomerPermissions.ts  # NEW
│   ├── products/
│   │   └── _hooks/
│   │       └── useProductPermissions.ts   # NEW
│   └── vendors/
│       └── _hooks/
│           └── useVendorPermissions.ts    # NEW
└── _components/
    └── tables/
        └── usePermissionColumns.ts    # NEW: Column filtering
```

---

## Files to Update

| File | Change Required |
|------|-----------------|
| `app/orders/page.tsx` | Wrap with PermissionGuard |
| `app/customers/page.tsx` | Wrap with PermissionGuard |
| `app/accounts/page.tsx` | Wrap with RoleGuard |
| `app/analytics/page.tsx` | Wrap with PermissionGuard |
| `app/providers/page.tsx` | Wrap with PermissionGuard |
| `NavigationService.ts` | Add permission-based filtering |
| `AccountsDataGrid.tsx` | Add PermissionGuard to actions |
| `OrdersDataGrid.tsx` | Add PermissionGuard to actions |
| `QuotesDataGrid.tsx` | Already good, verify complete |

---

## Expected Outcome

After implementing all items:

| Metric | Before | After |
|--------|--------|-------|
| Pages using Guards | 3/12 (25%) | 12/12 (100%) |
| Actions with Guards | 5/30 (17%) | 30/30 (100%) |
| Context-aware lists | 0/6 (0%) | 6/6 (100%) |
| Permission hooks | 1 (quotes) | 6 (all domains) |
| Navigation filtering | Basic | Full |
| **Frontend RBAC Score** | **7.5/10** | **10/10** |

---

## Testing Requirements

For each implementation, ensure:

1. **Unit Tests:**
   - Permission hook returns correct values for each role
   - Guards render/hide content correctly
   - Context-aware fetchers call correct endpoints

2. **Integration Tests:**
   - Admin sees all actions
   - Customer sees only own data
   - SalesRep sees assigned + own data
   - Navigation matches permissions

3. **E2E Tests:**
   - Full user journey as Customer
   - Full user journey as SalesRep
   - Full user journey as Admin
   - Role change updates UI immediately


