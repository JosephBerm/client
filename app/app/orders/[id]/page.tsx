/**
 * Order Detail Page
 * 
 * Comprehensive order detail view orchestrating specialized components.
 * 
 * **Page Structure:**
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │ InternalPageHeader                                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ OrderTimeline (compact)                                    │
 * ├───────────────────────────────────┬─────────────────────────┤
 * │ Main Content (2/3)                │ Sidebar (1/3)          │
 * │                                   │                        │
 * │ ┌───────────────────────────────┐ │ ┌─────────────────────┐│
 * │ │ OrderHeader                   │ │ │ OrderActions       ││
 * │ └───────────────────────────────┘ │ └─────────────────────┘│
 * │                                   │                        │
 * │ ┌───────────────────────────────┐ │ ┌─────────────────────┐│
 * │ │ OrderLineItems                │ │ │ OrderTimeline      ││
 * │ │ (table + totals)              │ │ │ (full)             ││
 * │ └───────────────────────────────┘ │ └─────────────────────┘│
 * │                                   │                        │
 * │ ┌───────────────────────────────┐ │ ┌─────────────────────┐│
 * │ │ OrderDeliveryDetails          │ │ │ OrderNotes         ││
 * │ │ (conditional)                 │ │ └─────────────────────┘│
 * │ └───────────────────────────────┘ │                        │
 * │                                   │ ┌─────────────────────┐│
 * │                                   │ │ OrderQuickInfo     ││
 * │                                   │ └─────────────────────┘│
 * └───────────────────────────────────┴─────────────────────────┘
 * ```
 * 
 * **Role-Based Views:**
 * - Customer: View own orders, request cancellation
 * - SalesRep: Confirm payment for assigned orders
 * - Fulfillment: Update status (Processing, Shipped, Delivered)
 * - SalesManager+: All actions including cancel
 * 
 * **Architecture Pattern:**
 * - Page is the orchestrator (Smart Component)
 * - Child components are presentational (Dumb Components)
 * - Hooks encapsulate data fetching, actions, and permissions
 * - Components use React.memo where beneficial
 * 
 * **Performance Optimizations:**
 * - Skeleton loading for better perceived performance
 * - Memoized child components prevent unnecessary re-renders
 * - useMemo for expensive computations in children
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/page
 */

'use client'

import Link from 'next/link'

import { ArrowLeft } from 'lucide-react'

import { Routes } from '@_features/navigation'

import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../../_components'

import { 
	// Content Components
	OrderHeader, 
	OrderTimeline,
	OrderLineItems,
	OrderDeliveryDetails,
	// Sidebar (composed)
	OrderSidebar,
	// Loading State
	OrderDetailSkeleton,
	// Hooks
	useOrderDetails,
	useOrderActions,
	useOrderPermissions,
} from './_components'

// =============================================================================
// PAGE COMPONENT
// =============================================================================

/**
 * Order detail page component.
 * 
 * **Orchestrator Pattern:**
 * This component orchestrates data and passes it down to presentational components.
 * It does not contain rendering logic beyond layout composition.
 * 
 * **Hook Dependencies:**
 * - useOrderDetails: Fetches order data, provides refresh
 * - useOrderActions: Provides action handlers (confirm, update, etc.)
 * - useOrderPermissions: Computes role-based permissions
 */
export default function OrderDetailPage() {
	// ─────────────────────────────────────────────────────────────────────────
	// DATA HOOKS
	// ─────────────────────────────────────────────────────────────────────────

	const { order, isLoading, refresh } = useOrderDetails()
	const actions = useOrderActions(order, refresh)
	const permissions = useOrderPermissions(order)

	// ─────────────────────────────────────────────────────────────────────────
	// DERIVED STATE
	// ─────────────────────────────────────────────────────────────────────────

	const { isStaff } = permissions

	// Page metadata - computed from order state
	const title = order ? `Order #${order.id}` : 'Order Details'
	const description = order
		? `View order details and ${isStaff ? 'manage workflow' : 'track status'}`
		: 'Loading order...'

	// ─────────────────────────────────────────────────────────────────────────
	// RENDER
	// ─────────────────────────────────────────────────────────────────────────

	return (
		<>
			{/* Page Header - Always visible */}
			<InternalPageHeader
				title={title}
				description={description}
				loading={isLoading}
				actions={<BackToOrdersButton />}
			/>

			{/* Loading State - Shows skeleton while fetching */}
			{isLoading && <OrderDetailSkeleton />}

			{/* Order Content - Renders when data is available */}
			{order && (
				<OrderDetailContent
					order={order}
					actions={actions}
					permissions={permissions}
					isStaff={isStaff}
				/>
			)}
		</>
	)
}

// =============================================================================
// INTERNAL COMPONENTS (Same file - not exported)
// =============================================================================

/**
 * Back to Orders navigation button.
 * Extracted to keep render method clean.
 */
function BackToOrdersButton() {
	return (
		<Link href={Routes.Orders.location}>
			<Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
				Back to Orders
			</Button>
		</Link>
	)
}

/**
 * Main order content layout.
 * Extracted to isolate layout logic from orchestrator.
 */
interface OrderDetailContentProps {
	order: NonNullable<ReturnType<typeof useOrderDetails>['order']>
	actions: ReturnType<typeof useOrderActions>
	permissions: ReturnType<typeof useOrderPermissions>
	isStaff: boolean
}

function OrderDetailContent({ 
	order, 
	actions, 
	permissions, 
	isStaff 
}: OrderDetailContentProps) {
	return (
		<div className="space-y-6">
			{/* Compact Timeline at Top - Shows progress at a glance */}
			<OrderTimeline order={order} compact />

			{/* Main Layout: Content + Sidebar */}
			<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				{/* Main Content Area */}
				<OrderMainContent order={order} isStaff={isStaff} />

				{/* Sidebar - Actions, timeline, notes, quick info */}
				<OrderSidebar
					order={order}
					actions={actions}
					permissions={permissions}
				/>
			</div>
		</div>
	)
}

/**
 * Main content column.
 * Groups header, line items, and delivery details.
 */
interface OrderMainContentProps {
	order: NonNullable<ReturnType<typeof useOrderDetails>['order']>
	isStaff: boolean
}

function OrderMainContent({ order, isStaff }: OrderMainContentProps) {
	return (
		<div className="space-y-6">
			{/* Order Header - Customer, status, financial summary */}
			<OrderHeader
				order={order}
				showSalesRep={isStaff}
				showInternalNotes={isStaff}
			/>

			{/* Line Items - Products table with totals */}
			<OrderLineItems
				order={order}
				showStaffColumns={isStaff}
			/>

			{/* Delivery Details - Shipping info (conditional) */}
			<OrderDeliveryDetails order={order} />
		</div>
	)
}
