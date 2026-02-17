/**
 * QuotePricingEditor Component
 *
 * Editable pricing table for sales reps to input vendor cost and customer price.
 * Shows calculated margins and totals. Only visible to Sales Rep+ roles.
 *
 * **Features:**
 * - Inline editable vendor cost and customer price fields
 * - Auto-save on blur (immediate feedback)
 * - Real-time margin calculations
 * - Total row with aggregated values
 * - Visual indicators for pricing status (ready/incomplete)
 * - Validation: customer price must be >= vendor cost
 * - RBAC: Only editable when user has permission AND quote status is 'Read'
 * - **Advanced Pricing Engine Integration** (NEW):
 *   - Shows suggested prices from contract pricing / volume tiers
 *   - Displays pricing breakdown (which rules applied)
 *   - Margin indicators for quick health assessment
 *   - "Apply Suggested" to use engine-calculated prices
 *
 * **Business Flow:**
 * 1. Sales rep receives quote with status 'Read'
 * 2. Sales rep negotiates with vendors
 * 3. Sales rep enters vendor cost per product
 * 4. Sales rep sees suggested customer price from pricing engine
 * 5. Sales rep enters customer price (can apply suggested or override)
 * 6. Margins calculated automatically
 * 7. "Send to Customer" enabled when all products have customer price
 *
 * @see prd_quotes_pricing.md - Full specification
 * @see prd_pricing_engine.md - Advanced Pricing Engine integration
 * @see business_flow.md Section 4 - INTERNAL PROCESSING
 * @module app/quotes/[id]/_components/QuotePricingEditor
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
	DollarSign,
	AlertTriangle,
	CheckCircle,
	TrendingUp,
	Sparkles,
	ChevronDown,
	ChevronRight,
	Tag,
} from 'lucide-react'

import { formatCurrency } from '@_lib/formatters'

import Card from '@_components/ui/Card'
import Input from '@_components/ui/Input'
import Button from '@_components/ui/Button'
import { DataGrid } from '@_components/tables'

import type Quote from '@_classes/Quote'
import { QuoteStatus } from '@_classes/Enums'

import { useQuotePricing, type UseQuotePricingReturn } from './hooks/useQuotePricing'
import { useQuoteSuggestedPricing, type SuggestedPriceData } from './hooks/useQuoteSuggestedPricing'
import type { UseQuotePermissionsReturn } from './hooks/useQuotePermissions'

// =========================================================================
// TYPES
// =========================================================================

/**
 * QuotePricingEditor Component Props
 */
export interface QuotePricingEditorProps {
	/** Quote entity with products */
	quote: Quote | null
	/** Permission flags from useQuotePermissions */
	permissions: UseQuotePermissionsReturn
	/** Customer ID for pricing engine lookup (optional) */
	customerId?: string | null
	/** Callback to refresh quote data after pricing update */
	onRefresh?: () => Promise<void>
}

/**
 * Local state for pricing inputs
 */
interface LocalPricing {
	vendorCost: string
	customerPrice: string
}

// =========================================================================
// MARGIN INDICATOR SUBCOMPONENT
// =========================================================================

interface MarginIndicatorProps {
	marginPercent: number | null
	marginProtected?: boolean
}

/**
 * Visual indicator for margin health.
 * Green = healthy (20%+), Yellow = warning (10-20%), Red = low (<10%)
 */
function MarginIndicator({ marginPercent, marginProtected = false }: MarginIndicatorProps) {
	if (marginPercent === null) {
		return <span className='badge badge-ghost badge-sm'>—</span>
	}

	// Determine badge color based on margin thresholds
	let badgeClass = 'badge-error' // Red < 10%
	if (marginPercent >= 20) {
		badgeClass = 'badge-success' // Green 20%+
	} else if (marginPercent >= 10) {
		badgeClass = 'badge-warning' // Yellow 10-20%
	}

	return (
		<span className={`badge ${badgeClass} badge-sm gap-1`}>
			{marginProtected && <Tag className='h-3 w-3' />}
			{marginPercent.toFixed(1)}%
		</span>
	)
}

// =========================================================================
// PRICING BREAKDOWN POPUP SUBCOMPONENT
// =========================================================================

interface PricingBreakdownProps {
	suggestedData: SuggestedPriceData
	isExpanded: boolean
	onToggle: () => void
}

/**
 * Expandable pricing breakdown showing applied rules.
 * Displays the waterfall: Base Price → Contract → Volume → Margin Protection
 */
function PricingBreakdown({ suggestedData, isExpanded, onToggle }: PricingBreakdownProps) {
	if (!suggestedData.appliedRules || suggestedData.appliedRules.length === 0) {
		return null
	}

	return (
		<div className='mt-2'>
			<Button
				type='button'
				onClick={onToggle}
				variant='ghost'
				size='xs'
				className='flex items-center gap-1 text-xs text-primary hover:underline h-auto p-0'
				leftIcon={isExpanded ? <ChevronDown className='h-3 w-3' /> : <ChevronRight className='h-3 w-3' />}
				contentDrivenHeight>
				{isExpanded ? 'Hide' : 'Show'} breakdown
			</Button>

			{isExpanded && (
				<div className='mt-2 rounded-lg bg-base-200/50 p-3 text-xs'>
					<div className='space-y-2'>
						{suggestedData.appliedRules.map((rule, idx) => (
							<div
								key={idx}
								className='flex items-center justify-between border-b border-base-300 pb-1 last:border-0'>
								<span className='text-base-content/70'>
									<span className='font-medium'>{rule.ruleName}</span>
									<span className='text-base-content/50 ml-1'>({rule.ruleType})</span>
								</span>
								<span className='text-base-content'>
									{formatCurrency(rule.priceBefore)} → {formatCurrency(rule.priceAfter)}
								</span>
							</div>
						))}
					</div>
					{suggestedData.marginProtected && (
						<div className='mt-2 flex items-center gap-1 text-warning'>
							<Tag className='h-3 w-3' />
							Margin protection applied
						</div>
					)}
				</div>
			)}
		</div>
	)
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

/**
 * QuotePricingEditor Component
 *
 * Displays and allows editing of product pricing for quotes.
 * Only visible and editable for authorized users on quotes with appropriate status.
 * Integrates with Advanced Pricing Engine for suggested pricing.
 *
 * @param props - Component props
 * @returns QuotePricingEditor component or null if not applicable
 */
export default function QuotePricingEditor({ quote, permissions, customerId, onRefresh }: QuotePricingEditorProps) {
	const { updatePricing, isUpdating, validatePricing, canSendToCustomer } = useQuotePricing(quote, onRefresh)

	// Advanced Pricing Engine integration
	const {
		suggestedPricing,
		isLoading: isPricingLoading,
		getSuggested,
		hasAnySpecialPricing,
	} = useQuoteSuggestedPricing(quote, customerId)

	// Local state for optimistic updates during editing
	const [editingProductId, setEditingProductId] = useState<string | null>(null)
	const [localPricing, setLocalPricing] = useState<Record<string, LocalPricing>>({})
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [expandedBreakdowns, setExpandedBreakdowns] = useState<Set<string>>(new Set())

	// Get products from quote
	const products = useMemo(() => quote?.products ?? [], [quote?.products])

	// Determine if pricing is editable
	// - User must have update permission
	// - Quote status must be 'Read'
	const isEditable = permissions.canUpdate && quote?.status === QuoteStatus.Read

	/**
	 * Get the display value for a pricing field
	 * Prefers local state (during editing) over server value
	 */
	const getDisplayValue = useCallback(
		(productId: string, field: 'vendorCost' | 'customerPrice'): string => {
			// If we have local state for this field, use it
			if (localPricing[productId]?.[field] !== undefined) {
				return localPricing[productId][field]
			}
			// Otherwise, use the value from the product
			const product = products.find((p) => p.id === productId || p.productId === productId)
			const value = product?.[field]
			return value != null ? value.toString() : ''
		},
		[localPricing, products],
	)

	/**
	 * Handle input change - update local state only
	 */
	const handleChange = useCallback((productId: string, field: 'vendorCost' | 'customerPrice', value: string) => {
		setEditingProductId(productId)
		setLocalPricing((prev) => ({
			...prev,
			[productId]: {
				...prev[productId],
				[field]: value,
			},
		}))
		// Clear error when user starts typing
		setErrors((prev) => ({ ...prev, [productId]: '' }))
	}, [])

	/**
	 * Handle blur - validate and save to server
	 */
	const handleBlur = useCallback(
		async (productId: string) => {
			const vendorCostStr = getDisplayValue(productId, 'vendorCost')
			const customerPriceStr = getDisplayValue(productId, 'customerPrice')

			const data = {
				productId,
				vendorCost: vendorCostStr ? parseFloat(vendorCostStr) : null,
				customerPrice: customerPriceStr ? parseFloat(customerPriceStr) : null,
			}

			// Validate client-side
			const validation = validatePricing(data)
			if (!validation.valid) {
				setErrors((prev) => ({ ...prev, [productId]: validation.errors[0] }))
				return
			}

			// Clear errors and editing state
			setErrors((prev) => ({ ...prev, [productId]: '' }))
			setEditingProductId(null)

			// Save to server
			await updatePricing(data)

			// Clear local state for this product after successful save
			setLocalPricing((prev) => {
				const next = { ...prev }
				delete next[productId]
				return next
			})
		},
		[getDisplayValue, validatePricing, updatePricing],
	)

	/**
	 * Apply suggested price to customer price field
	 */
	const handleApplySuggested = useCallback(
		(productId: string) => {
			const suggested = getSuggested(productId)
			if (!suggested) return

			// Set the suggested price as customer price
			setLocalPricing((prev) => ({
				...prev,
				[productId]: {
					...prev[productId],
					customerPrice: suggested.suggestedPrice.toFixed(2),
				},
			}))
		},
		[getSuggested],
	)

	/**
	 * Toggle breakdown expansion for a product
	 */
	const toggleBreakdown = useCallback((productId: string) => {
		setExpandedBreakdowns((prev) => {
			const next = new Set(prev)
			if (next.has(productId)) {
				next.delete(productId)
			} else {
				next.add(productId)
			}
			return next
		})
	}, [])

	// Calculate totals
	const totals = useMemo(() => {
		return products.reduce(
			(acc, p) => {
				const vendorCost = p.vendorCost ?? 0
				const customerPrice = p.customerPrice ?? 0
				const qty = p.quantity

				acc.vendorTotal += vendorCost * qty
				acc.customerTotal += customerPrice * qty
				acc.marginTotal += (customerPrice - vendorCost) * qty

				return acc
			},
			{ vendorTotal: 0, customerTotal: 0, marginTotal: 0 },
		)
	}, [products])

	const marginPercent =
		totals.vendorTotal > 0 ? Math.round((totals.marginTotal / totals.vendorTotal) * 100 * 100) / 100 : 0

	// Don't render if no quote or no products
	if (!quote || products.length === 0) return null

	// Internal pricing is restricted to internal quote handlers only.
	// Customers should never see vendor cost, margin, or rule-breakdown internals.
	const canViewInternalPricing =
		permissions.context.isAssignedQuote || permissions.context.isTeamQuote || permissions.context.isAllQuote
	if (!canViewInternalPricing) return null

	const readyToSend = canSendToCustomer(quote)

	return (
		<Card className='border border-base-300 bg-base-100 p-6 shadow-sm animate-elegant-reveal'>
			{/* Header */}
			<div className='flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-success/10'>
						<DollarSign className='h-5 w-5 text-success' />
					</div>
					<div>
						<h3 className='text-lg font-semibold text-base-content'>Quote Pricing</h3>
						<p className='text-sm text-base-content/60 mt-0.5'>
							{readyToSend ? (
								<span className='text-success flex items-center gap-1'>
									<CheckCircle className='h-4 w-4' /> Ready to send to customer
								</span>
							) : (
								<span className='text-warning flex items-center gap-1'>
									<AlertTriangle className='h-4 w-4' /> Set customer prices for all products
								</span>
							)}
						</p>
					</div>
				</div>

				{/* Special Pricing Badge + Margin Summary */}
				<div className='flex flex-wrap items-center gap-2'>
					{hasAnySpecialPricing && (
						<div className='badge badge-info badge-lg gap-1'>
							<Sparkles className='h-4 w-4' />
							Contract Pricing Available
						</div>
					)}
					{totals.marginTotal > 0 && (
						<div
							className='badge badge-success badge-lg gap-1'
							data-testid='margin-percent'>
							<TrendingUp className='h-4 w-4' />
							{marginPercent}% margin
						</div>
					)}
				</div>
			</div>

			{/* Pricing Table */}
			<div
				className='overflow-x-auto rounded-lg border border-base-200'
				data-testid='pricing-table'>
				<QuotePricingDataGrid
					products={products}
					totals={totals}
					marginPercent={marginPercent}
					isEditable={isEditable}
					isUpdating={isUpdating}
					isPricingLoading={isPricingLoading}
					errors={errors}
					getDisplayValue={getDisplayValue}
					handleChange={handleChange}
					handleBlur={handleBlur}
					handleApplySuggested={handleApplySuggested}
					getSuggested={getSuggested}
					expandedBreakdowns={expandedBreakdowns}
					toggleBreakdown={toggleBreakdown}
				/>
			</div>

			{/* Help Text */}
			{isEditable && (
				<p className='text-xs text-base-content/50 mt-4'>
					Enter vendor cost (what we pay) and customer price (what they pay). Customer price must be ≥ vendor
					cost.
					{hasAnySpecialPricing && (
						<span className='text-info ml-1'>
							<Sparkles className='h-3 w-3 inline' /> Click &quot;Apply&quot; to use contract/volume
							pricing.
						</span>
					)}
					Changes save automatically on blur.
				</p>
			)}
		</Card>
	)
}

// =========================================================================
// DATA GRID COMPONENT
// =========================================================================

/**
 * Base product type for quote line items
 */
interface QuoteProductBase {
	id?: string | null
	productId?: string | null
	product?: { name?: string; sku?: string } | null
	quantity: number
	vendorCost?: number | null
	customerPrice?: number | null
	lineTotal?: number | null
	margin?: number | null
	marginPercent?: number | null | undefined
}

/**
 * Discriminated union types for DataGrid rows
 * Uses isFooter as discriminant for type narrowing
 */
type QuoteProductRow = QuoteProductBase & { isFooter: false }
type FooterRow = { isFooter: true; id?: string; productId?: string; quantity?: number }
type QuotePricingRow = QuoteProductRow | FooterRow

interface QuotePricingDataGridProps {
	products: QuoteProductBase[]
	totals: { vendorTotal: number; customerTotal: number; marginTotal: number }
	marginPercent: number
	isEditable: boolean
	isUpdating: boolean
	isPricingLoading: boolean
	errors: Record<string, string>
	getDisplayValue: (productId: string, field: 'vendorCost' | 'customerPrice') => string
	handleChange: (productId: string, field: 'vendorCost' | 'customerPrice', value: string) => void
	handleBlur: (productId: string) => Promise<void>
	handleApplySuggested: (productId: string) => void
	getSuggested: (productId: string) => SuggestedPriceData | null | undefined
	expandedBreakdowns: Set<string>
	toggleBreakdown: (productId: string) => void
}

/**
 * DataGrid component for displaying quote pricing with inline editing
 */
function QuotePricingDataGrid({
	products,
	totals,
	marginPercent,
	isEditable,
	isUpdating,
	isPricingLoading,
	errors,
	getDisplayValue,
	handleChange,
	handleBlur,
	handleApplySuggested,
	getSuggested,
	expandedBreakdowns,
	toggleBreakdown,
}: QuotePricingDataGridProps) {
	const getEffectivePrice = useCallback(
		(productId: string, field: 'vendorCost' | 'customerPrice', persistedValue?: number | null): number | null => {
			// While editable, prefer local input state so row metrics reflect current values.
			if (isEditable) {
				const inputValue = getDisplayValue(productId, field).trim()
				if (inputValue.length === 0) {
					return persistedValue ?? null
				}

				const parsed = Number.parseFloat(inputValue)
				if (Number.isFinite(parsed)) {
					return parsed
				}
			}

			return persistedValue ?? null
		},
		[isEditable, getDisplayValue],
	)

	const columns = useMemo<ColumnDef<QuotePricingRow>[]>(
		() => [
			{
				accessorKey: 'product',
				header: 'Product',
				cell: ({ row }) => {
					const rowData = row.original
					if (rowData.isFooter) {
						return <span className='text-xs sm:text-sm font-semibold text-base-content'>Totals</span>
					}
					const productId = rowData.id ?? rowData.productId ?? ''
					const suggested = getSuggested(productId)
					const isBreakdownExpanded = expandedBreakdowns.has(productId)
					return (
						<div className='flex flex-col min-w-0'>
							<span className='text-xs sm:text-sm font-medium text-base-content truncate'>
								{rowData.product?.name ?? 'Product pending'}
							</span>
							{rowData.product?.sku && (
								<span className='text-[10px] sm:text-xs text-base-content/60 mt-0.5 truncate'>
									SKU: {rowData.product.sku}
								</span>
							)}
							{suggested && suggested.hasSpecialPricing && (
								<PricingBreakdown
									suggestedData={suggested}
									isExpanded={isBreakdownExpanded}
									onToggle={() => toggleBreakdown(productId)}
								/>
							)}
						</div>
					)
				},
				size: 160,
			},
			{
				accessorKey: 'quantity',
				header: 'Qty',
				cell: ({ row }) => {
					const rowData = row.original
					if (rowData.isFooter) {
						return null
					}
					return (
						<div className='text-center'>
							<span className='badge badge-primary badge-xs sm:badge-sm font-semibold'>
								{rowData.quantity}
							</span>
						</div>
					)
				},
				size: 50,
			},
			{
				accessorKey: 'vendorCost',
				header: 'Vendor Cost',
				cell: ({ row }) => {
					const rowData = row.original
					if (rowData.isFooter) {
						return (
							<div className='text-right text-base-content/80 font-semibold'>
								{totals.vendorTotal > 0 ? formatCurrency(totals.vendorTotal) : '—'}
							</div>
						)
					}
					const productId = rowData.id ?? rowData.productId ?? ''
					return (
						<div className='text-right'>
							{isEditable ? (
								<Input
									type='number'
									step='0.01'
									min='0'
									placeholder='0.00'
									value={getDisplayValue(productId, 'vendorCost')}
									onChange={(e) => handleChange(productId, 'vendorCost', e.target.value)}
									onBlur={() => void handleBlur(productId)}
									disabled={isUpdating}
									size='sm'
									width='auto'
									className='w-28 text-right'
									data-testid={`vendor-cost-${productId}`}
								/>
							) : (
								<span className='text-base-content/70'>
									{rowData.vendorCost != null ? formatCurrency(rowData.vendorCost) : '—'}
								</span>
							)}
						</div>
					)
				},
			},
			{
				accessorKey: 'customerPrice',
				header: 'Customer Price',
				cell: ({ row }) => {
					const rowData = row.original
					if (rowData.isFooter) {
						return (
							<div className='text-right text-base-content/80 font-semibold'>
								{totals.customerTotal > 0 ? formatCurrency(totals.customerTotal) : '—'}
							</div>
						)
					}
					const productId = rowData.id ?? rowData.productId ?? ''
					const error = errors[productId]
					const suggested = getSuggested(productId)
					return (
						<div className='text-right'>
							{isEditable ? (
								<div className='flex flex-col items-end gap-1'>
									<Input
										type='number'
										step='0.01'
										min='0'
										placeholder='0.00'
										value={getDisplayValue(productId, 'customerPrice')}
										onChange={(e) => handleChange(productId, 'customerPrice', e.target.value)}
										onBlur={() => void handleBlur(productId)}
										disabled={isUpdating}
										size='sm'
										width='auto'
										error={!!error}
										errorMessage={error}
										className='w-28 text-right'
										data-testid={`customer-price-${productId}`}
									/>
									{suggested && suggested.hasSpecialPricing && (
										<Button
											type='button'
											onClick={() => handleApplySuggested(productId)}
											disabled={isUpdating || isPricingLoading}
											variant='ghost'
											size='xs'
											className='flex items-center gap-1 text-xs text-info hover:text-info-focus h-auto p-0'
											title={`Apply suggested price: ${formatCurrency(suggested.suggestedPrice)}`}
											leftIcon={<Sparkles className='h-3 w-3' />}
											contentDrivenHeight>
											Apply {formatCurrency(suggested.suggestedPrice)}
										</Button>
									)}
								</div>
							) : (
								<span className='text-base-content/70'>
									{rowData.customerPrice != null ? formatCurrency(rowData.customerPrice) : '—'}
								</span>
							)}
						</div>
					)
				},
			},
			{
				accessorKey: 'lineTotal',
				header: 'Line Total',
				cell: ({ row }) => {
					const rowData = row.original
					if (rowData.isFooter) {
						return (
							<div className='text-right text-base-content font-semibold'>
								{totals.customerTotal > 0 ? formatCurrency(totals.customerTotal) : '—'}
							</div>
						)
					}

					const productId = rowData.id ?? rowData.productId ?? ''
					const customerPrice = getEffectivePrice(productId, 'customerPrice', rowData.customerPrice)
					const computedLineTotal =
						customerPrice != null ? Math.round(customerPrice * rowData.quantity * 100) / 100 : null

					return (
						<div className='text-right'>
							{computedLineTotal != null ? (
								<span className='font-medium text-base-content'>
									{formatCurrency(computedLineTotal)}
								</span>
							) : (
								<span className='text-base-content/40'>—</span>
							)}
						</div>
					)
				},
			},
			{
				accessorKey: 'margin',
				header: 'Margin',
				cell: ({ row }) => {
					const rowData = row.original
					if (rowData.isFooter) {
						return (
							<div className='text-right'>
								{totals.marginTotal !== 0 ? (
									<span
										className={
											totals.marginTotal >= 0
												? 'text-success font-semibold'
												: 'text-error font-semibold'
										}
										data-testid='margin-impact'>
										{formatCurrency(totals.marginTotal)}
										<span className='text-xs ml-1 opacity-70'>({marginPercent}%)</span>
									</span>
								) : (
									<span className='text-base-content/40'>—</span>
								)}
							</div>
						)
					}
					const productId = rowData.id ?? rowData.productId ?? ''
					const vendorCost = getEffectivePrice(productId, 'vendorCost', rowData.vendorCost)
					const customerPrice = getEffectivePrice(productId, 'customerPrice', rowData.customerPrice)
					const margin =
						vendorCost != null && customerPrice != null
							? Math.round((customerPrice - vendorCost) * rowData.quantity * 100) / 100
							: null
					const marginPct =
						vendorCost != null && customerPrice != null && vendorCost > 0
							? Math.round(((customerPrice - vendorCost) / vendorCost) * 1000) / 10
							: null
					const suggested = getSuggested(productId)
					return (
						<div className='text-right'>
							{margin != null ? (
								<div
									className='flex flex-col items-end gap-1'
									data-testid={`margin-impact-${productId}`}>
									<span
										className={margin >= 0 ? 'text-success font-medium' : 'text-error font-medium'}>
										{formatCurrency(margin)}
									</span>
									<MarginIndicator
										marginPercent={marginPct ?? null}
										marginProtected={suggested?.marginProtected}
									/>
								</div>
							) : (
								<span className='text-base-content/40'>—</span>
							)}
						</div>
					)
				},
			},
		],
		[
			isEditable,
			isUpdating,
			isPricingLoading,
			errors,
			getDisplayValue,
			getEffectivePrice,
			handleChange,
			handleBlur,
			handleApplySuggested,
			getSuggested,
			expandedBreakdowns,
			toggleBreakdown,
			totals,
			marginPercent,
		],
	)

	// Prepare data with footer row using discriminated union types
	const dataWithFooter = useMemo<QuotePricingRow[]>(() => {
		const productRows: QuoteProductRow[] = products.map((p) => ({
			...p,
			isFooter: false as const,
		}))
		const footerRow: FooterRow = {
			isFooter: true as const,
			id: 'footer',
			productId: 'footer',
		}
		return [...productRows, footerRow]
	}, [products])

	return (
		<div className='min-w-[600px]'>
			<DataGrid
				columns={columns}
				data={dataWithFooter}
				ariaLabel='Quote pricing table'
				className='table-zebra'
			/>
		</div>
	)
}
