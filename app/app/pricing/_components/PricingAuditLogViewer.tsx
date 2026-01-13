'use client'

/**
 * Pricing Audit Log Viewer Component
 *
 * Displays a history of pricing operations for audit and compliance purposes.
 * Shows price calculations, price list changes, and customer assignments.
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 6.3 (Audit & Compliance)
 * > "All pricing calculations during checkout/order creation are logged"
 *
 * **Features:**
 * - Paginated list of audit log entries
 * - Filter by product, customer, event type
 * - Date range filtering
 * - Applied rules breakdown view
 * - Export functionality (CSV)
 *
 * **DRY Compliance:**
 * - Uses shared PricingAuditLogResponse from @_classes/Pricing
 * - Uses usePricingAuditLogs hook from @_features/pricing/hooks
 *
 * @module pricing/components/PricingAuditLogViewer
 */

import { useState } from 'react'
import {
	FileText,
	Calendar,
	User,
	DollarSign,
	Shield,
	ChevronDown,
	ChevronUp,
	Download,
	Filter,
	History,
} from 'lucide-react'

import { formatDate } from '@_lib/dates'
import { formatCurrency } from '@_lib/formatters'

import { usePricingAuditLogs } from '@_features/pricing/hooks'
import {
	type PricingAuditLogResponse,
	type PricingAuditLogFilter,
	PricingRuleApplication,
} from '@_classes/Pricing'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import FormInput from '@_components/forms/FormInput'
import FormSection from '@_components/forms/FormSection'
import {
	RichDataGrid,
	createRichColumnHelper,
	createColumnId,
	FilterType,
	SortDirection,
	type RichColumnDef,
} from '@_components/tables/RichDataGrid'

// =========================================================================
// COMPONENT
// =========================================================================

export default function PricingAuditLogViewer() {
	const [filters, setFilters] = useState<PricingAuditLogFilter>({
		page: 1,
		pageSize: 20,
	})
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

	// Fetch audit logs with current filters using shared hook (DRY)
	const {
		data: logsData,
		isLoading,
		error,
	} = usePricingAuditLogs(filters)

	const logs = logsData?.data ?? []

	// Toggle row expansion
	const toggleRowExpansion = (id: string) => {
		const newExpanded = new Set(expandedRows)
		if (newExpanded.has(id)) {
			newExpanded.delete(id)
		} else {
			newExpanded.add(id)
		}
		setExpandedRows(newExpanded)
	}

	// Parse applied rules JSON using shared type
	const parseAppliedRules = (json: string): PricingRuleApplication[] => {
		try {
			const parsed = JSON.parse(json)
			return parsed.map((r: Partial<PricingRuleApplication>) => new PricingRuleApplication(r))
		} catch {
			return []
		}
	}

	// Export to CSV - implements PRD Section 6.3 export functionality
	const handleExportCsv = () => {
		if (logs.length === 0) return

		const headers = [
			'Date',
			'Event Type',
			'Product ID',
			'Product Name',
			'SKU',
			'Customer ID',
			'Customer Name',
			'Quantity',
			'Base Price',
			'Final Price',
			'Discount',
			'Margin %',
			'Protected',
			'Quote ID',
			'Order ID',
		]

		const rows = logs.map((log) => [
			log.calculatedAt instanceof Date ? log.calculatedAt.toISOString() : log.calculatedAt,
			log.eventType,
			log.productId,
			log.productName ?? '',
			log.productSku ?? '',
			log.customerId?.toString() ?? '',
			log.customerName ?? '',
			log.quantity.toString(),
			log.basePrice.toFixed(2),
			log.finalPrice.toFixed(2),
			log.totalDiscount.toFixed(2),
			log.effectiveMarginPercent?.toFixed(2) ?? '',
			log.marginProtected ? 'Yes' : 'No',
			log.quoteId ?? '',
			log.orderId?.toString() ?? '',
		])

		const csvContent = [
			headers.join(','),
			...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
		].join('\n')

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `pricing-audit-logs-${new Date().toISOString().split('T')[0]}.csv`
		link.click()
		URL.revokeObjectURL(link.href)
	}

	// Column definitions using shared PricingAuditLogResponse type
	const columnHelper = createRichColumnHelper<PricingAuditLogResponse>()

	const columns: RichColumnDef<PricingAuditLogResponse, unknown>[] = [
		columnHelper.display({
			id: 'expand',
			header: '',
			size: 40,
			cell: ({ row }) => {
				const isExpanded = expandedRows.has(row.original.id)
				return (
					<button
						type="button"
						onClick={() => toggleRowExpansion(row.original.id)}
						className="btn btn-ghost btn-xs"
						aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
					>
						{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
					</button>
				)
			},
		}),
		columnHelper.accessor('calculatedAt', {
			header: 'Date',
			filterType: FilterType.Date,
			size: 140,
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<Calendar className="h-4 w-4 text-base-content/40" />
					<span className="text-sm">{formatDate(row.original.calculatedAt, 'short')}</span>
				</div>
			),
		}),
		columnHelper.accessor('eventType', {
			header: 'Event',
			filterType: FilterType.Select,
			size: 120,
			cell: ({ row }) => {
				const eventType = row.original.eventType
				const variant =
					eventType === 'QuotePricing'
						? 'info'
						: eventType === 'OrderPricing'
							? 'success'
							: 'neutral'
				return (
					<Badge variant={variant} size="sm">
						{eventType.replace(/([A-Z])/g, ' $1').trim()}
					</Badge>
				)
			},
		}),
		columnHelper.accessor('productName', {
			header: 'Product',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium text-base-content truncate max-w-[200px]">
						{row.original.productName ?? row.original.productId}
					</span>
					{row.original.productSku && (
						<span className="text-xs text-base-content/60">SKU: {row.original.productSku}</span>
					)}
				</div>
			),
		}),
		columnHelper.accessor('customerName', {
			header: 'Customer',
			filterType: FilterType.Text,
			searchable: true,
			size: 150,
			cell: ({ row }) =>
				row.original.customerName ? (
					<div className="flex items-center gap-2">
						<User className="h-4 w-4 text-base-content/40" />
						<span className="text-sm truncate">{row.original.customerName}</span>
					</div>
				) : (
					<span className="text-base-content/40 text-sm">Anonymous</span>
				),
		}),
		columnHelper.accessor('quantity', {
			header: 'Qty',
			filterType: FilterType.Number,
			size: 60,
			cell: ({ row }) => <span className="font-medium">{row.original.quantity}</span>,
		}),
		columnHelper.accessor('basePrice', {
			header: 'Base',
			filterType: FilterType.Number,
			size: 100,
			cell: ({ row }) => (
				<span className="text-base-content/70">{formatCurrency(row.original.basePrice)}</span>
			),
		}),
		columnHelper.accessor('finalPrice', {
			header: 'Final',
			filterType: FilterType.Number,
			size: 100,
			cell: ({ row }) => (
				<span className="font-medium text-primary">{formatCurrency(row.original.finalPrice)}</span>
			),
		}),
		columnHelper.display({
			id: 'discount',
			header: 'Discount',
			size: 100,
			cell: ({ row }) => {
				const discount = row.original.totalDiscount
				const percent =
					row.original.basePrice > 0 ? (discount / row.original.basePrice) * 100 : 0
				return discount > 0 ? (
					<span className="text-success text-sm">
						-{formatCurrency(discount)} ({percent.toFixed(0)}%)
					</span>
				) : (
					<span className="text-base-content/40 text-sm">—</span>
				)
			},
		}),
		columnHelper.accessor('marginProtected', {
			header: 'Protected',
			filterType: FilterType.Boolean,
			size: 80,
			cell: ({ row }) =>
				row.original.marginProtected ? (
					<Badge variant="warning" size="sm">
						<Shield className="h-3 w-3 mr-1" />
						Yes
					</Badge>
				) : (
					<span className="text-base-content/40 text-sm">No</span>
				),
		}),
	]

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<History className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold text-base-content">Pricing Audit Log</h3>
						<p className="text-sm text-base-content/60">
							History of all pricing calculations and changes
						</p>
					</div>
				</div>
				<Button variant="secondary" size="sm" onClick={handleExportCsv}>
					<Download className="h-4 w-4 mr-2" />
					Export CSV
				</Button>
			</div>

			{/* Filters */}
			<Card className="border border-base-300 bg-base-100 p-4 shadow-sm">
				<FormSection
					title="Filters"
					icon={<Filter />}
					description="Filter audit log entries"
				>
					<div className="grid gap-4 md:grid-cols-4">
						<FormInput
							label="Product ID"
							type="text"
							placeholder="e.g., prod-123"
							value={filters.productId ?? ''}
							onChange={(e) => setFilters({ ...filters, productId: e.target.value || undefined })}
						/>
						<FormInput
							label="Customer ID"
							type="number"
							placeholder="e.g., 123"
							value={filters.customerId ?? ''}
							onChange={(e) =>
								setFilters({ ...filters, customerId: parseInt(e.target.value) || undefined })
							}
						/>
					<FormInput
						label="From Date"
						type="date"
						value={filters.dateFrom instanceof Date
							? filters.dateFrom.toISOString().split('T')[0]
							: (filters.dateFrom ?? '')}
						onChange={(e) =>
							setFilters({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })
						}
					/>
					<FormInput
						label="To Date"
						type="date"
						value={filters.dateTo instanceof Date
							? filters.dateTo.toISOString().split('T')[0]
							: (filters.dateTo ?? '')}
						onChange={(e) =>
							setFilters({ ...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined })
						}
					/>
					</div>
				</FormSection>
			</Card>

			{/* Data Grid */}
			<RichDataGrid<PricingAuditLogResponse>
				columns={columns}
				data={logs}
				defaultPageSize={20}
				defaultSorting={[{ columnId: createColumnId('calculatedAt'), direction: SortDirection.Descending }]}
				enableGlobalSearch
				enableColumnFilters
				searchPlaceholder="Search audit logs..."
				persistStateKey="pricing-audit-logs-grid"
				emptyState={
					<div className="flex flex-col items-center gap-3 py-12">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-base-200">
							<FileText className="h-8 w-8 text-base-content/40" />
						</div>
						<h3 className="text-lg font-semibold text-base-content">No Audit Logs</h3>
						<p className="text-base-content/60 max-w-md text-center">
							Pricing audit logs will appear here when quotes or orders are priced.
						</p>
					</div>
				}
				ariaLabel="Pricing audit log table"
			/>
		</div>
	)
}
