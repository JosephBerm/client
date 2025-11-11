import type { ReactNode } from 'react'
import classNames from 'classnames'

interface PageLayoutProps {
	children: ReactNode
	title?: string
	description?: string
	actions?: ReactNode
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
	className?: string
}

/**
 * Server Component page layout wrapper
 * Provides consistent container width and optional page header
 */
export default function PageLayout({
	children,
	title,
	description,
	actions,
	maxWidth = '2xl',
	className,
}: PageLayoutProps) {
	const maxWidthClass = {
		sm: 'max-w-screen-sm',
		md: 'max-w-screen-md',
		lg: 'max-w-screen-lg',
		xl: 'max-w-screen-xl',
		'2xl': 'max-w-screen-2xl',
		full: 'max-w-full',
	}[maxWidth]

	return (
		<div className={classNames('container mx-auto p-4 md:p-8', maxWidthClass, className)}>
			{/* Page Header */}
			{(title || description || actions) && (
				<div className="mb-6 md:mb-8">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							{title && (
								<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
									{title}
								</h1>
							)}
							{description && (
								<p className="text-sm md:text-base text-base-content/70">
									{description}
								</p>
							)}
						</div>
						{actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
					</div>
				</div>
			)}

			{/* Page Content */}
			{children}
		</div>
	)
}


