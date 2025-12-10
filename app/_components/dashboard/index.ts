/**
 * Dashboard Components Barrel Export
 * 
 * Centralized export point for all dashboard-related components.
 * Follows project architecture pattern for clean imports.
 * 
 * **Components:**
 * - AccountOverview: Main dashboard profile/activity card
 * - ActivityStatCard: Reusable activity metric card
 * 
 * @example
 * ```tsx
 * import { AccountOverview, ActivityStatCard } from '@_components/dashboard'
 * ```
 * 
 * @module DashboardComponents
 */

export { default as AccountOverview } from './AccountOverview'
export { default as ActivityStatCard } from './ActivityStatCard'

export type { ActivityStatCardProps } from './ActivityStatCard'

