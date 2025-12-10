/**
 * Cart Page Component
 * 
 * Quote-based shopping cart page for B2B medical supply ordering.
 * Refactored to use container/presentational pattern following MAANG-level best practices.
 * 
 * **Architecture:**
 * - Thin page wrapper that renders CartPageContainer
 * - All business logic in useCartPageLogic hook
 * - All UI in focused, reusable components
 * - Follows same pattern as StorePageContainer
 * 
 * **Business Model Compliance:**
 * - No prices displayed (quote-based system)
 * - Cart items submitted as quote requests
 * - Quote request form with validity period and notes
 * - Cart cleared after successful quote submission
 * 
 * @module CartPage
 */

'use client'

import { CartPageContainer } from '@_components/cart'

/**
 * Cart page component
 * 
 * Simplified implementation: All business logic and UI are handled by:
 * - `useCartPageLogic` hook (in @_features/cart)
 * - `CartPageContainer` component (in @_components/cart)
 * 
 * This page is a thin wrapper that renders the cart container.
 * 
 * @component
 */
export default function CartPage() {
	return <CartPageContainer />
}

