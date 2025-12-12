/**
 * @fileoverview Cart Page Logic Hook
 * 
 * Business logic hook for the cart page following MAANG-level patterns.
 * Extracts all state management, data fetching, and business logic from the UI component.
 * 
 * **Architecture:**
 * - Uses composition of smaller concerns (state, fetching, form)
 * - Manages side effects with proper dependency tracking
 * - Provides memoized event handlers to prevent unnecessary re-renders
 * - Uses useFormSubmit for DRY form submission (matches codebase pattern)
 * - Handles product fetching with loading states
 * - Manages quote submission lifecycle
 * 
 * **Patterns Followed:**
 * - Similar to useStorePageLogic hook structure
 * - Uses useFormSubmit like ProductForm, UpdateCustomerForm, etc.
 * - Proper error handling with notificationService
 * - Type-safe with full TypeScript
 * 
 * @module features/cart/hooks/useCartPageLogic
 * @category State Management
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import { quoteSchema, type QuoteFormData, logger } from '@_core'

import { formatDateForInput, addDays, serializeDate, parseDateOrNow } from '@_lib'

import { useZodForm, useFormSubmit, API } from '@_shared'

import Name from '@_classes/common/Name'
import { Product, CartProduct } from '@_classes/Product'
import Quote from '@_classes/Quote'
import type { IUser } from '@_classes/User'

import { useCartStore, useHydratedCart, type CartItem } from '../stores/useCartStore'

import type { UseFormReturn } from 'react-hook-form'

/**
 * Cart page logic hook return type
 */
export interface UseCartPageLogicReturn {
	// State
	cart: CartItem[]
	products: Map<string, Product>
	isLoading: boolean
	isFetchingProducts: boolean
	submitted: boolean
	form: UseFormReturn<QuoteFormData>
	isHydrated: boolean // True when cart has loaded from localStorage
	
	// Auth state
	isAuthenticated: boolean
	user: IUser | null
	
	// Derived state
	totalItems: number
	totalProducts: number
	
	// Cart actions
	updateCartQuantity: (productId: string, quantity: number) => void
	removeFromCart: (productId: string) => void
	
	// Form submission
	handleSubmit: (values: QuoteFormData) => Promise<void>
	
	// Navigation
	handleContinueShopping: () => void
	handleViewQuotes: () => void
	handleLoginClick: () => void
}

/**
 * Custom hook for cart page business logic
 * 
 * Centralizes all state management, data fetching, and event handling
 * for the cart page. Follows the same pattern as useStorePageLogic.
 * 
 * **State Management:**
 * - Local state: submitted, products, isFetchingProducts
 * - Store state: cart, auth (via Zustand)
 * - Form state: useZodForm with quoteSchema
 * 
 * **Data Fetching:**
 * - Fetches product details for cart items in parallel
 * - Handles loading states and errors
 * - Uses AbortController for request cancellation (future enhancement)
 * 
 * **Form Submission:**
 * - Uses useFormSubmit for DRY error handling
 * - Constructs Quote object from cart and form data
 * - Clears cart on success
 * - Sets submitted state for success UI
 * 
 * @returns Cart page state and event handlers
 * 
 * @example
 * ```typescript
 * const {
 *   cart,
 *   products,
 *   isLoading,
 *   handleSubmit,
 *   updateCartQuantity,
 * } = useCartPageLogic()
 * ```
 */
export function useCartPageLogic(): UseCartPageLogicReturn {
	const router = useRouter()
	
	// ============================================================================
	// STATE MANAGEMENT
	// ============================================================================
	
	const [submitted, setSubmitted] = useState(false)
	const [products, setProducts] = useState<Map<string, Product>>(new Map())
	const [isFetchingProducts, setIsFetchingProducts] = useState(false)
	
	// Auth state
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)
	
	// Cart state with hydration awareness
	// This ensures cart displays correctly after SSR hydration
	const { cart, isHydrated } = useHydratedCart()
	const updateCartQuantity = useCartStore((state) => state.updateCartQuantity)
	const removeFromCart = useCartStore((state) => state.removeFromCart)
	const clearCart = useCartStore((state) => state.clearCart)
	
	// Form management
	const form = useZodForm(quoteSchema, {
		defaultValues: {
			// Authenticated user fields
			customerId: user?.customerId ?? 0,
			// Non-authenticated user fields (optional, will be filled if not logged in)
			firstName: '',
			lastName: '',
			email: '',
			// Common fields
			items: [],
			notes: '',
			// Type assertion needed: z.coerce.date() infers Date type, but HTML date inputs require string format
			// The coercion will convert the string to Date during validation
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			validUntil: formatDateForInput(addDays(parseDateOrNow(), 30)) as any, // 30 days from now (YYYY-MM-DD format)
		},
	})
	
	// ============================================================================
	// DERIVED STATE
	// ============================================================================
	
	// Calculate total item count (memoized for performance)
	const totalItems = useMemo(
		() => cart.reduce((sum, item) => sum + item.quantity, 0),
		[cart]
	)
	
	// Calculate total product count
	const totalProducts = useMemo(() => cart.length, [cart])
	
	// ============================================================================
	// DATA FETCHING
	// ============================================================================
	
	// Fetch product details for cart items to display images
	useEffect(() => {
		const fetchProductDetails = async () => {
			if (cart.length === 0) {
				setProducts(new Map())
				return
			}

			setIsFetchingProducts(true)

			try {
				// Fetch all products in parallel for optimal performance
				const productPromises = cart.map(async (item) => {
					try {
						const { data } = await API.Store.Products.get(item.productId)
						if (data.payload) {
							return { id: item.productId, product: new Product(data.payload) }
						}
						return null
					} catch (error) {
						logger.warn('Failed to fetch product details for cart item', {
							component: 'useCartPageLogic',
							productId: item.productId,
							error,
						})
						return null
					}
				})

				const results = await Promise.all(productPromises)

				// Build products map
				const productsMap = new Map<string, Product>()
				results.forEach((result) => {
					if (result) {
						productsMap.set(result.id, result.product)
					}
				})

				setProducts(productsMap)

				logger.debug('Cart products fetched', {
					component: 'useCartPageLogic',
					fetchedCount: productsMap.size,
					cartItemCount: cart.length,
				})
			} catch (error) {
				logger.error('Failed to fetch cart product details', {
					component: 'useCartPageLogic',
					error,
				})
			} finally {
				setIsFetchingProducts(false)
			}
		}

		void fetchProductDetails()
	}, [cart])

	// Update form items when cart changes (for validation only - prices are placeholders)
	// Actual quote submission uses cart directly, not form values
	useEffect(() => {
		if (cart.length > 0) {
			const formItems = cart.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				// Use || instead of ?? because price is 0 in quote-based model (not null/undefined)
				// The schema requires positive price, so we use a placeholder for validation only
				price: item.price || 0.01, // Placeholder price for validation (not used in actual quote)
			}))
			form.setValue('items', formItems)
		} else {
			form.setValue('items', [])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cart]) // Intentionally excluding 'form' to prevent infinite loops (form.setValue is stable)

	// Update form state when authentication status changes
	// This ensures form reflects current auth state (e.g., user logs in while on cart page)
	useEffect(() => {
		if (isAuthenticated && user) {
			// User logged in: clear guest fields, set customerId
			form.setValue('customerId', user.customerId ?? 0)
			form.setValue('firstName', '')
			form.setValue('lastName', '')
			form.setValue('email', '')
			// Clear validation errors for guest fields
			form.clearErrors('firstName')
			form.clearErrors('lastName')
			form.clearErrors('email')
		} else {
			// User logged out: clear customerId, keep guest fields as-is
			form.setValue('customerId', 0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated, user?.customerId]) // Only depend on auth state, not form
	
	// ============================================================================
	// FORM SUBMISSION (using useFormSubmit pattern)
	// ============================================================================
	
	/**
	 * Quote submission handler using useFormSubmit for DRY error handling.
	 * Follows the same pattern as ProductForm, UpdateCustomerForm, etc.
	 * 
	 * ESLint: useFormSubmit is a custom hook that takes an async function and options object (not a dependency array).
	 * The async function intentionally captures cart and user from closure.
	 * These are not React hook dependencies - they're closure variables used in the submit function.
	 * The function is recreated on each render, which is acceptable for this use case.
	 * The second parameter is an options object, not a dependency array, so ESLint's warning is a false positive.
	 */
	const { submit: submitQuote, isSubmitting: isLoading } = useFormSubmit(
		async (values: QuoteFormData) => {
			logger.info('Submitting quote request', {
				component: 'useCartPageLogic',
				customerId: user?.customerId,
				itemCount: cart.length,
			})

			// Convert cart to quote items format
			const quoteItems = cart.map((item) => new CartProduct({
				productId: item.productId,
				quantity: item.quantity,
				product: null, // Product reference can be null for submission
			}))

			// Determine contact information based on authentication status
			const userIsAuthenticated = isAuthenticated && user
			
			// Construct Name object - use user's name if authenticated, otherwise use form values
			const contactName = userIsAuthenticated && user?.name
				? new Name(user.name)
				: new Name({
						first: values.firstName ?? '',
						last: values.lastName ?? '',
					})

			// Get email - use user's email if authenticated, otherwise use form value
			const contactEmail = userIsAuthenticated && user?.email
				? user.email
				: values.email ?? ''

			// Get company name - use user's company if authenticated, otherwise empty
			const companyName = userIsAuthenticated && user?.customer?.name
				? user.customer.name
				: ''

			// Construct a proper Quote object with all form values
			// Note: createdAt is set to now() as a client-side timestamp for new quotes
			// The backend will override this with its own server-side timestamp
			const quoteData = new Quote({
				name: contactName,
				companyName,
				emailAddress: contactEmail,
				phoneNumber: user?.phone ?? '',
				products: quoteItems,
				description: values.notes ?? '',
				createdAt: new Date(), // Required field - backend will set authoritative timestamp
				// Convert string date back to Date object if needed
				...(values.validUntil && { validUntil: serializeDate(values.validUntil) }),
			})

			return API.Public.sendQuote(quoteData)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		{
			successMessage: 'Quote request submitted successfully!',
			errorMessage: 'Failed to submit quote request. Please try again.',
			componentName: 'CartPage',
			actionName: 'submitQuote',
			onSuccess: () => {
				logger.info('Quote request submitted successfully', {
					component: 'useCartPageLogic',
					customerId: user?.customerId,
				})
				setSubmitted(true)
				clearCart()
				form.reset() // Reset form after successful submission
			},
		}
	)
	
	/**
	 * Form submission handler for React Hook Form.
	 * Wraps useFormSubmit's submit function to work with React Hook Form.
	 * 
	 * FAANG Pattern: Extract event handlers from JSX for separation of concerns.
	 */
	const handleSubmit = useCallback(async (values: QuoteFormData): Promise<void> => {
		await submitQuote(values)
	}, [submitQuote])
	
	// ============================================================================
	// NAVIGATION HANDLERS
	// ============================================================================
	
	/**
	 * Navigate to store page to continue shopping.
	 * 
	 * FAANG Pattern: Use useCallback for stable event handlers.
	 */
	const handleContinueShopping = useCallback(() => {
		router.push(Routes.Store.location)
	}, [router])
	
	/**
	 * Navigate to quotes page to view submitted quotes.
	 * 
	 * FAANG Pattern: Use useCallback for stable event handlers.
	 */
	const handleViewQuotes = useCallback(() => {
		router.push(Routes.Quotes.location)
	}, [router])
	
	/**
	 * Open login modal.
	 * 
	 * FAANG Pattern: Use useCallback for stable event handlers.
	 */
	const handleLoginClick = useCallback(() => {
		router.push(Routes.openLoginModal())
	}, [router])
	
	// ============================================================================
	// RETURN
	// ============================================================================
	
	return {
		// State
		cart,
		products,
		isLoading,
		isFetchingProducts,
		submitted,
		form,
		isHydrated, // Indicates if cart has been loaded from localStorage
		
		// Auth state
		isAuthenticated,
		user,
		
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
		handleLoginClick,
	}
}
