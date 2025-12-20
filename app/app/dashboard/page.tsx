'use client'

/**
 * Dashboard Page
 *
 * Unified dashboard for all user roles.
 * This page orchestrates role-specific components - it does NOT contain
 * inline JSX for each role. Instead, it composes purpose-built sections.
 *
 * **Architecture:**
 * - DashboardHeader: Welcome message and error display
 * - *StatsSection: Role-specific statistics (CustomerStats, SalesRepStats, etc.)
 * - *QuickActions: Role-specific action buttons
 * - TaskList: Universal task display
 * - TeamWorkloadTable: Manager+ only team overview
 * - RevenueOverview: Admin-only revenue breakdown
 * - RecentActivitySection: Recent orders and quotes
 *
 * **Next.js 16 Architecture Notes:**
 * - This is a Client Component ('use client') - `use cache` is NOT applicable
 * - Client-side caching handled via useFetchWithCache hooks (SWR pattern)
 * - Memoization avoided per React 19 best practices
 *
 * @see prd_dashboard.md
 * @see https://nextjs.org/docs/app/building-your-application/rendering/client-components
 * @module dashboard/page
 */

import { usePermissions } from '@_shared/hooks/usePermissions'

import {
	// Layout
	DashboardHeader,
	DashboardSkeleton,
	// Role-specific stats sections
	AdminStatsSection,
	CustomerStatsSection,
	FulfillmentStatsSection,
	ManagerStatsSection,
	SalesRepStatsSection,
	// Role-specific quick actions
	AdminQuickActions,
	CustomerQuickActions,
	FulfillmentQuickActions,
	ManagerQuickActions,
	SalesRepQuickActions,
	// Shared sections
	RecentActivitySection,
	RevenueOverview,
	TaskList,
	TeamWorkloadTable,
	// Hooks
	useDashboardStats,
	useDashboardTasks,
	useRecentItems,
} from './_components'

// =============================================================================
// COMPONENT
// =============================================================================

export default function DashboardPage() {
	// =========================================================================
	// PERMISSIONS
	// Determine user role for conditional rendering
	// =========================================================================
	const {
		user,
		isCustomer,
		isSalesRepOrAbove,
		isSalesManagerOrAbove,
		isAdmin,
		isFulfillmentCoordinatorOrAbove,
	} = usePermissions()

	// =========================================================================
	// DATA FETCHING
	// Uses SWR-pattern hooks with built-in caching, deduplication, revalidation
	// @see useFetchWithCache for implementation details
	// =========================================================================
	const { stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
	const { urgentTasks, regularTasks, isLoading: tasksLoading } = useDashboardTasks()
	const { recentOrders, recentQuotes, isLoading: itemsLoading } = useRecentItems(5)

	// =========================================================================
	// DERIVED STATE
	// =========================================================================
	const isLoading = statsLoading || tasksLoading || itemsLoading
	const allTasks = [...urgentTasks, ...regularTasks]
	const firstName = user?.name?.first ?? 'User'

	// Determine which role-specific components to render
	const showCustomerView = isCustomer
	const showSalesRepView = isSalesRepOrAbove && !isSalesManagerOrAbove
	const showFulfillmentView = isFulfillmentCoordinatorOrAbove && !isSalesManagerOrAbove
	const showManagerView = isSalesManagerOrAbove && !isAdmin
	const showAdminView = isAdmin

	// =========================================================================
	// LOADING STATE
	// =========================================================================
	if (isLoading) {
		return <DashboardSkeleton />
	}

	// =========================================================================
	// RENDER
	// Clean, declarative structure that tells a story
	// =========================================================================
	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* ================================================================
			    HEADER SECTION
			    Welcome message and error state
			    ================================================================ */}
			<DashboardHeader firstName={firstName} error={statsError} />

			{/* ================================================================
			    STATS SECTION
			    Role-specific statistics grid
			    Each role sees metrics relevant to their responsibilities
			    ================================================================ */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{showCustomerView && <CustomerStatsSection stats={stats} />}
				{showSalesRepView && <SalesRepStatsSection stats={stats} />}
				{showFulfillmentView && <FulfillmentStatsSection stats={stats} />}
				{showManagerView && <ManagerStatsSection stats={stats} />}
				{showAdminView && <AdminStatsSection stats={stats} />}
			</div>

			{/* ================================================================
			    TASKS & ACTIONS SECTION
			    Two-column layout: Tasks (2/3) + Quick Actions (1/3)
			    ================================================================ */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2">
					<TaskList tasks={allTasks} title="Today's Tasks" />
				</div>
				<div className="space-y-4">
					{showCustomerView && <CustomerQuickActions />}
					{showSalesRepView && <SalesRepQuickActions />}
					{showFulfillmentView && <FulfillmentQuickActions />}
					{showManagerView && <ManagerQuickActions />}
					{showAdminView && <AdminQuickActions />}
				</div>
			</div>

			{/* ================================================================
			    MANAGER+ SECTION
			    Team workload overview - visible to managers and admins
			    ================================================================ */}
			{isSalesManagerOrAbove && stats?.teamWorkload && stats.teamWorkload.length > 0 && (
				<TeamWorkloadTable workload={stats.teamWorkload} />
			)}

			{/* ================================================================
			    ADMIN SECTION
			    Revenue breakdown - visible to admins only
			    ================================================================ */}
			{showAdminView && stats?.revenueOverview && (
				<RevenueOverview data={stats.revenueOverview} />
			)}

			{/* ================================================================
			    RECENT ACTIVITY SECTION
			    Recent orders and quotes - visible to all roles
			    ================================================================ */}
			<RecentActivitySection orders={recentOrders} quotes={recentQuotes} />
		</div>
	)
}
