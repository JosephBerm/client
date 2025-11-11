import { ReactNode } from 'react'
import classNames from 'classnames'

interface BadgeProps {
	children: ReactNode
	variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
	size?: 'xs' | 'sm' | 'md' | 'lg'
	outline?: boolean
	className?: string
}

/**
 * Badge component for status indicators, labels, counts, etc.
 */
export default function Badge({
	children,
	variant = 'neutral',
	size = 'md',
	outline = false,
	className,
}: BadgeProps) {
	return (
		<span
			className={classNames(
				'badge',
				`badge-${variant}`,
				`badge-${size}`,
				{
					'badge-outline': outline,
				},
				className
			)}
		>
			{children}
		</span>
	)
}


