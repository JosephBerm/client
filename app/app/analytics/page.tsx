'use client'

/**
 * Analytics Dashboard Page
 *
 * Role-based business intelligence dashboard.
 * Orchestrates data fetching and renders appropriate view based on user role.
 *
 * **Architecture (per Next.js 16 + React 19 best practices):**
 *
 * This page follows the "Orchestrator Pattern":
 * - Handles authentication and role detection
 * - Manages data fetching via custom hooks (SWR-based)
 * - Delegates rendering to role-specific view components
 * - Handles error/loading/empty states
 *
 * **Performance Optimizations:**
 * - View components use React.memo() for shallow prop comparison
 * - useMemo() used ONLY for expensive calculations (per React docs:
 *   "useMemo is a performance optimization, not a semantic guarantee")
 * - roleFlags memoized since it's passed as conditional to render
 * - Simple boolean/primitive derived state NOT memoized (unnecessary overhead)
 *
 * **'use client' Boundary:**
 * Per Next.js 16 docs: "add 'use client' to specific interactive components
 * instead of marking large parts of your UI as Client Components"
 * This page requires client-side interactivity (hooks, state, effects).
 *
 * **Role Views:**
 * - Customer → CustomerAnalytics: Spending history, order trends
 * - Sales Rep → SalesRepAnalytics: Personal performance, team comparison
 * - Manager/Admin → ManagerAnalytics: Business intelligence, team metrics
 *
 * @see prd_analytics.md
 * @see https://nextjs.org/docs/app/building-your-application/rendering/client-components
 * @see https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere
 * @module app/analytics/page
 */

import { useEffect, useMemo } from 'react'

import { logger } from '@_core'
import { useAuthStore } from '@_features/auth'
import { usePermissions, RoleLevels } from '@_shared'

import { InternalPageHeader } from '../_components'

// Import from barrel for external consumption (page.tsx is external to _components)
import {
	// Role-based views (React.memo wrapped)
	CustomerAnalytics,
	SalesRepAnalytics,
	ManagerAnalytics,
	// State components
	AnalyticsErrorState,
	AnalyticsLoadingState,
	AnalyticsEmptyState,
	// UI components
	AnalyticsDateRangePicker,
} from './_components'

import { useAnalyticsSummary, useTeamPerformance, useRevenueTimeline } from './_hooks'

// ============================================================================
// CONSTANTS
// ============================================================================

const COMPONENT_NAME = 'AnalyticsPage'

/**
 * Role-specific page descriptions.
 * Defined outside component to prevent recreation on each render.
 */
const ROLE_DESCRIPTIONS: Readonly<Record<number, string>> = {
	[RoleLevels.Customer]: 'Track your spending and order history.',
	[RoleLevels.SalesRep]: 'Monitor your performance and compare with team averages.',
	[RoleLevels.SalesManager]: 'Business intelligence and team performance metrics.',
	[RoleLevels.Admin]: 'Complete business analytics and team management.',
} as const

// ============================================================================
// PAGE COMPONENT
// ============================================================================

/**
 * Analytics Dashboard Page
 *
 * Entry point for analytics feature.
 * Orchestrates data, role detection, and view rendering.
 */
export default function AnalyticsPage() {
	// =========================================================================
	// AUTH STATE & PERMISSIONS
	// =========================================================================
	// Zustand selector pattern for optimal re-render behavior

	const user = useAuthStore((state) => state.user)
	const authLoading = useAuthStore((state) => state.isLoading)

	// RBAC: Use usePermissions hook for role-based checks
	const { isCustomer, isSalesRepOrAbove, isSalesManagerOrAbove, roleLevel } = usePermissions()

	// =========================================================================
	// DATA HOOKS
	// =========================================================================
	// All hooks use useFetchWithCache internally (SWR pattern)

	// Core analytics summary (all roles)
	const {
		data: summary,
		isLoading: summaryLoading,
		error: summaryError,
		timeRange,
		setTimeRange,
		setCustomDateRange,
		retry: retrySummary,
		hasLoaded: summaryHasLoaded,
	} = useAnalyticsSummary({ initialTimeRange: '12m' })

	// Team performance (managers/admins only)
	const {
		data: teamData,
		isLoading: teamLoading,
		error: teamError,
	} = useTeamPerformance({
		// RBAC: Use usePermissions() hook for role checks
		autoFetch: isSalesManagerOrAbove,
	})

	// Revenue timeline (managers/admins only)
	const { data: revenueData, isLoading: revenueLoading } = useRevenueTimeline({
		// RBAC: Use usePermissions() hook for role checks
		autoFetch: isSalesManagerOrAbove,
	})

	// =========================================================================
	// DERIVED STATE
	// =========================================================================

	// RBAC: Use roleLevel from usePermissions() hook
	const userRole = roleLevel ?? RoleLevels.Customer

	/**
	 * Role flags for conditional rendering.
	 *
	 * RBAC: Now using usePermissions() hook values directly.
	 * The hook provides memoized boolean flags for role checks.
	 */
	const roleFlags = useMemo(
		() => ({
			isCustomer,
			isSalesRep: isSalesRepOrAbove && !isSalesManagerOrAbove,
			isManagerOrAdmin: isSalesManagerOrAbove,
		}),
		[isCustomer, isSalesRepOrAbove, isSalesManagerOrAbove]
	)

	// Simple primitives - no useMemo needed (per React docs: "don't add useMemo
	// for primitives... JavaScript engines are heavily optimized for primitives")
	const isLoading = authLoading || summaryLoading
	const pageDescription = ROLE_DESCRIPTIONS[userRole] ?? ROLE_DESCRIPTIONS[RoleLevels.SalesManager]

	// =========================================================================
	// EFFECTS
	// =========================================================================

	/**
	 * Error logging effect.
	 *
	 * Uses centralized logger from @_core for consistent error tracking.
	 * Logs include component context for debugging.
	 */
	useEffect(() => {
		if (summaryError) {
			logger.error('Analytics summary fetch failed', {
				component: COMPONENT_NAME,
				error: summaryError,
				userId: user?.id ?? undefined,
				role: userRole,
			})
		}
		if (teamError) {
			logger.error('Team performance fetch failed', {
				component: COMPONENT_NAME,
				error: teamError,
				userId: user?.id ?? undefined,
			})
		}
	}, [summaryError, teamError, user?.id, userRole])

	// =========================================================================
	// RENDER
	// =========================================================================

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title='Analytics Dashboard'
				description={pageDescription}
				loading={!summaryHasLoaded && isLoading}
				actions={
					<AnalyticsDateRangePicker
						timeRange={timeRange}
						onPresetChange={setTimeRange}
						onCustomRangeChange={setCustomDateRange}
						disabled={isLoading}
					/>
				}
			/>

			{/* Main Content */}
			<main className='space-y-6'>
				{/* Error State */}
				{summaryError && (
					<AnalyticsErrorState
						error={summaryError}
						onRetry={retrySummary}
						context='summary'
					/>
				)}

				{/* Refresh Loading State */}
				{isLoading && summaryHasLoaded && <AnalyticsLoadingState />}

				{/* Role-Based Views - memo() prevents unnecessary re-renders */}
				{summary && roleFlags.isCustomer && (
					<CustomerAnalytics
						summary={summary}
						isLoading={isLoading}
					/>
				)}

				{summary && roleFlags.isSalesRep && (
					<SalesRepAnalytics
						summary={summary}
						isLoading={isLoading}
					/>
				)}

				{summary && roleFlags.isManagerOrAdmin && (
					<ManagerAnalytics
						summary={summary}
						teamData={teamData}
						revenueData={revenueData}
						isLoading={isLoading}
						teamLoading={teamLoading}
						revenueLoading={revenueLoading}
					/>
				)}

				{/* Empty State */}
				{!isLoading && !summary && !summaryError && <AnalyticsEmptyState />}
			</main>
		</>
	)
}
