<!-- 49e57398-e8b3-43fe-a51c-8b38f2981665 f2160cd9-a715-4e5e-aba9-1247ee7ff916 -->
# MedSource Pro Frontend Modernization Plan

## Project Analysis

### Current State (MedSource Pro)

- **Framework**: Next.js 14.1.1, React 18, TypeScript 5
- **State Management**: Zustand 4.5.2 (cart + user)
- **Styling**: Custom CSS (29 separate files) + Tailwind 3.3.0
- **Forms**: Formik 2.4.5 + Yup 1.4.0
- **Tables**: Custom client/server-side components with manual pagination
- **Navigation**: Custom navbar + sidebar (separate `/medsource-app` route for auth)
- **Purpose**: Medical B2B marketplace for orders, quotes, providers, accounts, customers, and analytics
- **Color Scheme**: Green/teal brand (#416706, #4d7a07, #355405, #2a4204, #1e2f03, #06614a, #055541)

### Target State (Church of God Best Practices)

- **Framework**: Next.js 15.5.6, React 19.1.0, TypeScript 5
- **State Management**: Zustand 5.0.8 (unified UserSettingsStore pattern)
- **Styling**: Tailwind 4.x + DaisyUI 5.3.7 (mobile-first, minimal custom CSS)
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table v8 (industry standard, server-side pagination support)
- **Navigation**: Navbar + conditional Sidebar (visible only when authenticated)
- **Patterns**: PageLayout, Modal system, centralized services, protected routes

### Key Differences & Migration Strategy

1. **Authentication Flow**: Move from `/medsource-app` route pattern to home page with conditional sidebar
2. **Protected Routes**: Implement middleware-based route protection (industry standard)
3. **CSS Architecture**: Consolidate 29 CSS files into Tailwind-first approach with minimal custom CSS
4. **Component Quality**: Refactor complex components (tables, forms) to be DRY, scalable, and type-safe
5. **Theme System**: Create "MedSource Classic" DaisyUI theme matching existing brand colors

---

## Phase 1: Foundation Setup

### 1.1 Dependency Updates

**Files to update**: `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`

**Dependencies to upgrade**:

```json
{
  "next": "15.5.6",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "zustand": "^5.0.8",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "daisyui": "^5.3.7"
}
```

**Dependencies to add**:

```json
{
  "react-hook-form": "^7.53.2",
  "zod": "^3.23.8",
  "@hookform/resolvers": "^3.9.1",
  "@tanstack/react-table": "^8.20.5",
  "lucide-react": "^0.552.0"
}
```

**Dependencies to remove**:

```json
{
  "formik": "^2.4.5",
  "react-date-picker": "^11.0.0",
  "@fortawesome/fontawesome-free": "^6.5.1"
}
```

**Next.js config updates**:

- Enable Turbopack: `--turbopack` flag in dev/build scripts
- Update `next.config.mjs` to TypeScript: `next.config.ts`

**Tailwind config migration**:

- Migrate from Tailwind 3 config format to Tailwind 4 CSS-based config
- Update `postcss.config.js` → `postcss.config.mjs` with `@tailwindcss/postcss`

**TypeScript updates**:

- Update target from `ES2015` to `ES2022`
- Update path aliases to match Church of God pattern (underscore prefix)

### 1.2 DaisyUI "MedSource Classic" Theme

**Files to create/update**: `client/app/globals.css`, `tailwind.config.ts` (or CSS-based config)

**MedSource Classic Theme Mapping**:

```css
@plugin 'daisyui' {
  themes: medsource-classic --default, winter, luxury;
}

/* MedSource Classic Theme Variables */
[data-theme="medsource-classic"] {
  /* Primary: Brand green */
  --color-primary: #416706;
  --color-primary-content: #ffffff;
  
  /* Secondary: Darker brand green */
  --color-secondary: #2a4204;
  --color-secondary-content: #ffffff;
  
  /* Accent: Teal */
  --color-accent: #06614a;
  --color-accent-content: #ffffff;
  
  /* Neutral: Dark slate for text */
  --color-neutral: #393939;
  --color-neutral-content: #ffffff;
  
  /* Base colors */
  --color-base-100: #fcfff7; /* --bg-color */
  --color-base-200: #f8f8f8; /* --section-bg-color */
  --color-base-300: #d8d8d8; /* --light-gray */
  --color-base-content: #393939; /* --black-text-color */
  
  /* Semantic colors */
  --color-info: #00008b; /* --link-color */
  --color-success: #4d7a07;
  --color-warning: #ffcc00;
  --color-error: #d22b2b;
  
  /* Custom brand colors (accessible via CSS vars) */
  --brand-color-1: #416706;
  --brand-color-2: #4d7a07;
  --brand-color-3: #355405;
  --brand-color-4: #2a4204;
  --brand-color-5: #1e2f03;
  --teal: #06614a;
  --darker-teal: #055541;
}
```

### 1.3 Project Restructure

**Directory structure changes**:

```
client/
├── app/
│   ├── _classes/          # NEW: Type definitions (move from src/classes)
│   ├── _components/       # NEW: React components (move from src/components)
│   │   ├── auth/         # NEW: Auth-related components
│   │   ├── common/       # NEW: Shared components
│   │   ├── forms/        # NEW: Form components (React Hook Form)
│   │   ├── layouts/      # NEW: Layout components
│   │   ├── navigation/   # NEW: Navigation components
│   │   ├── tables/       # NEW: Table components (TanStack)
│   │   └── ui/           # NEW: UI primitives (Button, Input, Modal, etc.)
│   ├── _hooks/           # NEW: Custom React hooks
│   ├── _services/        # NEW: Business logic services (move from src/services)
│   ├── _stores/          # NEW: Zustand stores (move from src/stores)
│   ├── _types/           # NEW: TypeScript types (move from src/types)
│   ├── _utils/           # NEW: Utility functions
│   ├── (auth)/           # NEW: Route group for auth pages (login/signup)
│   ├── (protected)/      # NEW: Route group for protected routes
│   │   ├── accounts/
│   │   ├── analytics/
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── profile/
│   │   ├── providers/
│   │   └── quotes/
│   └── middleware.ts     # NEW: Route protection middleware
```

**Rationale**:

- Underscore prefix for app-level folders (Church of God pattern)
- Route groups for auth and protected routes (Next.js 13+ best practice)
- Consolidate logic into services layer
- Clear separation of concerns

---

## Phase 2: Core Infrastructure

### 2.1 Authentication & Route Protection

**Files to create**:

- `client/app/middleware.ts` - Route protection middleware
- `client/app/_services/AuthService.ts` - Auth logic centralization
- `client/app/_stores/useAuthStore.ts` - Unified auth store (replace user.ts)

**Authentication flow changes**:

**BEFORE (Current)**:

```
User not logged in → redirected to /login
User logs in → redirected to /medsource-app
/medsource-app/* routes have layout with auth check
```

**AFTER (Target)**:

```
User not logged in → Home page without sidebar
User logs in → Home page WITH sidebar visible
Protected routes (accounts, analytics, etc.) → Check auth in middleware
Middleware redirects to /login if not authenticated
```

**Implementation**:

`middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected route patterns
const protectedRoutes = [
  '/accounts',
  '/analytics', 
  '/customers',
  '/orders',
  '/profile',
  '/providers',
  '/quotes'
]

export function middleware(request: NextRequest) {
  const token = request.cookies.get('at')
  const { pathname } = request.nextUrl
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

`useAuthStore.ts`:

```typescript
import { create } from 'zustand'
import { IUser } from '@_classes/User'

interface AuthStore {
  user: IUser | null
  isAuthenticated: boolean
  isLoading: boolean
  
  setUser: (user: IUser) => void
  clearUser: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  
  checkAuth: async () => {
    // Server-side auth check logic here
    // Called on app initialization
  }
}))
```

### 2.2 Navigation System (Church of God Pattern)

**Files to create**:

- `client/app/_components/navigation/Navbar.tsx` - Top navbar (always visible)
- `client/app/_components/navigation/Sidebar.tsx` - Conditional sidebar
- `client/app/_components/navigation/NavigationLayout.tsx` - Root layout wrapper
- `client/app/_services/NavigationService.ts` - Navigation configuration

**Key differences from Church of God**:

1. Sidebar visibility controlled by `isAuthenticated` state
2. Navigation sections based on user role (Admin vs Customer)
3. Medical-specific icons using Lucide React

**Navbar features**:

- Logo (left)
- Search bar (center) - responsive
- Cart icon with badge
- User profile/Login button (right)
- Burger menu to open sidebar

**Sidebar features**:

- Only visible when authenticated
- Filtered routes based on user role
- Collapsible sections (Dashboard, Orders, Admin Tools, etc.)
- Settings button in footer
- Logout option

**NavigationLayout** (wraps all pages):

```tsx
'use client'

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  
  return (
    <>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      {isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <main className="min-h-screen">
        {children}
      </main>
    </>
  )
}
```

### 2.3 Layout System

**Files to create**:

- `client/app/_components/layouts/PageLayout.tsx` - Server Component wrapper
- `client/app/_components/layouts/ClientPageLayout.tsx` - Client Component wrapper
- `client/app/_components/layouts/PageContainer.tsx` - Shared container
- `client/app/_components/layouts/types.ts` - Layout prop types

**PageLayout features** (from Church of God):

- Consistent container width: `container mx-auto p-4 md:p-8`
- Optional page header (title + description)
- Mobile-first padding
- Ultra-wide screen support (max-width: 100rem)

**Usage pattern**:

```tsx
// Server Component page
export default async function OrdersPage() {
  return (
    <PageLayout title="Orders" description="Manage your orders">
      <OrdersTable />
    </PageLayout>
  )
}
```

### 2.4 UserSettings Store (Centralized Preferences)

**Files to create**:

- `client/app/_stores/useUserSettingsStore.ts` - Unified settings store
- `client/app/_services/UserSettingsService.ts` - Settings persistence
- `client/app/_services/ThemeService.ts` - Theme management
- `client/app/_components/common/UserSettingsInitializer.tsx` - Init component

**Store slices**:

- Theme slice (medsource-classic, winter, luxury)
- User preferences (table page size, default views, etc.)
- Cart state (migrate from separate store)

**Industry best practices** (from Church of God):

- Single localStorage key: `user-settings`
- Versioned schema for migrations
- Type-safe interfaces
- Unified persistence layer

---

## Phase 3: Form Migration (Formik → React Hook Form + Zod)

### 3.1 Form Infrastructure

**Files to create**:

- `client/app/_utils/validation-schemas.ts` - Zod schemas (migrate from Yup)
- `client/app/_components/forms/FormInput.tsx` - RHF input wrapper
- `client/app/_components/forms/FormSelect.tsx` - RHF select wrapper
- `client/app/_components/forms/FormTextArea.tsx` - RHF textarea wrapper
- `client/app/_components/forms/FormCheckbox.tsx` - RHF checkbox wrapper
- `client/app/_hooks/useZodForm.ts` - Custom RHF + Zod hook

**Migration strategy**:

**BEFORE (Formik + Yup)**:

```tsx
<Formik
  initialValues={{ email: '', password: '' }}
  validationSchema={Validations.loginSchema}
  onSubmit={handleSubmit}
>
  <Form>
    <FormInputTextbox name="email" label="Email" />
    <FormInputTextbox name="password" label="Password" type="password" />
  </Form>
</Formik>
```

**AFTER (React Hook Form + Zod)**:

```tsx
const form = useZodForm({
  schema: loginSchema,
  defaultValues: { email: '', password: '' }
})

<form onSubmit={form.handleSubmit(handleSubmit)}>
  <FormInput {...form.register('email')} label="Email" error={form.formState.errors.email} />
  <FormInput {...form.register('password')} label="Password" type="password" />
</form>
```

**Zod schema example** (migrate from Yup):

```typescript
// BEFORE (Yup)
yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required()
})

// AFTER (Zod)
z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})
```

### 3.2 Form Component Migration

**Forms to migrate** (priority order):

1. `login/page.tsx` - Login form
2. `signup/page.tsx` - Signup form  
3. `profile/page.tsx` - Profile update form
4. `AddEditUser.tsx` - User CRUD form
5. `UpdateAccountForm.tsx` - Account update
6. `UpdateCustomerForm.tsx` - Customer update
7. `UpdateProviderForm.tsx` - Provider update
8. Store product forms

**Migration checklist per form**:

- [ ] Create Zod schema for validation
- [ ] Replace Formik with useForm hook
- [ ] Update form inputs to RHF pattern
- [ ] Update error handling
- [ ] Test form submission
- [ ] Test validation messages
- [ ] Remove old Formik imports

### 3.3 Input Component Refactor

**Files to refactor/replace**:

- `FormInputTextbox.tsx` → `forms/FormInput.tsx`
- `FormDropdown.tsx` → `forms/FormSelect.tsx`
- `InputTextBox.tsx` → `ui/Input.tsx` (DaisyUI-based)
- `InputDropdown.tsx` → `ui/Select.tsx` (DaisyUI-based)
- `InputCheckbox.tsx` → `ui/Checkbox.tsx` (DaisyUI-based)

**New component features**:

- DaisyUI classes for styling
- React Hook Form integration
- Proper TypeScript types
- Error message display
- Accessible by default (ARIA labels)
- Mobile-friendly (44px touch targets)

---

## Phase 4: Table System (TanStack Table v8)

### 4.1 TanStack Table Setup

**Files to create**:

- `client/app/_components/tables/DataTable.tsx` - Generic table component
- `client/app/_components/tables/ServerDataTable.tsx` - Server-side pagination
- `client/app/_components/tables/columns.tsx` - Column definitions helper
- `client/app/_hooks/useTableQuery.ts` - Server-side data fetching hook

**Why TanStack Table for MedSource**:

- ✅ Full server-side pagination support (`manualPagination: true`)
- ✅ Built-in sorting, filtering, column visibility
- ✅ Excellent TypeScript support
- ✅ Lightweight and performant
- ✅ Industry standard (used by major companies)
- ✅ Headless UI (works with any styling approach)

**Implementation approach**:

**Server-side pagination pattern**:

```typescript
// useTableQuery.ts
export function useServerTableQuery<T>(
  endpoint: string,
  initialPageSize = 10
) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize })
  const [sorting, setSorting] = useState<SortingState>([])
  
  const { data, isLoading } = useQuery({
    queryKey: ['table', endpoint, pagination, sorting],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        pageSize: String(pagination.pageSize),
        sortBy: sorting[0]?.id || '',
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
      })
      
      const res = await fetch(`${endpoint}?${params}`)
      return res.json()
    }
  })
  
  return { data, isLoading, pagination, setPagination, sorting, setSorting }
}
```

**DataTable component**:

```tsx
export function ServerDataTable<T>({
  columns,
  endpoint,
  pageSize = 10
}: ServerDataTableProps<T>) {
  const { data, pagination, setPagination, sorting, setSorting } = useServerTableQuery<T>(endpoint, pageSize)
  
  const table = useReactTable({
    data: data?.data || [],
    columns,
    pageCount: Math.ceil((data?.total || 0) / pagination.pageSize),
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel()
  })
  
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        {/* Table implementation */}
      </table>
    </div>
  )
}
```

### 4.2 Table Migration

**Tables to migrate**:

1. `ServerTable.tsx` → `ServerDataTable.tsx` (orders, customers, providers, accounts)
2. `table.tsx` → `DataTable.tsx` (client-side tables)
3. `WealthyTable.tsx` → Analyze if needed, migrate or remove

**Column definition pattern**:

```typescript
// Example: Orders table columns
export const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ row }) => <Link href={`/orders/${row.original.id}`}>{row.original.id}</Link>
  },
  {
    accessorKey: 'customer.name',
    header: 'Customer'
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.original.total)
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  }
]
```

### 4.3 Pagination Component Update

**File to refactor**: `common/pagination.tsx`

Update to work with TanStack Table's pagination API:

- Use `table.getPageCount()` instead of manual calculation
- Use `table.setPageIndex()` for navigation
- Add page size selector
- Mobile-responsive design

---

## Phase 5: CSS Consolidation & Mobile-First

### 5.1 CSS Migration Strategy

**Current state**: 29 separate CSS files with heavy custom styling

**Target state**: Tailwind-first with minimal custom CSS

**Analysis** (which CSS to keep vs migrate):

**MIGRATE TO TAILWIND** (eliminate files):

1. ✅ `navigations.css` → Navbar/Sidebar components with Tailwind
2. ✅ `components.css` → Component-specific Tailwind classes
3. ✅ `forms.css` → DaisyUI form components
4. ✅ `inputcomponents.css` → DaisyUI input classes
5. ✅ `common.css` → Global Tailwind utilities
6. ✅ `pages/*.css` → Page-specific Tailwind in components
7. ✅ `InfiniteScroll.css` → Use library or Tailwind

**KEEP AS CUSTOM CSS** (convert to modules):

1. 🔄 `animations.css` → Keep for complex animations (flip, slide, etc.)
2. 🔄 `tables.css` → Partial migration (complex table styles)
3. 🔄 `Landing.css` → Landing page specific animations/effects
4. 🔄 `store.css` → E-commerce specific styles
5. 🔄 `fonts.css` → Font declarations (or migrate to next/font)

**DECISION CRITERIA**:

- If achievable with Tailwind utilities → MIGRATE
- If requires complex CSS that's hard to read in Tailwind → KEEP AS MODULE
- If used in multiple places and complex → CREATE REUSABLE COMPONENT

### 5.2 Global CSS Refactor

**File**: `client/app/globals.css`

**Migrate from** (current):

```css
/* 500+ lines of custom CSS with :root variables */
@import '@/styles/components.css';
@import '@/styles/navigations.css';
/* ... 10+ imports */
```

**Migrate to** (Church of God pattern):

```css
@import 'tailwindcss';

@plugin 'daisyui' {
  themes: medsource-classic --default, winter, luxury;
}

/* MedSource Classic theme variables */
[data-theme="medsource-classic"] {
  /* Theme colors */
}

/* Minimal custom utilities */
body {
  font-family: var(--font-sans);
  overflow-x: hidden;
}

/* Only keep critical custom CSS */
@keyframes medicalPulse { /* ... */ }
```

### 5.3 Mobile-First Implementation

**Tailwind breakpoints** (mobile-first):

- Base (default): Mobile styles (< 640px)
- `sm:` - Small devices (≥ 640px)
- `md:` - Medium devices (≥ 768px)
- `lg:` - Large devices (≥ 1024px)
- `xl:` - Extra large (≥ 1280px)
- `2xl:` - 2X extra large (≥ 1536px)

**Pattern to follow** (from Church of God):

```tsx
// ❌ WRONG (desktop-first)
<div className="flex-row md:flex-col">

// ✅ CORRECT (mobile-first)
<div className="flex-col md:flex-row">

// Example: Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl">

// Example: Responsive spacing
<div className="gap-4 md:gap-8">

// Example: Responsive visibility
<div className="hidden md:block">

// Example: Responsive width
<button className="w-full sm:w-auto">
```

**Apply to all components**:

- Navbar: Burger menu (mobile) → Full links (desktop)
- Sidebar: Overlay (mobile) → Persistent (desktop option)
- Tables: Horizontal scroll (mobile) → Full width (desktop)
- Forms: Full-width inputs (mobile) → Constrained (desktop)
- Cards: Stacked (mobile) → Grid (desktop)

### 5.4 Component-Specific CSS Modules

**When to use CSS Modules**:

- Complex animations not achievable with Tailwind
- Medical/e-commerce specific visualizations (product cards, order timelines)
- Heavy reuse of complex style patterns

**Example**:

```css
/* OrderTimeline.module.css */
.timeline {
  @apply relative pl-8;
}

.timeline::before {
  content: '';
  @apply absolute left-0 top-0 bottom-0 w-0.5 bg-primary;
}

/* Complex animation that's hard in Tailwind */
.timelineItem {
  animation: slideInFromLeft 0.3s ease-out forwards;
}

@keyframes slideInFromLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
```

---

## Phase 6: UI Components (DaisyUI-based)

### 6.1 Core UI Primitives

**Files to create** (inspired by Church of God):

- `ui/Button.tsx` - Primary/secondary/ghost variants, all sizes
- `ui/Input.tsx` - Text/email/password/number inputs
- `ui/Select.tsx` - Dropdown selects
- `ui/Checkbox.tsx` - Checkbox with label
- `ui/Modal.tsx` - Accessible modal dialog
- `ui/Badge.tsx` - Status badges (order status, user roles)
- `ui/Card.tsx` - Content cards
- `ui/Dropdown.tsx` - Dropdown menu component

**Design principles**:

- Mobile-first responsive
- Theme-aware (uses DaisyUI CSS variables)
- Accessible by default (ARIA labels, keyboard nav)
- TypeScript prop types
- Touch-friendly (44px minimum touch targets)

**Button component example**:

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: ReactNode
  // ... other props
}

export function Button({ variant = 'primary', size = 'md', fullWidth, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'w-full sm:w-auto'
      )}
      {...props}
    >
      {props.children}
    </button>
  )
}
```

### 6.2 Modal System

**Files to create**:

- `ui/Modal.tsx` - Base modal component (from Church of God)
- `common/ConfirmDialog.tsx` - Confirmation dialog
- `common/AlertDialog.tsx` - Alert/notification dialog

**Modal features** (from Church of God):

- Focus trap and restoration
- Escape key to close
- Overlay click to close (optional)
- Body scroll lock
- Size variants (sm, md, lg, xl, full)
- Smooth animations (scale + opacity)
- Accessible (ARIA attributes)

**Replace existing modals**:

- Migrate all ad-hoc modal implementations to unified Modal component
- Consistent UX across all dialogs

### 6.3 Medical-Specific Components

**Files to create**:

- `common/OrderStatusBadge.tsx` - Order status indicator
- `common/RoleBadge.tsx` - User role indicator
- `common/PricingCard.tsx` - Product/quote pricing display
- `common/DateRangePicker.tsx` - Date selection (replace react-date-picker)
- `common/FileUploader.tsx` - File upload with preview

**Design considerations**:

- Medical/professional aesthetic
- Clear information hierarchy
- Accessible color contrasts
- Mobile-friendly interactions

---

## Phase 7: Final Integration & Cleanup

### 7.1 Root Layout Update

**File**: `client/app/layout.tsx`

**Migrate from**:

```tsx
// Current: Shows Header conditionally, wraps in DropdownProvider
export default async function RootLayout({ children }) {
  // Server-side user fetch
  return (
    <html lang='en'>
      <body>
        <WrapperHandlerPublic User={response?.payload} />
        <Header />
        <DropdownProvider>
          <main>{children}</main>
          <ToastContainer />
        </DropdownProvider>
      </body>
    </html>
  )
}
```

**Migrate to** (Church of God pattern + auth):

```tsx
import { Geist, Geist_Mono } from 'next/font/google'
import NavigationLayout from '@_components/navigation/NavigationLayout'
import UserSettingsInitializer from '@_components/common/UserSettingsInitializer'
import AuthInitializer from '@_components/common/AuthInitializer'
import { themeInitScript } from '@_scripts/theme-init-inline'

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Script id='theme-init' strategy='beforeInteractive' 
          dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <UserSettingsInitializer />
        <AuthInitializer />
        <NavigationLayout>
          {children}
        </NavigationLayout>
      </body>
    </html>
  )
}
```

**Key changes**:

- Remove conditional Header logic (NavigationLayout handles it)
- Add theme init script (prevent FOUC)
- Add UserSettingsInitializer (loads theme/preferences)
- Add AuthInitializer (checks auth status on mount)
- NavigationLayout wraps everything (Navbar always visible, Sidebar conditional)

### 7.2 Protected Routes Structure

**Route organization**:

```
app/
├── (public)/              # Public routes
│   ├── page.tsx          # Home page
│   ├── about-us/
│   ├── contact/
│   └── store/
├── (auth)/               # Auth routes (redirect if authenticated)
│   ├── login/
│   └── signup/
└── (protected)/          # Protected routes (require auth)
    ├── accounts/
    ├── analytics/
    ├── customers/
    ├── orders/
    ├── profile/
    ├── providers/
    └── quotes/
```

**Middleware handles**:

- Redirect unauthenticated users from `(protected)` → `/login`
- Redirect authenticated users from `(auth)` → `/` (home)

### 7.3 File Cleanup

**Files to DELETE** (after migration):

```
client/src/                        # DELETE entire folder after migration
client/app/medsource-app/          # DELETE after moving routes
client/src/styles/                 # DELETE individual CSS files after consolidation
client/src/context/DropdownProvider.tsx  # DELETE if no longer needed
client/src/components/WrapperHandler*.tsx  # DELETE (replaced by initializers)
```

**CSS files to DELETE**:

- All 29 CSS files in `src/styles/` after migration to Tailwind
- Keep only `animations.css` as module if complex animations remain

**Component files to DELETE/REPLACE**:

- `FormInputTextbox.tsx` → replaced by `forms/FormInput.tsx`
- `FormDropdown.tsx` → replaced by `forms/FormSelect.tsx`
- All `Input*.tsx` components → replaced by `ui/` components
- `Header.tsx` → replaced by NavigationLayout
- `table.tsx` → replaced by DataTable
- `ServerTable.tsx` → replaced by ServerDataTable

### 7.4 Testing & Validation

**Testing checklist**:

- [ ] All forms submit correctly with validation
- [ ] All tables load and paginate correctly
- [ ] Authentication flow works (login, logout, protected routes)
- [ ] Sidebar shows/hides based on auth state
- [ ] Navigation works on mobile and desktop
- [ ] Theme switching works correctly
- [ ] All pages responsive (test on mobile, tablet, desktop)
- [ ] No console errors or warnings
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader compatibility
- [ ] Performance: no unnecessary re-renders
- [ ] TypeScript: no type errors

**Browser testing**:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### 7.5 Documentation

**Files to create/update**:

- `client/README.md` - Updated setup instructions
- `client/ARCHITECTURE.md` - Architecture overview (NEW)
- `client/COMPONENTS.md` - Component usage guide (NEW)
- `client/MIGRATION_NOTES.md` - Notes from migration (NEW)

**Documentation should cover**:

- Project structure
- Component patterns
- Form handling with React Hook Form + Zod
- Table usage with TanStack Table
- Authentication flow
- Theme system
- Development guidelines
- Common patterns and anti-patterns

---

## Implementation Order & Estimates

**Phase 1: Foundation** (2-3 days)

1. Dependency updates
2. DaisyUI theme creation
3. Directory restructure

**Phase 2: Core Infrastructure** (3-4 days)

1. Auth store and middleware
2. Navigation system (Navbar + Sidebar)
3. Layout system
4. UserSettings store

**Phase 3: Form Migration** (4-5 days)

1. Form infrastructure (RHF + Zod)
2. Input components
3. Migrate all forms (8+ forms)

**Phase 4: Table System** (3-4 days)

1. TanStack Table setup
2. DataTable and ServerDataTable components
3. Migrate all tables (5+ tables)

**Phase 5: CSS Consolidation** (3-4 days)

1. CSS analysis and planning
2. Migrate to Tailwind
3. Create CSS modules for complex styles
4. Mobile-first refactor

**Phase 6: UI Components** (2-3 days)

1. Core UI primitives
2. Modal system
3. Medical-specific components

**Phase 7: Integration** (2-3 days)

1. Root layout update
2. Route restructure
3. File cleanup
4. Testing and validation
5. Documentation

**Total estimated time**: 19-26 days

---

## Success Criteria

### Technical Metrics

- ✅ All dependencies updated to latest stable versions
- ✅ 90%+ reduction in custom CSS (29 files → ~3 files)
- ✅ Zero TypeScript errors
- ✅ Zero console warnings in development
- ✅ Lighthouse score: 90+ (Performance, Accessibility, Best Practices, SEO)
- ✅ Bundle size reduction: 20%+ smaller main bundle

### Functional Requirements

- ✅ All existing features work correctly
- ✅ Authentication flow seamless (no user disruption)
- ✅ All forms validate correctly
- ✅ All tables paginate and sort correctly
- ✅ Responsive on all device sizes
- ✅ Theme switching works
- ✅ Protected routes enforce authentication

### Code Quality

- ✅ DRY principles followed (no code duplication)
- ✅ Consistent component patterns
- ✅ Proper TypeScript types throughout
- ✅ Accessible components (WCAG 2.1 compliant)
- ✅ Mobile-first design implemented
- ✅ Clean, readable code

### User Experience

- ✅ No visual regressions
- ✅ Faster load times
- ✅ Smoother interactions
- ✅ Better mobile experience
- ✅ Consistent design language

---

## Risk Mitigation

### Potential Risks

1. **Breaking Changes in Next.js 15**

   - Mitigation: Follow official migration guide, test thoroughly
   - Fallback: Keep feature flags for gradual rollout

2. **Form Migration Bugs**

   - Mitigation: Migrate one form at a time, test each
   - Fallback: Keep Formik temporarily for complex forms

3. **CSS Migration Visual Regressions**

   - Mitigation: Screenshot comparison tool (Percy, Chromatic)
   - Fallback: Keep old CSS as fallback, gradual migration

4. **Table Performance Issues**

   - Mitigation: Load testing with large datasets
   - Fallback: Optimize with virtualization if needed

5. **Authentication Flow Issues**

   - Mitigation: Extensive testing, gradual rollout
   - Fallback: Feature flag to revert to old auth pattern

### Rollback Strategy

- Keep old code in separate branch
- Use feature flags for major changes
- Deploy to staging first, validate thoroughly
- Gradual rollout to production (10% → 50% → 100%)

---

## Post-Migration Optimization

### Future Enhancements (Post-MVP)

1. **Internationalization** (i18n)

   - Add multi-language support using Church of God pattern
   - Translation files for English, Spanish

2. **Advanced Theme System**

   - User-customizable theme colors
   - Dark mode (Luxury theme)
   - High contrast mode (accessibility)

3. **Performance Optimizations**

   - Image optimization (next/image)
   - Code splitting and lazy loading
   - React Server Components where applicable

4. **Advanced Table Features**

   - Column resizing
   - Column reordering
   - Advanced filtering
   - Export to CSV/Excel

5. **Real-time Features**

   - WebSocket integration for live order updates
   - Real-time notifications
   - Live chat support

6. **Analytics & Monitoring**

   - Error tracking (Sentry)
   - Performance monitoring (Vercel Analytics)
   - User analytics (Posthog, Mixpanel)

---

## Conclusion

This migration plan transforms MedSource Pro from an outdated, CSS-heavy codebase into a modern, maintainable, and scalable application following industry best practices. By leveraging the Church of God project's architecture while adapting it for MedSource's medical marketplace needs, we achieve:

- **Better Developer Experience**: Modern tooling, type safety, clear patterns
- **Better User Experience**: Faster, more responsive, mobile-friendly
- **Better Maintainability**: DRY code, consistent patterns, clear structure
- **Better Scalability**: Modular architecture, reusable components, efficient state management

The phased approach allows for incremental progress with validation at each step, minimizing risk while maximizing value delivery.

## Backend Compatibility Analysis

### Current Backend Architecture (ASP.NET Core)

**API Structure**:
- Base URL: `/api` (configured via `UsePathBase` in Program.cs)
- Response Format: `IResponse<T>` with `StatusCode`, `Message`, `Payload`, optional `MetaData`
- Authentication: JWT Bearer tokens stored in cookie `at`, sent as `Authorization: Bearer {token}`
- Pagination: `PagedResult<T>` with `Page`, `PageSize`, `Total`, `Data`, `TotalPages`, `HasNext`, `HasPrevious`
- Search: `GenericSearchFilter` with `Page`, `PageSize`, `SortBy`, `SortOrder`, `Filters` (Dictionary), `Includes` (List)

**API Endpoints** (verified compatibility):
- `/account/login` - POST (AllowAnonymous)
- `/account/signup` - POST (AllowAnonymous)
- `/account/{id?}` - GET (Authorize)
- `/account/search` - POST (Authorize) - Returns `PagedResult<Account>`
- `/account/analytics` - GET (Authorize) - Returns `CustomerSummary`
- `/orders/search` - POST (Authorize) - Returns `PagedResult<Order>`
- `/quote/search` - POST (Authorize) - Returns `PagedResult<Quote>`
- `/customers/search` - POST (Authorize) - Returns `PagedResult<Company>`
- `/Products/search` - POST (Authorize) - Returns `PagedResult<Product>`

**Frontend-Backend Compatibility**:
- ✅ Response structure matches: `{ payload, message, statusCode }`
- ✅ Pagination structure matches: Frontend `PagedResult<T>` aligns with backend `PagedResult<T>`
- ✅ Search filter structure matches: Frontend `GenericSearchFilter` aligns with backend
- ✅ Authentication flow compatible: Cookie-based token storage works with middleware
- ✅ API service layer (`src/services/api.ts`) correctly maps to backend endpoints
- ✅ HTTP interceptor correctly adds Bearer token from cookie

**Important Notes for Migration**:
1. **Pagination**: Backend uses 1-based page indexing (`Page = 1`), but TanStack Table uses 0-based. Need to convert: `backendPage = tablePageIndex + 1`
2. **Sorting**: Backend expects `SortBy` (string) and `SortOrder` ("asc" | "desc"), TanStack Table provides `id` and `desc` boolean. Need to map: `sortBy = sorting[0]?.id`, `sortOrder = sorting[0]?.desc ? "desc" : "asc"`
3. **Response Access**: All API responses are wrapped in `response.data.payload` (Axios + backend response wrapper)
4. **Error Handling**: Backend returns errors in same `IResponse<T>` format with appropriate `statusCode` (400, 401, 404, 500)

### Future Todos (Backend Improvements)

**Security & Best Practices**:
- [ ] **CRITICAL**: Move database connection string from hardcoded value in `Program.cs` to environment variables (`appsettings.json` or Azure Key Vault)
- [ ] **CRITICAL**: Move JWT secret key from hardcoded value to secure configuration (Azure Key Vault, environment variables)
- [ ] **SECURITY**: Restrict CORS origins instead of `AllowAnyOrigin()` - should only allow specific frontend domains
- [ ] **SECURITY**: Enable HTTPS requirement in production (currently `RequireHttpsMetadata = false` in dev, but should verify prod settings)
- [ ] **SECURITY**: Implement rate limiting for authentication endpoints (currently only quotes endpoint has rate limiting)
- [ ] **BEST PRACTICE**: Add request validation middleware (FluentValidation or Data Annotations)
- [ ] **BEST PRACTICE**: Implement proper error logging (Serilog, Application Insights)
- [ ] **BEST PRACTICE**: Add API versioning for future compatibility
- [ ] **BEST PRACTICE**: Implement health check endpoints (`/health`, `/ready`)

**API Improvements**:
- [ ] **STANDARDIZATION**: Standardize error response format across all endpoints (currently consistent but could be more structured)
- [ ] **PAGINATION**: Consider adding cursor-based pagination option for large datasets
- [ ] **SORTING**: Support multi-column sorting (currently only single column)
- [ ] **FILTERING**: Add support for complex filter operators (gt, lt, contains, etc.) beyond simple key-value pairs
- [ ] **VALIDATION**: Add comprehensive input validation with clear error messages
- [ ] **DOCUMENTATION**: Enhance Swagger/OpenAPI documentation with examples and descriptions
- [ ] **PERFORMANCE**: Add response caching headers where appropriate
- [ ] **MONITORING**: Add structured logging and metrics collection

**Code Quality**:
- [ ] **ARCHITECTURE**: Consider implementing Repository pattern or Unit of Work pattern for better testability
- [ ] **TESTING**: Add unit tests and integration tests for controllers and services
- [ ] **DEPENDENCY INJECTION**: Review and optimize service lifetimes (Scoped vs Transient vs Singleton)
- [ ] **ERROR HANDLING**: Implement global exception handler middleware
- [ ] **VALIDATION**: Add model validation attributes or FluentValidation rules

**Database**:
- [ ] **MIGRATIONS**: Ensure all migrations are properly versioned and tested
- [ ] **PERFORMANCE**: Add database indexes for frequently queried fields (CustomerId, OrderId, etc.)
- [ ] **BACKUP**: Implement automated backup strategy
- [ ] **MONITORING**: Add database performance monitoring

**DevOps**:
- [ ] **CI/CD**: Implement automated testing in CI/CD pipeline
- [ ] **DEPLOYMENT**: Add blue-green deployment strategy
- [ ] **MONITORING**: Set up Application Insights or similar monitoring solution
- [ ] **ALERTS**: Configure alerts for errors, performance degradation, and downtime

---

### To-dos

- [x] Update dependencies: Next.js 15.5.6, React 19, Zustand 5.0.8, add RHF/Zod/TanStack Table, Tailwind 4, DaisyUI
- [x] Create 'MedSource Classic' DaisyUI theme with brand colors (#416706, #4d7a07, teal)
- [x] Restructure project: Create app/_components, _services, _stores, _hooks folders with underscore prefix
- [ ] Create middleware.ts for route protection, useAuthStore, AuthService
- [ ] Build Navbar + conditional Sidebar (Church of God pattern, auth-based visibility)
- [ ] Create PageLayout, ClientPageLayout, NavigationLayout components
- [ ] Create useUserSettingsStore with theme slice and UserSettingsService
- [ ] Create RHF + Zod infrastructure: validation schemas, FormInput/Select/Checkbox, useZodForm hook
- [ ] Migrate all forms from Formik to React Hook Form (login, signup, profile, CRUD forms)
- [ ] Setup TanStack Table: DataTable, ServerDataTable components, useTableQuery hook
- [ ] Migrate table.tsx and ServerTable.tsx to TanStack Table with server-side pagination
- [ ] Analyze 29 CSS files, determine which to migrate to Tailwind vs keep as modules
- [ ] Migrate navigations, components, forms, common, pages CSS to Tailwind utilities
- [ ] Refactor all components to mobile-first responsive design (base → sm: → md: → lg:)
- [ ] Create DaisyUI-based UI components: Button, Input, Select, Checkbox, Modal, Badge, Card
- [ ] Create medical-specific components: OrderStatusBadge, RoleBadge, PricingCard, DateRangePicker
- [ ] Update root layout.tsx with theme init, UserSettingsInitializer, NavigationLayout
- [ ] Restructure routes: (public), (auth), (protected) groups, remove /medsource-app
- [ ] Delete old files: src/ folder, old CSS files, deprecated components
- [ ] Full testing: forms, tables, auth flow, responsive design, accessibility, browser compatibility
- [ ] Create documentation: README, ARCHITECTURE, COMPONENTS, MIGRATION_NOTES