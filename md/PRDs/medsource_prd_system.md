# MedSource Pro - PRD System (ACTUAL Architecture)

## 📋 Document Overview

This is the **Master PRD System** for MedSource Pro, aligned with the **ACTUAL** codebase structure.

**Version**: 3.2  
**Last Updated**: December 19, 2024  
**Status**: Production-Ready

---

## ⚙️ Tech Stack (ACTUAL Versions)

### Frontend
| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 16.0.10 | App Router, React Compiler enabled |
| React | 19.2.3 | Latest with concurrent features |
| TypeScript | 5.9.3 | Strict mode enabled |
| Tailwind CSS | 4.1.0 | v4 with new config format |
| DaisyUI | 5.3.7 | Component library on Tailwind |
| React Hook Form | 7.53.2 | Form management |
| Zod | 3.23.8 | Schema validation |
| Zustand | 5.0.8 | State management |
| Axios | 1.6.7 | HTTP client |
| date-fns | 3.6.0 | Date utilities |
| Lucide React | 0.552.0 | Icons |
| Framer Motion | 12.23.24 | Animations |

### Testing
| Technology | Version | Notes |
|------------|---------|-------|
| Vitest | 4.0.12 | Unit/Integration tests (NOT Jest!) |
| React Testing Library | 16.3.0 | Component testing |
| Playwright | 1.56.1 | E2E testing |
| MSW | 2.12.2 | API mocking |
| jest-axe | 9.0.0 | Accessibility testing |

### Backend
| Technology | Version | Notes |
|------------|---------|-------|
| .NET | 8.0 | LTS version |
| Entity Framework Core | 8.x | ORM |
| PostgreSQL | 14+ | Database |

### Development Tools
| Technology | Version | Notes |
|------------|---------|-------|
| ESLint | 9.39.1 | Flat config format |
| PostCSS | 8.x | CSS processing |

---

## 📚 PRD Index

| PRD | Priority | Status | File |
|-----|----------|--------|------|
| Dashboard | P0 | Defined | `prd_dashboard.md` |
| Quote Pricing | P0 | ✅ **Complete** | `prd_quotes_pricing.md` |
| Orders Management | P1 | Defined | `prd_orders.md` |
| Products Management | P2 | Defined | `prd_products.md` |
| Customers Management | P2 | Defined | `prd_customers.md` |
| Analytics Dashboard | P3 | Defined | `prd_analytics.md` |
| RBAC Management UI | P3 | ✅ **Complete** | `prd_rbac_management.md` |

---

## 🎯 Current State Assessment

### ✅ What's Already Built (DO NOT REBUILD)

1. **RBAC System** (Complete)
   - Backend: `server/Authorization/` (PermissionHandler, RoleHandler)
   - Frontend: `client/app/_components/common/guards/PermissionGuard`
   - Hooks: `client/app/_shared/hooks/usePermissions.ts`
   - ✅ **RBAC Management UI** (Completed Dec 2024)
     - Backend: `server/Controllers/RBACController.cs`, `server/Services/DB/RBACService.cs`
     - Frontend: `client/app/app/rbac/` with full CRUD for roles/permissions
     - Features: Role hierarchy diagram, permission matrix, audit logs, bulk role updates

2. **Authentication System** (Complete - MAANG-Level)
   - ✅ **JWT Token System** (Completed Dec 2024)
     - Short-lived access tokens (15 min) + long-lived refresh tokens (7-30 days)
     - Automatic token rotation on refresh
     - Silent refresh mechanism
     - HttpOnly cookie storage for refresh tokens
     - Backend: `server/Services/Auth/JwtTokenService.cs`, `server/Controllers/AuthController.cs`
     - Frontend: `client/app/_shared/services/tokenService.ts`, `client/app/_features/auth/services/AuthService.ts`

3. **Quote Management** (Complete)
   - ✅ Quote list page
   - ✅ Quote detail page (`app/app/quotes/[id]/`)
   - ✅ Mark as read functionality
   - ✅ **Quote Pricing System** (Completed Dec 2024)
     - ✅ Vendor cost input per product
     - ✅ Customer price input per product
     - ✅ Margin calculation (per product + totals)
     - ✅ Pricing validation (customer price >= vendor cost)
     - ✅ "Approve Quote" gated on complete pricing

4. **Core Infrastructure**
   - ✅ API Layer (`client/app/_shared/services/api.ts`)
   - ✅ Form Hooks (`useFormSubmit`, `useZodForm`)
   - ✅ Validation Schemas (`client/app/_core/validation/validation-schemas.ts`)
   - ✅ UI Components (`client/app/_components/ui/`)
   - ✅ Test Utils (`client/test-utils/`)
   - ✅ HttpService with automatic token refresh (`client/app/_shared/services/httpService.ts`)

### ❌ What Needs to Be Built

1. ~~**Quote Pricing System** (Priority 1)~~ ✅ **COMPLETE**
2. **Dashboard** (All roles - Priority 1)
3. **Order Management** (Full workflow - Priority 2)
4. **Product Management** (Admin/Sales - Priority 2)
5. **User/Customer Management** (Priority 3)
6. **Analytics Dashboard** (Priority 3)
7. ~~**RBAC Management UI** (Admin tools - Priority 4)~~ ✅ **COMPLETE**

---

## 🏗️ ACTUAL Folder Structure

### Frontend (REALITY)
```
client/
├── app/
│   ├── _classes/              # Entity classes
│   │   ├── Quote.ts
│   │   ├── Order.ts
│   │   ├── Product.ts
│   │   ├── CartProduct.ts
│   │   └── User.ts (Account.ts)
│   │
│   ├── _components/           # Shared components
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   │   └── PermissionGuard.tsx
│   │   │   └── badges/
│   │   ├── forms/
│   │   │   ├── FormInput.tsx
│   │   │   └── index.ts
│   │   ├── tables/
│   │   │   ├── DataGrid.tsx
│   │   │   └── ServerDataGrid.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       └── index.ts
│   │
│   ├── _core/
│   │   └── validation/
│   │       └── validation-schemas.ts  # ALL Zod schemas
│   │
│   ├── _features/             # Cross-cutting features
│   │   ├── accounts/
│   │   ├── cart/
│   │   └── navigation/
│   │
│   ├── _shared/
│   │   ├── hooks/
│   │   │   ├── useFormSubmit.ts
│   │   │   ├── useZodForm.ts
│   │   │   └── useAuth.ts
│   │   └── services/
│   │       ├── api.ts              # CENTRALIZED API
│   │       ├── httpService.ts      # HTTP client with auto token refresh
│   │       └── tokenService.ts     # JWT token management (MAANG-level)
│   │
│   ├── _types/                # Shared TypeScript types
│   │
│   └── app/                   # Route pages
│       ├── quotes/
│       │   ├── [id]/
│       │   │   ├── _components/
│       │   │   │   ├── hooks/
│       │   │   │   │   ├── useQuoteDetails.ts
│       │   │   │   │   ├── useQuoteActions.ts
│       │   │   │   │   ├── useQuotePricing.ts
│       │   │   │   │   └── index.ts
│       │   │   │   ├── QuoteHeader.tsx
│       │   │   │   ├── QuoteProducts.tsx
│       │   │   │   ├── QuotePricingEditor.tsx
│       │   │   │   └── index.ts
│       │   │   └── page.tsx
│       │   ├── _components/
│       │   └── page.tsx
│       ├── rbac/                    # RBAC Management UI (NEW)
│       │   ├── _components/
│       │   │   ├── hooks/
│       │   │   │   ├── useRBACManagement.ts
│       │   │   │   └── index.ts
│       │   │   ├── RoleHierarchyDiagram.tsx
│       │   │   ├── PermissionMatrix.tsx
│       │   │   ├── AuditLogTable.tsx
│       │   │   ├── BulkRoleModal.tsx
│       │   │   └── index.ts
│       │   ├── roles/
│       │   │   ├── manage/page.tsx
│       │   │   └── page.tsx
│       │   ├── permissions/
│       │   │   ├── manage/page.tsx
│       │   │   └── page.tsx
│       │   └── page.tsx
│       ├── orders/
│       ├── products/
│       └── dashboard/
│
├── md/                        # Documentation
│   └── business_flow.md
│
└── test-utils/
    ├── renderWithProviders.tsx
    └── rbacTestBuilders.ts
```

### Backend (REALITY)
```
server/
├── Controllers/
│   ├── QuotesController.cs
│   ├── OrdersController.cs
│   ├── ProductsController.cs
│   ├── RBACController.cs         # RBAC Management API (NEW)
│   ├── AuthController.cs         # Authentication endpoints (NEW)
│   └── AccountController.cs
│
├── Services/
│   ├── DB/
│   │   ├── QuoteService.cs
│   │   ├── OrderService.cs
│   │   ├── AccountService.cs
│   │   └── RBACService.cs        # RBAC business logic (NEW)
│   └── Auth/
│       └── JwtTokenService.cs    # JWT token management (NEW)
│
├── Entities/
│   ├── Quote.cs
│   ├── Order.cs
│   ├── Product.cs
│   ├── CartProduct.cs
│   ├── Account.cs
│   ├── RefreshToken.cs           # Refresh token entity (NEW)
│   └── RBAC/
│       ├── Role.cs
│       └── Permission.cs
│
├── Classes/
│   ├── BaseController.cs
│   ├── Common/           # Name, Address, etc.
│   ├── DTOs/
│   ├── Auth/
│   │   ├── AuthDTOs.cs           # Auth request/response DTOs (NEW)
│   │   └── JwtSettings.cs        # JWT configuration (NEW)
│   └── Others/           # Request/Response DTOs
│       ├── CreateQuoteRequest.cs
│       ├── QuotePricingDTOs.cs
│       └── ...
│
├── Authorization/        # RBAC
│   ├── PermissionHandler.cs
│   ├── PermissionRequirement.cs
│   ├── RoleHandler.cs
│   └── RoleRequirement.cs
│
├── Extensions/
│   └── RBACServiceExtensions.cs
│
├── Database/
│   └── DBContext.cs
│
└── Migrations/
```

---

## 🔐 RBAC Matrix (Complete)

### Role Hierarchy
```
Admin (500)
    ↓
Sales Manager (400)
    ↓
Sales Representative (300)
    ↓
Fulfillment Coordinator (200)
    ↓
Customer (100)
```

### Complete Permission Matrix

| Feature | Customer | Sales Rep | Fulfillment | Sales Mgr | Admin |
|---------|----------|-----------|-------------|-----------|-------|
| **Dashboard** |
| View own stats | ✅ | ✅ | ✅ | ✅ | ✅ |
| View team stats | ❌ | ❌ | ❌ | ✅ | ✅ |
| View all stats | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Products** |
| Browse/search | ✅ | ✅ | ✅ | ✅ | ✅ |
| View pricing | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Orders** |
| View own | ✅ | ❌ | ❌ | ❌ | ❌ |
| View assigned | ❌ | ✅ | ✅ | ✅ | ✅ |
| View all | ❌ | ❌ | ❌ | ✅ | ✅ |
| Update status | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cancel | ✅ (req) | ✅ | ❌ | ✅ | ✅ |
| Confirm payment | ❌ | ✅ | ❌ | ✅ | ✅ |
| Add tracking | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Quotes** |
| Submit request | ✅ | ❌ | ❌ | ❌ | ❌ |
| View own | ✅ | ❌ | ❌ | ❌ | ❌ |
| View assigned | ❌ | ✅ | ❌ | ✅ | ✅ |
| View all | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mark as read | ❌ | ✅ | ❌ | ✅ | ✅ |
| Input pricing | ❌ | ✅ | ❌ | ✅ | ✅ |
| Approve quote | ❌ | ✅ | ❌ | ✅ | ✅ |
| Send to customer | ❌ | ✅ | ❌ | ✅ | ✅ |
| Assign | ❌ | ❌ | ❌ | ✅ | ✅ |
| Reassign | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Users** |
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| View customers | ❌ | ✅ (assigned) | ❌ | ✅ | ✅ |
| View team | ❌ | ❌ | ❌ | ✅ (team) | ✅ (all) |
| Create user | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| **RBAC** |
| View settings | ❌ | ❌ | ❌ | ✅ (view) | ✅ |
| Edit roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit permissions | ❌ | ❌ | ❌ | ❌ | ✅ |

---

---

## 🛡️ MAANG-Level Standards (MANDATORY)

### Error Handling Pattern

**Backend (C#):**
```csharp
// ✅ CORRECT - Use BaseController response methods
public async Task<IResponse<Quote>> UpdateQuote([FromBody] Quote quote)
{
    // Validation errors
    if (quote == null)
        return BadRequest<Quote>("Invalid quote data");
    
    // Not found errors
    var existing = await _quoteService.Get(quote.Id.Value);
    if (existing == null)
        return NotFound<Quote>($"Quote {quote.Id} not found");
    
    // Authorization errors
    if (!CanEdit(user, existing))
        return Unauthorized<Quote>("You cannot edit this quote");
    
    // Business rule errors
    if (quote.CustomerPrice < quote.VendorCost)
        return BadRequest<Quote>("Customer price must be >= vendor cost");
    
    // Success
    try {
        var updated = await _quoteService.Update(quote);
        return Ok<Quote>("quote_updated", updated);
    }
    catch (Exception ex) {
        // Unexpected errors (log and return generic message)
        _logger.LogError(ex, "Failed to update quote {QuoteId}", quote.Id);
        return UnexpectedError<Quote>("An unexpected error occurred");
    }
}
```

**Frontend (TypeScript):**
```typescript
// ✅ CORRECT - Use useFormSubmit for all API calls
const { submit, isSubmitting } = useFormSubmit(
  async (data) => API.Quotes.update(data),
  {
    successMessage: 'Quote updated successfully',
    errorMessage: 'Failed to update quote',  // User-friendly
    componentName: 'QuotePricingEditor',     // For logging
    actionName: 'updatePricing',              // For logging
    onSuccess: async () => {
      await refresh()  // Refresh data after success
    },
    onError: (error) => {
      logger.error('Quote update failed', { error })  // Technical log
    }
  }
)
```

### Logging Standards

**Backend:**
- Use `ILogger<T>` (built-in .NET logging)
- Log levels: `Debug`, `Information`, `Warning`, `Error`, `Critical`
- Include contextual data: user ID, entity ID, action

```csharp
_logger.LogInformation(
    "Quote {QuoteId} updated by user {UserId}. Status: {OldStatus} → {NewStatus}",
    quote.Id, user.Id, oldStatus, newStatus
);
```

**Frontend:**
- Use `logger` from `@_core` (existing)
- Log component name and action
- Never log sensitive data (passwords, tokens)

```typescript
import { logger } from '@_core'

logger.info('Quote pricing updated', {
  component: 'QuotePricingEditor',
  quoteId: quote.id,
  productId: product.id,
})
```

### Performance Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| API Response Time | < 200ms | 500ms |
| Page Load Time | < 2s | 3s |
| Database Query | < 100ms | 250ms |
| Bundle Size (JS) | < 500KB | 1MB |

### Accessibility Standards (WCAG 2.1 AA)

- All interactive elements must be keyboard accessible
- Color contrast ratio: minimum 4.5:1
- All images must have alt text
- Form inputs must have labels
- Error messages must be announced to screen readers

### Security Standards

1. **Input Validation**
   - Validate ALL user input (frontend + backend)
   - Use Zod schemas (frontend) and Data Annotations (backend)
   - Sanitize strings to prevent XSS

2. **Authorization**
   - Check permissions on EVERY endpoint
   - Use `[Authorize]` attributes + manual role checks
   - Never trust client-side role claims alone

3. **Data Protection**
   - Never expose internal IDs unnecessarily
   - Hide sensitive fields (cost, margins) from unauthorized roles
   - Use HTTPS only

---

## 📝 PRD Structure (Standard Template)

Every PRD follows this exact structure:

```markdown
# [Feature] PRD

## 1. Overview
- **Feature**: [Name]
- **Priority**: P0/P1/P2
- **Status**: Not Started / In Progress / Complete
- **Dependencies**: [List other features/PRDs]

## 2. Business Context
[From business_flow.md - what problem does this solve?]

## 3. Role-Based Requirements

### Customer View
- Can: [List capabilities]
- Cannot: [List restrictions]
- Sees: [UI elements visible]

### Sales Rep View
[Same structure]

### [Other Roles...]

## 4. User Stories

### Epic: [Epic Name]

**US-001**: As a [role], I want to [action] so that [benefit]
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given [context], when [action], then [outcome]
  - [ ] Given [context], when [action], then [outcome]

## 5. Technical Architecture

### 5.1 Backend

#### Database Changes
**Migration**: `YYYYMMDDHHMMSS_[Name].cs`
```csharp
// Changes to entities
// New columns
// Constraints
```

#### DTOs
**File**: `server/Classes/Others/[Name].cs`
```csharp
public class CreateXRequest { }
public class UpdateXRequest { }
public class XResponse { }
```

#### Service Updates
**File**: `server/Services/DB/[Name]Service.cs`
```csharp
// New methods
// Updated methods
```

#### Controller Endpoints
**File**: `server/Controllers/[Name]Controller.cs`
```csharp
[HttpGet("/api/[route]")]
[Authorize(Policy = "...")]
public async Task<IResponse<T>> Method()
```

### 5.2 Frontend

#### Entity Classes
**File**: `client/app/_classes/[Name].ts`
```typescript
export default class X {
  constructor(param?: Partial<X>) { }
}
```

#### Validation Schema
**File**: `client/app/_core/validation/validation-schemas.ts`
```typescript
export const xSchema = z.object({ })
export type XFormData = z.infer<typeof xSchema>
```

#### API Integration
**File**: `client/app/_shared/services/api.ts`
```typescript
export const API = {
  X: {
    get: async <T>(id: string) => { },
    create: async <T>(data: T) => { }
  }
}
```

#### Components
**Location**: `client/app/app/[route]/_components/`
- `[Component].tsx` - [Purpose]
- `hooks/use[Feature].ts` - [Purpose]
- `index.ts` - Barrel export

#### Page
**File**: `client/app/app/[route]/page.tsx`
[Description of page structure]

### 5.3 RBAC Implementation

#### Backend Authorization
```csharp
[Authorize(Policy = "...")]
// Role checks in controller
```

#### Frontend Guards
```tsx
<PermissionGuard resource={Resources.X} action={Actions.Y}>
  {/* Protected UI */}
</PermissionGuard>
```

## 6. Implementation Plan

### Phase 1: Database & Backend (Week 1)
- [ ] Create migration
- [ ] Update entities
- [ ] Create DTOs
- [ ] Implement service methods
- [ ] Create controller endpoints
- [ ] Add authorization policies

### Phase 2: Frontend Foundation (Week 2)
- [ ] Update entity classes
- [ ] Add validation schemas
- [ ] Update API object
- [ ] Create custom hooks

### Phase 3: UI Components (Week 3)
- [ ] Build components
- [ ] Implement page
- [ ] Add RBAC guards
- [ ] Wire up data flow

### Phase 4: Testing (Week 4)
- [ ] Unit tests (95%+ coverage)
- [ ] RBAC tests
- [ ] Integration tests
- [ ] E2E tests

## 7. Testing Requirements

### Unit Tests

#### Component Tests
```typescript
describe('[Component]', () => {
  it('should render correctly', () => { })
  it('should handle user input', () => { })
  it('should call API on submit', () => { })
})
```

#### Hook Tests
```typescript
describe('use[Feature]', () => {
  it('should fetch data', async () => { })
  it('should handle errors', async () => { })
})
```

#### Service Tests (Backend)
```csharp
[Test]
public async Task Service_Should_X()
{
    // Arrange, Act, Assert
}
```

### RBAC Security Tests
```typescript
describe('[Feature] RBAC', () => {
  it('should allow [role] to [action]', () => { })
  it('should deny [role] from [action]', () => { })
  it('should prevent horizontal access', () => { })
})
```

### Integration Tests
```typescript
describe('[Feature] Flow', () => {
  it('should complete full workflow', async () => {
    // Step-by-step workflow test
  })
})
```

## 8. Dependencies

### Reused Components
- `FormInput` from `@_components/forms`
- `Button` from `@_components/ui`
- `Card` from `@_components/ui`

### Reused Hooks
- `useFormSubmit` from `@_shared/hooks`
- `useZodForm` from `@_shared/hooks`
- `useAuth` from `@_shared/hooks`

### Reused Services
- `API.X.method` from `@_shared/services/api`

## 9. File Changes

### New Files
```
server/
└── Migrations/YYYYMMDDHHMMSS_[Name].cs

client/
└── app/app/[route]/
    ├── _components/
    │   ├── [Component].tsx
    │   └── hooks/use[Feature].ts
    └── page.tsx
```

### Modified Files
```
server/
├── Entities/[Entity].cs
├── Services/DB/[Service].cs
└── Controllers/[Controller].cs

client/
├── app/_classes/[Entity].ts
├── app/_core/validation/validation-schemas.ts
└── app/_shared/services/api.ts
```

## 10. Success Criteria
- [ ] All functional requirements met
- [ ] All tests passing (95%+ coverage)
- [ ] RBAC verified for all roles
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Performance acceptable (<200ms API, <2s page load)
- [ ] Barrel exports implemented
- [ ] Documentation complete
```

---

## 🎯 Development Priority Order

### Phase 1: Critical (Weeks 1-2)
1. ✅ **Dashboard** - All roles need overview
2. ✅ **Quote Pricing** - Complete quote workflow
3. ✅ **Profile & Notifications** - User settings

### Phase 2: Core Management (Weeks 3-4)
4. **Orders Management** - Full order lifecycle
5. **Products Management** - Product CRUD
6. **Quotes Management** - Enhanced quote features

### Phase 3: User Management (Weeks 5-6)
7. **Customers Management** - Customer profiles
8. **Accounts Management** - User accounts
9. **Providers Management** - Vendor portal

### Phase 4: Advanced (Weeks 7-8)
10. **Analytics Dashboard** - Business intelligence
11. ✅ **RBAC Management UI** - Role/permission editor (COMPLETE)
12. **Performance Optimization**

---

## 📦 File Naming Conventions

### Backend (C#)
- **PascalCase** for ALL files, classes, methods, properties
- **Suffix patterns**:
  - `Controller.cs` for controllers
  - `Service.cs` for services
  - `Request.cs` for request DTOs
  - `Response.cs` for response DTOs
  - `DTOs.cs` for grouped DTOs
- **Column names**: Use `snake_case` in database (PostgreSQL convention)

### Frontend (TypeScript)
- **PascalCase** for component files: `QuoteHeader.tsx`, `FormInput.tsx`
- **PascalCase** for class files: `Quote.ts`, `Product.ts`
- **camelCase** for hook files: `useQuoteDetails.ts`, `useFormSubmit.ts`
- **kebab-case** for utility files: `validation-schemas.ts`, `date-utils.ts`
- **Suffix patterns**:
  - `.tsx` for React components
  - `.ts` for TypeScript (non-React)
  - `.types.ts` for type definitions
  - `.test.ts` / `.test.tsx` for tests
- **Prefix patterns**:
  - `use` for hooks
  - Avoid `I` prefix for interfaces (use `type` keyword)
  
### Import Aliases (Actual)
```typescript
// These aliases are configured in tsconfig.json
import Quote from '@_classes/Quote'
import { FormInput } from '@_components/forms'
import { useFormSubmit } from '@_shared'
import { quoteSchema } from '@_core'
import { API } from '@_shared/services/api'
```

---

## 🚀 AI Agent Quick Start

### Step 1: Read Documentation (5 min)
1. `business_flow.md` - Understand business
2. This file - Understand architecture
3. Specific PRD - Understand feature

### Step 2: Validate Understanding (2 min)
- [ ] I know which role can do what
- [ ] I know existing components to reuse
- [ ] I know the file structure (ACTUAL)
- [ ] I know the coding patterns (API layer, useFormSubmit, etc.)

### Step 3: Follow PRD Checklist
- [ ] Backend: Migration → DTO → Service → Controller
- [ ] Frontend: Entity → Schema → API → Hook → Component → Page
- [ ] Testing: Unit → RBAC → Integration
- [ ] Review: Barrel exports, no TypeScript errors, tests pass

---

## 🔗 Next Steps

1. Read: `prd_start_here.md` - Quick guide for AI agents
2. Read: `prd_dashboard.md` - Dashboard PRD (next priority)
3. Read: `prd_orders.md` - Orders management PRD

**Recently Completed:**
- ✅ `prd_quotes_pricing.md` - Quote Pricing (Dec 19, 2024)
- ✅ `prd_rbac_management.md` - RBAC Management UI (Dec 19, 2024)
- ✅ **JWT Token System** - MAANG-level authentication (Dec 19, 2024)

---

## 📊 Entity ID Types Reference

**IMPORTANT**: The backend uses different ID types for different entities:

| Entity | ID Type | Notes |
|--------|---------|-------|
| `Account` | `int?` | User/Account IDs |
| `Order` | `int?` | Order IDs |
| `Quote` | `Guid?` | Quote IDs (default `Guid.NewGuid()`) |
| `Product` | `Guid?` | Product IDs |
| `CartProduct` | `Guid?` | Cart product IDs |
| `CustomerId` | `int?` | Foreign key to Account |
| `AssignedSalesRepId` | `string` | Stored as string, references Account.Id |

When creating DTOs and TypeScript types:
- `int?` → `number | null` in TypeScript
- `Guid?` → `string | null` in TypeScript (JSON serializes Guid as string)
- Always use nullable types for optional IDs

---

## 🧪 Testing Standards

**Framework**: Vitest 4 + React Testing Library + Playwright (E2E)

```typescript
// ✅ Correct imports for Vitest
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ✅ Mock API calls
vi.mock('@_shared/services/api', () => ({
  API: {
    Quotes: {
      get: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// ✅ Use renderWithProviders for components that need context
import { renderWithProviders } from '@/test-utils'
import { createMockUserWithRole } from '@/test-utils/rbacTestBuilders'

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should render correctly', () => {
    const mockUser = createMockUserWithRole('SalesRep')
    renderWithProviders(<MyComponent />, { user: mockUser })
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

**Test File Location**:
- Co-locate tests with components: `ComponentName.test.tsx`
- Or use `__tests__` folder: `_components/__tests__/ComponentName.test.tsx`

**Run Tests**:
```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run test:ui       # With Vitest UI
```

---

**Document Version**: 3.2  
**Last Updated**: December 19, 2024  
**Status**: Aligned with actual codebase

---

## 📋 Changelog

### v3.2 (December 19, 2024)
- ✅ **RBAC Management UI** completed
  - Backend: `RBACController.cs` with full CRUD for roles/permissions, audit logs, bulk role updates
  - Backend: `RBACService.cs` with comprehensive role/permission management, cache invalidation
  - Frontend: Complete UI at `client/app/app/rbac/` with:
    - Role hierarchy diagram visualization
    - Permission matrix (feature x role)
    - Audit log viewer with filtering
    - Bulk role assignment modal
    - User role management table
  - Components: RoleHierarchyDiagram, PermissionMatrix, AuditLogTable, BulkRoleModal
  - Hooks: `useRBACManagement`, `useRoles`, `usePermissions`
  - API: Full RBAC endpoints in `api.ts`
- ✅ **MAANG-Level JWT Token System** completed
  - Backend: `JwtTokenService.cs` for token generation with rotation
  - Backend: `AuthController.cs` with `/auth/login`, `/auth/refresh`, `/auth/logout`
  - Backend: `RefreshToken.cs` entity with token rotation support
  - Frontend: `tokenService.ts` with automatic silent refresh
  - Frontend: `AuthService.ts` fully migrated to new token system
  - Frontend: `httpService.ts` with automatic 401 retry + token refresh
  - Features:
    - Short-lived access tokens (15 min)
    - Long-lived refresh tokens (7-30 days)
    - Token rotation on each refresh
    - Automatic silent refresh
    - Concurrent request queuing during refresh
    - Tab visibility-based refresh
- ✅ All logging follows PRD standards (component + action fields)
- ✅ All API calls use HttpService (DRY principle)
- ✅ No empty catch blocks (all have proper logging)

### v3.1 (December 19, 2024)
- ✅ **Quote Pricing System** completed
  - Backend: Migration, CartProduct entity, QuotePricingDTOs, QuoteService, QuotesController
  - Frontend: CartProduct class, productPricingSchema, API methods, useQuotePricing hook, QuotePricingEditor component
  - Integration: Updated QuoteActions to gate approval on pricing completion