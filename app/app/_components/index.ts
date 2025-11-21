/**
 * Internal App Components - Barrel Export
 * 
 * Components specific to the /app internal application area.
 * These components provide consistent layout, navigation, and structure
 * for authenticated admin/customer dashboards.
 * 
 * **Components:**
 * - InternalAppShell: Main layout wrapper with permanent sidebar
 * - InternalPageHeader: Page header with title, description, and actions
 * - Breadcrumb: Auto-generated breadcrumb navigation
 * 
 * **Usage:**
 * ```typescript
 * import { InternalAppShell, InternalPageHeader, Breadcrumb } from '@/app/app/_components'
 * 
 * // In layout.tsx
 * <InternalAppShell user={user}>
 *   {children}
 * </InternalAppShell>
 * 
 * // In page.tsx
 * <InternalPageHeader 
 *   title="Dashboard" 
 *   description="Overview of your account"
 *   actions={<Button>Action</Button>}
 * />
 * ```
 * 
 * @module app/components
 */

// Layout Components
export { default as InternalAppShell } from './InternalAppShell'
export { default as InternalPageHeader } from './InternalPageHeader'
export type { InternalPageHeaderProps } from './InternalPageHeader'

// Navigation Components
export { default as InternalSidebar } from './InternalSidebar'
export { default as Breadcrumb } from './Breadcrumb'
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb'

