/**
 * Analytics Hooks Barrel Export
 *
 * Custom hooks for analytics data fetching and state management.
 * This barrel file is for EXTERNAL CONSUMERS ONLY.
 *
 * **IMPORTANT - Circular Dependency Prevention:**
 * Hooks WITHIN this folder should NOT import from this index.
 * Instead, use direct imports to the specific module files.
 *
 * **Architecture (per Next.js 16 + React 19 best practices):**
 * - All hooks use `useFetchWithCache` for SWR-style caching
 * - Hooks follow the "custom hook" pattern from React docs
 * - No unnecessary memoization (per React docs guidelines)
 *
 * **Hooks:**
 * - `useAnalyticsSummary` - Core analytics data for all roles
 * - `useTeamPerformance` - Team metrics (Manager/Admin only)
 * - `useRevenueTimeline` - Revenue chart data (Manager/Admin only)
 *
 * **Utilities:**
 * - `getAnalyticsDateRange` - Convert time range presets to API dates
 * - `getAnalyticsCacheKey` - Generate consistent cache keys
 *
 * @see https://react.dev/learn/reusing-logic-with-custom-hooks
 * @see useFetchWithCache for caching implementation
 * @module analytics/hooks
 */

// ============================================================================
// DATA HOOKS
// ============================================================================

// Analytics Summary - Core analytics for all roles
export { useAnalyticsSummary } from './useAnalyticsSummary'
export type { UseAnalyticsSummaryOptions, UseAnalyticsSummaryReturn } from './useAnalyticsSummary'

// Team Performance - Manager/Admin only
export { useTeamPerformance } from './useTeamPerformance'
export type { UseTeamPerformanceOptions, UseTeamPerformanceReturn } from './useTeamPerformance'

// Revenue Timeline - Chart data for Manager/Admin
export { useRevenueTimeline } from './useRevenueTimeline'
export type { UseRevenueTimelineOptions, UseRevenueTimelineReturn } from './useRevenueTimeline'

// ============================================================================
// UTILITIES (for hooks internal use and external consumption)
// ============================================================================

export { getAnalyticsDateRange, getAnalyticsCacheKey } from './analyticsDateUtils'
