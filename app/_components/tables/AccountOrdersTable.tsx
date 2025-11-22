/**
 * AccountOrdersTable Component
 *
 * Displays the user's recent orders in a table format.
 * Fetches and shows the last 5 orders for the authenticated user's customer account.
 * Used in dashboard and account pages to provide quick access to order history.
 *
 * **Features:**
 * - Fetches last 5 orders for current user's customer
 * - Auto-fetches on component mount when customer ID is available
 * - Loading state with spinner
 * - Order status badges with color coding
 * - Currency and date formatting
 * - View order details action button
 * - Empty state for users with no orders
 * - Card layout with title
 *
 * **Table Columns:**
 * - Order ID: Monospace format with # prefix
 * - Date: Formatted date created
 * - Total: Currency formatted
 * - Status: Color-coded OrderStatusBadge
 * - Actions: View button linking to order details
 *
 * **Use Cases:**
 * - User dashboard (recent orders widget)
 * - Account/profile page
 * - Order history preview
 *
 * @example
 * ```tsx
 * import AccountOrdersTable from '@_components/tables/AccountOrdersTable';
 *
 * // In dashboard page
 * export default function DashboardPage() {
 *   return (
 *     <PageLayout title="Dashboard">
 *       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 *         <AccountOrdersTable />
 *         <AccountQuotesTable />
 *       </div>
 *     </PageLayout>
 *   );
 * }
 *
 * // In profile page
 * export default function ProfilePage() {
 *   return (
 *     <PageLayout title="My Account">
 *       <div className="space-y-6">
 *         <UserProfileCard />
 *         <AccountOrdersTable />
 *       </div>
 *     </PageLayout>
 *   );
 * }
 * ```
 *
 * @module AccountOrdersTable
 */

'use client'

import { useMemo, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import { DataGrid, type ColumnDef } from '@_components/tables'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import { logger } from '@_core'
import { formatDate, formatCurrency } from '@_shared'
import { useAuthStore } from '@_features/auth'
import Order from '@_classes/Order'
import { API } from '@_shared'
import { notificationService } from '@_shared'
import { Routes } from '@_features/navigation'

/**
 * AccountOrdersTable Component
 *
 * Client component that fetches and displays recent orders for the authenticated user.
 * Automatically fetches data when user's customer ID becomes available.
 *
 * **Data Fetching:**
 * - Triggered by useEffect when user.customer.id is available
 * - Calls API.Orders.getFromCustomer(customerId)
 * - Sorts by createdAt descending
 * - Takes last 5 orders only
 * - Shows loading spinner during fetch
 * - Displays toast errors on failure
 *
 * **Column Definitions:**
 * - All columns use useMemo for performance
 * - Custom cell renderers for formatted display
 * - Action column with router navigation
 *
 * **Empty State:**
 * - Shows "No orders yet" when table is empty
 * - Provides clear message to users without order history
 *
 * **Card Wrapper:**
 * - Uses DaisyUI card for consistent styling
 * - Includes "Recent Orders" title
 *
 * @returns AccountOrdersTable component
 */
export default function AccountOrdersTable() {
	const router = useRouter()
	const user = useAuthStore((state) => state.user)
	const [orders, setOrders] = useState<Order[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
	const fetchOrders = async () => {
		try {
			setIsLoading(true)
			if (!user?.customer?.id) return

		const { data } = await API.Orders.getFromCustomer(user.customer.id)
		if (!data.payload) {
			notificationService.error(data.message || 'Failed to load orders', {
				metadata: { customerId: user.customer.id },
				component: 'AccountOrdersTable',
				action: 'fetchOrders',
			})
			return
		}

			const sortedOrders = data.payload
				.map((x: any) => new Order(x))
				.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 5)

			setOrders(sortedOrders)
		} catch (error: any) {
			notificationService.error(error.message || 'Failed to load orders', {
				metadata: {
					error,
					userId: user?.id || undefined,
				},
				component: 'AccountOrdersTable',
				action: 'fetchOrders',
			})
		} finally {
			setIsLoading(false)
		}
	}

		if (user?.customer?.id) {
			fetchOrders()
		}
	}, [user?.customer?.id, user?.id])

	const columns: ColumnDef<Order>[] = useMemo(
		() => [
			{
				accessorKey: 'id',
				header: 'Order ID',
				cell: ({ row }) => <span className="font-mono text-sm">#{row.original.id}</span>,
			},
			{
				accessorKey: 'createdAt',
				header: 'Date',
				cell: ({ row }) => formatDate(row.original.createdAt),
			},
			{
				accessorKey: 'total',
				header: 'Total',
				cell: ({ row }) => formatCurrency(row.original.total || 0),
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => <OrderStatusBadge status={row.original.status as any} />,
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push(`${Routes.Orders.location}/${row.original.id}`)}
					>
						<Eye className="w-4 h-4 mr-2" />
						View
					</Button>
				),
			},
		],
		[router]
	)

	return (
		<div className="card bg-base-100 border border-base-300 shadow-xl !rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-2xl motion-safe:transition-all w-full min-w-0">
			<div className="card-body p-5 sm:p-6 md:p-8 min-w-0 overflow-hidden">
				<h2 className="card-title text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-base-content">
					Recent Orders
				</h2>
				<div className="min-w-0 overflow-hidden">
				<DataGrid
					columns={columns}
					data={orders}
					ariaLabel="Recent orders"
					isLoading={isLoading}
					emptyMessage="No orders yet"
					manualPagination={false}
				/>
				</div>
			</div>
		</div>
	)
}
