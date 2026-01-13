'use client'

/**
 * EntityMappingsTable Component
 *
 * Displays entity mappings between Prometheus and ERP systems using the
 * standardized DataGrid component.
 *
 * @remarks
 * PRD Reference: prd_erp_integration.md - US-ERP-007 (View entity mappings)
 *
 * **DRY Compliance:**
 * - Uses DataGrid from @_components/tables (standardized table component)
 * - Uses Badge from @_components/ui/Badge
 * - Uses Select from @_components/ui/Select
 *
 * @module integrations/components
 */

import { useState, useMemo } from 'react'

import { ExternalLink, Search } from 'lucide-react'

import { DataGrid, type ColumnDef } from '@_components/tables'
import Badge from '@_components/ui/Badge'
import Input from '@_components/ui/Input'
import Select, { type SelectOption } from '@_components/ui/Select'

import { ENTITY_TYPES, PROVIDERS } from '../constants'
import { useEntityMappings } from '../hooks'
import type { IntegrationEntityMappingDTO, IntegrationProvider } from '../types'

interface EntityMappingsTableProps {
	/** Pre-filter by provider */
	provider?: IntegrationProvider
	/** Pre-filter by entity type */
	entityType?: string
	/** Number of items per page */
	pageSize?: number
}

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
	{ value: ENTITY_TYPES.ORDER, label: 'Order' },
]

/**
 * Table displaying entity mappings between Prometheus and ERP systems.
 */
export function EntityMappingsTable({ provider, entityType, pageSize = 10 }: EntityMappingsTableProps) {
	const [currentProvider, setCurrentProvider] = useState<string>(provider ?? '')
	const [currentEntityType, setCurrentEntityType] = useState<string>(entityType ?? '')
	const [searchTerm, setSearchTerm] = useState('')
	const [pageNumber, setPageNumber] = useState(1)

	const { data, isLoading } = useEntityMappings({
		provider: currentProvider || undefined,
		entityType: currentEntityType || undefined,
		searchTerm: searchTerm || undefined,
		pageNumber,
		pageSize,
	})

	const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentProvider(e.target.value)
		setPageNumber(1)
	}

	const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentEntityType(e.target.value)
		setPageNumber(1)
	}

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
		setPageNumber(1)
	}

	// Define columns for DataGrid - memoized to prevent re-renders
	const columns = useMemo<ColumnDef<IntegrationEntityMappingDTO>[]>(
		() => [
			{
				id: 'link',
				header: '',
				size: 40,
				cell: () => <ExternalLink className='h-4 w-4 text-base-content/50' />,
			},
			{
				accessorKey: 'provider',
				header: 'Provider',
				cell: ({ getValue }) => <span className='font-medium'>{getValue<string>()}</span>,
			},
			{
				accessorKey: 'entityType',
				header: 'Entity Type',
				cell: ({ getValue }) => <Badge variant='secondary'>{getValue<string>()}</Badge>,
			},
			{
				accessorKey: 'prometheusId',
				header: 'Prometheus ID',
				cell: ({ getValue }) => <span className='font-mono text-sm'>{getValue<string>()}</span>,
			},
			{
				accessorKey: 'externalId',
				header: 'External ID',
				cell: ({ getValue }) => <span className='font-mono text-sm'>{getValue<string>()}</span>,
			},
			{
				accessorKey: 'lastSyncAt',
				header: 'Last Sync',
				cell: ({ getValue }) => {
					const date = getValue<string | null>()
					return (
						<span className='text-sm text-base-content/60'>
							{date ? new Date(date).toLocaleString() : 'Never'}
						</span>
					)
				},
			},
			{
				accessorKey: 'lastSyncDirection',
				header: 'Direction',
				cell: ({ getValue }) => {
					const direction = getValue<string | null>()
					if (!direction) {
						return null
					}
					const variant = direction === 'Outbound' ? 'primary' : 'secondary'
					return <Badge variant={variant}>{direction}</Badge>
				},
			},
		],
		[]
	)

	return (
		<div className='space-y-4'>
			{/* Filters */}
			<div className='flex flex-wrap items-center gap-4'>
				<div className='flex items-center gap-2'>
					<Search className='h-4 w-4 text-base-content/50' />
					<Input
						placeholder='Search by ID...'
						value={searchTerm}
						onChange={handleSearchChange}
						className='w-48'
						size='sm'
					/>
				</div>

				{!provider && (
					<Select
						value={currentProvider}
						onChange={handleProviderChange}
						options={providerOptions}
						size='sm'
						width='md'
						placeholder='All Providers'
					/>
				)}

				<Select
					value={currentEntityType}
					onChange={handleEntityTypeChange}
					options={entityTypeOptions}
					size='sm'
					width='md'
					placeholder='All Types'
				/>
			</div>

			{/* DataGrid - using standardized table component */}
			<DataGrid<IntegrationEntityMappingDTO>
				columns={columns}
				data={data?.items ?? []}
				isLoading={isLoading}
				ariaLabel='Entity mappings table'
				enableSorting={false}
				enablePagination
				manualPagination
				pageCount={data?.totalPages ?? 1}
				pagination={{ pageIndex: pageNumber - 1, pageSize }}
				onPaginationChange={(updater) => {
					const newState =
						typeof updater === 'function' ? updater({ pageIndex: pageNumber - 1, pageSize }) : updater
					setPageNumber(newState.pageIndex + 1)
				}}
				emptyMessage='No entity mappings found'
			/>

			{/* Pagination info */}
			{data && data.totalCount > 0 && (
				<div className='text-sm text-base-content/60'>
					Showing {(pageNumber - 1) * pageSize + 1} to {Math.min(pageNumber * pageSize, data.totalCount)} of{' '}
					{data.totalCount} mappings
				</div>
			)}
		</div>
	)
}

export default EntityMappingsTable
