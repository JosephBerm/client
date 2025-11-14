/**
 * AccountQuotesTable Component
 *
 * Displays the user's recent quote requests in a table format.
 * Fetches and shows the last 5 quotes for the authenticated user's company.
 * Used in dashboard and account pages to provide quick access to quote history.
 *
 * **Features:**
 * - Fetches last 5 quotes for current user's company
 * - Filters quotes by company name
 * - Auto-fetches on component mount when customer ID is available
 * - Loading state with spinner
 * - Quote status badges
 * - Date formatting
 * - View quote details action button
 * - Empty state for users with no quotes
 * - Card layout with title
 *
 * **Table Columns:**
 * - Company: Company name from quote
 * - Phone: Contact phone number
 * - Requested: Formatted date created
 * - Status: Color-coded Badge (success/warning)
 * - Actions: View button linking to quote details
 *
 * **Use Cases:**
 * - User dashboard (recent quotes widget)
 * - Account/profile page
 * - Quote history preview
 * - RFQ tracking
 *
 * @example
 * ```tsx
 * import AccountQuotesTable from '@_components/tables/AccountQuotesTable';
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
 * // In account page
 * export default function AccountPage() {
 *   return (
 *     <PageLayout title="My Account">
 *       <div className="space-y-6">
 *         <AccountOrdersTable />
 *         <AccountQuotesTable />
 *       </div>
 *     </PageLayout>
 *   );
 * }
 * ```
 *
 * @module AccountQuotesTable
 */

'use client'

import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import DataTable from './DataTable'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import { formatDate } from '@_shared'
import { useAuthStore } from '@_features/auth'
import Quote from '@_classes/Quote'
import { API } from '@_shared'
import { toast } from 'react-toastify'
import { Routes } from '@_features/navigation'

/**
 * AccountQuotesTable Component
 *
 * Client component that fetches and displays recent quotes for the authenticated user.
 * Automatically fetches data when user's customer ID becomes available.
 * Filters quotes by matching company name to user's customer name.
 *
 * **Data Fetching:**
 * - Triggered by useEffect when user.customer.id is available
 * - Calls API.Quotes.getAll() to fetch all quotes
 * - Filters by comparing quote.companyName to user.customer.name
 * - Sorts by createdAt descending
 * - Takes last 5 quotes only
 * - Shows loading spinner during fetch
 * - Displays toast errors on failure
 *
 * **Column Definitions:**
 * - All columns use useMemo for performance
 * - Status column uses dynamic require() for QuoteStatus enum
 * - Badge variant based on status (success for Read, warning for Unread)
 * - Custom cell renderers for formatted display
 * - Action column with router navigation
 *
 * **Empty State:**
 * - Shows "No quotes yet" when table is empty
 * - Provides clear message to users without quote history
 *
 * **Card Wrapper:**
 * - Uses DaisyUI card for consistent styling
 * - Includes "Recent Quotes" title
 *
 * **Note:**
 * Uses dynamic require() for QuoteStatus enum in status cell renderer
 * to avoid import issues. Consider refactoring to static import if possible.
 *
 * @returns AccountQuotesTable component
 */
export default function AccountQuotesTable() {
	const router = useRouter()
	const user = useAuthStore((state) => state.user)
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (user?.customer?.id) {
			fetchQuotes()
		}
	}, [user?.customer?.id])

	const fetchQuotes = async () => {
		try {
			setIsLoading(true)
			if (!user?.customer?.id) return

			const { data } = await API.Quotes.getAll<Quote[]>()
			if (!data.payload) {
				toast.error(data.message || 'Failed to load quotes')
				return
			}

			const sortedQuotes = data.payload
				.map((x: any) => new Quote(x))
				.filter((q: Quote) => q.companyName === user.customer?.name)
				.sort((a: Quote, b: Quote) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 5)

			setQuotes(sortedQuotes)
		} catch (error: any) {
			console.error('Failed to fetch quotes:', error)
			toast.error(error.message || 'Failed to load quotes')
		} finally {
			setIsLoading(false)
		}
	}

	const columns: ColumnDef<Quote>[] = useMemo(
		() => [
			{
				accessorKey: 'companyName',
				header: 'Company',
				cell: ({ row }) => row.original.companyName || 'N/A',
			},
			{
				accessorKey: 'phoneNumber',
				header: 'Phone',
			},
			{
				accessorKey: 'createdAt',
				header: 'Requested',
				cell: ({ row }) => formatDate(row.original.createdAt),
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => {
					const { QuoteStatus } = require('@_classes/Enums')
					const status = row.original.status
					const variant = status === QuoteStatus.Read ? 'success' : 'warning'
					return <Badge variant={variant}>{status}</Badge>
				},
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push(`${Routes.InternalAppRoute}/quotes/${row.original.id}`)}
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
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body">
				<h2 className="card-title">Recent Quotes</h2>
				<DataTable
					columns={columns}
					data={quotes}
					isLoading={isLoading}
					emptyMessage="No quotes yet"
					manualPagination={false}
				/>
			</div>
		</div>
	)
}
