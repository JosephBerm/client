/**
 * Orders Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Matches the Orders page layout:
 * - Page header with "Orders" title
 * - Quick filter cards (for staff)
 * - RichDataGrid with order columns (manager view - most comprehensive)
 *
 * Column widths (manager view - 9 columns):
 * - Order # (md), Customer (lg), Sales Rep (md), Total (md), Status (md),
 * - Payment (md), Shipped (md), Created (md), Actions (sm)
 *
 * @module app/orders/loading
 */

import { DataGridSkeleton } from '@_components/tables'
import { InternalPageHeader } from '../_components'

/**
 * Column widths matching orders grid layout (manager view):
 * - Order # (md)
 * - Customer (lg) - with ID subtitle
 * - Sales Rep (md)
 * - Total (md)
 * - Status (md)
 * - Payment (md)
 * - Shipped (md)
 * - Created (md)
 * - Actions (sm)
 */
const ORDERS_COLUMN_WIDTHS = ['md', 'lg', 'md', 'md', 'md', 'md', 'md', 'md', 'sm'] as const

/**
 * QuickFilterSkeleton - Skeleton for quick filter buttons
 */
function QuickFilterSkeleton() {
	return (
		<div
			className="flex flex-wrap gap-3 mb-6"
			role="status"
			aria-label="Loading filter options"
		>
			{[1, 2].map((i) => (
				<div
					key={i}
					className="h-10 w-32 bg-base-200 rounded-lg motion-safe:animate-pulse"
				/>
			))}
		</div>
	)
}

export default function OrdersLoading() {
	return (
		<>
			<InternalPageHeader
				title="Orders"
				description="Manage all orders in the system"
				loading
			/>

			{/* Quick Filter Cards (for staff) */}
			<QuickFilterSkeleton />

			{/* Data Grid Card */}
			<div className="card bg-base-100 shadow-xl border border-base-300">
				<div className="p-6">
					<DataGridSkeleton
						columns={9}
						rows={10}
						columnWidths={[...ORDERS_COLUMN_WIDTHS]}
						showPagination
						showPageSize
						ariaLabel="Loading orders..."
						animationVariant="shimmer"
						staggerDelay={40}
					/>
				</div>
			</div>
		</>
	)
}
