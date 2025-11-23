/**
 * CartItem Component - Beautiful, Elegant Cart Item Display
 * 
 * FAANG-level cart item component inspired by Amazon's elegant cart design.
 * Displays product information, quantity controls, and actions in a clean,
 * scannable layout optimized for B2B quote-based ordering.
 * 
 * **Design Principles (FAANG Best Practices):**
 * - Clean, scannable layout with clear visual hierarchy
 * - Product image left, details center, actions right
 * - Quantity selector prominently displayed
 * - Touch-friendly controls (min 44px tap targets)
 * - Mobile-first responsive design
 * - Smooth transitions and hover states
 * - Accessibility-first (ARIA labels, keyboard navigation)
 * 
 * **Business Model Alignment:**
 * - Quote-based: No prices displayed
 * - B2B focus: Clean, professional aesthetic
 * - Action-oriented: Easy quantity updates and item removal
 * 
 * **Features:**
 * - Product image/icon with fallback
 * - Product name with metadata (SKU, manufacturer when available)
 * - Quantity selector (read-only, styled as input)
 * - Remove action
 * - Save for later action (optional, for future feature)
 * - Mobile-responsive layout
 * - Smooth hover effects
 * - Full accessibility support
 * 
 * **Separation of Concerns:**
 * - Pure presentation component (no business logic)
 * - Receives callbacks for actions (onQuantityChange, onRemove)
 * - Reusable across cart, saved items, order review
 * 
 * @example
 * ```tsx
 * import CartItem from '@_components/cart/CartItem';
 * 
 * // Basic usage
 * <CartItem
 *   item={cartItem}
 *   onQuantityChange={(productId, quantity) => updateCartQuantity(productId, quantity)}
 *   onRemove={(productId) => removeFromCart(productId)}
 * />
 * 
 * // With product image
 * <CartItem
 *   item={cartItem}
 *   product={product}
 *   onQuantityChange={handleQuantityChange}
 *   onRemove={handleRemove}
 * />
 * ```
 * 
 * @module CartItem
 */

'use client'

import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Trash2, ShoppingBag } from 'lucide-react'
import { CartItem as CartItemType } from '@_features/cart'
import { Product } from '@_classes/Product'
import { serializeProduct } from '@_lib/serializers/productSerializer'
import QuantitySelector from '@_components/ui/QuantitySelector'
import Button from '@_components/ui/Button'
import ProductImage from '@_components/store/ProductImage'
import { Routes } from '@_features/navigation'
import { logger } from '@_core'
import classNames from 'classnames'

/**
 * CartItem component props interface.
 * 
 * **Type Safety (FAANG Best Practice):**
 * - All required props are non-nullable
 * - Callbacks have explicit signatures
 * - Optional props have sensible defaults
 * - item and product are readonly to prevent accidental mutation
 */
export interface CartItemProps {
	/** Cart item data (read-only to prevent mutation) */
	readonly item: CartItemType

	/** 
	 * Optional: Full product object for additional details and image.
	 * When provided, enables product image display and additional metadata (SKU, manufacturer).
	 * Read-only to prevent mutation.
	 */
	readonly product?: Product | null

	/** 
	 * Callback when quantity changes.
	 * @param productId - Unique identifier of the product
	 * @param quantity - New quantity (always >= 1)
	 */
	onQuantityChange: (productId: string, quantity: number) => void

	/** 
	 * Callback when item is removed.
	 * @param productId - Unique identifier of the product to remove
	 */
	onRemove: (productId: string) => void

	/** 
	 * Optional: Show product link to detail page.
	 * @default true
	 */
	showProductLink?: boolean

	/** 
	 * Optional: Custom className for additional styling.
	 * @default ''
	 */
	className?: string

	/** 
	 * Optional: Compact mode for smaller display (less padding).
	 * @default false
	 */
	compact?: boolean

	/** 
	 * Optional: Disable interactions (for order review or processing states).
	 * @default false
	 */
	disabled?: boolean
}

/**
 * CartItem Component
 * 
 * Beautiful, elegant cart item component following FAANG design patterns.
 * Displays product information, quantity controls, and actions in a clean layout.
 * 
 * **Layout Structure:**
 * - Mobile: Stacked (image top, info middle, actions bottom)
 * - Tablet+: Horizontal (image left, info center, actions right)
 * 
 * **Visual Hierarchy:**
 * 1. Product image (draws attention)
 * 2. Product name (primary information)
 * 3. Quantity selector (primary action)
 * 4. Remove button (secondary action)
 * 
 * **Accessibility:**
 * - Proper ARIA labels for all interactive elements
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Focus management
 * 
 * @param props - CartItem configuration props
 * @returns CartItem component
 */
export default function CartItem({
	item,
	product,
	onQuantityChange,
	onRemove,
	showProductLink = true,
	className = '',
	compact = false,
	disabled = false,
}: CartItemProps) {
	// Component name for structured logging (FAANG best practice)
	const COMPONENT_NAME = 'CartItem'

	// Memoized derived state (Phase 5 optimization)
	const productName = useMemo(() => product?.name || item.name, [product?.name, item.name])
	const productSku = useMemo(() => product?.sku || undefined, [product?.sku])
	const productManufacturer = useMemo(
		() => product?.manufacturer || product?.provider?.name || undefined,
		[product?.manufacturer, product?.provider?.name]
	)
	const hasProductDetails = useMemo(() => Boolean(product), [product])
	
	// Use Routes.Store.product() builder method instead of manual string construction (DRY principle)
	const productLink = useMemo(
		() => (showProductLink ? Routes.Store.product(item.productId) : undefined),
		[showProductLink, item.productId]
	)
	
	const containerPadding = useMemo(() => (compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5 md:p-6'), [compact])

	// Memoized callbacks (Phase 5 optimization - prevent unnecessary re-renders)
	const handleIncrement = useCallback(() => {
		if (disabled) return

		const newQuantity = item.quantity + 1

		logger.debug('Cart item quantity incremented', {
			component: COMPONENT_NAME,
			productId: item.productId,
			productName,
			oldQuantity: item.quantity,
			newQuantity,
		})

		onQuantityChange(item.productId, newQuantity)
	}, [disabled, item.productId, item.quantity, productName, onQuantityChange])

	const handleDecrement = useCallback(() => {
		if (disabled) return

		const newQuantity = Math.max(1, item.quantity - 1)

		logger.debug('Cart item quantity decremented', {
			component: COMPONENT_NAME,
			productId: item.productId,
			productName,
			oldQuantity: item.quantity,
			newQuantity,
		})

		onQuantityChange(item.productId, newQuantity)
	}, [disabled, item.productId, item.quantity, productName, onQuantityChange])

	const handleRemove = useCallback(() => {
		if (disabled) return

		logger.info('Cart item removed', {
			component: COMPONENT_NAME,
			productId: item.productId,
			productName,
			quantity: item.quantity,
		})

		onRemove(item.productId)
	}, [disabled, item.productId, productName, item.quantity, onRemove])

	return (
		<div
			className={classNames(
				'card bg-base-100 border border-base-300 shadow-sm hover:shadow-md',
				// Transitions with reduced motion support (Phase 5)
				'transition-all duration-300 motion-reduce:transition-none',
				containerPadding,
				className
			)}
		>
			<div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6">
				{/* Product Image/Icon - Left */}
				<div className="relative w-full sm:w-28 md:w-32 h-28 md:h-32 bg-base-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center aspect-square">
					{hasProductDetails && product ? (
						<div className="w-full h-full">
							<ProductImage
								product={product instanceof Product ? serializeProduct(product) : product}
								size="md"
								priority={false}
								className="w-full h-full object-cover"
								onImageClick={productLink ? undefined : undefined}
							/>
						</div>
					) : (
						<ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-base-content/30" aria-hidden="true" />
					)}
				</div>

				{/* Product Info - Center */}
				<div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
					{/* Product Name */}
					<div className="space-y-1.5">
						{showProductLink && productLink ? (
							<Link
								href={productLink}
								className="block group"
								aria-label={`View ${productName} details`}
							>
							<h3 className="font-semibold text-base sm:text-lg md:text-xl text-base-content group-hover:text-primary transition-colors duration-200 motion-reduce:transition-none line-clamp-2 leading-tight">
								{productName}
							</h3>
							</Link>
						) : (
							<h3 className="font-semibold text-base sm:text-lg md:text-xl text-base-content line-clamp-2 leading-tight">
								{productName}
							</h3>
						)}

						{/* Product Metadata - SKU, Manufacturer */}
						<div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-base-content/70">
							{productSku && (
								<div className="flex items-center gap-1.5">
									<span className="font-medium">SKU:</span>
									<span className="font-mono text-xs">{productSku}</span>
								</div>
							)}
							{productManufacturer && (
								<div className="flex items-center gap-1.5">
									<span className="text-base-content/50">•</span>
									<span className="truncate max-w-[200px] sm:max-w-none">{productManufacturer}</span>
								</div>
							)}
						</div>
					</div>

					{/* Quantity Controls - Prominently Displayed */}
					<div className="flex flex-wrap items-center gap-2 sm:gap-3">
						<span className="text-sm sm:text-base text-base-content/70 font-medium shrink-0">
							Quantity:
						</span>
						<QuantitySelector
							value={item.quantity}
							onIncrement={handleIncrement}
							onDecrement={handleDecrement}
							min={1}
							editable={false}
							size="sm"
							buttonVariant="ghost"
							useIcons={true}
							disabled={disabled}
							ariaLabel={`Quantity controls for ${productName}`}
							align="justify-start"
							className="shrink-0"
						/>
					</div>
				</div>

				{/* Actions - Right */}
				<div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-3 shrink-0">
					{/* Remove Button */}
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRemove}
						disabled={disabled}
						leftIcon={<Trash2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />}
						className="text-error hover:bg-error/10 hover:text-error transition-colors duration-200 motion-reduce:transition-none min-h-[44px]"
						aria-label={`Remove ${productName} from cart`}
					>
						<span className="sm:hidden">Remove</span>
					</Button>

					{/* Future: More Actions Menu (Save for later, etc.) */}
					{/* Uncomment when implementing additional actions */}
					{/* <button
						type="button"
						className="btn btn-ghost btn-sm btn-circle min-h-[44px] min-w-[44px] text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors duration-200"
						aria-label="More actions"
						aria-haspopup="true"
					>
						<MoreVertical className="w-4 h-4" aria-hidden="true" />
					</button> */}
				</div>
			</div>
		</div>
	)
}

