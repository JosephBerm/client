/**
 * createProviderColumns - Provider Table Column Definitions
 * 
 * Factory function for creating TanStack Table column definitions.
 * Follows the same pattern as createCustomerColumns for consistency.
 * 
 * STATUS WORKFLOW (Industry Best Practice):
 * Active -> Suspended -> Archived (can be restored at each step)
 * 
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

import type { ColumnDef } from '@tanstack/react-table'

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

/**
 * Creates column definitions for the providers table.
 * 
 * @param options - Column configuration options
 * @returns Array of TanStack Table column definitions
 * 
 * @example
 * ```tsx
 * const columns = createProviderColumns({
 *   canDelete: isAdmin,
 *   canManageStatus: isAdmin,
 *   onDelete: openDeleteModal,
 *   onArchive: openArchiveModal,
 *   onSuspend: openSuspendModal,
 *   onActivate: handleActivate,
 * })
 * ```
 */
export function createProviderColumns(
	options: CreateProviderColumnsOptions
): ColumnDef<Provider>[] {
	const { canDelete, canManageStatus, onDelete, onArchive, onSuspend, onActivate } = options

	return [
		{
			accessorKey: 'name',
			header: 'Provider',
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
						<Factory className="w-5 h-5 text-primary" />
					</div>
					<div className="min-w-0">
						<Link
							href={Routes.Providers.detail(row.original.id)}
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
		},
		{
			accessorKey: 'email',
			header: 'Contact',
			cell: ({ row }) => (
				<div className="space-y-1 hidden sm:block">
					{row.original.email && (
						<div className="flex items-center gap-2 text-sm">
							<Mail className="w-3.5 h-3.5 text-base-content/50" />
							<a 
								href={`mailto:${row.original.email}`}
								className="hover:text-primary transition-colors truncate max-w-[180px]"
							>
								{row.original.email}
							</a>
						</div>
					)}
					{row.original.phone && (
						<div className="flex items-center gap-2 text-sm">
							<Phone className="w-3.5 h-3.5 text-base-content/50" />
							<a 
								href={`tel:${row.original.phone}`}
								className="hover:text-primary transition-colors"
							>
								{row.original.phone}
							</a>
						</div>
					)}
					{!row.original.email && !row.original.phone && (
						<span className="text-sm text-base-content/40">No contact info</span>
					)}
				</div>
			),
		},
		{
			accessorKey: 'website',
			header: 'Website',
			cell: ({ row }) => 
				row.original.website ? (
					<a 
						href={row.original.website}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-primary hover:underline truncate max-w-[150px] hidden md:block"
					>
						{row.original.website.replace(/^https?:\/\//, '')}
					</a>
				) : (
					<span className="text-sm text-base-content/40 hidden md:block">—</span>
				),
		},
		{
			accessorKey: 'createdAt',
			header: 'Added',
			cell: ({ row }) => (
				<span className="text-sm text-base-content/70 hidden lg:block">
					{formatDate(row.original.createdAt, 'short')}
				</span>
			),
		},
		{
			id: 'status',
			header: 'Status',
			cell: ({ row }) => (
				<ProviderStatusBadge 
					status={row.original.status} 
					size="sm"
					showTooltip
				/>
			),
		},
		{
			id: 'actions',
			header: '',
			cell: ({ row }) => {
				const provider = row.original
				const status = provider.status ?? ProviderStatus.Active

				return (
					<div className="flex items-center justify-end gap-1">
						{/* View Button - Always visible */}
						<Link href={Routes.Providers.detail(provider.id)}>
							<Button 
								variant="ghost" 
								size="sm"
								aria-label={`View ${provider.name}`}
							>
								<Eye className="w-4 h-4" />
							</Button>
						</Link>
						
						{/* Status Actions - Based on current status */}
						{canManageStatus && (
							<>
								{/* Activate (from Suspended or Archived) */}
								{status !== ProviderStatus.Active && (
									<Button
										variant="ghost"
										size="sm"
										className="text-success hover:text-success hover:bg-success/10"
										onClick={() => onActivate(provider)}
										aria-label={`Activate ${provider.name}`}
										title="Activate provider"
									>
										<CheckCircle className="w-4 h-4" />
									</Button>
								)}
								
								{/* Suspend (from Active only) */}
								{status === ProviderStatus.Active && (
									<Button
										variant="ghost"
										size="sm"
										className="text-warning hover:text-warning hover:bg-warning/10"
										onClick={() => onSuspend(provider)}
										aria-label={`Suspend ${provider.name}`}
										title="Suspend provider"
									>
										<PauseCircle className="w-4 h-4" />
									</Button>
								)}
								
								{/* Archive (from Active or Suspended) */}
								{status !== ProviderStatus.Archived && (
									<Button
										variant="ghost"
										size="sm"
										className="text-error hover:text-error hover:bg-error/10"
										onClick={() => onArchive(provider)}
										aria-label={`Archive ${provider.name}`}
										title="Archive provider"
									>
										<Archive className="w-4 h-4" />
									</Button>
								)}
							</>
						)}
						
						{/* Delete Button - Admin only */}
						{canDelete && (
							<Button
								variant="ghost"
								size="sm"
								className="text-error hover:text-error hover:bg-error/10"
								onClick={() => onDelete(provider)}
								aria-label={`Delete ${provider.name}`}
								title="Permanently delete"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						)}
					</div>
				)
			},
		},
	]
}

export default createProviderColumns

