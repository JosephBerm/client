'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag, CheckCircle } from 'lucide-react'
import { useZodForm } from '@_hooks/useZodForm'
import { quoteSchema, type QuoteFormData } from '@_utils/validation-schemas'
import { useAuthStore } from '@_stores/useAuthStore'
import { useUserSettingsStore } from '@_stores/useUserSettingsStore'
import FormInput from '@_components/forms/FormInput'
import FormTextArea from '@_components/forms/FormTextArea'
import Button from '@_components/ui/Button'
import PageContainer from '@_components/layouts/PageContainer'
import EmptyState from '@_components/common/EmptyState'
import API from '@_services/api'
import Quote from '@_classes/Quote'
import { CartProduct } from '@_classes/Product'
import Name from '@_classes/common/Name'

export default function CartPage() {
	const router = useRouter()
	const [submitted, setSubmitted] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)
	const cart = useUserSettingsStore((state) => state.cart)
	const updateCartQuantity = useUserSettingsStore((state) => state.updateCartQuantity)
	const removeFromCart = useUserSettingsStore((state) => state.removeFromCart)
	const clearCart = useUserSettingsStore((state) => state.clearCart)

	const form = useZodForm(quoteSchema, {
		defaultValues: {
			customerId: user?.customerId || 0,
			items: [],
			notes: '',
			validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		},
	})

	// Calculate totals
	const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
	const tax = subtotal * 0.08 // 8% tax
	const total = subtotal + tax

	const handleSubmit = async (values: QuoteFormData) => {
		setIsLoading(true)

		try {
			// Convert cart to quote items format
			const quoteItems = cart.map((item) => new CartProduct({
				productId: item.productId,
				quantity: item.quantity,
				product: null, // Product reference can be null for submission
			}))

			// Construct a proper Quote object
			const quoteData = new Quote({
				companyName: user?.customer?.name || '',
				emailAddress: user?.email || '',
				phoneNumber: user?.phone || '',
				products: quoteItems,
				description: values.notes || '',
			})

			const response = await API.Public.sendQuote(quoteData)
			
			if (response.data.statusCode === 200) {
				setSubmitted(true)
				clearCart()
			}
		} catch (error) {
			console.error('Error submitting quote:', error)
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
					description="Add some products to your cart to get started"
					action={{
						label: 'Browse Products',
						onClick: () => router.push('/store'),
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
							Thank you for your quote request. Our team will review it and get back to you within 24-48 hours.
						</p>

						<div className="flex gap-4">
							<Button variant="primary" onClick={() => router.push('/store')}>
								Continue Shopping
							</Button>
							{isAuthenticated && (
								<Button variant="outline" onClick={() => router.push('/medsource-app/quotes')}>
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
		<PageContainer className="max-w-7xl py-8">
			<h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">Shopping Cart</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Cart Items */}
				<div className="lg:col-span-2 space-y-4">
					{cart.map((item) => (
						<div key={item.productId} className="card bg-base-100 shadow-md">
							<div className="card-body p-4">
								<div className="flex gap-4">
									{/* Product Image */}
									<div className="w-24 h-24 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
										<ShoppingBag className="w-12 h-12 text-base-content/30" />
									</div>

									{/* Product Info */}
									<div className="flex-1">
										<h3 className="font-semibold text-lg">{item.name}</h3>
										<p className="text-sm text-base-content/70">
											${item.price.toFixed(2)} each
										</p>

										{/* Quantity Controls */}
										<div className="flex items-center gap-2 mt-2">
											<button
												className="btn btn-xs btn-circle"
												onClick={() =>
													updateCartQuantity(
														item.productId,
														Math.max(1, item.quantity - 1)
													)
												}
											>
												-
											</button>
											<span className="w-12 text-center">{item.quantity}</span>
											<button
												className="btn btn-xs btn-circle"
												onClick={() =>
													updateCartQuantity(item.productId, item.quantity + 1)
												}
											>
												+
											</button>
										</div>
									</div>

									{/* Price & Remove */}
									<div className="flex flex-col items-end justify-between">
										<p className="font-semibold text-lg">
											${(item.price * item.quantity).toFixed(2)}
										</p>
										<button
											className="btn btn-ghost btn-sm text-error"
											onClick={() => removeFromCart(item.productId)}
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Order Summary & Quote Form */}
				<div className="space-y-6">
					{/* Order Summary */}
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title">Order Summary</h2>
							
							<div className="space-y-2 py-4">
								<div className="flex justify-between">
									<span>Subtotal</span>
									<span>${subtotal.toFixed(2)}</span>
								</div>
								<div className="flex justify-between">
									<span>Tax (8%)</span>
									<span>${tax.toFixed(2)}</span>
								</div>
								<div className="divider my-2"></div>
								<div className="flex justify-between font-bold text-lg">
									<span>Total</span>
									<span>${total.toFixed(2)}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Quote Request Form */}
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title">Request Quote</h2>
							
							<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
								<FormInput
									label="Valid Until"
									type="date"
									{...form.register('validUntil')}
									error={form.formState.errors.validUntil}
								/>

								<FormTextArea
									label="Additional Notes (Optional)"
									placeholder="Any special requirements or questions?"
									rows={4}
									{...form.register('notes')}
									error={form.formState.errors.notes}
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
											Please log in to submit a quote
										</p>
										<Button
											variant="primary"
											fullWidth
											onClick={() => router.push('/login')}
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
