/**
 * Customer Table RichDataGrid Columns Factory
 * 
 * Creates RichDataGrid column definitions for the customer data grid.
 * Enhanced version with filtering, faceting, and search support.
 * 
 * **Features:**
 * - Text filter on name and email (searchable)
 * - Select filter on status and typeOfBusiness (faceted)
 * - Date filter on createdAt
 * 
 * @see RICHDATAGRID_MIGRATION_PLAN.md - Phase 3.1
 * @module customers/utils
 */

import Link from 'next/link'

import { Archive, Eye, Mail, Phone, Trash2, UserCheck } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { formatDate } from '@_shared'

import { CustomerStatus, TypeOfBusiness } from '@_classes/Enums'
import type Company from '@_classes/Company'

import Button from '@_components/ui/Button'
import {
	createRichColumnHelper,
	FilterType,
	type RichColumnDef,
} from '@_components/tables/RichDataGrid'

import { BusinessTypeBadge, CustomerStatusBadge } from '../components'

interface CreateCustomerColumnsOptions {
	/** Whether user can delete customers (Admin only) */
	canDelete: boolean
	/** Handler for opening delete modal */
	onDelete: (customer: Company) => void
}

// Create the column helper
const columnHelper = createRichColumnHelper<Company>()

/**
 * Creates RichDataGrid column definitions for the customers table.
 * 
 * @param options - Configuration options for columns
 * @returns Array of RichColumnDef column definitions
 */
export function createCustomerRichColumns(
	options: CreateCustomerColumnsOptions
): RichColumnDef<Company, unknown>[] {
	const { canDelete, onDelete } = options

	return [
		// Company Name - Text filter, searchable
		columnHelper.accessor('name', {
			header: 'Company',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => {
				const name = row.original.name || 'Unnamed Company'
				const isArchived = row.original.isArchived
				
				return (
					<div className="flex flex-col gap-0.5 min-w-0">
						<div className="flex items-center gap-2">
							<Link
								href={Routes.Customers.detail(row.original.id ?? '')}
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
		}),

		// Status - Select filter, faceted
		columnHelper.accessor('status', {
			header: 'Status',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => (
				<CustomerStatusBadge
					status={row.original.status ?? CustomerStatus.Active}
					size="sm"
					iconOnly
				/>
			),
		}),

		// Type of Business - Select filter, faceted
		columnHelper.accessor('typeOfBusiness', {
			header: 'Type',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => (
				<BusinessTypeBadge
					type={row.original.typeOfBusiness ?? TypeOfBusiness.Other}
					size="sm"
					iconOnly
				/>
			),
		}),

		// Contact (Email) - Text filter, searchable
		columnHelper.accessor('email', {
			header: 'Contact',
			filterType: FilterType.Text,
			searchable: true,
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
		}),

		// Sales Rep - Text filter
		columnHelper.accessor('primarySalesRep', {
			header: 'Sales Rep',
			enableSorting: false, // Related entity, sorting may not work directly
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
			cell: ({ row }) => (
				<div className="flex justify-end gap-1">
					<Link href={Routes.Customers.detail(row.original.id ?? '')}>
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
		}),
	]
}

export default createCustomerRichColumns

