/**
 * Accounts Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Matches the Accounts page layout:
 * - Page header with "Accounts" title
 * - RichDataGrid with account columns
 *
 * Column widths (6 columns):
 * - Username (lg), Email (xl), Role (md), Status (md), Created (md), Actions (md)
 *
 * @module app/accounts/loading
 */

import { DataGridSkeleton } from '@_components/tables'
import { InternalPageHeader } from '../_components'

/**
 * Column widths matching accounts grid layout:
 * - Username (lg) - link
 * - Email (xl)
 * - Role (md) - badge
 * - Status (md) - badge
 * - Created (md)
 * - Actions (md) - multiple buttons
 */
const ACCOUNTS_COLUMN_WIDTHS = ['lg', 'xl', 'md', 'md', 'md', 'md'] as const

export default function AccountsLoading() {
	return (
		<>
			<InternalPageHeader
				title="Accounts"
				description="Manage user accounts in the system"
				loading
			/>

			{/* Data Grid Card */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<DataGridSkeleton
						columns={6}
						rows={10}
						columnWidths={[...ACCOUNTS_COLUMN_WIDTHS]}
						showPagination
						showPageSize
						ariaLabel="Loading accounts..."
						animationVariant="shimmer"
						staggerDelay={40}
					/>
				</div>
			</div>
		</>
	)
}
