'use client'

/**
 * SyncLogsTable Component
 *
 * Displays sync operation logs using the standardized DataGrid component.
 *
 * @remarks
 * PRD Reference: prd_erp_integration.md - US-ERP-008 (View sync logs)
 *
 * **DRY Compliance:**
 * - Uses DataGrid from @_components/tables (standardized table component)
 * - Uses Badge from @_components/ui/Badge
 * - Uses Select from @_components/ui/Select
 *
 * @module integrations/components
 */

import { useState, useMemo } from 'react'

import { AlertCircle, CheckCircle, Clock, Search, XCircle } from 'lucide-react'

import { DataGrid, type ColumnDef } from '@_components/tables'
import Badge from '@_components/ui/Badge'
import Input from '@_components/ui/Input'
import Select, { type SelectOption } from '@_components/ui/Select'

import { ENTITY_TYPES, PROVIDERS } from '../constants'
import { useSyncLogs } from '../hooks'
import { formatDuration, SyncStatus } from '../types'
import type { IntegrationProvider, IntegrationSyncLogDTO, SyncLogSearchFilter } from '../types'

interface SyncLogsTableProps {
	provider?: IntegrationProvider
	entityType?: string
	pageSize?: number
}

// Status options for Select - using actual enum values
const statusOptions: SelectOption<string>[] = [
	{ value: '', label: 'All Statuses' },
	{ value: String(SyncStatus.Pending), label: 'Pending' },
	{ value: String(SyncStatus.InProgress), label: 'In Progress' },
	{ value: String(SyncStatus.Completed), label: 'Completed' },
	{ value: String(SyncStatus.Failed), label: 'Failed' },
	{ value: String(SyncStatus.Skipped), label: 'Skipped' },
]

// Provider options for Select - using constants for DRY compliance
const providerOptions: SelectOption<string>[] = [
	{ value: '', label: 'All Providers' },
	{ value: PROVIDERS.QUICKBOOKS, label: 'QuickBooks' },
	{ value: PROVIDERS.NETSUITE, label: 'NetSuite' },
]

// Entity type options for Select - using constants for DRY compliance
const entityTypeOptions: SelectOption<string>[] = [
	{ value: '', label: 'All Types' },
	{ value: ENTITY_TYPES.CUSTOMER, label: 'Customer' },
	{ value: ENTITY_TYPES.INVOICE, label: 'Invoice' },
	{ value: ENTITY_TYPES.PAYMENT, label: 'Payment' },
	{ value: ENTITY_TYPES.PRODUCT, label: 'Product' },
]

// Get status icon component
function StatusIcon({ status }: { status: SyncStatus }) {
	switch (status) {
		case SyncStatus.Completed:
			return <CheckCircle className='h-4 w-4 text-success' />
		case SyncStatus.Failed:
			return <XCircle className='h-4 w-4 text-error' />
		case SyncStatus.Pending:
		case SyncStatus.InProgress:
			return <Clock className='h-4 w-4 text-warning' />
		default:
			return <AlertCircle className='h-4 w-4 text-base-content/50' />
	}
}

/**
 * Table displaying sync logs with filtering and pagination.
 */
export function SyncLogsTable({ provider, entityType, pageSize = 10 }: SyncLogsTableProps) {
	const [filter, setFilter] = useState<SyncLogSearchFilter>({
		provider,
		entityType,
		pageNumber: 1,
		pageSize,
		sortDescending: true,
	})

	const { data, isLoading } = useSyncLogs(filter)

	const handleFilterChange = (key: keyof SyncLogSearchFilter, value: string | number | undefined) => {
		setFilter((prev) => ({
			...prev,
			[key]: value === '' ? undefined : value,
			pageNumber: 1, // Reset to first page on filter change
		}))
	}

	// Define columns for DataGrid - memoized to prevent re-renders
	const columns = useMemo<ColumnDef<IntegrationSyncLogDTO>[]>(
		() => [
			{
				id: 'statusIcon',
				header: '',
				size: 40,
				cell: ({ row }) => <StatusIcon status={row.original.status} />,
			},
			{
				accessorKey: 'provider',
				header: 'Provider',
				cell: ({ getValue }) => <span className='font-medium'>{getValue<string>()}</span>,
			},
			{
				id: 'entity',
				header: 'Entity',
				cell: ({ row }) => (
					<div>
						<span className='font-medium'>{row.original.entityType}</span>
						{row.original.entityId && (
							<span className='text-base-content/60'> #{row.original.entityId}</span>
						)}
					</div>
				),
			},
			{
				accessorKey: 'directionDisplay',
				header: 'Direction',
				cell: ({ getValue }) => <Badge variant='secondary'>{getValue<string>()}</Badge>,
			},
			{
				accessorKey: 'operation',
				header: 'Operation',
				cell: ({ getValue }) => getValue<string>() ?? '-',
			},
			{
				accessorKey: 'startedAt',
				header: 'Started',
				cell: ({ getValue }) => (
					<span className='text-sm text-base-content/60'>
						{new Date(getValue<string>()).toLocaleString()}
					</span>
				),
			},
			{
				accessorKey: 'durationMs',
				header: 'Duration',
				cell: ({ getValue }) => formatDuration(getValue<number | undefined>()),
			},
			{
				accessorKey: 'errorMessage',
				header: 'Error',
				cell: ({ getValue }) => {
					const error = getValue<string | null>()
					if (!error) {
						return null
					}
					return (
						<span
							className='max-w-xs truncate text-error'
							title={error}>
							{error}
						</span>
					)
				},
			},
		],
		[]
	)

	return (
		<div className='space-y-4'>
			{/* Filters */}
			<div className='flex flex-wrap gap-4'>
				<div className='flex items-center gap-2'>
					<Search className='h-4 w-4 text-base-content/50' />
					<Input
						placeholder='Search...'
						value={filter.searchTerm ?? ''}
						onChange={(e) => handleFilterChange('searchTerm', e.target.value || undefined)}
						className='w-48'
						size='sm'
					/>
				</div>

				<Select
					value={filter.status?.toString() ?? ''}
					onChange={(e) =>
						handleFilterChange('status', e.target.value ? parseInt(e.target.value) : undefined)
					}
					options={statusOptions}
					size='sm'
					width='md'
				/>

				{!provider && (
					<Select
						value={filter.provider ?? ''}
						onChange={(e) => handleFilterChange('provider', e.target.value || undefined)}
						options={providerOptions}
						size='sm'
						width='md'
					/>
				)}

				<Select
					value={filter.entityType ?? ''}
					onChange={(e) => handleFilterChange('entityType', e.target.value || undefined)}
					options={entityTypeOptions}
					size='sm'
					width='md'
				/>
			</div>

			{/* DataGrid - using standardized table component */}
			<DataGrid<IntegrationSyncLogDTO>
				columns={columns}
				data={data?.items ?? []}
				isLoading={isLoading}
				ariaLabel='Sync logs table'
				enableSorting={false}
				enablePagination
				manualPagination
				pageCount={data?.totalPages ?? 1}
				pagination={{ pageIndex: (filter.pageNumber ?? 1) - 1, pageSize }}
				onPaginationChange={(updater) => {
					const currentPageIndex = (filter.pageNumber ?? 1) - 1
					const newState =
						typeof updater === 'function' ? updater({ pageIndex: currentPageIndex, pageSize }) : updater
					setFilter((prev) => ({ ...prev, pageNumber: newState.pageIndex + 1 }))
				}}
				emptyMessage='No sync logs found'
			/>

			{/* Pagination info */}
			{data && data.totalCount > 0 && (
				<div className='text-sm text-base-content/60'>
					Showing {((filter.pageNumber ?? 1) - 1) * pageSize + 1} to{' '}
					{Math.min((filter.pageNumber ?? 1) * pageSize, data.totalCount)} of {data.totalCount} logs
				</div>
			)}
		</div>
	)
}

export default SyncLogsTable
