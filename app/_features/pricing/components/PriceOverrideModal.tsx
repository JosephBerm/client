'use client'

/**
 * Price Override Modal Component
 *
 * Modal for Sales Managers to override calculated pricing on quote items.
 * Requires business justification for audit compliance.
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 4.2 (Sales Manager Stories)
 * > US-PRICE-012: "As a Sales Manager, I want to override pricing"
 *
 * @module pricing/components/PriceOverrideModal
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, DollarSign, FileText, Save, X } from 'lucide-react'

import { formatCurrency } from '@_lib/formatters'
import API from '@_shared/services/api'

import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import FormInput from '@_components/forms/FormInput'
import FormTextArea from '@_components/forms/FormTextArea'
import FormSection from '@_components/forms/FormSection'

// =========================================================================
// TYPES
// =========================================================================

export interface PriceOverrideModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Callback when modal closes */
	onClose: () => void
	/** Quote ID */
	quoteId: string
	/** Cart product ID to override */
	cartProductId: string
	/** Product name for display */
	productName: string
	/** Current price before override */
	currentPrice: number
	/** Calculated price from pricing engine (for comparison) */
	calculatedPrice?: number
	/** Callback on successful override */
	onSuccess?: () => void
}

// =========================================================================
// COMPONENT
// =========================================================================

export default function PriceOverrideModal({
	isOpen,
	onClose,
	quoteId,
	cartProductId,
	productName,
	currentPrice,
	calculatedPrice,
	onSuccess,
}: PriceOverrideModalProps) {
	const queryClient = useQueryClient()
	const [overridePrice, setOverridePrice] = useState(currentPrice.toString())
	const [overrideReason, setOverrideReason] = useState('')
	const [errors, setErrors] = useState<{ price?: string; reason?: string }>({})

	// Override mutation
	const overrideMutation = useMutation({
		mutationFn: async () => {
			const response = await API.Pricing.overrideQuoteItemPrice(quoteId, cartProductId, {
				overridePrice: parseFloat(overridePrice),
				overrideReason,
			})
			return response.data.payload
		},
		onSuccess: () => {
			// Invalidate quote queries to refresh pricing
			queryClient.invalidateQueries({ queryKey: ['quotes', quoteId] })
			onSuccess?.()
			handleClose()
		},
	})

	// Validate form
	const validate = (): boolean => {
		const newErrors: { price?: string; reason?: string } = {}

		const priceValue = parseFloat(overridePrice)
		if (isNaN(priceValue) || priceValue <= 0) {
			newErrors.price = 'Price must be greater than 0'
		}

		if (!overrideReason.trim()) {
			newErrors.reason = 'A business justification is required for audit compliance'
		} else if (overrideReason.trim().length < 10) {
			newErrors.reason = 'Please provide a more detailed justification (at least 10 characters)'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	// Handle submit
	const handleSubmit = () => {
		if (validate()) {
			overrideMutation.mutate()
		}
	}

	// Handle close
	const handleClose = () => {
		setOverridePrice(currentPrice.toString())
		setOverrideReason('')
		setErrors({})
		onClose()
	}

	// Calculate difference from calculated price
	const priceValue = parseFloat(overridePrice) || 0
	const difference = priceValue - currentPrice
	const differencePercent = currentPrice > 0 ? (difference / currentPrice) * 100 : 0

	if (!isOpen) return null

	return (
		<div className="modal modal-open">
			<div className="modal-box max-w-lg">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
							<DollarSign className="h-5 w-5 text-warning" />
						</div>
						<div>
							<h3 className="font-bold text-lg">Override Price</h3>
							<p className="text-sm text-base-content/60">Requires business justification</p>
						</div>
					</div>
					<button
						type="button"
						onClick={handleClose}
						className="btn btn-ghost btn-sm btn-circle"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Product Info */}
				<div className="rounded-lg bg-base-200/50 p-4 mb-6">
					<p className="font-medium text-base-content">{productName}</p>
					<div className="flex items-center gap-4 mt-2 text-sm">
						<div>
							<span className="text-base-content/60">Current Price:</span>{' '}
							<span className="font-semibold">{formatCurrency(currentPrice)}</span>
						</div>
						{calculatedPrice !== undefined && calculatedPrice !== currentPrice && (
							<div>
								<span className="text-base-content/60">Calculated:</span>{' '}
								<span className="font-semibold text-primary">{formatCurrency(calculatedPrice)}</span>
							</div>
						)}
					</div>
				</div>

				{/* Warning */}
				<div className="alert alert-warning mb-6">
					<AlertTriangle className="h-5 w-5" />
					<span className="text-sm">
						Price overrides are logged for audit purposes. Please provide a clear business
						justification.
					</span>
				</div>

				{/* Form */}
				<div className="space-y-4">
					<FormSection
						title="New Price"
						icon={<DollarSign />}
						description="Enter the override price"
					>
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<FormInput
									type="number"
									step="0.01"
									min="0.01"
									value={overridePrice}
									onChange={(e) => setOverridePrice(e.target.value)}
									error={errors.price ? { type: 'manual', message: errors.price } : undefined}
									className="input-lg font-bold"
								/>
							</div>
							{difference !== 0 && (
								<Badge
									variant={difference > 0 ? 'error' : 'success'}
									size="lg"
									className="whitespace-nowrap"
								>
									{difference > 0 ? '+' : ''}
									{formatCurrency(difference)} ({differencePercent > 0 ? '+' : ''}
									{differencePercent.toFixed(1)}%)
								</Badge>
							)}
						</div>
					</FormSection>

					<FormSection
						title="Business Justification"
						icon={<FileText />}
						description="Required for audit compliance"
					>
						<FormTextArea
							placeholder="Explain why this price override is necessary (e.g., competitor match, long-term customer, volume commitment, etc.)"
							value={overrideReason}
							onChange={(e) => setOverrideReason(e.target.value)}
							rows={3}
							error={errors.reason ? { type: 'manual', message: errors.reason } : undefined}
						/>
					</FormSection>
				</div>

				{/* Actions */}
				<div className="modal-action">
					<Button variant="ghost" onClick={handleClose} disabled={overrideMutation.isPending}>
						Cancel
					</Button>
				<Button
					variant="accent"
					onClick={handleSubmit}
					disabled={overrideMutation.isPending || !overrideReason.trim()}
				>
						{overrideMutation.isPending ? (
							<>
								<span className="loading loading-spinner loading-sm mr-2" />
								Applying...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Apply Override
							</>
						)}
					</Button>
				</div>

				{/* Error */}
				{overrideMutation.isError && (
					<div className="alert alert-error mt-4">
						<span>Failed to apply override. Please try again.</span>
					</div>
				)}
			</div>
			<div className="modal-backdrop" onClick={handleClose} />
		</div>
	)
}
