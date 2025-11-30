/**
 * Product Header Info Component
 * 
 * Displays product header information: manufacturer and name.
 * Server component - no client-side interactivity needed.
 * 
 * @module ProductDetail/ProductHeaderInfo
 */

import type { Product } from '@_classes/Product'

import { ANIMATION_DELAYS } from './ProductDetail.constants'

export interface ProductHeaderInfoProps {
	/** Product instance */
	product: Product
}

/**
 * Product Header Info
 * 
 * Renders product manufacturer and name with animations.
 * Note: Stock status is not displayed as this is a quote-based dropshipping model
 * where availability is determined during quote processing, not upfront.
 */
export default function ProductHeaderInfo({ product }: ProductHeaderInfoProps) {
	return (
		<div
			className="animate-elegant-reveal space-y-5"
			style={{ animationDelay: ANIMATION_DELAYS.HEADER }}
		>
			{product.manufacturer && (
				<p className="text-sm font-bold uppercase tracking-widest text-primary">
					{product.manufacturer}
				</p>
			)}

			<h1 className="text-4xl font-bold leading-tight tracking-tight text-base-content sm:text-5xl lg:text-4xl xl:text-5xl">
				{product.name}
			</h1>
		</div>
	)
}

