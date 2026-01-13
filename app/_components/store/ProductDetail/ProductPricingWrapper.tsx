'use client'

/**
 * Product Pricing Wrapper Component
 *
 * Smart wrapper that conditionally renders:
 * - CustomerPricingCard for authenticated users (shows personalized pricing)
 * - ProductPricingCard for anonymous users (shows quote-based messaging)
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 3
 * > "Product cards show customer's price (not base price)"
 *
 * This component bridges the gap between server-rendered product pages
 * and client-side customer-specific pricing.
 *
 * @module ProductDetail/ProductPricingWrapper
 */

import { useAuthStore } from '@_features/auth'
import { Product } from '@_classes/Product'

import ProductPricingCard from './ProductPricingCard'
import CustomerPricingCard from './CustomerPricingCard'

// =========================================================================
// TYPES
// =========================================================================

export interface ProductPricingWrapperProps {
	/** Product data */
	product: Product
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Product Pricing Wrapper Component
 *
 * Intelligently renders the appropriate pricing card based on authentication state.
 * - Authenticated users see their personalized contract/volume pricing
 * - Anonymous users see the standard quote-based pricing card
 */
export default function ProductPricingWrapper({ product }: ProductPricingWrapperProps) {
	// Check authentication state
	const user = useAuthStore((state) => state.user)
	const isAuthenticated = !!user && user.customerId > 0

	// For authenticated users with a valid customer ID, show personalized pricing
	if (isAuthenticated) {
		return (
			<CustomerPricingCard
				productId={product.id}
				productName={product.name}
				basePrice={product.price}
				quantity={1}
			/>
		)
	}

	// For anonymous users, show standard quote-based pricing
	return <ProductPricingCard product={product} />
}
