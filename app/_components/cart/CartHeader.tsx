/**
 * CartHeader Component
 * 
 * Page header for the cart page with title and description.
 * Presentational component following FAANG best practices.
 * 
 * @module components/cart/CartHeader
 */

export interface CartHeaderProps {
	/** Optional custom title */
	title?: string
	/** Optional custom description */
	description?: string
}

/**
 * CartHeader Component
 * 
 * Displays the page header with title and description.
 * 
 * @param props - Component props
 * @returns CartHeader component
 */
export default function CartHeader({ 
	title = 'Shopping Cart',
	description = 'Review your items and submit a quote request for personalized pricing',
}: CartHeaderProps) {
	return (
		<div className="mb-6 sm:mb-8">
			<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
				{title}
			</h1>
			<p className="text-sm sm:text-base text-base-content/70">
				{description}
			</p>
		</div>
	)
}
