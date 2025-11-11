import { ReactNode } from 'react'
import classNames from 'classnames'

interface CardProps {
	children: ReactNode
	title?: string
	subtitle?: string
	actions?: ReactNode
	image?: string
	imageAlt?: string
	className?: string
	bodyClassName?: string
	compact?: boolean
	bordered?: boolean
	shadow?: boolean
}

/**
 * Card component for content containers
 * DaisyUI-styled with optional image, title, and actions
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
				'card bg-base-100',
				{
					'card-compact': compact,
					'card-bordered': bordered,
					'shadow-xl': shadow,
				},
				className
			)}
		>
			{image && (
				<figure>
					<img src={image} alt={imageAlt || ''} />
				</figure>
			)}

			<div className={classNames('card-body', bodyClassName)}>
				{(title || subtitle) && (
					<div>
						{title && <h2 className="card-title">{title}</h2>}
						{subtitle && <p className="text-sm text-base-content/70">{subtitle}</p>}
					</div>
				)}

				{children}

				{actions && <div className="card-actions justify-end mt-4">{actions}</div>}
			</div>
		</div>
	)
}


