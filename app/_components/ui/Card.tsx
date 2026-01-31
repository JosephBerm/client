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

import type { HTMLAttributes, ReactNode, JSX } from 'react'

import Image from 'next/image'

import classNames from 'classnames'

type CardVariant = 'elevated' | 'soft' | 'outline' | 'ghost' | 'stat' | 'data'

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
		'card bg-base-100 border border-base-300 shadow-[var(--shadow-card-elevated)]',
	soft: 'card bg-base-200 border border-base-300 shadow-[var(--shadow-card-rest)]',
	outline: 'card bg-base-100 border border-dashed border-base-300',
	ghost: 'card bg-transparent border border-base-300',
	// NEW: Stats cards for KPI displays (dashboard metrics)
	stat: 'card bg-base-100 border border-base-300 shadow-[var(--shadow-card-rest)]',
	// NEW: Data grid containers (tables, lists)
	data: 'card bg-base-100 border border-base-200 shadow-[var(--shadow-card-rest)]',
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
}: CardProps): JSX.Element {
	const bodyPadding = compact ? 'p-4' : 'p-6'

	// Stat cards use rounded-xl (12px) to differentiate from main content cards (rounded-2xl/16px)
	// Per 2025-2026 Dashboard Design Trends - Section 7.1
	const borderRadiusClass = variant === 'stat' ? 'rounded-xl' : 'rounded-2xl'

	return (
		<div
			className={classNames(
				'relative flex flex-col overflow-hidden transition duration-200',
				borderRadiusClass,
				variantClasses[variant],
				{
					'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:border-base-content/10':
						hover && variant === 'elevated',
					'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]':
						hover && (variant === 'soft' || variant === 'stat'),
					'hover:-translate-y-0.5 hover:border-base-content/20':
						hover && variant === 'outline',
					// data variant: no hover lift (static container)
				},
				className
			)}
			{...props}
		>
			{image && (
				<figure className="relative h-48 w-full overflow-hidden">
					<Image
						src={image}
						alt={imageAlt || ''}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						priority={false}
						loading="lazy"
					/>
				</figure>
			)}

			<div className={classNames('flex flex-col gap-4', bodyPadding, bodyClassName)}>
				{(title || subtitle) && (
					<header className="space-y-2">
					{title && <h2 className="text-xl font-semibold text-base-content">{title}</h2>}
					{subtitle && <p className="text-sm uppercase tracking-[0.3em] text-primary">{subtitle}</p>}
					</header>
				)}

				{children}

				{actions && <div className="mt-4 flex flex-wrap items-center justify-end gap-3">{actions}</div>}
			</div>
		</div>
	)
}


