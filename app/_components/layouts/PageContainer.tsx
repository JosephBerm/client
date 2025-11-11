import type { ReactNode } from 'react'
import classNames from 'classnames'

interface PageContainerProps {
	children: ReactNode
	className?: string
}

/**
 * Simple page container without header
 * Useful for custom layouts or landing pages
 */
export default function PageContainer({ children, className }: PageContainerProps) {
	return (
		<div className={classNames('container mx-auto p-4 md:p-8', className)}>
			{children}
		</div>
	)
}


