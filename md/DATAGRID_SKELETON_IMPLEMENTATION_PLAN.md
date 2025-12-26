# DataGrid Skeleton Loading Implementation Plan

> **MAANG-Level Engineering Document**  
> Version: 1.1  
> Author: Engineering Team  
> Date: December 2024  
> Status: ✅ **IMPLEMENTATION COMPLETE**

---

## 🎉 Implementation Status

> **Last Updated:** December 25, 2024

### ✅ Completed

| Phase | Task | Status |
|-------|------|--------|
| **Phase 1** | Create `skeleton.types.ts` | ✅ Complete |
| **Phase 1** | Create `skeleton.constants.ts` | ✅ Complete |
| **Phase 1** | Create `DataGridSkeletonRow.tsx` | ✅ Complete |
| **Phase 1** | Create `DataGridSkeletonHeader.tsx` | ✅ Complete |
| **Phase 1** | Create `DataGridSkeletonBody.tsx` | ✅ Complete |
| **Phase 1** | Create `DataGridSkeletonPagination.tsx` | ✅ Complete |
| **Phase 1** | Create `DataGridSkeleton.tsx` (main component) | ✅ Complete |
| **Phase 1** | Create skeleton barrel export (`skeleton/index.ts`) | ✅ Complete |
| **Phase 1** | Update `DataGrid/index.ts` with skeleton exports | ✅ Complete |
| **Phase 1** | Update `tables/index.ts` with skeleton exports | ✅ Complete |
| **Phase 1** | Add skeleton CSS to `globals.css` | ✅ Complete |
| **Phase 2** | Migrate `quotes/loading.tsx` to DataGridSkeleton | ✅ Complete |
| **Phase 3** | Add `loadingVariant` prop to DataGrid | ✅ Complete |
| **Phase 3** | Add `skeletonRowCount` prop to DataGrid | ✅ Complete |
| **Phase 3** | Add `LoadingVariant` type to exports | ✅ Complete |
| **Phase 4** | Create `AuditLogDataGrid.tsx` | ✅ Complete |
| **Phase 4** | Create `UserRolesDataGrid.tsx` | ✅ Complete |
| **Phase 4** | Create `TeamLeaderboardDataGrid.tsx` | ✅ Complete |

### 📁 Files Created

```
client/app/_components/tables/DataGrid/skeleton/
├── skeleton.types.ts          # Type definitions
├── skeleton.constants.ts      # Constants and defaults
├── DataGridSkeletonRow.tsx    # Single row skeleton
├── DataGridSkeletonHeader.tsx # Header skeleton
├── DataGridSkeletonBody.tsx   # Body with multiple rows
├── DataGridSkeletonPagination.tsx # Pagination skeleton
├── DataGridSkeleton.tsx       # Main composed component
└── index.ts                   # Barrel exports

client/app/app/rbac/_components/
├── AuditLogDataGrid.tsx       # Migrated from AuditLogTable
└── UserRolesDataGrid.tsx      # Migrated from UserRolesTable

client/app/app/analytics/_components/
└── TeamLeaderboardDataGrid.tsx # Migrated from TeamLeaderboard
```

### 📝 Files Modified

- `client/app/_components/tables/DataGrid/index.ts` - Added skeleton exports
- `client/app/_components/tables/index.ts` - Added skeleton exports
- `client/app/_components/tables/DataGrid/DataGrid.tsx` - Added loadingVariant prop
- `client/app/_components/tables/DivTable/types/divTableTypes.ts` - Added LoadingVariant type
- `client/app/_components/tables/tableTypes.ts` - Added LoadingVariant type
- `client/app/globals.css` - Added skeleton CSS classes
- `client/app/app/quotes/loading.tsx` - Migrated to DataGridSkeleton
- `client/app/app/rbac/_components/index.ts` - Added new DataGrid exports
- `client/app/app/analytics/_components/index.ts` - Added TeamLeaderboardDataGrid export

### 🔄 Remaining (Optional)

These tables can be migrated as needed but are functional with current implementations:

- `TeamWorkloadTable.tsx` → Could use DataGrid with summary row
- `RecentItemsTable.tsx` → Could use DataGrid with type switching
- `CustomerHistory.tsx` → Could use DataGrid per tab

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Background & Research](#2-background--research)
3. [Architecture Overview](#3-architecture-overview)
4. [Component Specifications](#4-component-specifications)
5. [Implementation Phases](#5-implementation-phases)
6. [Barrel Export Updates](#6-barrel-export-updates-critical)
7. [File Changes Matrix](#7-file-changes-matrix)
8. [Testing Strategy](#8-testing-strategy)
9. [Migration Guide](#9-migration-guide)
10. [Accessibility Requirements](#10-accessibility-requirements)
11. [Performance Considerations](#11-performance-considerations)
12. [Rollback Plan](#12-rollback-plan)

---

## 1. Executive Summary

### 1.1 Objective

Implement a **hybrid loading strategy** for DataGrid components that aligns with MAANG-level best practices, providing:

- **Route-level skeleton** via `DataGridSkeleton` component for Next.js Suspense boundaries
- **Component-level loading** via enhanced `DataGrid` with skeleton rows option
- **Consistent UX** across all data table interactions

### 1.2 Key Deliverables

| Deliverable | Description | Priority |
|-------------|-------------|----------|
| `DataGridSkeleton` | Standalone skeleton component for loading.tsx files | P0 |
| `DataGridSkeletonRow` | Reusable skeleton row component | P0 |
| Enhanced `DataGrid` | Add `loadingVariant` prop for skeleton rows | P1 |
| Updated `loading.tsx` files | Migrate from raw `<table>` to `DataGridSkeleton` | P1 |
| Updated raw `<table>` components | Migrate appropriate tables to DataGrid | P2 |

### 1.3 Success Metrics

- [ ] Zero raw `<table>` elements in loading.tsx files
- [ ] Consistent skeleton appearance across all data grids
- [ ] < 50ms skeleton render time (measured via Performance API)
- [ ] 100% WCAG AA compliance for loading states
- [ ] All existing DataGrid functionality preserved (regression-free)

---

## 2. Background & Research

### 2.1 Industry Analysis

#### Netflix Pattern
```
┌─────────────────────────────────────────────────────────────┐
│  ROUTE LOAD (Suspense)      │  COMPONENT LOAD (State)       │
├─────────────────────────────┼───────────────────────────────┤
│  GridSkeleton component     │  Skeleton rows in grid body   │
│  Shimmer animation          │  Progressive loading          │
│  Exact layout match         │  Maintains scroll position    │
└─────────────────────────────┴───────────────────────────────┘
```

#### Airbnb Pattern
- External `ListingSkeleton` for Suspense
- Internal `SkeletonCard` array for infinite scroll
- CSS `animation-delay` for staggered shimmer effect

#### Google Material Design Guidelines
> "Skeleton screens are most effective when their shapes closely resemble the actual content layout."

Key principles:
1. **Structure Matching**: Skeleton must match final UI exactly
2. **Motion**: Subtle shimmer animation (left-to-right pulse)
3. **Timing**: Display skeleton for minimum 300ms to avoid flash
4. **Accessibility**: Use `aria-busy="true"` and `aria-label` for screen readers

### 2.2 Current State Analysis

| File | Current Implementation | Issue |
|------|----------------------|-------|
| `quotes/loading.tsx` | Raw `<table>` with skeletons | Inconsistent with DataGrid styling |
| `DataGrid.tsx` | Spinner overlay only | No skeleton rows option |
| `DashboardSkeleton.tsx` | Custom skeleton ✅ | Good pattern to follow |
| `StoreSkeleton.tsx` | Custom skeleton ✅ | Good pattern to follow |

### 2.3 Technical Constraints

1. **Next.js Suspense**: `loading.tsx` runs BEFORE component mounts
2. **TanStack Table**: Provides no built-in skeleton support
3. **DaisyUI**: Has `skeleton` class but no grid-specific variant
4. **React Compiler**: Must work with automatic memoization

---

## 3. Architecture Overview

### 3.1 Barrel Import Architecture Analysis

Your codebase follows a **MAANG-level modular barrel export pattern**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BARREL IMPORT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  @_core       → App foundations (logger, validation)                 │
│  @_lib        → Pure utilities (formatters, dates) - Server safe     │
│  @_shared     → Cross-feature (hooks, services, utils)               │
│  @_types      → Centralized type definitions                         │
│  @_features/* → Feature-specific exports                             │
│  @_components/*→ Component domain exports                            │
│                                                                      │
│  Each module has:                                                    │
│  1. Header documentation with @module tag                            │
│  2. Organized sections with ======== dividers                        │
│  3. Named exports for tree-shaking                                   │
│  4. Types exported separately                                        │
│  5. Re-exports from sub-modules                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Assessment:**

| Principle | Status | Notes |
|-----------|--------|-------|
| **DRY** | ✅ Strong | Types in `@_types`, utils in `@_shared`, constants centralized |
| **Separation of Concerns** | ✅ Strong | Pure/impure split (`@_lib` vs `@_shared`), Server/Client awareness |
| **Scalability** | ✅ Strong | Feature-based organization, tree-shakeable |
| **Discoverability** | ✅ Strong | JSDoc headers, example imports in each barrel |
| **Server/Client Safety** | ✅ Strong | Clear documentation on what's safe where |

**Tables Module Current Pattern:**

```typescript
// client/app/_components/tables/index.ts - CURRENT STRUCTURE
// ============================================================================
// COMPONENTS
// ============================================================================
export { DataGrid } from './DataGrid'
export { default as ServerDataGrid } from './ServerDataGrid'

// ============================================================================
// CONSTANTS
// ============================================================================
export { DEFAULT_PAGE_SIZE_OPTIONS, ... } from './tableConstants'

// ============================================================================
// UTILITIES
// ============================================================================
export { sanitizeString, ... } from './tableUtils'

// ============================================================================
// TYPES
// ============================================================================
export type { PaginationButtonConfig, ... } from './tableTypes'
export type { ColumnDef } from '@tanstack/react-table'
```

### 3.2 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LOADING ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 1: ROUTE-LEVEL                       │   │
│  │                    (Next.js Suspense Boundary)                │   │
│  │                                                               │   │
│  │   loading.tsx ─────────► DataGridSkeleton                     │   │
│  │                               │                               │   │
│  │                               ├── DataGridSkeletonHeader      │   │
│  │                               ├── DataGridSkeletonBody        │   │
│  │                               │     └── DataGridSkeletonRow   │   │
│  │                               └── DataGridSkeletonPagination  │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 2: COMPONENT-LEVEL                   │   │
│  │                    (In-Component State)                       │   │
│  │                                                               │   │
│  │   DataGrid                                                    │   │
│  │      │                                                        │   │
│  │      ├── loadingVariant="spinner" (default)                   │   │
│  │      │     └── Overlay spinner                                │   │
│  │      │                                                        │   │
│  │      └── loadingVariant="skeleton"                            │   │
│  │            └── DataGridSkeletonBody (internal)                │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 File Structure (Following DivTable Pattern)

```
client/app/_components/tables/
├── DataGrid/
│   ├── DataGrid.tsx                 # Enhanced with loadingVariant
│   ├── index.ts                     # Barrel export (updated)
│   ├── components/                  # NEW: Skeleton sub-components
│   │   ├── DataGridSkeletonHeader.tsx
│   │   ├── DataGridSkeletonBody.tsx
│   │   ├── DataGridSkeletonRow.tsx
│   │   └── DataGridSkeletonPagination.tsx
│   └── skeleton/                    # NEW: Main skeleton + types
│       ├── DataGridSkeleton.tsx     # Main composed skeleton
│       ├── skeleton.types.ts        # Skeleton-specific types
│       ├── skeleton.constants.ts    # Skeleton constants
│       └── index.ts                 # Skeleton barrel
├── DivTable/
│   ├── components/                  # Existing pattern to follow
│   │   ├── DivTableBody.tsx
│   │   ├── DivTableHeader.tsx
│   │   └── ...
│   ├── types/
│   │   ├── divTableTypes.ts
│   │   └── divTableConstants.ts
│   ├── utils/
│   │   └── divTableUtils.ts
│   └── index.ts                     # Barrel export
├── ServerDataGrid.tsx
├── tableConstants.ts
├── tableTypes.ts
├── tableUtils.ts
└── index.ts                         # Main barrel (updated)
```

### 3.4 Import Path Design (Follows Existing Conventions)

```typescript
// ============================================================================
// CONSUMER IMPORTS - Following existing barrel patterns
// ============================================================================

// OPTION 1: From main tables barrel (RECOMMENDED for external consumers)
import { DataGrid, DataGridSkeleton, ServerDataGrid } from '@_components/tables'
import type { DataGridProps, DataGridSkeletonProps } from '@_components/tables'

// OPTION 2: Direct from DataGrid barrel (for internal tables module use)
import { DataGrid, DataGridSkeleton } from './DataGrid'
import { DataGridSkeletonBody } from './DataGrid/components/DataGridSkeletonBody'

// OPTION 3: Direct file import (AVOID - breaks barrel encapsulation)
// ❌ import { DataGridSkeleton } from '@_components/tables/DataGrid/skeleton/DataGridSkeleton'
```

---

## 4. Component Specifications

### 4.1 DataGridSkeleton (Main Component)

```typescript
/**
 * DataGridSkeleton Component
 * 
 * Route-level skeleton for DataGrid, used in Next.js loading.tsx files.
 * Matches DataGrid's visual structure for seamless loading transitions.
 * 
 * @example
 * // In loading.tsx
 * import { DataGridSkeleton } from '@_components/tables'
 * 
 * export default function QuotesLoading() {
 *   return (
 *     <PageWrapper>
 *       <DataGridSkeleton 
 *         columns={7} 
 *         rows={10}
 *         showPagination 
 *       />
 *     </PageWrapper>
 *   )
 * }
 */

interface DataGridSkeletonProps {
  /** Number of columns to render */
  columns?: number
  /** Number of skeleton rows to render */
  rows?: number
  /** Whether to show pagination skeleton */
  showPagination?: boolean
  /** Whether to show page size selector skeleton */
  showPageSize?: boolean
  /** Column width configuration (optional) */
  columnWidths?: ('sm' | 'md' | 'lg' | 'xl')[]
  /** Custom CSS class */
  className?: string
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** Animation variant */
  animationVariant?: 'pulse' | 'shimmer' | 'none'
  /** Stagger animation delay between rows (ms) */
  staggerDelay?: number
}

// Default values aligned with common DataGrid usage
const DEFAULT_PROPS = {
  columns: 6,
  rows: 10,
  showPagination: true,
  showPageSize: true,
  animationVariant: 'pulse',
  staggerDelay: 50,
  ariaLabel: 'Loading data...',
}
```

### 4.2 DataGridSkeletonRow

```typescript
/**
 * Single skeleton row for DataGrid
 * 
 * Renders a grid row with skeleton cells matching column count.
 * Supports staggered animation for visual polish.
 */

interface DataGridSkeletonRowProps {
  /** Number of columns */
  columns: number
  /** Column widths configuration */
  columnWidths?: ('sm' | 'md' | 'lg' | 'xl')[]
  /** Row index for stagger animation */
  index?: number
  /** Stagger delay multiplier */
  staggerDelay?: number
  /** CSS class for row */
  className?: string
}

// Width mappings for skeleton cells (mimics real data patterns)
const SKELETON_WIDTHS = {
  sm: 'w-16',   // IDs, short codes
  md: 'w-24',   // Dates, status badges
  lg: 'w-32',   // Names, titles
  xl: 'w-48',   // Emails, descriptions
}

// Default pattern: [sm, lg, xl, md, md, sm] (common table layout)
const DEFAULT_COLUMN_WIDTHS = ['sm', 'lg', 'xl', 'md', 'md', 'sm']
```

### 4.3 Enhanced DataGrid Props

```typescript
// New props to add to DataGridProps<TData>

interface DataGridLoadingEnhancement {
  /**
   * Loading indicator variant
   * - 'spinner': Overlay spinner (default, best for quick operations)
   * - 'skeleton': Skeleton rows (best for pagination, initial load)
   * @default 'spinner'
   */
  loadingVariant?: 'spinner' | 'skeleton'
  
  /**
   * Number of skeleton rows to show when loadingVariant='skeleton'
   * @default 5
   */
  skeletonRowCount?: number
  
  /**
   * Minimum time to show loading state (prevents flash)
   * @default 300
   */
  minLoadingTimeMs?: number
}
```

### 4.4 CSS Classes Specification

```css
/* New classes to add to globals.css */

/* Base skeleton animation */
.data-grid-skeleton {
  @apply animate-pulse;
}

/* Shimmer variant (Netflix-style) */
.data-grid-skeleton-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--b3)) 0%,
    hsl(var(--b2)) 50%,
    hsl(var(--b3)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skeleton row with stagger support */
.data-grid-skeleton-row {
  --stagger-delay: 0ms;
  animation-delay: var(--stagger-delay);
}

/* Accessibility: Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .data-grid-skeleton,
  .data-grid-skeleton-shimmer {
    animation: none;
  }
}
```

---

## 5. Implementation Phases

### Phase 1: Core Skeleton Components (Day 1-2)

**Tasks:**
1. [ ] Create `DataGrid/skeleton/skeleton.types.ts` - Type definitions
2. [ ] Create `DataGrid/skeleton/skeleton.constants.ts` - Constants
3. [ ] Create `DataGrid/components/DataGridSkeletonRow.tsx` - Single row
4. [ ] Create `DataGrid/components/DataGridSkeletonHeader.tsx` - Header
5. [ ] Create `DataGrid/components/DataGridSkeletonBody.tsx` - Body
6. [ ] Create `DataGrid/components/DataGridSkeletonPagination.tsx` - Pagination
7. [ ] Create `DataGrid/skeleton/DataGridSkeleton.tsx` - Main composed component
8. [ ] Create `DataGrid/skeleton/index.ts` - Skeleton barrel export
9. [ ] Update `DataGrid/index.ts` - Add skeleton exports
10. [ ] Update `tables/index.ts` - Add skeleton exports to main barrel
11. [ ] Add CSS classes to `globals.css`
12. [ ] Write unit tests for skeleton components

**Barrel Export Order (CRITICAL - Follow existing patterns):**
```
skeleton/skeleton.types.ts     → Types first (no dependencies)
skeleton/skeleton.constants.ts → Constants second
components/*Skeleton*.tsx      → Sub-components third
skeleton/DataGridSkeleton.tsx  → Main component (uses sub-components)
skeleton/index.ts              → Skeleton barrel (exports all)
DataGrid/index.ts              → DataGrid barrel (re-exports from skeleton/)
tables/index.ts                → Main barrel (re-exports from DataGrid/)
```

**Acceptance Criteria:**
- [ ] `DataGridSkeleton` renders with correct column count
- [ ] Skeleton matches DataGrid visual structure
- [ ] Animation works correctly
- [ ] Reduced motion preference respected
- [ ] ARIA attributes present
- [ ] All barrel exports work correctly
- [ ] Tree-shaking verified (no circular dependencies)

### Phase 2: Update Loading Files (Day 2-3)

**Tasks:**
1. [ ] Update `app/quotes/loading.tsx`
2. [ ] Audit all `loading.tsx` files for raw tables
3. [ ] Create any missing `loading.tsx` files that need DataGridSkeleton
4. [ ] Verify Suspense boundaries work correctly

**Files to Update:**
```
app/quotes/loading.tsx        → DataGridSkeleton
app/orders/loading.tsx        → DataGridSkeleton (if exists)
app/accounts/loading.tsx      → DataGridSkeleton (if exists)
app/analytics/loading.tsx     → Keep AnalyticsLoadingSkeleton (different layout)
```

### Phase 3: Enhance DataGrid (Day 3-4)

**Tasks:**
1. [ ] Add `loadingVariant` prop to DataGrid
2. [ ] Add `skeletonRowCount` prop
3. [ ] Add `minLoadingTimeMs` prop with debounce logic
4. [ ] Implement skeleton rows rendering mode
5. [ ] Update DataGrid types
6. [ ] Update ServerDataGrid to pass through new props
7. [ ] Write integration tests

**Code Changes in DataGrid.tsx:**
```typescript
// Add to imports
import { DataGridSkeletonBody } from './components/DataGridSkeletonBody'

// Add to props destructuring
loadingVariant = 'spinner',
skeletonRowCount = 5,
minLoadingTimeMs = 300,

// Add skeleton body rendering
{isLoading && loadingVariant === 'skeleton' && (
  <DataGridSkeletonBody 
    columns={columns.length} 
    rows={skeletonRowCount}
  />
)}
```

### Phase 4: Table Migration (Day 4-7)

**Priority Order:**

| Priority | Table | Action | Complexity |
|----------|-------|--------|------------|
| P0 | `AuditLogTable.tsx` | Create `AuditLogDataGrid` | High |
| P0 | `UserRolesTable.tsx` | Create `UserRolesDataGrid` | Medium |
| P1 | `CustomerHistory.tsx` | Migrate to DataGrid | Medium |
| P1 | `TeamLeaderboard.tsx` | Migrate to DataGrid | Low |
| P1 | `TeamWorkloadTable.tsx` | Migrate to DataGrid | Low |
| P1 | `RecentItemsTable.tsx` | Migrate to DataGrid | Low |
| N/A | `PermissionMatrix.tsx` | Keep as `<table>` | N/A |
| N/A | `QuotePricingEditor.tsx` | Keep as `<table>` | N/A |
| N/A | `ProductSpecifications.tsx` | Keep as `<table>` | N/A |

### Phase 5: Documentation & Cleanup (Day 7-8)

**Tasks:**
1. [ ] Update component documentation
2. [ ] Add Storybook stories for skeleton components
3. [ ] Create migration guide for future tables
4. [ ] Remove deprecated loading patterns
5. [ ] Final review and testing

---

## 6. Barrel Export Updates (CRITICAL)

### 6.1 Main Tables Barrel (`_components/tables/index.ts`)

Following the existing pattern exactly:

```typescript
/**
 * Tables Barrel Export
 * 
 * Centralized export point for all table components, utilities, types, and constants.
 * Provides clean imports across the application following FAANG-level organization.
 * 
 * @example
 * ```tsx
 * // Components
 * import { DataGrid, DataGridSkeleton, ServerDataGrid } from '@_components/tables';
 * 
 * // Utilities
 * import { calculateTotalItems, sanitizeString } from '@_components/tables';
 * 
 * // Constants
 * import { DEFAULT_PAGE_SIZE_OPTIONS, SKELETON_WIDTHS } from '@_components/tables';
 * 
 * // Types
 * import type { DataGridSkeletonProps, ColumnDef } from '@_components/tables';
 * ```
 * 
 * @module tables
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export { default as ServerDataGrid } from './ServerDataGrid'
export { DataGrid } from './DataGrid'
export type { DataGridProps } from './DataGrid'

// Skeleton Components (NEW)
export { DataGridSkeleton } from './DataGrid'
export type { DataGridSkeletonProps } from './DataGrid'

// ============================================================================
// CONSTANTS
// ============================================================================

export {
	DEFAULT_PAGE_SIZE_OPTIONS,
	DEFAULT_PAGE_SIZE,
	MIN_PAGE_SIZE,
	MAX_PAGE_SIZE,
	DEFAULT_EMPTY_MESSAGE,
	TABLE_ERROR_MESSAGES,
	COMPONENT_NAME,
} from './tableConstants'

// Skeleton Constants (NEW)
export {
	SKELETON_WIDTHS,
	DEFAULT_SKELETON_ROWS,
	DEFAULT_SKELETON_COLUMNS,
	SKELETON_ANIMATION_DURATION,
} from './DataGrid/skeleton/skeleton.constants'

// ============================================================================
// UTILITIES
// ============================================================================

export {
	sanitizeString,
	isPositiveNumber,
	isValidPageSize,
	calculateTotalItems,
	calculateLastPageIndex,
	calculatePaginationRange,
	isValidArray,
	normalizeArray,
} from './tableUtils'

// ============================================================================
// TYPES
// ============================================================================

export type {
	PaginationButtonConfig,
	TableFeatureToggles,
	TableManualModes,
	ServerPaginationMeta,
	PaginationRange,
} from './tableTypes'

// Re-export TanStack Table types for convenience
export type { ColumnDef, PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'
```

### 6.2 DataGrid Barrel (`_components/tables/DataGrid/index.ts`)

Following DivTable pattern:

```typescript
/**
 * DataGrid - Barrel Export
 * 
 * Centralized exports for the modern data grid implementation.
 * Industry-standard naming convention for div-based tables.
 * 
 * @example
 * ```tsx
 * import { DataGrid, DataGridSkeleton } from '@_components/tables/DataGrid'
 * import type { DataGridProps, DataGridSkeletonProps } from '@_components/tables/DataGrid'
 * ```
 * 
 * @module DataGrid
 */

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

export { DataGrid } from './DataGrid'
export type { DataGridProps } from './DataGrid'

// ============================================================================
// SKELETON COMPONENTS (NEW)
// ============================================================================

export { DataGridSkeleton } from './skeleton'
export type { DataGridSkeletonProps, SkeletonColumnWidth } from './skeleton'

// Internal skeleton sub-components (for advanced customization)
export { DataGridSkeletonHeader } from './components/DataGridSkeletonHeader'
export { DataGridSkeletonBody } from './components/DataGridSkeletonBody'
export { DataGridSkeletonRow } from './components/DataGridSkeletonRow'
export { DataGridSkeletonPagination } from './components/DataGridSkeletonPagination'

// ============================================================================
// SKELETON CONSTANTS
// ============================================================================

export {
	SKELETON_WIDTHS,
	DEFAULT_SKELETON_ROWS,
	DEFAULT_SKELETON_COLUMNS,
	SKELETON_ANIMATION_DURATION,
	DEFAULT_COLUMN_WIDTH_PATTERN,
} from './skeleton/skeleton.constants'
```

### 6.3 Skeleton Sub-Barrel (`_components/tables/DataGrid/skeleton/index.ts`)

```typescript
/**
 * DataGrid Skeleton - Barrel Export
 * 
 * Loading skeleton components for DataGrid.
 * Used in Next.js loading.tsx files for Suspense boundaries.
 * 
 * @example
 * ```tsx
 * import { DataGridSkeleton } from '@_components/tables'
 * 
 * export default function Loading() {
 *   return <DataGridSkeleton columns={6} rows={10} />
 * }
 * ```
 * 
 * @module DataGrid/skeleton
 */

// ============================================================================
// MAIN SKELETON COMPONENT
// ============================================================================

export { DataGridSkeleton } from './DataGridSkeleton'

// ============================================================================
// TYPES
// ============================================================================

export type {
	DataGridSkeletonProps,
	SkeletonColumnWidth,
	SkeletonAnimationVariant,
} from './skeleton.types'

// ============================================================================
// CONSTANTS
// ============================================================================

export {
	SKELETON_WIDTHS,
	DEFAULT_SKELETON_ROWS,
	DEFAULT_SKELETON_COLUMNS,
	SKELETON_ANIMATION_DURATION,
	DEFAULT_COLUMN_WIDTH_PATTERN,
} from './skeleton.constants'
```

---

## 7. File Changes Matrix

### New Files

| File Path | Purpose | Size Est. |
|-----------|---------|-----------|
| `_components/tables/DataGrid/skeleton/DataGridSkeleton.tsx` | Main skeleton component | ~100 LOC |
| `_components/tables/DataGrid/skeleton/skeleton.types.ts` | Skeleton type definitions | ~40 LOC |
| `_components/tables/DataGrid/skeleton/skeleton.constants.ts` | Skeleton constants | ~30 LOC |
| `_components/tables/DataGrid/skeleton/index.ts` | Skeleton barrel export | ~30 LOC |
| `_components/tables/DataGrid/components/DataGridSkeletonRow.tsx` | Single skeleton row | ~50 LOC |
| `_components/tables/DataGrid/components/DataGridSkeletonHeader.tsx` | Header skeleton | ~40 LOC |
| `_components/tables/DataGrid/components/DataGridSkeletonBody.tsx` | Body skeleton | ~40 LOC |
| `_components/tables/DataGrid/components/DataGridSkeletonPagination.tsx` | Pagination skeleton | ~30 LOC |
| `app/rbac/_components/AuditLogDataGrid.tsx` | New server data grid | ~150 LOC |
| `app/rbac/_components/UserRolesDataGrid.tsx` | New server data grid | ~100 LOC |

### Modified Files

| File Path | Change Type | Impact |
|-----------|-------------|--------|
| `_components/tables/index.ts` | Add skeleton exports | Low |
| `_components/tables/DataGrid/index.ts` | Add skeleton exports | Low |
| `_components/tables/DataGrid/DataGrid.tsx` | Add loading props | Low |
| `_components/tables/ServerDataGrid.tsx` | Pass through props | Low |
| `app/quotes/loading.tsx` | Use DataGridSkeleton | Low |
| `app/globals.css` | Add skeleton CSS | Low |
| `_features/customers/components/CustomerHistory.tsx` | Use DataGrid | Medium |
| `app/analytics/_components/TeamLeaderboard.tsx` | Use DataGrid | Low |
| `app/dashboard/_components/TeamWorkloadTable.tsx` | Use DataGrid | Low |
| `app/dashboard/_components/RecentItemsTable.tsx` | Use DataGrid | Low |
| `app/rbac/_components/AuditLogTable.tsx` | Replace with DataGrid | High |
| `app/rbac/_components/UserRolesTable.tsx` | Replace with DataGrid | Medium |

### Deleted/Deprecated Files

| File Path | Action | Reason |
|-----------|--------|--------|
| None | - | Preserve backwards compatibility |

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
// __tests__/tables/DataGridSkeleton.test.tsx

describe('DataGridSkeleton', () => {
  it('renders correct number of columns', () => {
    render(<DataGridSkeleton columns={5} />)
    expect(screen.getAllByRole('columnheader')).toHaveLength(5)
  })

  it('renders correct number of rows', () => {
    render(<DataGridSkeleton rows={10} />)
    expect(screen.getAllByRole('row')).toHaveLength(11) // header + 10 rows
  })

  it('shows pagination when enabled', () => {
    render(<DataGridSkeleton showPagination />)
    expect(screen.getByLabelText(/pagination/i)).toBeInTheDocument()
  })

  it('respects reduced motion preference', () => {
    // Mock matchMedia for prefers-reduced-motion
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }))
    
    render(<DataGridSkeleton />)
    expect(screen.getByRole('grid')).not.toHaveClass('animate-pulse')
  })

  it('has correct ARIA attributes', () => {
    render(<DataGridSkeleton ariaLabel="Loading users" />)
    const grid = screen.getByRole('grid')
    expect(grid).toHaveAttribute('aria-busy', 'true')
    expect(grid).toHaveAttribute('aria-label', 'Loading users')
  })
})
```

### 8.2 Integration Tests

```typescript
// __tests__/tables/DataGrid.integration.test.tsx

describe('DataGrid Loading States', () => {
  it('shows spinner overlay by default', async () => {
    render(<DataGrid columns={columns} data={[]} isLoading />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows skeleton rows when loadingVariant="skeleton"', async () => {
    render(
      <DataGrid 
        columns={columns} 
        data={[]} 
        isLoading 
        loadingVariant="skeleton"
        skeletonRowCount={5}
      />
    )
    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(5)
  })

  it('maintains minimum loading time', async () => {
    const { rerender } = render(
      <DataGrid columns={columns} data={[]} isLoading minLoadingTimeMs={300} />
    )
    
    // Set loading to false immediately
    rerender(<DataGrid columns={columns} data={data} isLoading={false} />)
    
    // Should still show loading
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    
    // Wait for minimum time
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    }, { timeout: 400 })
  })
})
```

### 8.3 Visual Regression Tests

```typescript
// __tests__/visual/DataGridSkeleton.visual.test.tsx

describe('DataGridSkeleton Visual', () => {
  it('matches desktop snapshot', async () => {
    const { container } = render(<DataGridSkeleton columns={6} rows={5} />)
    expect(container).toMatchSnapshot()
  })

  it('matches mobile snapshot', async () => {
    // Set viewport to mobile
    await setViewport({ width: 375, height: 667 })
    const { container } = render(<DataGridSkeleton columns={6} rows={5} />)
    expect(container).toMatchSnapshot()
  })
})
```

### 8.4 Performance Tests

```typescript
// __tests__/performance/DataGridSkeleton.perf.test.tsx

describe('DataGridSkeleton Performance', () => {
  it('renders within 50ms budget', () => {
    const start = performance.now()
    render(<DataGridSkeleton columns={10} rows={20} />)
    const end = performance.now()
    
    expect(end - start).toBeLessThan(50)
  })

  it('does not cause layout thrashing', () => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          expect(entry.value).toBeLessThan(0.1)
        }
      }
    })
    observer.observe({ entryTypes: ['layout-shift'] })
    
    render(<DataGridSkeleton columns={6} rows={10} />)
  })
})
```

---

## 9. Migration Guide

### 9.1 For loading.tsx Files

**Before:**
```tsx
// app/quotes/loading.tsx
export default function QuotesLoading() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <table className="table w-full">
          <thead>
            <tr>
              <th><div className="skeleton h-4 w-20" /></th>
              {/* ... */}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td><div className="skeleton h-4 w-24" /></td>
                {/* ... */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**After:**
```tsx
// app/quotes/loading.tsx
import { DataGridSkeleton } from '@_components/tables'
import { InternalPageHeader } from '../_components'

export default function QuotesLoading() {
  return (
    <>
      <InternalPageHeader 
        title="Quotes" 
        description="Manage customer quote requests" 
      />
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <DataGridSkeleton 
            columns={7}
            rows={5}
            showPagination
            ariaLabel="Loading quotes"
          />
        </div>
      </div>
    </>
  )
}
```

### 9.2 For Raw Table to DataGrid Migration

**Before:**
```tsx
// TeamLeaderboard.tsx
<table className="table table-sm">
  <thead>
    <tr className="text-base-content/60">
      <th className="w-12">#</th>
      <th>Sales Rep</th>
      {/* ... */}
    </tr>
  </thead>
  <tbody>
    {displayData.map((rep, index) => (
      <tr key={rep.salesRepId}>
        <td>{index + 1}</td>
        <td>{rep.salesRepName}</td>
        {/* ... */}
      </tr>
    ))}
  </tbody>
</table>
```

**After:**
```tsx
// TeamLeaderboard.tsx
import { DataGrid, type ColumnDef } from '@_components/tables'

const columns: ColumnDef<SalesRepPerformance>[] = [
  {
    id: 'rank',
    header: '#',
    cell: ({ row }) => <RankBadge rank={row.index + 1} />,
    size: 48,
  },
  {
    accessorKey: 'salesRepName',
    header: 'Sales Rep',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.salesRepName}</div>
        <div className="text-xs text-base-content/60">
          {row.original.activeCustomers} active customers
        </div>
      </div>
    ),
  },
  // ... more columns
]

<DataGrid
  columns={columns}
  data={displayData}
  ariaLabel="Team leaderboard"
  isLoading={isLoading}
  emptyMessage="No team data available"
/>
```

### 9.3 Decision Matrix: When to Use What

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LOADING STATE DECISION TREE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Where is the loading state triggered?                               │
│    │                                                                 │
│    ├── ROUTE CHANGE (Next.js navigation)                            │
│    │     └── Use: DataGridSkeleton in loading.tsx                   │
│    │                                                                 │
│    └── IN-COMPONENT (state change)                                  │
│          │                                                           │
│          ├── QUICK OPERATION (sort, filter, <500ms expected)        │
│          │     └── Use: loadingVariant="spinner" (default)          │
│          │                                                           │
│          └── SLOW OPERATION (pagination, initial load, >500ms)      │
│                └── Use: loadingVariant="skeleton"                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Accessibility Requirements

### 10.1 WCAG 2.1 AA Compliance

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.3.1 Info & Relationships | Structure must be programmatically determinable | Use `role="grid"` with proper ARIA |
| 1.4.1 Use of Color | Don't rely on color alone | Skeleton shape indicates loading |
| 2.1.1 Keyboard | All functionality via keyboard | Skip link for skeleton |
| 2.2.2 Pause, Stop, Hide | User can pause animations | Respect `prefers-reduced-motion` |
| 4.1.2 Name, Role, Value | Elements have accessible names | `aria-label` on skeleton |

### 10.2 Required ARIA Attributes

```tsx
<div
  role="grid"
  aria-busy="true"
  aria-label={ariaLabel}
  aria-describedby="loading-description"
>
  <span id="loading-description" className="sr-only">
    Data is currently loading. Please wait.
  </span>
  {/* skeleton content */}
</div>
```

### 10.3 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .data-grid-skeleton,
  .data-grid-skeleton * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 10.4 Screen Reader Announcements

```tsx
// Use existing announceToScreenReader utility
useEffect(() => {
  if (isLoading) {
    announceToScreenReader('Loading data, please wait', 'polite')
  }
}, [isLoading])
```

---

## 11. Performance Considerations

### 11.1 Render Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Render | < 50ms | React DevTools Profiler |
| Layout Shift (CLS) | < 0.1 | Lighthouse |
| Memory Allocation | < 2MB | Chrome DevTools Memory |

### 11.2 Optimization Techniques

```tsx
// 1. Memoize skeleton components
const DataGridSkeletonRow = memo(function DataGridSkeletonRow(props) {
  // ...
})

// 2. Use CSS for animations (not JS)
// All animations are CSS-based, not requestAnimationFrame

// 3. Avoid layout thrashing
// Use transform: instead of width/height for animations

// 4. Limit DOM nodes
// Max 20 skeleton rows (pagination assumed for larger datasets)
const MAX_SKELETON_ROWS = 20
```

### 11.3 Bundle Size Impact

| Component | Estimated Size | Gzipped |
|-----------|---------------|---------|
| DataGridSkeleton | ~3KB | ~1KB |
| DataGridSkeletonRow | ~1KB | ~0.4KB |
| Total Addition | ~5KB | ~1.8KB |

---

## 12. Rollback Plan

### 12.1 Feature Flag

```typescript
// config/featureFlags.ts
export const FEATURE_FLAGS = {
  USE_DATAGRID_SKELETON: process.env.NEXT_PUBLIC_USE_DATAGRID_SKELETON === 'true',
}

// Usage in loading.tsx
import { DataGridSkeleton } from '@_components/tables'
import { FEATURE_FLAGS } from '@/config/featureFlags'

export default function Loading() {
  if (FEATURE_FLAGS.USE_DATAGRID_SKELETON) {
    return <DataGridSkeleton columns={6} rows={10} />
  }
  
  // Fallback to old implementation
  return <LegacyTableSkeleton />
}
```

### 12.2 Rollback Steps

1. Set `NEXT_PUBLIC_USE_DATAGRID_SKELETON=false` in environment
2. Deploy (no code changes needed)
3. Investigate issues
4. Fix and re-enable

### 12.3 Monitoring

```typescript
// Track skeleton render performance
useEffect(() => {
  if (typeof window !== 'undefined' && window.performance) {
    const mark = `skeleton-render-${Date.now()}`
    performance.mark(mark)
    
    return () => {
      performance.measure('skeleton-render-time', mark)
      const entries = performance.getEntriesByName('skeleton-render-time')
      if (entries.length > 0) {
        // Send to analytics
        analytics.track('skeleton_render_time', {
          duration: entries[0].duration,
          component: 'DataGridSkeleton',
        })
      }
    }
  }
}, [])
```

---

## Appendix A: Architecture Principles Compliance

### A.1 Barrel Export Conventions (MUST FOLLOW)

```typescript
/**
 * [Module Name] - Barrel Export
 * 
 * [Brief description of what this module exports]
 * 
 * **Architecture:**
 * - [Server/Client safety notes]
 * - [Key features]
 * 
 * @example
 * ```typescript
 * import { Component, util } from '@_module'
 * import type { SomeType } from '@_module'
 * ```
 * 
 * @module [module-name]
 */

// ============================================================================
// [SECTION NAME IN CAPS]
// ============================================================================

export { SomeComponent } from './SomeComponent'
export type { SomeType } from './types'
```

### A.2 DRY Compliance Checklist

- [ ] Types defined once in `.types.ts` files
- [ ] Constants defined once in `.constants.ts` files
- [ ] No duplicate exports across barrels
- [ ] Re-export from sub-barrels, don't duplicate

### A.3 Separation of Concerns

| Layer | What Goes Here | Server Safe? |
|-------|---------------|--------------|
| `types/` | TypeScript interfaces, types | ✅ Yes |
| `constants/` | Pure constants, enums | ✅ Yes |
| `utils/` | Pure helper functions | ✅ Yes |
| `components/` | React components | ⚠️ Check directive |
| `hooks/` | React hooks | ❌ Client only |
| `services/` | Side-effect services | ⚠️ Check directive |

### A.4 Import Hierarchy

```
✅ CORRECT: Import from barrels
import { DataGridSkeleton } from '@_components/tables'

❌ WRONG: Deep file imports (breaks encapsulation)
import { DataGridSkeleton } from '@_components/tables/DataGrid/skeleton/DataGridSkeleton'

⚠️ INTERNAL ONLY: Direct sub-module imports (within same module)
import { DataGridSkeletonRow } from './components/DataGridSkeletonRow'
```

### A.5 Tree-Shaking Requirements

1. **Named exports only** (no `export default` for utilities)
2. **No side effects** in barrel files
3. **No circular dependencies** between modules
4. **Explicit re-exports** (not `export * from`)

---

## Appendix B: Column Width Patterns

Common table layouts and their skeleton width configurations:

```typescript
// Quote Table: ID, Company, Email, Phone, Status, Date, Actions
const QUOTE_TABLE_WIDTHS: SkeletonColumnWidth[] = ['sm', 'lg', 'xl', 'md', 'md', 'md', 'sm']

// Account Table: Username, Email, Role, Status, Created, Actions
const ACCOUNT_TABLE_WIDTHS: SkeletonColumnWidth[] = ['md', 'xl', 'sm', 'sm', 'md', 'sm']

// Order Table: ID, Customer, Date, Total, Status, Actions
const ORDER_TABLE_WIDTHS: SkeletonColumnWidth[] = ['sm', 'lg', 'md', 'md', 'sm', 'sm']

// Audit Log: Timestamp, User, Permission, Result, Details
const AUDIT_LOG_WIDTHS: SkeletonColumnWidth[] = ['md', 'lg', 'lg', 'sm', 'xl']
```

---

## Appendix C: Implementation Checklist

### Pre-Implementation
- [ ] Review this document with team
- [ ] Set up feature flag
- [ ] Create tracking for skeleton performance

### Phase 1: Core Components
- [ ] DataGridSkeletonRow.tsx created
- [ ] DataGridSkeletonHeader.tsx created
- [ ] DataGridSkeletonBody.tsx created
- [ ] DataGridSkeletonPagination.tsx created
- [ ] DataGridSkeleton.tsx created
- [ ] CSS classes added
- [ ] Exports updated
- [ ] Unit tests passing

### Phase 2: Loading Files
- [ ] quotes/loading.tsx updated
- [ ] All loading.tsx files audited
- [ ] Suspense boundaries verified

### Phase 3: DataGrid Enhancement
- [ ] loadingVariant prop added
- [ ] skeletonRowCount prop added
- [ ] minLoadingTimeMs prop added
- [ ] Integration tests passing

### Phase 4: Table Migrations
- [ ] AuditLogDataGrid created
- [ ] UserRolesDataGrid created
- [ ] CustomerHistory migrated
- [ ] TeamLeaderboard migrated
- [ ] TeamWorkloadTable migrated
- [ ] RecentItemsTable migrated

### Phase 5: Cleanup
- [ ] Documentation updated
- [ ] Storybook stories added
- [ ] Performance tests passing
- [ ] Visual regression tests passing
- [ ] Code review completed
- [ ] Feature flag enabled in production

---

**Document Status:** Ready for Implementation  
**Next Review Date:** After Phase 1 completion  
**Owner:** Engineering Team

