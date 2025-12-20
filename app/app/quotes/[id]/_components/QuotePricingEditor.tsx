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
 * 
 * **Business Flow:**
 * 1. Sales rep receives quote with status 'Read'
 * 2. Sales rep negotiates with vendors
 * 3. Sales rep enters vendor cost per product
 * 4. Sales rep enters customer price per product
 * 5. Margins calculated automatically
 * 6. "Send to Customer" enabled when all products have customer price
 * 
 * @see prd_quotes_pricing.md - Full specification
 * @see business_flow.md Section 4 - INTERNAL PROCESSING
 * @module app/quotes/[id]/_components/QuotePricingEditor
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

import { formatCurrency } from '@_lib/formatters'

import Card from '@_components/ui/Card'

import type Quote from '@_classes/Quote'
import type { CartProduct } from '@_classes/Product'
import { QuoteStatus } from '@_classes/Enums'

import { useQuotePricing, type UseQuotePricingReturn } from './hooks/useQuotePricing'
import type { UseQuotePermissionsReturn } from './hooks/useQuotePermissions'

/**
 * QuotePricingEditor Component Props
 */
export interface QuotePricingEditorProps {
	/** Quote entity with products */
	quote: Quote | null
	/** Permission flags from useQuotePermissions */
	permissions: UseQuotePermissionsReturn
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

/**
 * QuotePricingEditor Component
 * 
 * Displays and allows editing of product pricing for quotes.
 * Only visible and editable for authorized users on quotes with appropriate status.
 * 
 * @param props - Component props
 * @returns QuotePricingEditor component or null if not applicable
 */
export default function QuotePricingEditor({
	quote,
	permissions,
	onRefresh,
}: QuotePricingEditorProps) {
	const { updatePricing, isUpdating, validatePricing, canSendToCustomer } = useQuotePricing(quote, onRefresh)

	// Local state for optimistic updates during editing
	const [editingProductId, setEditingProductId] = useState<string | null>(null)
	const [localPricing, setLocalPricing] = useState<Record<string, LocalPricing>>({})
	const [errors, setErrors] = useState<Record<string, string>>({})

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
		[localPricing, products]
	)

	/**
	 * Handle input change - update local state only
	 */
	const handleChange = useCallback(
		(productId: string, field: 'vendorCost' | 'customerPrice', value: string) => {
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
		},
		[]
	)

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
		[getDisplayValue, validatePricing, updatePricing]
	)

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
			{ vendorTotal: 0, customerTotal: 0, marginTotal: 0 }
		)
	}, [products])

	const marginPercent = totals.vendorTotal > 0
		? Math.round((totals.marginTotal / totals.vendorTotal) * 100 * 100) / 100
		: 0

	// Don't render if no quote or no products
	if (!quote || products.length === 0) return null

	// Don't render for customers (they shouldn't see pricing editor)
	// This is a safety check - the page should already hide this component for customers
	if (!permissions.canUpdate && !permissions.canView) return null

	const readyToSend = canSendToCustomer(quote)

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm animate-elegant-reveal">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
						<DollarSign className="h-5 w-5 text-success" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-base-content">Quote Pricing</h3>
						<p className="text-sm text-base-content/60 mt-0.5">
							{readyToSend ? (
								<span className="text-success flex items-center gap-1">
									<CheckCircle className="h-4 w-4" /> Ready to send to customer
								</span>
							) : (
								<span className="text-warning flex items-center gap-1">
									<AlertTriangle className="h-4 w-4" /> Set customer prices for all products
								</span>
							)}
						</p>
					</div>
				</div>
				
				{/* Margin Summary Badge */}
				{totals.marginTotal > 0 && (
					<div className="badge badge-success badge-lg gap-1">
						<TrendingUp className="h-4 w-4" />
						{marginPercent}% margin
					</div>
				)}
			</div>

			{/* Pricing Table */}
			<div className="overflow-x-auto rounded-lg border border-base-200">
				<table className="table table-zebra w-full">
					<thead className="bg-base-200/50">
						<tr>
							<th className="text-left">Product</th>
							<th className="text-center w-20">Qty</th>
							<th className="text-right w-32">Vendor Cost</th>
							<th className="text-right w-32">Customer Price</th>
							<th className="text-right w-32">Line Total</th>
							<th className="text-right w-36">Margin</th>
						</tr>
					</thead>
					<tbody>
						{products.map((product) => {
							const productId = product.id ?? product.productId ?? ''
							const error = errors[productId]
							const margin = product.margin
							const marginPct = product.marginPercent

							return (
								<tr key={productId} className={error ? 'bg-error/5' : ''}>
									{/* Product Info */}
									<td>
										<div className="flex flex-col">
											<span className="font-medium text-base-content">
												{product.product?.name || 'Product pending'}
											</span>
											{product.product?.sku && (
												<span className="text-xs text-base-content/60 mt-0.5">
													SKU: {product.product.sku}
												</span>
											)}
										</div>
									</td>

									{/* Quantity */}
									<td className="text-center">
										<span className="badge badge-primary badge-sm font-semibold">
											{product.quantity}
										</span>
									</td>

									{/* Vendor Cost */}
									<td className="text-right">
										{isEditable ? (
											<input
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00"
												value={getDisplayValue(productId, 'vendorCost')}
												onChange={(e) => handleChange(productId, 'vendorCost', e.target.value)}
												onBlur={() => handleBlur(productId)}
												disabled={isUpdating}
												className="input input-bordered input-sm w-28 text-right"
											/>
										) : (
											<span className="text-base-content/70">
												{product.vendorCost != null ? formatCurrency(product.vendorCost) : '—'}
											</span>
										)}
									</td>

									{/* Customer Price */}
									<td className="text-right">
										{isEditable ? (
											<div className="flex flex-col items-end">
												<input
													type="number"
													step="0.01"
													min="0"
													placeholder="0.00"
													value={getDisplayValue(productId, 'customerPrice')}
													onChange={(e) => handleChange(productId, 'customerPrice', e.target.value)}
													onBlur={() => handleBlur(productId)}
													disabled={isUpdating}
													className={`input input-bordered input-sm w-28 text-right ${error ? 'input-error' : ''}`}
												/>
												{error && (
													<span className="text-xs text-error mt-1">{error}</span>
												)}
											</div>
										) : (
											<span className="text-base-content/70">
												{product.customerPrice != null ? formatCurrency(product.customerPrice) : '—'}
											</span>
										)}
									</td>

									{/* Line Total */}
									<td className="text-right">
										{product.lineTotal != null ? (
											<span className="font-medium text-base-content">
												{formatCurrency(product.lineTotal)}
											</span>
										) : (
											<span className="text-base-content/40">—</span>
										)}
									</td>

									{/* Margin */}
									<td className="text-right">
										{margin != null ? (
											<span className={margin >= 0 ? 'text-success font-medium' : 'text-error font-medium'}>
												{formatCurrency(margin)}
												<span className="text-xs ml-1 opacity-70">({marginPct}%)</span>
											</span>
										) : (
											<span className="text-base-content/40">—</span>
										)}
									</td>
								</tr>
							)
						})}
					</tbody>

					{/* Totals Footer */}
					<tfoot className="bg-base-200/80 font-semibold">
						<tr>
							<td colSpan={2} className="text-left">
								<span className="text-base-content">Totals</span>
							</td>
							<td className="text-right text-base-content/80">
								{totals.vendorTotal > 0 ? formatCurrency(totals.vendorTotal) : '—'}
							</td>
							<td className="text-right text-base-content/80">
								{totals.customerTotal > 0 ? formatCurrency(totals.customerTotal) : '—'}
							</td>
							<td className="text-right text-base-content">
								{totals.customerTotal > 0 ? formatCurrency(totals.customerTotal) : '—'}
							</td>
							<td className="text-right">
								{totals.marginTotal !== 0 ? (
									<span className={totals.marginTotal >= 0 ? 'text-success' : 'text-error'}>
										{formatCurrency(totals.marginTotal)}
										<span className="text-xs ml-1 opacity-70">({marginPercent}%)</span>
									</span>
								) : (
									<span className="text-base-content/40">—</span>
								)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>

			{/* Help Text */}
			{isEditable && (
				<p className="text-xs text-base-content/50 mt-4">
					Enter vendor cost (what we pay) and customer price (what they pay). 
					Customer price must be ≥ vendor cost. Changes save automatically on blur.
				</p>
			)}
		</Card>
	)
}

