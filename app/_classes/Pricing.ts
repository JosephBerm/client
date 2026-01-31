/**
 * Pricing Entity Classes
 *
 * Domain models for the Advanced Pricing Engine.
 * Includes Price Lists, Pricing Results, Volume Tiers, and Rule Applications.
 *
 * **Features:**
 * - Contract pricing (customer-specific price lists)
 * - Volume/quantity pricing tiers
 * - Margin protection
 * - Pricing explainability (applied rules breakdown)
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 5.2 Frontend
 *
 * @module Pricing
 */

import { parseDateSafe } from '@_lib/dates'

// ============================================================================
// PRICE LIST ENTITIES
// ============================================================================

/**
 * Price List entity representing a contract or promotional pricing list.
 *
 * Price lists can contain fixed prices, percentage discounts, or fixed discounts
 * for products. They're assigned to customers to provide customer-specific pricing.
 *
 * **Priority:** Lower number = higher priority. When multiple lists apply,
 * the lowest priority number wins.
 *
 * @example
 * ```typescript
 * const priceList = new PriceList({
 *   id: 'abc-123',
 *   name: 'Hospital System Contract 2026',
 *   priority: 10,
 *   isActive: true,
 *   validFrom: new Date('2026-01-01'),
 *   validUntil: new Date('2026-12-31'),
 * });
 * ```
 */
export class PriceList {
	/** Unique identifier (GUID) */
	id: string

	/** Price list name (e.g., "Hospital System Contract 2026") */
	name: string

	/** Optional description */
	description: string | null

	/** Priority (lower = higher priority, first match wins) */
	priority: number

	/** Whether the price list is active */
	isActive: boolean

	/** Optional start date for validity */
	validFrom: Date | null

	/** Optional end date for validity */
	validUntil: Date | null

	/** Number of products in the price list */
	itemCount: number

	/** Number of customers assigned to this price list */
	customerCount: number

	/** Creation timestamp */
	createdAt: Date

	/** Price list items (when fetching detailed view) */
	items?: PriceListItem[]

	/** Customer assignments (when fetching detailed view) */
	customers?: CustomerAssignment[]

	constructor(data?: Partial<PriceList>) {
		this.id = data?.id ?? ''
		this.name = data?.name ?? ''
		this.description = data?.description ?? null
		this.priority = data?.priority ?? 100
		this.isActive = data?.isActive ?? true
		this.validFrom = data?.validFrom ? parseDateSafe(data.validFrom) : null
		this.validUntil = data?.validUntil ? parseDateSafe(data.validUntil) : null
		this.itemCount = data?.itemCount ?? 0
		this.customerCount = data?.customerCount ?? 0
		this.createdAt = data?.createdAt ? parseDateSafe(data.createdAt) ?? new Date() : new Date()
		this.items = data?.items?.map((item) => new PriceListItem(item))
		this.customers = data?.customers?.map((c) => new CustomerAssignment(c))
	}

	/**
	 * Checks if the price list is currently valid based on validity dates.
	 */
	isCurrentlyValid(priceDate: Date = new Date()): boolean {
		if (!this.isActive) return false
		if (this.validFrom && priceDate < this.validFrom) return false
		if (this.validUntil && priceDate > this.validUntil) return false
		return true
	}
}

/**
 * Price List Item representing a product's pricing within a price list.
 *
 * **Pricing Methods (exactly one must be set):**
 * - `fixedPrice`: Customer pays this exact price
 * - `percentDiscount`: Customer gets X% off base price
 * - `fixedDiscount`: Customer gets $X off base price
 *
 * @example
 * ```typescript
 * // Fixed price item
 * const item = new PriceListItem({
 *   productId: 'prod-123',
 *   fixedPrice: 85.00,
 * });
 *
 * // Percent discount item
 * const item2 = new PriceListItem({
 *   productId: 'prod-456',
 *   percentDiscount: 15, // 15% off
 * });
 * ```
 */
export class PriceListItem {
	/** Unique identifier (GUID) */
	id: string

	/** Product ID (GUID) */
	productId: string

	/** Product name (for display) */
	productName: string

	/** Product SKU (for display) */
	productSku: string

	/** Product base price (list price) */
	basePrice: number

	/** Fixed price override (customer pays this exact amount) */
	fixedPrice: number | null

	/** Percent discount off base price (0-100) */
	percentDiscount: number | null

	/** Fixed discount amount off base price */
	fixedDiscount: number | null

	/** Minimum margin percent override for this item */
	minimumMarginPercent: number | null

	/** Calculated effective price based on pricing method */
	calculatedPrice: number

	constructor(data?: Partial<PriceListItem>) {
		this.id = data?.id ?? ''
		this.productId = data?.productId ?? ''
		this.productName = data?.productName ?? ''
		this.productSku = data?.productSku ?? ''
		this.basePrice = data?.basePrice ?? 0
		this.fixedPrice = data?.fixedPrice ?? null
		this.percentDiscount = data?.percentDiscount ?? null
		this.fixedDiscount = data?.fixedDiscount ?? null
		this.minimumMarginPercent = data?.minimumMarginPercent ?? null
		this.calculatedPrice = data?.calculatedPrice ?? 0
	}

	/**
	 * Gets the active pricing method for this item.
	 */
	getPricingMethod(): 'fixedPrice' | 'percentDiscount' | 'fixedDiscount' | 'none' {
		if (this.fixedPrice != null) return 'fixedPrice'
		if (this.percentDiscount != null) return 'percentDiscount'
		if (this.fixedDiscount != null) return 'fixedDiscount'
		return 'none'
	}

	/**
	 * Gets a human-readable description of the pricing method.
	 */
	getPricingDescription(): string {
		switch (this.getPricingMethod()) {
			case 'fixedPrice':
				return `Fixed: $${this.fixedPrice?.toFixed(2)}`
			case 'percentDiscount':
				return `${this.percentDiscount}% off`
			case 'fixedDiscount':
				return `$${this.fixedDiscount?.toFixed(2)} off`
			default:
				return 'No pricing'
		}
	}
}

/**
 * Customer Assignment representing a customer's assignment to a price list.
 */
export class CustomerAssignment {
	/** Customer ID (GUID) */
	customerId: string

	/** Customer name (for display) */
	customerName: string

	/** Assignment timestamp */
	assignedAt: Date

	/** User ID who assigned (for audit) */
	assignedBy?: string

	constructor(data?: Partial<CustomerAssignment>) {
		this.customerId = data?.customerId ?? ''
		this.customerName = data?.customerName ?? ''
		this.assignedAt = data?.assignedAt ? parseDateSafe(data.assignedAt) ?? new Date() : new Date()
		this.assignedBy = data?.assignedBy
	}
}

// ============================================================================
// VOLUME PRICING ENTITIES
// ============================================================================

/**
 * Volume Tier representing quantity-based pricing.
 *
 * **Pricing Methods (exactly one must be set):**
 * - `unitPrice`: Fixed price per unit at this quantity
 * - `percentDiscount`: Percent off base price at this quantity
 *
 * @example
 * ```typescript
 * // Tiers: 1-9 = $100, 10-49 = $90, 50+ = $80
 * const tiers = [
 *   new VolumeTier({ minQuantity: 1, maxQuantity: 9, unitPrice: 100 }),
 *   new VolumeTier({ minQuantity: 10, maxQuantity: 49, unitPrice: 90 }),
 *   new VolumeTier({ minQuantity: 50, maxQuantity: null, unitPrice: 80 }),
 * ];
 * ```
 */
export class VolumeTier {
	/** Unique identifier (GUID) */
	id: string

	/** Minimum quantity for this tier */
	minQuantity: number

	/** Maximum quantity for this tier (null = unlimited) */
	maxQuantity: number | null

	/** Fixed unit price at this tier */
	unitPrice: number | null

	/** Percent discount at this tier */
	percentDiscount: number | null

	/** Calculated price based on base price */
	calculatedPrice: number

	/** Human-readable tier description (e.g., "10-49 units") */
	tierDescription?: string

	constructor(data?: Partial<VolumeTier>) {
		this.id = data?.id ?? ''
		this.minQuantity = data?.minQuantity ?? 1
		this.maxQuantity = data?.maxQuantity ?? null
		this.unitPrice = data?.unitPrice ?? null
		this.percentDiscount = data?.percentDiscount ?? null
		this.calculatedPrice = data?.calculatedPrice ?? 0
		this.tierDescription = data?.tierDescription
	}

	/**
	 * Gets the tier range as a formatted string.
	 */
	getRangeDescription(): string {
		if (this.tierDescription) return this.tierDescription
		if (this.maxQuantity == null) return `${this.minQuantity}+ units`
		if (this.minQuantity === this.maxQuantity) return `${this.minQuantity} unit`
		return `${this.minQuantity}-${this.maxQuantity} units`
	}

	/**
	 * Gets the pricing method for this tier.
	 */
	getPricingMethod(): 'unitPrice' | 'percentDiscount' | 'none' {
		if (this.unitPrice != null) return 'unitPrice'
		if (this.percentDiscount != null) return 'percentDiscount'
		return 'none'
	}
}

/**
 * Product Volume Tiers response containing all tiers for a product.
 */
export class ProductVolumeTiers {
	/** Product ID (GUID) */
	productId: string

	/** Product name */
	productName: string

	/** Product base price */
	basePrice: number

	/** Volume tiers for this product */
	tiers: VolumeTier[]

	constructor(data?: Partial<ProductVolumeTiers>) {
		this.productId = data?.productId ?? ''
		this.productName = data?.productName ?? ''
		this.basePrice = data?.basePrice ?? 0
		this.tiers = data?.tiers?.map((t) => new VolumeTier(t)) ?? []
	}

	/**
	 * Gets the applicable tier for a given quantity.
	 */
	getTierForQuantity(quantity: number): VolumeTier | null {
		// Find the tier with the highest minQuantity that the quantity qualifies for
		const sortedTiers = [...this.tiers].sort((a, b) => b.minQuantity - a.minQuantity)
		for (const tier of sortedTiers) {
			if (quantity >= tier.minQuantity) {
				if (tier.maxQuantity == null || quantity <= tier.maxQuantity) {
					return tier
				}
			}
		}
		return null
	}
}

// ============================================================================
// PRICING RESULT ENTITIES
// ============================================================================

/**
 * Pricing Result representing a calculated price with applied rules.
 *
 * **Security Note (PRD 5.1):**
 * - Customer role: `effectiveMarginPercent` is always null (hidden)
 * - Staff roles: Full margin visibility
 *
 * **Waterfall Algorithm:**
 * 1. Base Price → 2. Contract Price List → 3. Volume Tier → 4. Margin Protection
 *
 * @example
 * ```typescript
 * const result = new PricingResult({
 *   productId: 'prod-123',
 *   basePrice: 100.00,
 *   finalPrice: 85.00,
 *   totalDiscount: 15.00,
 *   effectiveMarginPercent: 25.5, // Only visible to staff
 *   marginProtected: false,
 *   appliedRules: [
 *     new PricingRuleApplication({
 *       ruleType: 'ContractPrice',
 *       ruleName: 'Hospital Contract',
 *       priceBefore: 100.00,
 *       priceAfter: 85.00,
 *       explanation: '15% discount',
 *     }),
 *   ],
 * });
 * ```
 */
export class PricingResult {
	/** Product ID (GUID) */
	productId: string

	/** Original base price (list price) */
	basePrice: number

	/** Final calculated price after all rules */
	finalPrice: number

	/** Total discount amount (basePrice - finalPrice) */
	totalDiscount: number

	/** Effective margin percent (null for customer role - security) */
	effectiveMarginPercent: number | null

	/** Whether margin protection was applied */
	marginProtected: boolean

	/** Applied pricing rules (for explainability) */
	appliedRules: PricingRuleApplication[]

	constructor(data?: Partial<PricingResult>) {
		this.productId = data?.productId ?? ''
		this.basePrice = data?.basePrice ?? 0
		this.finalPrice = data?.finalPrice ?? 0
		this.totalDiscount = data?.totalDiscount ?? 0
		this.effectiveMarginPercent = data?.effectiveMarginPercent ?? null
		this.marginProtected = data?.marginProtected ?? false
		this.appliedRules = data?.appliedRules?.map((r) => new PricingRuleApplication(r)) ?? []
	}

	/**
	 * Gets the discount percentage.
	 */
	getDiscountPercent(): number {
		if (this.basePrice === 0) return 0
		return (this.totalDiscount / this.basePrice) * 100
	}

	/**
	 * Checks if pricing is healthy (margin above threshold).
	 * @param threshold - Minimum acceptable margin (default 10%)
	 */
	isMarginHealthy(threshold: number = 10): boolean {
		if (this.effectiveMarginPercent == null) return true // Unknown = assume OK
		return this.effectiveMarginPercent >= threshold
	}

	/**
	 * Gets margin health status.
	 */
	getMarginStatus(): 'healthy' | 'warning' | 'critical' | 'unknown' {
		if (this.effectiveMarginPercent == null) return 'unknown'
		if (this.effectiveMarginPercent >= 20) return 'healthy'
		if (this.effectiveMarginPercent >= 10) return 'warning'
		return 'critical'
	}
}

/**
 * Pricing Rule Application representing a single step in the pricing waterfall.
 *
 * **Rule Types:**
 * - `BasePrice`: Initial product price
 * - `ContractPrice`: Customer-specific price list applied
 * - `VolumeTier`: Quantity-based pricing applied
 * - `MarginProtection`: Price adjusted to meet minimum margin
 *
 * @example
 * ```typescript
 * const rule = new PricingRuleApplication({
 *   order: 1,
 *   ruleType: 'BasePrice',
 *   ruleName: 'Product List Price',
 *   priceBefore: 0,
 *   priceAfter: 100.00,
 *   adjustment: 100.00,
 *   explanation: 'Base product price: $100.00',
 * });
 * ```
 */
export class PricingRuleApplication {
	/** Order in the waterfall (1-based) */
	order: number

	/** Type of rule (BasePrice, ContractPrice, VolumeTier, MarginProtection) */
	ruleType: string

	/** Name of the rule (e.g., price list name, tier description) */
	ruleName: string

	/** Price before this rule was applied */
	priceBefore: number

	/** Price after this rule was applied */
	priceAfter: number

	/** Price adjustment (can be positive or negative) */
	adjustment: number

	/** Human-readable explanation of the rule effect */
	explanation: string

	constructor(data?: Partial<PricingRuleApplication>) {
		this.order = data?.order ?? 0
		this.ruleType = data?.ruleType ?? ''
		this.ruleName = data?.ruleName ?? ''
		this.priceBefore = data?.priceBefore ?? 0
		this.priceAfter = data?.priceAfter ?? 0
		this.adjustment = data?.adjustment ?? 0
		this.explanation = data?.explanation ?? ''
	}

	/**
	 * Gets the appropriate icon for this rule type.
	 */
	getIcon(): string {
		switch (this.ruleType) {
			case 'BasePrice':
				return '💰'
			case 'ContractPrice':
				return '📋'
			case 'VolumeTier':
				return '📦'
			case 'MarginProtection':
				return '🛡️'
			default:
				return '📝'
		}
	}

	/**
	 * Gets whether this rule decreased the price.
	 */
	isDiscount(): boolean {
		return this.adjustment < 0
	}
}

// ============================================================================
// REQUEST/RESPONSE TYPES (for API)
// ============================================================================

/** Request for single price calculation */
export interface PricingRequest {
	productId: string
	customerId?: string | null
	quantity?: number
	priceDate?: Date | null
	includeBreakdown?: boolean
}

/** Request for bulk price calculation */
export interface BulkPricingRequest {
	items: PricingRequest[]
}

/** Request for creating a price list */
export interface CreatePriceListRequest {
	name: string
	description?: string | null
	priority?: number
	isActive?: boolean
	validFrom?: Date | null
	validUntil?: Date | null
}

/** Request for updating a price list */
export interface UpdatePriceListRequest {
	name?: string
	description?: string | null
	priority?: number
	isActive?: boolean
	validFrom?: Date | null
	validUntil?: Date | null
}

/** Request for adding an item to a price list */
export interface AddPriceListItemRequest {
	productId: string
	fixedPrice?: number | null
	percentDiscount?: number | null
	fixedDiscount?: number | null
	minimumMarginPercent?: number | null
}

/** Request for assigning a price list to a customer */
export interface AssignPriceListRequest {
	priceListId: string
}

/** Volume tier input for setting tiers */
export interface VolumeTierInput {
	minQuantity: number
	maxQuantity?: number | null
	unitPrice?: number | null
	percentDiscount?: number | null
}

/** Request for setting volume tiers */
export interface SetVolumeTiersRequest {
	tiers: VolumeTierInput[]
}

// ============================================================================
// PRICE OVERRIDE ENTITIES
// ============================================================================

/**
 * Price Override History entry representing a manual price override by Sales Manager.
 *
 * **Audit Compliance (PRD 5.1):**
 * All overrides are logged with full audit trail including:
 * - Original vs overridden price
 * - Business justification (reason)
 * - Who made the override
 * - When it was made
 *
 * @example
 * ```typescript
 * const history = new PriceOverrideHistory({
 *   id: 'override-123',
 *   cartProductId: 'cp-456',
 *   originalPrice: 100.00,
 *   overriddenPrice: 85.00,
 *   reason: 'Competitor match for long-term customer',
 *   overriddenByUserId: 'user-789',
 *   overriddenAt: new Date(),
 * });
 * ```
 */
export class PriceOverrideHistory {
	/** Unique identifier (GUID) */
	id: string

	/** Cart product ID that was overridden */
	cartProductId: string

	/** Original price before override */
	originalPrice: number

	/** Price after override */
	overriddenPrice: number

	/** Business justification for the override */
	reason: string

	/** User ID who performed the override */
	overriddenByUserId: string

	/** Timestamp when override was applied */
	overriddenAt: Date

	constructor(data?: Partial<PriceOverrideHistory>) {
		this.id = data?.id ?? ''
		this.cartProductId = data?.cartProductId ?? ''
		this.originalPrice = data?.originalPrice ?? 0
		this.overriddenPrice = data?.overriddenPrice ?? 0
		this.reason = data?.reason ?? ''
		this.overriddenByUserId = data?.overriddenByUserId ?? ''
		this.overriddenAt = data?.overriddenAt ? new Date(data.overriddenAt) : new Date()
	}

	/**
	 * Gets the price difference.
	 */
	getDifference(): number {
		return this.overriddenPrice - this.originalPrice
	}

	/**
	 * Gets the percentage difference.
	 */
	getDifferencePercent(): number {
		if (this.originalPrice === 0) return 0
		return (this.getDifference() / this.originalPrice) * 100
	}

	/**
	 * Whether this was a price increase.
	 */
	isIncrease(): boolean {
		return this.getDifference() > 0
	}
}

// ============================================================================
// AUDIT LOG ENTITIES
// ============================================================================

/**
 * Pricing Audit Log response representing a single audit entry.
 *
 * **Purpose:**
 * - Compliance tracking for all pricing calculations
 * - Analytics and debugging
 * - Audit trail for quotes/orders
 *
 * @example
 * ```typescript
 * const log = new PricingAuditLogResponse({
 *   productId: 'prod-123',
 *   customerId: 456,
 *   quantity: 10,
 *   basePrice: 100.00,
 *   finalPrice: 85.00,
 *   eventType: 'QuotePrice',
 * });
 * ```
 */
export class PricingAuditLogResponse {
	/** Unique identifier (GUID) */
	id: string

	/** Product ID (GUID) */
	productId: string

	/** Product name (for display) */
	productName: string | null

	/** Product SKU (for display) */
	productSku: string | null

	/** Customer ID (GUID, if customer-specific pricing) */
	customerId: string | null

	/** Customer name (for display) */
	customerName: string | null

	/** Quantity that was priced */
	quantity: number

	/** Base price at time of calculation */
	basePrice: number

	/** Final calculated price */
	finalPrice: number

	/** Total discount given */
	totalDiscount: number

	/** Effective margin percent (staff only) */
	effectiveMarginPercent: number | null

	/** Whether margin protection was triggered */
	marginProtected: boolean

	/** JSON of applied pricing rules */
	appliedRulesJson: string

	/** Event type (QuotePrice, OrderPrice, CartPrice, etc.) */
	eventType: string

	/** Quote ID (if quote pricing) */
	quoteId: string | null

	/** Order ID (UUID/GUID if order pricing) */
	orderId: string | null

	/** User ID who requested pricing */
	requestedBy: string | null

	/** User name (for display) */
	requestedByName: string | null

	/** Timestamp of calculation */
	calculatedAt: Date

	constructor(data?: Partial<PricingAuditLogResponse>) {
		this.id = data?.id ?? ''
		this.productId = data?.productId ?? ''
		this.productName = data?.productName ?? null
		this.productSku = data?.productSku ?? null
		this.customerId = data?.customerId ?? null
		this.customerName = data?.customerName ?? null
		this.quantity = data?.quantity ?? 0
		this.basePrice = data?.basePrice ?? 0
		this.finalPrice = data?.finalPrice ?? 0
		this.totalDiscount = data?.totalDiscount ?? 0
		this.effectiveMarginPercent = data?.effectiveMarginPercent ?? null
		this.marginProtected = data?.marginProtected ?? false
		this.appliedRulesJson = data?.appliedRulesJson ?? '[]'
		this.eventType = data?.eventType ?? ''
		this.quoteId = data?.quoteId ?? null
		this.orderId = data?.orderId ?? null
		this.requestedBy = data?.requestedBy ?? null
		this.requestedByName = data?.requestedByName ?? null
		this.calculatedAt = data?.calculatedAt ? new Date(data.calculatedAt) : new Date()
	}

	/**
	 * Gets the discount percentage.
	 */
	getDiscountPercent(): number {
		if (this.basePrice === 0) return 0
		return (this.totalDiscount / this.basePrice) * 100
	}

	/**
	 * Parses the applied rules JSON.
	 */
	getAppliedRules(): PricingRuleApplication[] {
		try {
			const parsed = JSON.parse(this.appliedRulesJson)
			return parsed.map((r: Partial<PricingRuleApplication>) => new PricingRuleApplication(r))
		} catch {
			return []
		}
	}
}

/**
 * Filter parameters for querying pricing audit logs.
 */
export interface PricingAuditLogFilter {
	/** Filter by product ID */
	productId?: string
	/** Filter by customer ID (GUID) */
	customerId?: string
	/** Filter by event type */
	eventType?: string
	/** Filter from date */
	dateFrom?: Date | string
	/** Filter to date */
	dateTo?: Date | string
	/** Filter by quote ID */
	quoteId?: string
	/** Filter by order ID (GUID) */
	orderId?: string
	/** Only margin-protected transactions */
	marginProtectedOnly?: boolean
	/** Page number */
	page?: number
	/** Page size */
	pageSize?: number
}

// ============================================================================
// ANALYTICS ENTITIES
// ============================================================================

/**
 * Pricing Analytics response with aggregated metrics.
 *
 * **Authorization:** SalesManagerOrAbove policy only.
 * Contains sensitive margin data not accessible to SalesRep or Customer.
 *
 * @example
 * ```typescript
 * const analytics = new PricingAnalyticsResponse({
 *   averageMargin: 22.5,
 *   totalDiscountGiven: 15000.00,
 *   totalCalculations: 500,
 *   marginProtectedCount: 25,
 * });
 * ```
 */
export class PricingAnalyticsResponse {
	/** Average margin across all calculations */
	averageMargin: number

	/** Total discount given in dollar amount */
	totalDiscountGiven: number

	/** Total number of price calculations */
	totalCalculations: number

	/** Number of times margin protection was triggered */
	marginProtectedCount: number

	/** Percentage of calculations that triggered margin protection */
	marginProtectedPercent: number

	/** Start of analytics period */
	periodStart: Date

	/** End of analytics period */
	periodEnd: Date

	/** Analytics by price list */
	priceListAnalytics: PriceListAnalytics[]

	/** Margin distribution buckets */
	marginDistribution: MarginDistributionBucket[]

	/** Margin change vs previous period (percentage) */
	marginTrend: number

	/** Discount change vs previous period (percentage) */
	discountTrend: number

	constructor(data?: Partial<PricingAnalyticsResponse>) {
		this.averageMargin = data?.averageMargin ?? 0
		this.totalDiscountGiven = data?.totalDiscountGiven ?? 0
		this.totalCalculations = data?.totalCalculations ?? 0
		this.marginProtectedCount = data?.marginProtectedCount ?? 0
		this.marginProtectedPercent = data?.marginProtectedPercent ?? 0
		this.periodStart = data?.periodStart ? new Date(data.periodStart) : new Date()
		this.periodEnd = data?.periodEnd ? new Date(data.periodEnd) : new Date()
		this.priceListAnalytics = data?.priceListAnalytics ?? []
		this.marginDistribution = data?.marginDistribution ?? []
		this.marginTrend = data?.marginTrend ?? 0
		this.discountTrend = data?.discountTrend ?? 0
	}

	/**
	 * Gets the margin trend direction.
	 */
	getMarginTrendDirection(): 'up' | 'down' | 'stable' {
		if (this.marginTrend > 1) return 'up'
		if (this.marginTrend < -1) return 'down'
		return 'stable'
	}

	/**
	 * Gets the discount trend direction.
	 */
	getDiscountTrendDirection(): 'up' | 'down' | 'stable' {
		if (this.discountTrend > 1) return 'up'
		if (this.discountTrend < -1) return 'down'
		return 'stable'
	}
}

/**
 * Analytics for a single price list.
 */
export interface PriceListAnalytics {
	priceListId: string
	priceListName: string
	averageMargin: number
	totalDiscountGiven: number
	itemCount: number
	customerCount: number
	calculationCount: number
}

/**
 * Margin distribution bucket for visualization.
 */
export interface MarginDistributionBucket {
	/** Range label (e.g., "0-10%") */
	range: string
	/** Minimum margin in bucket */
	minMargin: number
	/** Maximum margin in bucket */
	maxMargin: number
	/** Count of calculations in bucket */
	count: number
	/** Percentage of total */
	percentage: number
}

/**
 * Request parameters for pricing analytics.
 */
export interface PricingAnalyticsRequest {
	/** Period: week, month, quarter, year */
	period?: string
	/** Optional start date override */
	startDate?: Date | string
	/** Optional end date override */
	endDate?: Date | string
}

/**
 * Alias for price override history entry (matches API naming).
 */
export type PriceOverrideHistoryEntry = PriceOverrideHistory
