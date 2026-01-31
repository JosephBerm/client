'use client'

import { useState } from 'react'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import Modal from '@_components/ui/Modal'
import { ShoppingCart, X } from 'lucide-react'

interface CartItem {
	id: string
	name: string
	price: number
	quantity: number
	imageUrl?: string
}

interface CartWidgetProps {
	items?: CartItem[]
	position?: 'top' | 'side'
	onCheckout?: () => void
	onRemoveItem?: (id: string) => void
}

/**
 * Cart Widget Component
 *
 * Floating shopping cart widget with item summary.
 * Opens a modal with cart details.
 * Uses DaisyUI semantic colors and existing UI components.
 *
 * TIER: Professional
 * CATEGORY: Order
 */
export default function CartWidget({ items = [], position = 'side', onCheckout, onRemoveItem }: CartWidgetProps) {
	const [isOpen, setIsOpen] = useState(false)

	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
	const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

	const handleRemoveItem = (id: string) => {
		if (onRemoveItem) {
			onRemoveItem(id)
		}
	}

	const handleCheckout = () => {
		setIsOpen(false)
		if (onCheckout) {
			onCheckout()
		}
	}

	return (
		<>
			{/* Floating Cart Button */}
			<Button
				onClick={() => setIsOpen(true)}
				variant='primary'
				size='md'
				className={`
          btn-circle shadow-lg
          fixed z-50
          ${position === 'top' ? 'right-4 top-4' : 'bottom-4 right-4'}
          hover:scale-105 active:scale-95
          transition-transform duration-150
        `}
				aria-label={`Shopping cart with ${totalItems} items`}
				leftIcon={<ShoppingCart className='h-5 w-5' />}>
				{totalItems > 0 && (
					<Badge
						variant='error'
						badgeStyle='solid'
						size='xs'
						className='absolute -right-1 -top-1'>
						{totalItems}
					</Badge>
				)}
			</Button>

			{/* Cart Modal */}
			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title='Shopping Cart'
				size='md'>
				<p className='mb-4 text-sm text-base-content/60'>
					{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
				</p>

				<div className='space-y-4'>
					{items.length === 0 ? (
						<p className='py-8 text-center text-base-content/60'>Your cart is empty</p>
					) : (
						<>
							<div className='space-y-3'>
								{items.map((item) => (
									<div
										key={item.id}
										className='flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/30 p-3'>
										<div className='flex-1'>
											<h4 className='font-medium text-base-content'>{item.name}</h4>
											<p className='text-sm text-base-content/60'>
												${item.price.toFixed(2)} × {item.quantity}
											</p>
										</div>
										<p className='font-semibold text-base-content'>
											${(item.price * item.quantity).toFixed(2)}
										</p>
										<Button
											onClick={() => handleRemoveItem(item.id)}
											variant='ghost'
											size='sm'
											className='btn-circle hover:bg-error/10 hover:text-error'
											aria-label={`Remove ${item.name} from cart`}
											leftIcon={<X className='h-4 w-4' />}
										/>
									</div>
								))}
							</div>

							<div className='border-t border-base-300 pt-4'>
								<div className='flex items-center justify-between text-lg font-bold text-base-content'>
									<span>Total:</span>
									<span>${totalPrice.toFixed(2)}</span>
								</div>
							</div>

							<Button
								variant='primary'
								fullWidth
								onClick={handleCheckout}>
								Proceed to Checkout
							</Button>
						</>
					)}
				</div>
			</Modal>
		</>
	)
}
