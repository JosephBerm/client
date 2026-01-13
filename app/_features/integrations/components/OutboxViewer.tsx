'use client'

/**
 * OutboxViewer Component
 *
 * Displays pending outbox events for admin visibility using the standardized DataGrid.
 *
 * @remarks
 * PRD Reference: prd_erp_integration.md - Admin visibility for outbox events
 *
 * **DRY Compliance:**
 * - Uses DataGrid from @_components/tables
 * - Uses Badge from @_components/ui/Badge
 *
 * @module integrations/components
 */

import { useMemo } from 'react'

import { Clock, RefreshCw, Inbox } from 'lucide-react'

import { DataGrid, type ColumnDef } from '@_components/tables'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'

import { useIntegrationDashboard } from '../hooks'
import type { PendingOutboxItem } from '../types'

interface OutboxViewerProps {
	/** Maximum items to display */
	limit?: number
	/** Whether to show refresh button */
	showRefresh?: boolean
	/** Custom empty message */
	emptyMessage?: string
}

/**
 * Displays pending outbox events for admin visibility.
 */
export function OutboxViewer({
	limit = 10,
	showRefresh = true,
	emptyMessage = 'No pending events',
}: OutboxViewerProps) {
	const { data, isLoading, refetch, isRefetching } = useIntegrationDashboard()

	const pendingItems = data?.pendingItems ?? []

	// Define columns for DataGrid - memoized
	const columns = useMemo<ColumnDef<PendingOutboxItem>[]>(
		() => [
			{
				id: 'status',
				header: '',
				size: 40,
				cell: () => <Clock className='h-4 w-4 text-warning' />,
			},
			{
				accessorKey: 'eventType',
				header: 'Event',
				cell: ({ getValue }) => <span className='font-medium'>{getValue<string>()}</span>,
			},
			{
				accessorKey: 'entityType',
				header: 'Entity Type',
				cell: ({ getValue }) => <Badge variant='secondary'>{getValue<string>()}</Badge>,
			},
			{
				accessorKey: 'entityId',
				header: 'Entity ID',
				cell: ({ getValue }) => <span className='font-mono text-sm'>{getValue<string>()}</span>,
			},
			{
				accessorKey: 'targetSystem',
				header: 'Target',
				cell: ({ getValue }) => getValue<string | null>() ?? 'All',
			},
			{
				accessorKey: 'scheduledFor',
				header: 'Scheduled',
				cell: ({ getValue }) => (
					<span className='text-sm text-base-content/60'>
						{new Date(getValue<string>()).toLocaleString()}
					</span>
				),
			},
			{
				accessorKey: 'retryCount',
				header: 'Retries',
				cell: ({ getValue }) => {
					const count = getValue<number>()
					const variant = count > 0 ? 'warning' : 'secondary'
					return <Badge variant={variant}>{count}</Badge>
				},
			},
		],
		[]
	)

	return (
		<div className='space-y-4'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Inbox className='h-5 w-5 text-base-content/70' />
					<h3 className='font-semibold'>Pending Outbox Events</h3>
					{pendingItems.length > 0 && (
						<Badge variant='warning'>{pendingItems.length}</Badge>
					)}
				</div>
				{showRefresh && (
					<Button
						variant='ghost'
						size='sm'
						onClick={() => refetch()}
						disabled={isRefetching}
					>
						<RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
				)}
			</div>

			{/* DataGrid - using standardized table component */}
			<DataGrid<PendingOutboxItem>
				columns={columns}
				data={pendingItems.slice(0, limit)}
				isLoading={isLoading}
				ariaLabel='Pending outbox events'
				enableSorting={false}
				emptyMessage={emptyMessage}
			/>

			{/* Show more indicator */}
			{pendingItems.length > limit && (
				<p className='text-sm text-base-content/60'>
					Showing {limit} of {pendingItems.length} pending events
				</p>
			)}
		</div>
	)
}

export default OutboxViewer
