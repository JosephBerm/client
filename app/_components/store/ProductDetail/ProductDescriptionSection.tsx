/**
 * Product Description Section Component
 * 
 * Displays the product description with enhanced typography.
 * Server component - no client-side interactivity needed.
 * 
 * @module ProductDetail/ProductDescriptionSection
 */

import SafeHtmlContent from '@_components/ui/SafeHtmlContent'

import {
	ANIMATION_DELAYS,
	FALLBACK_MESSAGES,
	SECTION_LABELS,
} from './ProductDetail.constants'

export interface ProductDescriptionSectionProps {
	/** Product description HTML content */
	description: string | null | undefined
}

/**
 * Product Description Section
 * 
 * Renders the product description with prose styling and animations.
 */
export default function ProductDescriptionSection({
	description,
}: ProductDescriptionSectionProps) {
	return (
		<div
			className="animate-elegant-reveal space-y-8"
			style={{ animationDelay: ANIMATION_DELAYS.DESCRIPTION }}
		>
			<div className="flex items-center gap-4 border-b border-base-200 pb-4">
				<h2 className="text-2xl font-semibold tracking-tight text-base-content">
					{SECTION_LABELS.ABOUT_ITEM}
				</h2>
			</div>
			<SafeHtmlContent
				content={description}
				fallback={FALLBACK_MESSAGES.NO_DESCRIPTION}
				renderAsHtml={true}
				className="prose prose-lg prose-zinc max-w-none text-base-content/80 prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline pl-1"
			/>
		</div>
	)
}

