# Features That Need Revision

**Generated:** January 15, 2026
**Purpose:** Track features moved from E2E priority list for later codebase convention review

---

## Analysis: Original "Features and Pages Missing" Section

After thorough codebase analysis, here's what we found:

### ✅ These Are TESTS (Not Features) - Already Built Pages Exist

| #   | Original Item                     | Analysis                                                                         | Status              |
| --- | --------------------------------- | -------------------------------------------------------------------------------- | ------------------- |
| 1   | **Authenticated Analytics** pages | `client/app/app/analytics` EXISTS with KPIs, charts, time filters                | Need E2E tests only |
| 2   | **Authenticated Pricing** pages   | `client/app/app/pricing` EXISTS with price lists, volume tiers, contract pricing | Need E2E tests only |
| 3   | **Authenticated RBAC** pages      | `client/app/app/rbac` EXISTS with roles, permissions, audit logs                 | Need E2E tests only |
| 5   | **Payments + Stripe checkout**    | Store, cart, checkout flows EXIST. Stripe integration configured                 | Need E2E tests only |
| 6   | **Shipping actions**              | `/app/fulfillment` and `/app/orders/[id]` include tracking, status updates       | Need E2E tests only |
| 7   | **Admin customer management**     | `/app/customers`, `/app/customers/create`, `/app/customers/[id]` EXIST           | Need E2E tests only |
| 8   | **Admin accounts**                | Full CRUD at `/app/accounts`, create, edit, role change EXIST                    | Need E2E tests only |
| 10  | **Integration flows**             | This IS a test item (quote → approval → order → payment → fulfillment)           | E2E test coverage   |

### ⚠️ These Are ACTUAL FEATURES That Need Work

| #   | Original Item                     | Analysis                                                           | Action Required                                        |
| --- | --------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| 9   | **Super-admin tenant management** | UI at `/app/admin/tenants` shows "API endpoints being implemented" | **BLOCKED**: Requires backend API implementation first |

### ✅ FEATURES COMPLETED (Moved to Convention Review)

| #   | Original Item       | Analysis                                           | Status       |
| --- | ------------------- | -------------------------------------------------- | ------------ |
| 4   | **Inventory views** | Dedicated `/app/inventory` page built with full UI | ✅ COMPLETED |

---

## Recommendation

1. **Items 1-3, 5-8, 10**: These do NOT need feature development - they need E2E test coverage only
2. **Item 4 (Inventory)**: Decision required from stakeholder - is a dedicated inventory page needed?
3. **Item 9 (Tenant Management)**: Blocked on backend - placeholder UI already exists

---

## Features Moved Here for Convention Review

_As features are completed, they will be added below for later review to ensure they follow codebase conventions._

### Completed Features (Pending Convention Review)

1. **PricingPage Page Object** (`client/e2e/pages/PricingPage.ts`)

    - Created: January 15, 2026
    - Purpose: E2E page object for pricing engine tests
    - Review needed: Ensure follows existing page object conventions

2. **Inventory Management Page** (`client/app/app/inventory/page.tsx`)
    - Created: January 15, 2026
    - Purpose: Centralized inventory management for all products
    - Files created:
        - `client/app/_types/inventory.types.ts` - Type definitions
        - `client/app/app/inventory/page.tsx` - Main page component
        - `client/app/app/inventory/loading.tsx` - Loading skeleton
    - Features:
        - Stats cards (total products, in-stock, low-stock, out-of-stock)
        - Stock levels table with search and filtering
        - Low stock alerts section
        - Tabbed interface (Stock Levels, Alerts, History placeholder)
    - Navigation: Added `Routes.Inventory` to routes.ts
    - Review needed: Ensure follows existing page conventions

---

## Next Steps

The original task list conflated "E2E test coverage" with "missing features." The actual feature gaps are:

1. ✅ **Inventory Management Page** - COMPLETED (January 15, 2026)
2. 🚫 **Tenant Management Backend** - Blocked on API implementation

All other items are test coverage gaps, not feature gaps.
