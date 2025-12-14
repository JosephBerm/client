/**
 * Customer Table Columns Factory
 * 
 * Creates column definitions for the customer data grid.
 * Extracted to separate file for cleaner page component.
 * 
 * @module customers/utils
 */

import Link from 'next/link'

import { Archive, Eye, Mail, Phone, Trash2, UserCheck } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { formatDate } from '@_shared'

import { CustomerStatus, TypeOfBusiness } from '@_classes/Enums'
import type Company from '@_classes/Company'

import Button from '@_components/ui/Button'

import { BusinessTypeBadge, CustomerStatusBadge } from '../components'

import type { ColumnDef } from '@tanstack/react-table'

interface CreateCustomerColumnsOptions {
	/** Whether user can delete customers (Admin only) */
	canDelete: boolean
	/** Handler for opening delete modal */
	onDelete: (customer: Company) => void
}

/**
 * Creates column definitions for the customers table.
 * 
 * @param options - Configuration options for columns
 * @returns Array of TanStack Table column definitions
 * 
 * @example
 * ```tsx
 * const columns = createCustomerColumns({
 *   canDelete: isAdmin,
 *   onDelete: openDeleteModal,
 * })
 * ```
 */
export function createCustomerColumns(
	options: CreateCustomerColumnsOptions
): ColumnDef<Company>[] {
	const { canDelete, onDelete } = options

	return [
		{
			accessorKey: 'name',
			header: 'Company',
			cell: ({ row }) => {
				const name = row.original.name || 'Unnamed Company'
				const isArchived = row.original.isArchived
				
				return (
					<div className="flex flex-col gap-0.5 min-w-0">
						<div className="flex items-center gap-2">
							<Link
								href={Routes.Customers.detail(row.original.id)}
								className={`link link-primary font-semibold truncate ${
									isArchived ? 'opacity-60' : ''
								}`}
							>
								{name}
							</Link>
							{isArchived && (
								<span className="badge badge-ghost badge-sm gap-1">
									<Archive size={10} />
									Archived
								</span>
							)}
						</div>
						{/* Mobile: Show email inline */}
						<span className="text-xs text-base-content/60 truncate sm:hidden">
							{row.original.email}
						</span>
					</div>
				)
			},
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => (
				<CustomerStatusBadge
					status={row.original.status ?? CustomerStatus.Active}
					size="sm"
					iconOnly
				/>
			),
		},
		{
			accessorKey: 'typeOfBusiness',
			header: 'Type',
			cell: ({ row }) => (
				<BusinessTypeBadge
					type={row.original.typeOfBusiness ?? TypeOfBusiness.Other}
					size="sm"
					iconOnly
				/>
			),
		},
		{
			accessorKey: 'email',
			header: 'Contact',
			cell: ({ row }) => (
				<div className="hidden sm:flex flex-col gap-0.5 text-sm">
					{row.original.email ? (
						<a
							href={`mailto:${row.original.email}`}
							className="link link-hover flex items-center gap-1 text-base-content/80"
						>
							<Mail size={12} aria-hidden="true" />
							<span className="truncate max-w-[180px]">{row.original.email}</span>
						</a>
					) : (
						<span className="text-base-content/40 italic">No email</span>
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
				</div>
			),
		},
		{
			accessorKey: 'primarySalesRep',
			header: 'Sales Rep',
			cell: ({ row }) => {
				const rep = row.original.primarySalesRep
				if (!rep) {
					return (
						<span className="text-base-content/40 text-sm italic">Unassigned</span>
					)
				}
				const name = rep.name
					? [rep.name.first, rep.name.last].filter(Boolean).join(' ')
					: rep.username
				return (
					<div className="flex items-center gap-1.5 text-sm">
						<UserCheck size={14} className="text-success" aria-hidden="true" />
						<span className="truncate max-w-[120px]">{name}</span>
					</div>
				)
			},
		},
		{
			accessorKey: 'createdAt',
			header: 'Created',
			cell: ({ row }) => (
				<span className="text-sm text-base-content/70">
					{formatDate(row.original.createdAt, 'short')}
				</span>
			),
		},
		{
			id: 'actions',
			header: '',
			cell: ({ row }) => (
				<div className="flex justify-end gap-1">
					<Link href={Routes.Customers.detail(row.original.id)}>
						<Button
							variant="ghost"
							size="sm"
							aria-label={`View ${row.original.name || 'customer'}`}
						>
							<Eye className="w-4 h-4" />
						</Button>
					</Link>
					{canDelete && (
						<Button
							variant="ghost"
							size="sm"
							className="text-error hover:text-error hover:bg-error/10"
							onClick={() => onDelete(row.original)}
							aria-label={`Delete ${row.original.name || 'customer'}`}
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					)}
				</div>
			),
		},
	]
}

export default createCustomerColumns

