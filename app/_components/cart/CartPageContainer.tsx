/**
 * @fileoverview Cart Page Container Component
 * 
 * Main orchestration component for the cart page.
 * Connects business logic hook with presentational components.
 * 
 * **FAANG Best Practice:**
 * - Container/Presentational pattern (Dan Abramov)
 * - Single responsibility (orchestrates child components)
 * - No business logic (delegated to hook)
 * - Clean component composition
 * 
 * **Architecture:**
 * - Uses useCartPageLogic hook for all business logic
 * - Conditionally renders: EmptyState, SuccessState, or MainContent
 * - Composes child components with proper props
 * - Handles layout structure
 * 
 * @module components/cart/CartPageContainer
 * @category Components
 */

'use client'

import { useCartPageLogic } from '@_features/cart'

import PageContainer from '@_components/layouts/PageContainer'

import CartEmptyState from './CartEmptyState'
import CartSuccessState from './CartSuccessState'
import CartHeader from './CartHeader'
import CartItemsSection from './CartItemsSection'
import CartSummary from './CartSummary'

/**
 * Cart page container component
 * 
 * Orchestrates the cart page by:
 * - Using business logic hook for state and handlers
 * - Composing presentational child components
 * - Passing down props and callbacks
 * - Handling conditional rendering (empty, success, main)
 * 
 * **Component Structure:**
 * - Empty State: When cart is empty and not submitted
 * - Success State: After successful quote submission
 * - Main Content: Cart items + Quote request form
 *   - CartHeader: Page title and description
 *   - CartItemsSection: Cart items list with info card
 *   - CartSummary: Quote summary and request form
 * 
 * @component
 */
export default function CartPageContainer() {
	const {
		// State
		cart,
		products,
		isLoading,
		isFetchingProducts,
		submitted,
		form,
		isHydrated, // Zustand hydration status
		
		// Auth state
		isAuthenticated,
		
		// Derived state
		totalItems,
		totalProducts,
		
		// Cart actions
		updateCartQuantity,
		removeFromCart,
		
		// Form submission
		handleSubmit,
		
		// Navigation
		handleContinueShopping,
		handleViewQuotes,
	} = useCartPageLogic()

	// Show loading skeleton during hydration to prevent flash of "empty cart"
	if (!isHydrated) {
		return (
			<PageContainer className="max-w-4xl">
				<div className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center">
					<div className="h-24 w-24 animate-pulse rounded-full bg-base-200" />
					<div className="h-8 w-48 animate-pulse rounded-md bg-base-200" />
					<div className="h-4 w-64 animate-pulse rounded-md bg-base-200" />
				</div>
			</PageContainer>
		)
	}

	// Empty cart state
	if (cart.length === 0 && !submitted) {
		return (
			<PageContainer className="max-w-4xl">
				<CartEmptyState onBrowseClick={handleContinueShopping} />
			</PageContainer>
		)
	}

	// Success state
	if (submitted) {
		return (
			<PageContainer className="max-w-2xl">
				<CartSuccessState
					onContinueShopping={handleContinueShopping}
					onViewQuotes={handleViewQuotes}
					showViewQuotes={isAuthenticated}
				/>
			</PageContainer>
		)
	}

	// Main cart content
	return (
		<PageContainer className="max-w-7xl py-4 sm:py-8">
			<CartHeader />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
				{/* Cart Items Section */}
				<CartItemsSection
					cart={cart}
					products={products}
					isFetchingProducts={isFetchingProducts}
					onQuantityChange={updateCartQuantity}
					onRemove={removeFromCart}
				/>

				{/* Quote Request Section */}
				<CartSummary
					totalItems={totalItems}
					totalProducts={totalProducts}
					form={form}
					onSubmit={handleSubmit}
					isLoading={isLoading}
					isAuthenticated={isAuthenticated}
				/>
			</div>
		</PageContainer>
	)
}
