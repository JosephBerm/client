/**
 * Dashboard Types
 *
 * TypeScript types for the Dashboard feature.
 * Maps to backend DashboardDTOs.cs
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Types
 * @module dashboard.types
 */

/**
 * Unified dashboard stats response containing role-specific metrics.
 * Only relevant fields will be populated based on user's role.
 */
export interface DashboardStats {
	// =========================================================================
	// CUSTOMER STATS
	// =========================================================================

	/** Number of quotes awaiting response */
	pendingQuotes?: number
	/** Number of approved quotes */
	approvedQuotes?: number
	/** Number of active orders (not delivered/cancelled) */
	activeOrders?: number
	/** Total amount spent by customer */
	totalSpent?: number

	// =========================================================================
	// SALES REP STATS
	// =========================================================================

	/** Number of unread quotes assigned to sales rep */
	unreadQuotes?: number
	/** Number of orders awaiting payment confirmation */
	ordersPendingPayment?: number
	/** Quote to order conversion rate percentage */
	conversionRate?: number
	/** Average quote turnaround time in hours */
	avgTurnaroundHours?: number

	// =========================================================================
	// FULFILLMENT STATS
	// =========================================================================

	/** Number of orders ready to ship */
	ordersReadyToShip?: number
	/** Number of orders in transit */
	ordersInTransit?: number
	/** On-time delivery rate percentage */
	onTimeRate?: number
	/** Average processing time in days */
	avgProcessingDays?: number

	// =========================================================================
	// SALES MANAGER STATS
	// =========================================================================

	/** Total active quotes across team */
	teamActiveQuotes?: number
	/** Team-wide conversion rate percentage */
	teamConversionRate?: number
	/** Monthly revenue for the team */
	monthlyRevenue?: number
	/** Team workload distribution */
	teamWorkload?: SalesRepWorkload[]
	/** Number of unassigned quotes */
	unassignedQuotes?: number
	/** Number of aging quotes (>48 hours) */
	agingQuotes?: number

	// =========================================================================
	// ADMIN STATS
	// =========================================================================

	/** Total active users in system (excluding admins) */
	totalActiveUsers?: number
	/** Total number of quotes in system */
	totalQuotes?: number
	/** Total number of orders in system */
	totalOrders?: number
	/** System health percentage */
	systemHealth?: number
	/** Revenue breakdown by period */
	revenueOverview?: RevenueOverview
}

/**
 * Sales rep workload information for manager dashboard.
 */
export interface SalesRepWorkload {
	/** Sales rep account ID (int? from backend Account.Id) */
	salesRepId: number | null
	/** Sales rep display name */
	salesRepName: string
	/** Number of active quotes assigned */
	activeQuotes: number
	/** Number of active orders assigned */
	activeOrders: number
	/** Flag indicating if rep is overloaded (40% above team average) */
	isOverloaded: boolean
}

/**
 * Dashboard task/action item requiring attention.
 */
export interface DashboardTask {
	/** Quote ID (Guid? serialized as string when task is quote-related) */
	quoteId: string | null
	/** Order ID (UUID/GUID when task is order-related) */
	orderId: string | null
	/** Task type: "quote", "order", "payment", "fulfillment" */
	type: 'quote' | 'order' | 'payment' | 'fulfillment'
	/** Task title/headline */
	title: string
	/** Task description with details */
	description: string
	/** When the task was created (ISO string) */
	createdAt: string
	/** Whether this is an urgent task */
	isUrgent: boolean
	/** URL to navigate to for action */
	actionUrl: string
}

/**
 * Recent item (quote or order) for dashboard display.
 */
export interface RecentItem {
	/** Quote ID (Guid? serialized as string when type = "quote") */
	quoteId: string | null
	/** Order ID (UUID/GUID when type = "order") */
	orderId: string | null
	/** Item type: "quote" or "order" */
	type: 'quote' | 'order'
	/** Display number (order number or quote reference) */
	number: string
	/** Date of the item (ISO string) */
	date: string
	/** Status as string */
	status: string
	/** Amount (for orders) */
	amount?: number
	/** Customer name */
	customerName?: string
}

/**
 * Revenue overview for admin dashboard.
 */
export interface RevenueOverview {
	/** Today's order count */
	todayOrders: number
	/** Today's revenue */
	todayRevenue: number
	/** This week's order count */
	weekOrders: number
	/** This week's revenue */
	weekRevenue: number
	/** This month's order count */
	monthOrders: number
	/** This month's revenue */
	monthRevenue: number
}

