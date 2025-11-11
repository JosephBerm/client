/**
 * Card UI Component
 * 
 * DaisyUI-styled card component for grouping related content into containers.
 * Provides optional image, title, subtitle, actions, and flexible styling options.
 * Commonly used for product displays, information panels, and dashboard widgets.
 * 
 * **Features:**
 * - Optional image with figure element
 * - Title and subtitle support
 * - Actions area (typically buttons)
 * - Compact mode for smaller cards
 * - Optional border and shadow
 * - Fully theme-aware (DaisyUI)
 * - Responsive by default
 * - Customizable class names for body and container
 * 
 * **Use Cases:**
 * - Product cards in catalog
 * - Information panels
 * - Dashboard statistic widgets
 * - User profile cards
 * - Content preview cards
 * 
 * @example
 * ```tsx
 * import Card from '@_components/ui/Card';
 * import Button from '@_components/ui/Button';
 * 
 * // Basic card with title and content
 * <Card title="User Profile" subtitle="Administrator">
 *   <p>Email: admin@example.com</p>
 *   <p>Phone: (555) 123-4567</p>
 * </Card>
 * 
 * // Product card with image and actions
 * <Card
 *   title="Surgical Mask"
 *   subtitle="$12.99"
 *   image="/products/mask.jpg"
 *   imageAlt="Disposable surgical mask"
 *   actions={
 *     <>
 *       <Button variant="ghost" size="sm">Details</Button>
 *       <Button variant="primary" size="sm">Add to Cart</Button>
 *     </>
 *   }
 *   shadow
 *   bordered
 * >
 *   <p>High-quality, 3-layer disposable masks. Box of 50.</p>
 * </Card>
 * 
 * // Compact dashboard widget
 * <Card
 *   title="Total Orders"
 *   compact
 *   shadow
 *   className="bg-primary text-primary-content"
 * >
 *   <div className="stat-value">248</div>
 *   <div className="stat-desc text-primary-content/70">+15% from last month</div>
 * </Card>
 * ```
 * 
 * @module Card
 */

import { ReactNode } from 'react'
import classNames from 'classnames'

/**
 * Card component props interface.
 */
interface CardProps {
	/** Card content (body) */
	children: ReactNode
	
	/** Optional title displayed in card header */
	title?: string
	
	/** Optional subtitle displayed below title */
	subtitle?: string
	
	/** Optional actions area (typically buttons), displayed at bottom */
	actions?: ReactNode
	
	/** Optional image URL to display at top of card */
	image?: string
	
	/** Alt text for image (accessibility) */
	imageAlt?: string
	
	/** Additional classes for card container */
	className?: string
	
	/** Additional classes for card body */
	bodyClassName?: string
	
	/** 
	 * Compact mode (smaller padding).
	 * @default false
	 */
	compact?: boolean
	
	/** 
	 * Show border around card.
	 * @default false
	 */
	bordered?: boolean
	
	/** 
	 * Show shadow beneath card.
	 * @default true
	 */
	shadow?: boolean
}

/**
 * Card Component
 * 
 * Container component for grouping content with optional image, header, and actions.
 * Uses DaisyUI card classes for consistent styling across themes.
 * 
 * **Structure:**
 * 1. Figure (optional) - image element
 * 2. Card body - main content area
 *    - Title and subtitle (optional)
 *    - Children content
 *    - Actions (optional)
 * 
 * **Styling:**
 * - DaisyUI card base class
 * - Optional compact mode (card-compact)
 * - Optional border (card-bordered)
 * - Optional shadow (shadow-xl)
 * - Custom classes can be added via className props
 * 
 * @param props - Card configuration props
 * @returns Card component
 */
export default function Card({
	children,
	title,
	subtitle,
	actions,
	image,
	imageAlt,
	className,
	bodyClassName,
	compact = false,
	bordered = false,
	shadow = true,
}: CardProps) {
	return (
		<div
			className={classNames(
				'card bg-base-100', // Base DaisyUI card with background
				{
					'card-compact': compact, // Smaller padding
					'card-bordered': bordered, // Border around card
					'shadow-xl': shadow, // Shadow beneath card
				},
				className // Additional custom classes
			)}
		>
			{/* Optional image at top of card */}
			{image && (
				<figure>
					<img src={image} alt={imageAlt || ''} />
				</figure>
			)}

			{/* Card body (main content area) */}
			<div className={classNames('card-body', bodyClassName)}>
				{/* Title and subtitle section */}
				{(title || subtitle) && (
					<div>
						{title && <h2 className="card-title">{title}</h2>}
						{subtitle && <p className="text-sm text-base-content/70">{subtitle}</p>}
					</div>
				)}

				{/* Main content (children) */}
				{children}

				{/* Actions area (typically buttons) */}
				{actions && <div className="card-actions justify-end mt-4">{actions}</div>}
			</div>
		</div>
	)
}


