/**
 * Analytics Components - Barrel Export
 * 
 * Centralized export point for all analytics-related components.
 * Follows project architecture pattern for clean imports.
 * 
 * **Components:**
 * - AnalyticsFilters: Filter controls for time ranges and dates
 * - AnalyticsSummaryCards: Container for summary financial metrics
 * - AnalyticsSummaryCard: Individual summary metric card
 * - AnalyticsSalesMetrics: Sales performance metrics section
 * - AnalyticsOrderMetrics: Order analytics metrics section
 * - AnalyticsMetricCard: Reusable metric card component
 * - AnalyticsPerformanceTrends: Performance trends placeholder
 * - AnalyticsLoadingSkeleton: Loading state components
 * 
 * @example
 * ```tsx
 * import {
 *   AnalyticsFilters,
 *   AnalyticsSummaryCards,
 *   AnalyticsSalesMetrics,
 *   AnalyticsOrderMetrics,
 *   AnalyticsPerformanceTrends,
 * } from '@_components/analytics'
 * ```
 * 
 * @module components/analytics
 */

// Main Components
export { default as AnalyticsFilters } from './AnalyticsFilters'
export { default as AnalyticsSummaryCards } from './AnalyticsSummaryCards'
export { default as AnalyticsSummaryCard } from './AnalyticsSummaryCard'
export { default as AnalyticsSalesMetrics } from './AnalyticsSalesMetrics'
export { default as AnalyticsOrderMetrics } from './AnalyticsOrderMetrics'
export { default as AnalyticsMetricCard } from './AnalyticsMetricCard'
export { default as AnalyticsPerformanceTrends } from './AnalyticsPerformanceTrends'

// Loading States
export { SummaryCardSkeleton, DetailedMetricsSkeleton } from './AnalyticsLoadingSkeleton'

// Constants
export { TIME_RANGES, rangeLabels } from './analytics.constants'
