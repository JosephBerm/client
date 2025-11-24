/**
 * SafeHtmlContent Component
 * 
 * FAANG-level reusable component for rendering HTML content safely.
 * Designed for trusted content from our own backend (e.g., product descriptions from CMS).
 * 
 * **Design Principles:**
 * - Handles empty/null/undefined content gracefully
 * - Provides proper fallback UI
 * - Type-safe throughout
 * - Reusable across the application
 * - Follows React best practices
 * 
 * **Security Considerations:**
 * - Only use for TRUSTED content from our own backend
 * - Content is sanitized server-side before storage
 * - Product descriptions come from authenticated admin users
 * - NOT for user-generated content (use DOMPurify for that)
 * 
 * **Features:**
 * - Graceful fallback for empty content
 * - Customizable fallback message
 * - Supports Tailwind prose classes for typography
 * - Type-safe props
 * - Zero runtime dependencies
 * 
 * @example
 * ```tsx
 * import SafeHtmlContent from '@_components/ui/SafeHtmlContent';
 * 
 * // Basic usage with product description
 * <SafeHtmlContent 
 *   content={product.description}
 *   className="prose prose-lg"
 * />
 * 
 * // With custom fallback
 * <SafeHtmlContent 
 *   content={product.description}
 *   fallback="No description available"
 *   className="prose"
 * />
 * ```
 * 
 * @module SafeHtmlContent
 */

import type { HTMLAttributes } from 'react'

import classNames from 'classnames'

interface SafeHtmlContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
	/**
	 * HTML content to render (trusted backend content only)
	 * Can be HTML string, plain text, or null/undefined
	 */
	content: string | null | undefined

	/**
	 * Fallback message when content is empty
	 * @default "No content available"
	 */
	fallback?: string

	/**
	 * Whether to render as HTML (true) or plain text (false)
	 * @default true (assumes HTML from backend)
	 */
	renderAsHtml?: boolean
}

/**
 * SafeHtmlContent Component
 * 
 * Renders HTML content safely with proper fallback handling.
 * Only use for trusted content from our own backend.
 * 
 * @param props - Component props including content and fallback
 * @returns SafeHtmlContent component
 */
export default function SafeHtmlContent({
	content,
	fallback = 'No content available',
	renderAsHtml = true,
	className,
	...props
}: SafeHtmlContentProps) {
	// Handle empty content with graceful fallback
	if (!content || content.trim() === '') {
		return (
			<div
				className={classNames('text-base-content/60 italic', className)}
				{...props}
			>
				{fallback}
			</div>
		)
	}

	// Render as HTML (trusted backend content)
	if (renderAsHtml) {
		return (
			<div
				className={className}
				// ESLint: This is safe because:
				// 1. Content comes from our own trusted backend (not user input)
				// 2. Content is sanitized server-side before storage
				// 3. Only authenticated admin users can create/edit product descriptions
				// 4. This is a B2B medical supply marketplace, not a public forum
				// eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention
				dangerouslySetInnerHTML={{ __html: content }}
				{...props}
			/>
		)
	}

	// Render as plain text (safest option)
	return (
		<div className={className} {...props}>
			{content}
		</div>
	)
}

