/**
 * ImagePlaceholder UI Component - Industry Best Practice
 * 
 * Reusable placeholder component for missing images.
 * Provides consistent fallback UI across the application.
 * 
 * **Features:**
 * - Multiple variants (product, generic, icon-based)
 * - Theme-aware styling
 * - Accessible (proper ARIA attributes)
 * - Smooth transitions
 * - Customizable content
 * 
 * **Variants:**
 * - **product**: Product-specific placeholder (Package icon)
 * - **generic**: Generic placeholder (Image icon)
 * - **icon**: Icon-only placeholder (customizable)
 * 
 * **Use Cases:**
 * - Missing product images
 * - Loading states
 * - Error fallbacks
 * - Empty states
 * 
 * @example
 * ```tsx
 * import ImagePlaceholder from '@_components/ui/ImagePlaceholder';
 * 
 * // Product placeholder
 * <ImagePlaceholder variant="product" alt="Product image" />
 * 
 * // Generic placeholder
 * <ImagePlaceholder variant="generic" alt="Image" />
 * 
 * // Custom icon
 * <ImagePlaceholder variant="icon" icon={<CustomIcon />} alt="Custom" />
 * ```
 * 
 * @module ImagePlaceholder
 */

import { ReactNode } from 'react'
import classNames from 'classnames'
import { Package, Image as ImageIcon } from 'lucide-react'

/**
 * ImagePlaceholder component props interface.
 */
export interface ImagePlaceholderProps {
	/** 
	 * Placeholder variant.
	 * @default 'product'
	 */
	variant?: 'product' | 'generic' | 'icon'
	
	/** 
	 * Accessibility label.
	 * Required for screen readers.
	 */
	alt: string
	
	/** 
	 * Custom icon (only used with variant="icon").
	 */
	icon?: ReactNode
	
	/** 
	 * Icon size.
	 * @default 'md'
	 */
	iconSize?: 'sm' | 'md' | 'lg' | 'xl'
	
	/** 
	 * Additional CSS classes.
	 */
	className?: string
	
	/** 
	 * Aspect ratio.
	 * @default 'aspect-square'
	 */
	aspectRatio?: 'aspect-square' | 'aspect-video' | 'aspect-auto'
	
	/** 
	 * Show text label.
	 * @default false
	 */
	showLabel?: boolean
	
	/** 
	 * Custom label text.
	 * Only shown if showLabel is true.
	 */
	label?: string
}

/**
 * Icon size configurations.
 */
const iconSizeClasses = {
	sm: 'h-8 w-8',
	md: 'h-12 w-12',
	lg: 'h-16 w-16',
	xl: 'h-20 w-20',
}

/**
 * ImagePlaceholder Component
 * 
 * Consistent placeholder component for missing images.
 * Follows accessibility best practices and theme conventions.
 * 
 * **Accessibility:**
 * - Proper ARIA roles and labels
 * - Screen reader support
 * - Semantic HTML
 * 
 * **Design:**
 * - Theme-aware colors
 * - Smooth transitions
 * - Consistent sizing
 * 
 * @param props - ImagePlaceholder configuration props
 * @returns ImagePlaceholder component
 */
export default function ImagePlaceholder({
	variant = 'product',
	alt,
	icon,
	iconSize = 'md',
	className,
	aspectRatio = 'aspect-square',
	showLabel = false,
	label,
}: ImagePlaceholderProps) {
	// Select icon based on variant
	const getIcon = () => {
		if (variant === 'icon' && icon) {
			return icon
		}
		if (variant === 'generic') {
			return <ImageIcon className={iconSizeClasses[iconSize]} strokeWidth={1.5} />
		}
		// Default: product variant
		return <Package className={iconSizeClasses[iconSize]} strokeWidth={1.5} />
	}

	return (
		<div
			className={classNames(
				'relative flex flex-col items-center justify-center bg-base-200 text-base-content/20',
				aspectRatio,
				className
			)}
			role="img"
			aria-label={alt}
		>
			{getIcon()}
			{showLabel && (
				<span className="mt-2 text-xs font-medium text-base-content/40">
					{label || alt}
				</span>
			)}
			<span className="sr-only">{alt || 'Image placeholder'}</span>
		</div>
	)
}

