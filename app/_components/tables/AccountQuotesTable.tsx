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

import { useRouter } from 'next/navigation'

import { Eye } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import { formatDate, API, notificationService } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { QuoteStatus } from '@_classes/Enums'
import Quote from '@_classes/Quote'

import { DataGrid, type ColumnDef } from '@_components/tables'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'





/**
 * AccountQuotesTable Component
 *
 * Client component that fetches and displays recent quotes for the authenticated user.
 * Automatically fetches data when user's customer ID becomes available.
 * Filters quotes by matching company name to user's customer name.
 *
 * **Data Fetching:**
 * - Triggered by useEffect when user.customer.id is available
 * - Calls API.Quotes.search() with GenericSearchFilter to fetch quotes
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
	const fetchQuotes = async () => {
		try {
			setIsLoading(true)
			if (!user?.customer?.id) {return}

			// Use search endpoint with GenericSearchFilter (FAANG-level API design)
			const searchFilter = new GenericSearchFilter()
			searchFilter.pageSize = 100 // Get enough quotes to filter client-side
			searchFilter.sortBy = 'createdAt'
			searchFilter.sortOrder = 'desc'

			const { data } = await API.Quotes.search(searchFilter)
			if (!data.payload) {
				notificationService.error(data.message || 'Failed to load quotes', {
					component: 'AccountQuotesTable',
					action: 'fetchQuotes',
				})
				return
			}

			// Filter and sort quotes for current user's company
			const sortedQuotes = data.payload.data
				.map((x: any) => new Quote(x))
				.filter((q: Quote) => q.companyName === user.customer?.name)
				.slice(0, 5) // Take only last 5

			setQuotes(sortedQuotes)
		} catch (error: any) {
			notificationService.error(error.message || 'Failed to load quotes', {
				metadata: {
				error,
					userId: user?.id || undefined,
				},
				component: 'AccountQuotesTable',
				action: 'fetchQuotes',
			})
		} finally {
			setIsLoading(false)
		}
	}

		if (user?.customer?.id) {
			void fetchQuotes()
		}
	}, [user?.customer?.id, user?.id, user?.customer?.name])

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
					const {status} = row.original
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
						onClick={() => router.push(Routes.Quotes.detail(row.original.id))}
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
					Recent Quotes
				</h2>
				<div className="min-w-0 overflow-hidden">
				<DataGrid
					columns={columns}
					data={quotes}
					ariaLabel="Recent quotes"
					isLoading={isLoading}
					emptyMessage="No quotes yet"
					manualPagination={false}
				/>
				</div>
			</div>
		</div>
	)
}
