/**
 * createProviderRichColumns - Provider Table RichDataGrid Column Definitions
 * 
 * Factory function for creating RichDataGrid column definitions for providers.
 * Enhanced version with filtering, faceting, and search support.
 * 
 * STATUS WORKFLOW (Industry Best Practice):
 * Active -> Suspended -> Archived (can be restored at each step)
 * 
 * @see RICHDATAGRID_MIGRATION_PLAN.md - Phase 3.2
 * @module providers/utils
 */

import Link from 'next/link'

import { 
	Archive, 
	CheckCircle, 
	Eye, 
	Factory, 
	Mail, 
	PauseCircle, 
	Phone, 
	Trash2 
} from 'lucide-react'

import { Routes } from '@_features/navigation'

import { formatDate } from '@_shared'

import type Provider from '@_classes/Provider'
import { ProviderStatus } from '@_classes/Provider'

import { ProviderStatusBadge } from '../components'

import Button from '@_components/ui/Button'
import {
	createRichColumnHelper,
	FilterType,
	type RichColumnDef,
} from '@_components/tables/RichDataGrid'

interface CreateProviderColumnsOptions {
	/** Whether the user can delete providers */
	canDelete: boolean
	/** Whether the user can manage provider status */
	canManageStatus: boolean
	/** Callback when delete button is clicked */
	onDelete: (provider: Provider) => void
	/** Callback when archive button is clicked */
	onArchive: (provider: Provider) => void
	/** Callback when suspend button is clicked */
	onSuspend: (provider: Provider) => void
	/** Callback when activate button is clicked */
	onActivate: (provider: Provider) => void
}

// Create the column helper
const columnHelper = createRichColumnHelper<Provider>()

/**
 * Creates RichDataGrid column definitions for the providers table.
 * 
 * @param options - Column configuration options
 * @returns Array of RichColumnDef column definitions
 */
export function createProviderRichColumns(
	options: CreateProviderColumnsOptions
): RichColumnDef<Provider, unknown>[] {
	const { canDelete, canManageStatus, onDelete, onArchive, onSuspend, onActivate } = options

	return [
		// Provider Name - Text filter, searchable
		columnHelper.accessor('name', {
			header: 'Provider',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
						<Factory className="w-5 h-5 text-primary" />
					</div>
					<div className="min-w-0">
						<Link
							href={Routes.Providers.detail(row.original.id ?? '')}
							className="font-semibold text-base-content hover:text-primary transition-colors line-clamp-1"
						>
							{row.original.name}
						</Link>
						{row.original.identifier && (
							<p className="text-xs text-base-content/60 mt-0.5">
								ID: {row.original.identifier}
							</p>
						)}
					</div>
				</div>
			),
		}),

		// Status - Select filter, faceted
		columnHelper.accessor('status', {
			header: 'Status',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => (
				<ProviderStatusBadge status={row.original.status ?? ProviderStatus.Active} />
			),
		}),

		// Contact (Email) - Text filter, searchable
		columnHelper.accessor('email', {
			header: 'Contact',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<div className="flex flex-col gap-0.5 text-sm">
					{row.original.email && (
						<a
							href={`mailto:${row.original.email}`}
							className="link link-hover flex items-center gap-1 text-base-content/80"
						>
							<Mail size={12} aria-hidden="true" />
							<span className="truncate max-w-[180px]">{row.original.email}</span>
						</a>
					)}
					{row.original.phone && (
						<a
							href={`tel:${row.original.phone}`}
							className="flex items-center gap-1 text-base-content/60"
						>
							<Phone size={12} aria-hidden="true" />
							<span>{row.original.phone}</span>
						</a>
					)}
					{!row.original.email && !row.original.phone && (
						<span className="text-base-content/40 italic">No contact info</span>
					)}
				</div>
			),
		}),

		// Created At - Date filter
		columnHelper.accessor('createdAt', {
			header: 'Created',
			filterType: FilterType.Date,
			cell: ({ row }) => (
				<span className="text-sm text-base-content/70">
					{formatDate(row.original.createdAt, 'short')}
				</span>
			),
		}),

		// Actions - Display only
		columnHelper.display({
			id: 'actions',
			header: '',
			cell: ({ row }) => {
				const provider = row.original
				const status = provider.status ?? ProviderStatus.Active

				return (
					<div className="flex justify-end gap-1">
						{/* View */}
						<Link href={Routes.Providers.detail(provider.id ?? '')}>
							<Button
								variant="ghost"
								size="sm"
								aria-label={`View ${provider.name}`}
							>
								<Eye className="w-4 h-4" />
							</Button>
						</Link>

						{/* Status Management Actions */}
						{canManageStatus && (
							<>
								{status === ProviderStatus.Active && (
									<Button
										variant="ghost"
										size="sm"
										className="text-warning hover:text-warning hover:bg-warning/10"
										onClick={() => onSuspend(provider)}
										aria-label={`Suspend ${provider.name}`}
									>
										<PauseCircle className="w-4 h-4" />
									</Button>
								)}

								{status === ProviderStatus.Suspended && (
									<>
										<Button
											variant="ghost"
											size="sm"
											className="text-success hover:text-success hover:bg-success/10"
											onClick={() => onActivate(provider)}
											aria-label={`Activate ${provider.name}`}
										>
											<CheckCircle className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="text-error hover:text-error hover:bg-error/10"
											onClick={() => onArchive(provider)}
											aria-label={`Archive ${provider.name}`}
										>
											<Archive className="w-4 h-4" />
										</Button>
									</>
								)}

								{status === ProviderStatus.Archived && (
									<Button
										variant="ghost"
										size="sm"
										className="text-success hover:text-success hover:bg-success/10"
										onClick={() => onActivate(provider)}
										aria-label={`Restore ${provider.name}`}
									>
										<CheckCircle className="w-4 h-4" />
									</Button>
								)}
							</>
						)}

						{/* Delete - Only for Archived providers */}
						{canDelete && status === ProviderStatus.Archived && (
							<Button
								variant="ghost"
								size="sm"
								className="text-error hover:text-error hover:bg-error/10"
								onClick={() => onDelete(provider)}
								aria-label={`Delete ${provider.name}`}
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						)}
					</div>
				)
			},
		}),
	]
}

export default createProviderRichColumns

