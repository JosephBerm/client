/**
 * Product Specifications Component
 * 
 * Displays product specifications in a minimal table format.
 * Server component - no client-side interactivity needed.
 * 
 * @module ProductDetail/ProductSpecifications
 */

import Guid from '@_classes/Base/Guid'
import type { Product } from '@_classes/Product'

import { ANIMATION_DELAYS, PRODUCT_STATUS, SECTION_LABELS, SPEC_LABELS } from './ProductDetail.constants'

export interface ProductSpecificationsProps {
	/** Product instance */
	product: Product
}

/**
 * Product Specifications
 * 
 * Renders product specifications table with category, product ID, SKU, and manufacturer.
 */
export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
	return (
		<div
			className="animate-elegant-reveal pt-4"
			style={{ animationDelay: ANIMATION_DELAYS.SPECIFICATIONS }}
		>
			<h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-base-content/40">
				{SECTION_LABELS.SPECIFICATIONS}
			</h3>
			<div className="overflow-hidden rounded-xl border border-base-200 shadow-sm">
				{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
				{/* @ts-ignore - Simple key-value specifications table; native table is most semantic for this use case */}
				<table className="w-full text-sm">
					<tbody className="divide-y divide-base-200 bg-base-100">
						{product.categories.length > 0 && (
							<tr className="divide-x divide-base-200 transition-colors hover:bg-base-50">
								<td className="w-1/3 bg-base-200/30 px-4 py-3 font-medium text-base-content/60">
									{SPEC_LABELS.CATEGORY}
								</td>
								<td className="px-4 py-3 text-base-content">
									{product.categories.map((c) => c.name).join(', ')}
								</td>
							</tr>
						)}
						<tr className="divide-x divide-base-200 transition-colors hover:bg-base-50">
							<td className="w-1/3 bg-base-200/30 px-4 py-3 font-medium text-base-content/60">
								{SPEC_LABELS.PRODUCT_ID}
							</td>
							<td className="px-4 py-3 font-mono text-base-content/80 text-xs">
								<span className="break-all">{Guid.formatForDisplay(product.id)}</span>
							</td>
						</tr>
						<tr className="divide-x divide-base-200 transition-colors hover:bg-base-50">
							<td className="w-1/3 bg-base-200/30 px-4 py-3 font-medium text-base-content/60">
								{SPEC_LABELS.SKU}
							</td>
							<td className="px-4 py-3 font-mono text-base-content">
								{product.sku ?? PRODUCT_STATUS.SKU_NA}
							</td>
						</tr>
						{product.manufacturer && (
							<tr className="divide-x divide-base-200 transition-colors hover:bg-base-50">
								<td className="w-1/3 bg-base-200/30 px-4 py-3 font-medium text-base-content/60">
									{SPEC_LABELS.MANUFACTURER}
								</td>
								<td className="px-4 py-3 text-base-content">{product.manufacturer}</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

