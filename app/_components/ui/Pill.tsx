/**
 * Pill UI Component
 *
 * Lightweight label badge built on MedSource brand tokens.
 * Ideal for inline status chips, feature tags, or metrics callouts.
 */

import { ReactNode } from 'react'
import classNames from 'classnames'

type PillTone = 'brand' | 'success' | 'warning' | 'info' | 'neutral'

interface PillProps {
	children: ReactNode
	tone?: PillTone
	icon?: ReactNode
	className?: string
}

const toneClasses: Record<PillTone, string> = {
	brand: 'bg-brand-4/10 text-brand-4',
	success: 'bg-brand-2/10 text-brand-3',
	warning: 'bg-[var(--highlight)]/20 text-brand-4',
	info: 'bg-[var(--link-color)]/15 text-[var(--link-color)]',
	neutral: 'bg-[var(--light-gray)]/40 text-brand-4',
}

export default function Pill({ children, tone = 'brand', icon, className }: PillProps) {
	return (
		<span
			className={classNames(
				'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em]',
				'transition-colors duration-150',
				toneClasses[tone],
				className
			)}
		>
			{icon && <span className="flex items-center text-current">{icon}</span>}
			<span className="text-current">{children}</span>
		</span>
	)
}

