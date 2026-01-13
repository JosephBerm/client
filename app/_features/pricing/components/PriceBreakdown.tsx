'use client'

/**
 * PriceBreakdown Component
 *
 * Displays pricing calculation breakdown with applied rules.
 * Shows the pricing waterfall: Base Price → Contract → Volume → Margin Protection.
 *
 * **Use Cases:**
 * - Quote line items with full pricing explainability
 * - Order pricing review
 * - Admin price calculation testing
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 3 (B2B Trust Factor)
 *
 * @module pricing/components
 */

import { memo } from 'react'
import { PricingResult, PricingRuleApplication } from '@_classes/Pricing'

// =========================================================================
// TYPES
// =========================================================================

export interface PriceBreakdownProps {
	/** Pricing result with applied rules */
	pricingResult: PricingResult
	/** Whether to show compact view (no rule details) */
	compact?: boolean
	/** Whether to show margin information (staff only) */
	showMargin?: boolean
	/** Custom CSS classes */
	className?: string
}

// =========================================================================
// RULE TYPE STYLING
// =========================================================================

const RULE_TYPE_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
	BasePrice: {
		bg: 'bg-base-200/50',
		border: 'border-base-300',
		text: 'text-base-content',
		icon: '💰',
	},
	ContractPrice: {
		bg: 'bg-primary/10',
		border: 'border-primary/30',
		text: 'text-primary',
		icon: '📋',
	},
	VolumeTier: {
		bg: 'bg-secondary/10',
		border: 'border-secondary/30',
		text: 'text-secondary',
		icon: '📦',
	},
	MarginProtection: {
		bg: 'bg-warning/10',
		border: 'border-warning/30',
		text: 'text-warning',
		icon: '🛡️',
	},
}

const DEFAULT_STYLE = {
	bg: 'bg-base-200/50',
	border: 'border-base-300',
	text: 'text-base-content',
	icon: '📝',
}

// =========================================================================
// SUB-COMPONENTS
// =========================================================================

interface RuleRowProps {
	rule: PricingRuleApplication
	isLast: boolean
}

const RuleRow = memo(function RuleRow({ rule, isLast }: RuleRowProps) {
	const styles = RULE_TYPE_STYLES[rule.ruleType] || DEFAULT_STYLE
	const isDiscount = rule.adjustment < 0

	return (
		<div className={`flex items-center gap-3 p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
			{/* Order indicator */}
			<div className="flex items-center justify-center w-6 h-6 rounded-full bg-base-100 text-xs font-medium">
				{rule.order}
			</div>

			{/* Icon and type */}
			<div className="flex items-center gap-2 min-w-0 flex-1">
				<span className="text-lg">{styles.icon}</span>
				<div className="min-w-0 flex-1">
					<div className={`font-medium text-sm ${styles.text}`}>
						{rule.ruleName || rule.ruleType}
					</div>
					<div className="text-xs text-base-content/60 truncate">
						{rule.explanation}
					</div>
				</div>
			</div>

			{/* Price change */}
			<div className="text-right shrink-0">
				<div className="font-medium">
					${rule.priceAfter.toFixed(2)}
				</div>
				{rule.adjustment !== 0 && (
					<div className={`text-xs ${isDiscount ? 'text-success' : 'text-error'}`}>
						{isDiscount ? '' : '+'}${rule.adjustment.toFixed(2)}
					</div>
				)}
			</div>

			{/* Arrow indicator (except for last) */}
			{!isLast && (
				<div className="absolute right-1/2 -bottom-3 transform translate-x-1/2 text-base-content/30">
					↓
				</div>
			)}
		</div>
	)
})

// =========================================================================
// MAIN COMPONENT
// =========================================================================

/**
 * PriceBreakdown displays pricing calculation breakdown with applied rules.
 *
 * @example
 * ```tsx
 * // Full breakdown for quote editor
 * <PriceBreakdown pricingResult={result} showMargin />
 *
 * // Compact view for product cards
 * <PriceBreakdown pricingResult={result} compact />
 * ```
 */
export const PriceBreakdown = memo(function PriceBreakdown({
	pricingResult,
	compact = false,
	showMargin = false,
	className = '',
}: PriceBreakdownProps) {
	const hasDiscount = pricingResult.totalDiscount > 0
	const discountPercent = pricingResult.getDiscountPercent()

	// Compact view: just show base → final
	if (compact) {
		return (
			<div className={`inline-flex items-center gap-2 ${className}`}>
				{hasDiscount && (
					<span className="text-base-content/50 line-through text-sm">
						${pricingResult.basePrice.toFixed(2)}
					</span>
				)}
				<span className="font-semibold">
					${pricingResult.finalPrice.toFixed(2)}
				</span>
				{hasDiscount && (
					<span className="badge badge-success badge-sm">
						-{discountPercent.toFixed(0)}%
					</span>
				)}
			</div>
		)
	}

	// Full breakdown view
	return (
		<div className={`space-y-4 ${className}`}>
			{/* Header with summary */}
			<div className="flex items-center justify-between border-b border-base-300 pb-3">
				<div>
					<h4 className="font-medium text-base-content">Price Breakdown</h4>
					<p className="text-xs text-base-content/60">
						{pricingResult.appliedRules.length} rule{pricingResult.appliedRules.length !== 1 ? 's' : ''} applied
					</p>
				</div>
				<div className="text-right">
					<div className="text-2xl font-bold text-primary">
						${pricingResult.finalPrice.toFixed(2)}
					</div>
					{hasDiscount && (
						<div className="text-sm text-success">
							Save ${pricingResult.totalDiscount.toFixed(2)} ({discountPercent.toFixed(1)}%)
						</div>
					)}
				</div>
			</div>

			{/* Applied rules */}
			{pricingResult.appliedRules.length > 0 ? (
				<div className="space-y-2 relative">
					{pricingResult.appliedRules.map((rule, index) => (
						<RuleRow
							key={`${rule.ruleType}-${rule.order}`}
							rule={rule}
							isLast={index === pricingResult.appliedRules.length - 1}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-6 text-base-content/50 border border-dashed border-base-300 rounded-lg">
					<div className="text-2xl mb-2">📋</div>
					<p className="text-sm">No pricing rules applied</p>
					<p className="text-xs">Using base product price</p>
				</div>
			)}

			{/* Margin and protection info (staff only) */}
			{showMargin && (
				<div className="flex items-center justify-between pt-3 border-t border-base-300">
					<div className="flex items-center gap-2">
						{pricingResult.marginProtected && (
							<span className="badge badge-warning gap-1">
								🛡️ Margin Protected
							</span>
						)}
					</div>
					{pricingResult.effectiveMarginPercent != null && (
						<div className="text-right">
							<span className="text-xs text-base-content/60">Effective Margin:</span>
							<span
								className={`ml-2 font-medium ${
									pricingResult.effectiveMarginPercent >= 20
										? 'text-success'
										: pricingResult.effectiveMarginPercent >= 10
										? 'text-warning'
										: 'text-error'
								}`}
							>
								{pricingResult.effectiveMarginPercent.toFixed(1)}%
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	)
})

export default PriceBreakdown
