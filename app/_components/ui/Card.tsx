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

import { HTMLAttributes, ReactNode } from 'react'
import classNames from 'classnames'

type CardVariant = 'elevated' | 'soft' | 'outline' | 'ghost'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
	title?: string
	subtitle?: string
	actions?: ReactNode
	image?: string
	imageAlt?: string
	bodyClassName?: string
	compact?: boolean
	variant?: CardVariant
	hover?: boolean
}

const variantClasses: Record<CardVariant, string> = {
	elevated:
		'bg-white border border-brand-1/10 shadow-[0_22px_40px_rgba(41,66,4,0.16)]',
	soft: 'bg-[var(--soft-brand-color)] border border-brand-1/10 shadow-[0_18px_32px_rgba(65,103,6,0.12)]',
	outline: 'bg-white border border-dashed border-brand-1/20',
	ghost: 'bg-transparent border border-brand-1/15',
}

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
	variant = 'elevated',
	hover = true,
	...props
}: CardProps) {
	const bodyPadding = compact ? 'p-6' : 'p-8'

	return (
		<div
			className={classNames(
				'relative flex flex-col overflow-hidden rounded-[32px] transition duration-200',
				variantClasses[variant],
				{
					'hover:-translate-y-1 hover:shadow-[0_28px_48px_rgba(41,66,4,0.2)]': hover && variant === 'elevated',
					'hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(41,66,4,0.18)]': hover && variant === 'soft',
					'hover:-translate-y-1 hover:border-brand-1/25': hover && variant === 'outline',
				},
				className
			)}
			{...props}
		>
			{image && (
				<figure className="relative h-48 w-full overflow-hidden">
					<img src={image} alt={imageAlt || ''} className="h-full w-full object-cover" />
				</figure>
			)}

			<div className={classNames('flex flex-col gap-4', bodyPadding, bodyClassName)}>
				{(title || subtitle) && (
					<header className="space-y-2">
						{title && <h2 className="text-xl font-semibold text-brand-4">{title}</h2>}
						{subtitle && <p className="text-sm uppercase tracking-[0.3em] text-brand-3">{subtitle}</p>}
					</header>
				)}

				{children}

				{actions && <div className="mt-4 flex flex-wrap items-center justify-end gap-3">{actions}</div>}
			</div>
		</div>
	)
}


