/**
 * Analytics Components Barrel Export
 *
 * Centralized export for all analytics dashboard components.
 * This barrel file is for EXTERNAL CONSUMERS ONLY.
 *
 * **IMPORTANT - Circular Dependency Prevention:**
 * Components WITHIN this folder should NOT import from this index.
 * Instead, use direct imports to the specific module files.
 *
 * **Architecture (per Next.js 16 + React 19 best practices):**
 * - `/views` - Role-based view components (Customer, SalesRep, Manager)
 * - `/states` - State components (Error, Loading, Empty)
 * - Base components - Reusable visualization components
 *
 * @see https://react-typescript-style-guide.com/ - Barrel file best practices
 * @module analytics/components
 */

// ============================================================================
// ROLE-BASED VIEWS
// ============================================================================
// Each view tells the analytics story from that role's perspective
// Uses React.memo() for re-render optimization

export { CustomerAnalytics } from './views/CustomerAnalytics'
export type { CustomerAnalyticsProps } from './views/CustomerAnalytics'

export { SalesRepAnalytics } from './views/SalesRepAnalytics'
export type { SalesRepAnalyticsProps } from './views/SalesRepAnalytics'

export { ManagerAnalytics } from './views/ManagerAnalytics'
export type { ManagerAnalyticsProps } from './views/ManagerAnalytics'

// ============================================================================
// STATE COMPONENTS
// ============================================================================
// Consistent error, loading, and empty state handling
// Uses centralized @_components/common patterns

export { AnalyticsErrorState } from './states/AnalyticsErrorState'
export type { AnalyticsErrorStateProps } from './states/AnalyticsErrorState'

export { AnalyticsLoadingState } from './states/AnalyticsLoadingState'
export type { AnalyticsLoadingStateProps } from './states/AnalyticsLoadingState'

export { AnalyticsEmptyState } from './states/AnalyticsEmptyState'
export type { AnalyticsEmptyStateProps } from './states/AnalyticsEmptyState'

// ============================================================================
// VISUALIZATION COMPONENTS
// ============================================================================
// Reusable chart and data visualization components

export { AnalyticsDateRangePicker } from './AnalyticsDateRangePicker'
export { AnalyticsKPICard } from './AnalyticsKPICard'
export { RevenueChart } from './RevenueChart'
export { ConversionFunnel } from './ConversionFunnel'
export { TeamLeaderboard } from './TeamLeaderboard'
export { PersonalVsTeamCard } from './PersonalVsTeamCard'
