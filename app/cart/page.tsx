'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Trash2, ShoppingBag, CheckCircle, Info, FileText, Clock } from 'lucide-react'
import { useZodForm } from '@_shared'
import { quoteSchema, type QuoteFormData } from '@_core'
import { logger } from '@_core'
import { useAuthStore } from '@_features/auth'
import { useCartStore } from '@_features/cart'
import FormInput from '@_components/forms/FormInput'
import FormTextArea from '@_components/forms/FormTextArea'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import PageContainer from '@_components/layouts/PageContainer'
import EmptyState from '@_components/common/EmptyState'
import { API } from '@_shared'
import Quote from '@_classes/Quote'
import { CartProduct } from '@_classes/Product'
import { Routes } from '@_features/navigation'

// Force dynamic rendering due to useSearchParams in Navbar
export const dynamic = 'force-dynamic'

/**
 * Cart Page Component
 * 
 * Quote-based shopping cart page for B2B medical supply ordering.
 * Implements the quote-based business model where prices are not displayed
 * until a quote is provided by staff after review.
 * 
 * **Business Model Compliance:**
 * - No prices displayed (quote-based system)
 * - Cart items submitted as quote requests
 * - Quote request form with validity period and notes
 * - Cart cleared after successful quote submission
 * 
 * **Features:**
 * - Mobile-first responsive design
 * - Quantity management for cart items
 * - Quote request submission with validation
 * - Informational messaging about quote process
 * - Empty and success states
 * 
 * @module CartPage
 */
export default function CartPage() {
	const router = useRouter()
	const [submitted, setSubmitted] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)
	const cart = useCartStore((state) => state.cart)
	const updateCartQuantity = useCartStore((state) => state.updateCartQuantity)
	const removeFromCart = useCartStore((state) => state.removeFromCart)
	const clearCart = useCartStore((state) => state.clearCart)

	// Format date as YYYY-MM-DD for HTML date input
	const formatDateForInput = (date: Date): string => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const form = useZodForm(quoteSchema, {
		defaultValues: {
			customerId: user?.customerId || 0,
			items: [],
			notes: '',
			validUntil: formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) as any, // 30 days from now (YYYY-MM-DD format)
		},
	})

	// Calculate total item count (memoized for performance) - Must be before conditional returns
	const totalItems = useMemo(
		() => cart.reduce((sum, item) => sum + item.quantity, 0),
		[cart]
	)

	// Update form items when cart changes (for validation only - prices are placeholders)
	// Actual quote submission uses cart directly, not form values
	useEffect(() => {
		if (cart.length > 0) {
			const formItems = cart.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				price: item.price || 0.01, // Placeholder price for validation (not used in actual quote)
			}))
			form.setValue('items', formItems)
		} else {
			form.setValue('items', [])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cart]) // Intentionally excluding 'form' to prevent infinite loops (form.setValue is stable)

	const handleSubmit = async (values: QuoteFormData) => {
		setIsLoading(true)

		try {
			logger.info('Submitting quote request', {
				component: 'CartPage',
				customerId: user?.customerId,
				itemCount: cart.length,
			})

			// Convert cart to quote items format
			const quoteItems = cart.map((item) => new CartProduct({
				productId: item.productId,
				quantity: item.quantity,
				product: null, // Product reference can be null for submission
			}))

			// Construct a proper Quote object with all form values
			const quoteData = new Quote({
				companyName: user?.customer?.name || '',
				emailAddress: user?.email || '',
				phoneNumber: user?.phone || '',
				products: quoteItems,
				description: values.notes || '',
				// CRITICAL FIX: Include validUntil from form
				// Convert string date back to Date object if needed
				...(values.validUntil && { validUntil: new Date(values.validUntil) }),
			})

			const response = await API.Public.sendQuote(quoteData)
			
			if (response.data.statusCode === 200) {
				logger.info('Quote request submitted successfully', {
					component: 'CartPage',
					customerId: user?.customerId,
				})
				setSubmitted(true)
				clearCart()
				form.reset() // Reset form after successful submission
			}
		} catch (error) {
			const errorMessage = error instanceof Error 
				? error.message 
				: 'Failed to submit quote request. Please try again.'
			
			logger.error('Quote submission failed', {
				error,
				component: 'CartPage',
				customerId: user?.customerId,
				errorMessage,
			})
			
			toast.error(errorMessage, {
				position: 'top-right',
				autoClose: 5000,
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Empty cart state
	if (cart.length === 0 && !submitted) {
		return (
			<PageContainer className="max-w-4xl">
				<EmptyState
					icon={<ShoppingBag className="w-16 h-16" />}
					title="Your cart is empty"
					description="Add some products to your cart to request a quote"
					action={{
						label: 'Browse Products',
						onClick: () => router.push(Routes.Store.location),
					}}
				/>
			</PageContainer>
		)
	}

	// Success state
	if (submitted) {
		return (
			<PageContainer className="max-w-2xl">
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body items-center text-center py-12">
						<CheckCircle className="w-20 h-20 text-success mb-4" />
						
						<h2 className="card-title text-3xl mb-2">Quote Request Submitted!</h2>
						
						<p className="text-base-content/70 mb-6">
							Thank you for your quote request. Our team will review it and get back to you within 24-48 hours with personalized pricing.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
							<Button variant="primary" onClick={() => router.push(Routes.Store.location)}>
								Continue Shopping
							</Button>
							{isAuthenticated && (
								<Button variant="outline" onClick={() => router.push(Routes.Quotes.location)}>
									View My Quotes
								</Button>
							)}
						</div>
					</div>
				</div>
			</PageContainer>
		)
	}

	return (
		<PageContainer className="max-w-7xl py-4 sm:py-8">
			{/* Page Header */}
			<div className="mb-6 sm:mb-8">
				<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
					Shopping Cart
				</h1>
				<p className="text-sm sm:text-base text-base-content/70">
					Review your items and submit a quote request for personalized pricing
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
				{/* Cart Items Section */}
				<div className="lg:col-span-2 space-y-4">
					{/* Quote Process Info Card */}
					<div className="card bg-info/10 border border-info/20 shadow-sm">
						<div className="card-body p-4 sm:p-6">
							<div className="flex gap-3 sm:gap-4">
								<Info className="w-5 h-5 sm:w-6 sm:h-6 text-info shrink-0 mt-0.5" />
								<div className="flex-1">
									<h3 className="font-semibold text-base sm:text-lg text-info mb-1">
										Quote-Based Pricing
									</h3>
									<p className="text-sm sm:text-base text-base-content/80">
										Our team will review your request and provide personalized pricing within 24-48 hours. 
										This allows us to offer competitive rates tailored to your needs and order volume.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Cart Items */}
					<div className="space-y-3 sm:space-y-4">
						{cart.map((item) => (
							<div key={item.productId} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
								<div className="card-body p-4 sm:p-6">
									<div className="flex flex-col sm:flex-row gap-4">
										{/* Product Image/Icon */}
										<div className="w-full sm:w-24 h-24 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
											<ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-base-content/30" />
										</div>

										{/* Product Info */}
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-base sm:text-lg mb-2 wrap-break-word">
												{item.name}
											</h3>

											{/* Quantity Controls */}
											<div className="flex items-center gap-3 mt-3 sm:mt-4">
												<span className="text-sm text-base-content/70">Quantity:</span>
												<div className="flex items-center gap-2" role="group" aria-label={`Quantity controls for ${item.name}`}>
													<button
														type="button"
														className="btn btn-sm btn-circle btn-outline"
														onClick={() =>
															updateCartQuantity(
																item.productId,
																Math.max(1, item.quantity - 1)
															)
														}
														aria-label={`Decrease quantity of ${item.name}`}
													>
														-
													</button>
													<span 
														className="w-12 text-center font-medium"
														aria-live="polite"
														aria-atomic="true"
														role="status"
													>
														{item.quantity}
													</span>
													<button
														type="button"
														className="btn btn-sm btn-circle btn-outline"
														onClick={() =>
															updateCartQuantity(item.productId, item.quantity + 1)
														}
														aria-label={`Increase quantity of ${item.name}`}
													>
														+
													</button>
												</div>
											</div>
										</div>

										{/* Remove Button */}
										<div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
											<button
												type="button"
												className="btn btn-ghost btn-sm text-error hover:bg-error/10"
												onClick={() => removeFromCart(item.productId)}
												aria-label={`Remove ${item.name} from cart`}
											>
												<Trash2 className="w-4 h-4" aria-hidden="true" />
												<span className="sm:hidden ml-2">Remove</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Quote Request Section */}
				<div className="space-y-4 sm:space-y-6">
					{/* Quote Information Card */}
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body p-4 sm:p-6">
							<div className="flex items-center gap-2 mb-4">
								<FileText className="w-5 h-5 text-primary" />
								<h2 className="card-title text-lg sm:text-xl">Quote Request</h2>
							</div>
							
							<div className="space-y-3">
								<div className="flex items-center justify-between text-sm">
									<span className="text-base-content/70">Items in Cart</span>
									<Badge variant="primary" tone="subtle">
										{totalItems} {totalItems === 1 ? 'item' : 'items'}
									</Badge>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-base-content/70">Products</span>
									<Badge variant="info" tone="subtle">
										{cart.length} {cart.length === 1 ? 'product' : 'products'}
									</Badge>
								</div>
								<div className="divider my-2"></div>
								<div className="flex items-start gap-2 text-xs sm:text-sm text-base-content/70">
									<Clock className="w-4 h-4 shrink-0 mt-0.5" />
									<p>
										You&apos;ll receive a personalized quote within 24-48 hours. 
										Our team reviews each request to ensure competitive pricing.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Quote Request Form */}
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body p-4 sm:p-6">
							<h2 className="card-title text-lg sm:text-xl mb-4">Submit Quote Request</h2>
							
							<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
								<FormInput
									label="Valid Until"
									type="date"
									{...form.register('validUntil')}
									error={form.formState.errors.validUntil}
									helperText="Quote will be valid until this date"
								/>

								<FormTextArea
									label="Additional Notes (Optional)"
									placeholder="Any special requirements, delivery preferences, or questions?"
									rows={4}
									{...form.register('notes')}
									error={form.formState.errors.notes}
									helperText="Help us provide the best quote by sharing any specific needs"
								/>

								{isAuthenticated ? (
									<Button
										type="submit"
										variant="primary"
										fullWidth
										loading={isLoading}
										disabled={isLoading}
									>
										Submit Quote Request
									</Button>
								) : (
									<div className="space-y-2">
										<p className="text-sm text-center text-base-content/70">
											Please log in to submit a quote request
										</p>
										<Button
											variant="primary"
											fullWidth
											onClick={() => router.push(Routes.openLoginModal())}
										>
											Log In
										</Button>
									</div>
								)}
							</form>
						</div>
					</div>
				</div>
			</div>
		</PageContainer>
	)
}

