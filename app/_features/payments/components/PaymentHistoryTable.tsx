/**
 * Payment History Table Component
 *
 * Displays a table of payments for an order or customer.
 * Uses TanStack Table for sorting and pagination.
 *
 * **Features:**
 * - Sortable columns
 * - Payment method icons
 * - Status badges
 * - Refund action button
 * - Empty state
 *
 * @module payments/components/PaymentHistoryTable
 */

'use client'

import { useMemo, useState } from 'react'

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type SortingState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import {
	ArrowUpDown,
	Banknote,
	Building2,
	CreditCard,
	FileText,
	MoreHorizontal,
	RefreshCcw,
} from 'lucide-react'

import {
	PaymentMethod,
	PaymentStatus,
	formatAmountCents,
	getPaymentMethodDisplay,
	type PaymentDTO,
} from '../types'

import { PaymentStatusBadge } from './PaymentStatusBadge'

// =========================================================================
// COMPONENT TYPES
// =========================================================================

export interface PaymentHistoryTableProps {
	/** Payments to display */
	payments: PaymentDTO[]
	/** Whether the table is in loading state */
	isLoading?: boolean
	/** Callback when refund is requested */
	onRefund?: (payment: PaymentDTO) => void
	/** Whether to show the order number column */
	showOrderColumn?: boolean
	/** Whether to show the customer column */
	showCustomerColumn?: boolean
	/** Custom class name */
	className?: string
}

// =========================================================================
// PAYMENT METHOD ICONS
// =========================================================================

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, typeof CreditCard> = {
	[PaymentMethod.CreditCard]: CreditCard,
	[PaymentMethod.DebitCard]: CreditCard,
	[PaymentMethod.ACH]: Building2,
	[PaymentMethod.Check]: FileText,
	[PaymentMethod.Wire]: Building2,
	[PaymentMethod.Cash]: Banknote,
	[PaymentMethod.Other]: CreditCard,
}

// =========================================================================
// TABLE COLUMN DEFINITIONS
// =========================================================================

const columnHelper = createColumnHelper<PaymentDTO>()

// =========================================================================
// PAYMENT HISTORY TABLE COMPONENT
// =========================================================================

/**
 * PaymentHistoryTable Component
 *
 * Renders a sortable table of payments with actions.
 */
export function PaymentHistoryTable({
	payments,
	isLoading = false,
	onRefund,
	showOrderColumn = false,
	showCustomerColumn = false,
	className = '',
}: PaymentHistoryTableProps) {
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])

	// Define columns dynamically based on props
	const columns = useMemo(
		() => [
			// Date column
			columnHelper.accessor('createdAt', {
				header: ({ column }) => (
					<button
						className="flex items-center gap-1"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						Date
						<ArrowUpDown className="h-3 w-3" />
					</button>
				),
				cell: (info) => (
					<span className="text-sm">
						{format(new Date(info.getValue()), 'MMM d, yyyy')}
						<br />
						<span className="text-xs text-base-content/60">
							{format(new Date(info.getValue()), 'h:mm a')}
						</span>
					</span>
				),
			}),

			// Order column (conditional)
			...(showOrderColumn
				? [
						columnHelper.accessor('orderNumber', {
							header: 'Order',
							cell: (info) => (
								<span className="font-mono text-sm">{info.getValue() ?? `#${info.row.original.orderId}`}</span>
							),
						}),
				  ]
				: []),

			// Customer column (conditional)
			...(showCustomerColumn
				? [
						columnHelper.accessor('customerName', {
							header: 'Customer',
							cell: (info) => <span className="text-sm">{info.getValue() ?? '-'}</span>,
						}),
				  ]
				: []),

			// Method column
			columnHelper.accessor('method', {
				header: 'Method',
				cell: (info) => {
					const method = info.getValue()
					const Icon = PAYMENT_METHOD_ICONS[method] ?? CreditCard
					const payment = info.row.original
					return (
						<div className="flex items-center gap-2">
							<Icon className="h-4 w-4 text-base-content/60" />
							<div>
								<span className="text-sm">{getPaymentMethodDisplay(method)}</span>
								{payment.cardLastFour && (
									<span className="ml-1 text-xs text-base-content/60">
										****{payment.cardLastFour}
									</span>
								)}
								{payment.referenceNumber && (
									<div className="text-xs text-base-content/60">{payment.referenceNumber}</div>
								)}
							</div>
						</div>
					)
				},
			}),

			// Amount column
			columnHelper.accessor('amountCents', {
				header: ({ column }) => (
					<button
						className="flex items-center gap-1"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						Amount
						<ArrowUpDown className="h-3 w-3" />
					</button>
				),
				cell: (info) => {
					const payment = info.row.original
					return (
						<div className="text-right">
							<span className="font-medium">
								{formatAmountCents(info.getValue(), payment.currency)}
							</span>
							{payment.refundedAmountCents > 0 && (
								<div className="flex items-center justify-end gap-1 text-xs text-warning">
									<RefreshCcw className="h-3 w-3" />
									-{formatAmountCents(payment.refundedAmountCents, payment.currency)}
								</div>
							)}
						</div>
					)
				},
			}),

			// Status column
			columnHelper.accessor('status', {
				header: 'Status',
				cell: (info) => <PaymentStatusBadge status={info.getValue()} />,
			}),

			// Actions column
			columnHelper.display({
				id: 'actions',
				header: '',
				cell: (info) => {
					const payment = info.row.original
					const canRefund =
						onRefund &&
						payment.status === PaymentStatus.Succeeded &&
						payment.amountCents > payment.refundedAmountCents

					if (!canRefund) return null

					return (
						<div className="dropdown dropdown-end">
							<button tabIndex={0} className="btn btn-ghost btn-xs">
								<MoreHorizontal className="h-4 w-4" />
							</button>
							<ul
								tabIndex={0}
								className="dropdown-content menu rounded-box z-50 w-40 bg-base-100 p-2 shadow"
							>
								<li>
									<button onClick={() => onRefund(payment)}>
										<RefreshCcw className="h-4 w-4" />
										Refund
									</button>
								</li>
							</ul>
						</div>
					)
				},
			}),
		],
		[showOrderColumn, showCustomerColumn, onRefund]
	)

	const table = useReactTable({
		data: payments,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	// Loading state
	if (isLoading) {
		return (
			<div className={`space-y-2 ${className}`}>
				{[1, 2, 3].map((i) => (
					<div key={i} className="skeleton h-16 w-full" />
				))}
			</div>
		)
	}

	// Empty state
	if (payments.length === 0) {
		return (
			<div className={`rounded-lg border border-base-200 p-8 text-center ${className}`}>
				<CreditCard className="mx-auto mb-2 h-8 w-8 text-base-content/40" />
				<p className="text-base-content/60">No payments recorded yet</p>
			</div>
		)
	}

	return (
		<div className={`overflow-x-auto ${className}`}>
			<table className="table table-sm">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id} className="bg-base-200">
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="hover:bg-base-200/50">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default PaymentHistoryTable
