# RBAC Test Suite

> **MAANG-Level Security Testing for Role-Based Access Control**

## Overview

This test suite provides comprehensive coverage for the MedSource Pro RBAC (Role-Based Access Control) system. These tests are **critical** for ensuring platform security and must pass before any deployment.

## Test Files Structure

```
client/
├── app/
│   ├── _shared/hooks/__tests__/
│   │   └── usePermissions.test.ts          # Core RBAC hook tests
│   ├── _components/common/guards/__tests__/
│   │   ├── PermissionGuard.test.tsx        # Permission-based UI guard tests
│   │   └── RoleGuard.test.tsx              # Role-based UI guard tests
│   ├── _types/__tests__/
│   │   └── rbac.test.ts                    # Type and constant validation
│   ├── app/quotes/[id]/_components/hooks/__tests__/
│   │   └── useQuotePermissions.test.ts     # Domain-specific permission tests
│   └── __tests__/rbac/
│       ├── rbac-integration.test.tsx       # End-to-end integration tests
│       └── README.md                       # This file
├── test-utils/
│   └── rbacTestBuilders.ts                 # Test utilities and builders
└── mocks/
    └── handlers.ts                         # MSW API mocking (includes RBAC endpoints)
```

## Test Categories

### 1. usePermissions Hook Tests (`usePermissions.test.ts`)
**Lines: ~650 | Priority: 🔴 CRITICAL**

Core permission system validation:
- ✅ Authentication state handling
- ✅ Role hierarchy enforcement (Customer → SalesRep → SalesManager → FulfillmentCoordinator → Admin)
- ✅ Permission checks for all resource/action combinations
- ✅ Context-aware permissions (Own, Assigned, Team, All)
- ✅ Admin bypass verification
- ✅ Batch permission checks (hasAnyPermission, hasAllPermissions)
- ✅ Role display names
- ✅ Security edge cases

### 2. PermissionGuard Tests (`PermissionGuard.test.tsx`)
**Lines: ~480 | Priority: 🔴 CRITICAL**

UI-level permission enforcement:
- ✅ Conditional rendering based on permissions
- ✅ Fallback content rendering
- ✅ Context-aware permission integration
- ✅ Nested guard behavior
- ✅ All resources and actions coverage
- ✅ Security edge cases (no content leakage)

### 3. RoleGuard Tests (`RoleGuard.test.tsx`)
**Lines: ~480 | Priority: 🔴 CRITICAL**

Role-based UI protection:
- ✅ Role hierarchy enforcement
- ✅ Minimum role checks
- ✅ Nested role guards
- ✅ Complete role matrix validation
- ✅ Unauthenticated user handling
- ✅ Real-world navigation scenarios

### 4. RBAC Types Tests (`rbac.test.ts`)
**Lines: ~400 | Priority: 🔴 CRITICAL**

Type system validation:
- ✅ RoleLevels values and hierarchy
- ✅ RoleNames string format
- ✅ RoleDisplayNames human-readable format
- ✅ Resources completeness
- ✅ Actions completeness
- ✅ Contexts completeness
- ✅ Helper function correctness
- ✅ Backend consistency verification

### 5. Integration Tests (`rbac-integration.test.tsx`)
**Lines: ~500 | Priority: 🔴 CRITICAL**

End-to-end RBAC flow validation:
- ✅ Complete user journey for each role
- ✅ Role transitions (upgrade/downgrade)
- ✅ Login/logout handling
- ✅ Real-world workflow scenarios
- ✅ Security bypass attempt prevention

### 6. Domain-Specific Tests (`useQuotePermissions.test.ts`)
**Lines: ~550 | Priority: 🔴 CRITICAL**

Quote-specific permission logic:
- ✅ Ownership context (own quote, assigned quote)
- ✅ Status-based permissions (Draft, Pending, Approved, etc.)
- ✅ Role-based permissions (Customer, SalesRep, Manager, Admin)
- ✅ Combined scenario testing
- ✅ Edge case handling

## Role Hierarchy

```
Admin (9999999)
  └── All permissions (bypass)

FulfillmentCoordinator (300)
  └── Orders: Read/Update All
  └── Vendors: Update
  
SalesManager (200)
  └── Quotes: Approve, Assign, Read/Update All
  └── Orders: Approve, Read/Update All
  └── Analytics: Export, Read Team
  └── Users: Create, Update Team

SalesRep (100)
  └── Quotes: Read/Update Assigned
  └── Orders: Create, ConfirmPayment, UpdateTracking
  └── Customers: Create, Read/Update Assigned
  └── Analytics: Read Own

Customer (0)
  └── Quotes: Create, Read/Update Own
  └── Orders: Read/Update Own
  └── Products: Read
  └── Profile: Read/Update Own
```

## Running Tests

```bash
# Run all RBAC tests
npm run test -- --grep "RBAC"

# Run specific test file
npm run test -- app/_shared/hooks/__tests__/usePermissions.test.ts

# Run with coverage
npm run test:coverage -- --grep "RBAC"

# Watch mode
npm run test:watch -- app/_shared/hooks/__tests__/usePermissions.test.ts
```

## Test Utilities

### TestUserBuilder

```typescript
import { TestUserBuilder } from '@/test-utils/rbacTestBuilders'

// Create admin user
const admin = new TestUserBuilder().asAdmin().build()

// Create customer with specific ID
const customer = new TestUserBuilder()
  .asCustomer()
  .withId(123)
  .withCustomerId(456)
  .build()

// Create SalesRep with email
const salesRep = new TestUserBuilder()
  .asSalesRep()
  .withEmail('rep@company.com')
  .build()
```

### PermissionCheckBuilder

```typescript
import { PermissionCheckBuilder } from '@/test-utils/rbacTestBuilders'

// Build permission checks for testing
const checks = new PermissionCheckBuilder()
  .canReadOwnQuotes()
  .canCreateOrders()
  .cannotDeleteUsers()
  .cannotManageSettings()
  .build()
```

### RolePermissionPresets

```typescript
import { RolePermissionPresets } from '@/test-utils/rbacTestBuilders'

// Use preset permission checks
const customerPermissions = RolePermissionPresets.Customer
const adminOnlyPermissions = RolePermissionPresets.AdminOnly
```

## Business Rules Tested

### Quote Workflow
1. Customer creates quote → Can view/update own draft
2. SalesRep assigned → Can update pending, convert approved
3. Manager approves/declines → Can manage all quotes
4. Admin has full control → Can delete, override status

### Permission Inheritance
- Higher roles inherit all lower role permissions
- Context hierarchy: All > Team > Assigned > Own
- Admin bypasses all permission checks

### Security Constraints
- Unauthenticated users have NO permissions
- Role downgrade immediately revokes permissions
- Invalid roles default to Customer level
- No content leakage during permission checks

## Coverage Requirements

| Category | Minimum Coverage |
|----------|------------------|
| usePermissions Hook | 95% |
| Guard Components | 90% |
| Type Constants | 100% |
| Integration Tests | 85% |

## Adding New Tests

When adding new RBAC features:

1. **Add type constants** in `app/_types/rbac.ts`
2. **Add tests** in `app/_types/__tests__/rbac.test.ts`
3. **Update usePermissions** if needed
4. **Add hook tests** in `app/_shared/hooks/__tests__/`
5. **Add guard tests** if UI components affected
6. **Add integration tests** for complete workflows

## Security Review Checklist

Before PR approval, verify:

- [ ] All existing RBAC tests pass
- [ ] New permissions added to type tests
- [ ] Backend constants match frontend
- [ ] No permission escalation possible
- [ ] Unauthenticated access blocked
- [ ] Admin bypass works correctly
- [ ] Context hierarchy enforced
- [ ] Role transitions handled properly


