/**
 * Dashboard Components Barrel Export
 *
 * Organized exports following MAANG-level architecture with clear separation of concerns:
 *
 * **Structure:**
 * - `layouts/` - Page-level layout components (DashboardHeader)
 * - `sections/` - Role-specific content sections (StatsSection, RevenueOverview)
 * - `actions/` - Role-specific quick action button groups
 * - `hooks/` - Data fetching and state management hooks
 * - Root-level - Shared, reusable components (StatsCard, TaskList, etc.)
 *
 * @see prd_dashboard.md
 * @module dashboard/components
 */

// =============================================================================
// LAYOUT COMPONENTS
// Page-level structure and layout
// =============================================================================
export { DashboardHeader } from './layouts/DashboardHeader'

// =============================================================================
// SECTION COMPONENTS
// Role-specific content sections
// =============================================================================
export { AdminStatsSection } from './sections/AdminStatsSection'
export { CustomerStatsSection } from './sections/CustomerStatsSection'
export { FulfillmentStatsSection } from './sections/FulfillmentStatsSection'
export { ManagerStatsSection } from './sections/ManagerStatsSection'
export { RecentActivitySection } from './sections/RecentActivitySection'
export { RevenueOverview } from './sections/RevenueOverview'
export { SalesRepStatsSection } from './sections/SalesRepStatsSection'

// =============================================================================
// ACTION COMPONENTS
// Role-specific quick action button groups
// =============================================================================
export { AdminQuickActions } from './actions/AdminQuickActions'
export { CustomerQuickActions } from './actions/CustomerQuickActions'
export { FulfillmentQuickActions } from './actions/FulfillmentQuickActions'
export { ManagerQuickActions } from './actions/ManagerQuickActions'
export { SalesRepQuickActions } from './actions/SalesRepQuickActions'

// =============================================================================
// SHARED UI COMPONENTS
// Reusable components used across multiple sections
// =============================================================================
export { DashboardSkeleton } from './DashboardSkeleton'
export { QuickActions } from './QuickActions'
export { RecentItemsTable } from './RecentItemsTable'
export { StatsCard } from './StatsCard'
export { TaskList } from './TaskList'
export { TeamWorkloadTable } from './TeamWorkloadTable'

// =============================================================================
// HOOKS
// Data fetching and state management
// =============================================================================
export { useDashboardStats } from './hooks/useDashboardStats'
export { useDashboardTasks } from './hooks/useDashboardTasks'
export { useRecentItems } from './hooks/useRecentItems'
