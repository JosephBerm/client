/**
 * Types - Barrel Export (Optimized for Tree-Shaking)
 *
 * Centralized type definitions for the application.
 * Pure TypeScript types - zero runtime cost.
 *
 * **Architecture:**
 * - Single source of truth for shared types
 * - Enables DRY-compliant type usage
 * - Supports Dependency Inversion Principle
 * - Zero bundle impact (types only)
 *
 * @example
 * ```typescript
 * import type { BreadcrumbItem, NavigationRoute, NavigationSection } from '@_types'
 * ```
 *
 * @module types
 */

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type { BreadcrumbItem, NavigationIconType, NavigationRoute, NavigationSection } from './navigation'

// NOTE: AccountRole removed (January 2026) - use RoleLevels from ./rbac instead

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export type {
	SelectOption,
	SelectSettingItem,
	ToggleSettingItem,
	ButtonSettingItem,
	CustomSettingItem,
	SettingItem,
	SettingsSection,
} from './settings'

// ============================================================================
// RBAC TYPES
// RoleLevels, getRoleDisplayName, etc. are re-exported from @_shared for backward compatibility.
// New code should import directly from '@_shared'.
// ============================================================================

export {
	RoleLevels,
	getRoleDisplayName,
	DEFAULT_ROLE_METADATA,
	Resources,
	Actions,
	Contexts,
	buildPermission,
} from './rbac'

export type { RoleLevelKey, RoleLevelValue, Resource, Action, Context, Permission, Role, RoleThresholds } from './rbac'

// ============================================================================
// ACCOUNT TYPES
// ============================================================================

export type { AccountInfo } from './account'
export { toAccountInfo, getAccountDisplayName } from './account'

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export type { DashboardStats, DashboardTask, RecentItem, SalesRepWorkload, RevenueOverview } from './dashboard.types'

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export type {
	DateRange,
	SalesRepPerformance,
	RevenueData,
	QuotePipelineData,
	AnalyticsSummary,
	TimeRangePreset,
	AnalyticsFilter,
	TimelineGranularity,
	RevenueTimelineParams,
	ChartDataPoint,
	RevenueChartProps,
	ConversionFunnelProps,
	TeamLeaderboardProps,
	AnalyticsMetricProps,
} from './analytics.types'
