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
	brand: 'bg-primary/10 text-primary',
	success: 'bg-success/10 text-success',
	warning: 'bg-warning/20 text-warning',
	info: 'bg-info/15 text-info',
	neutral: 'bg-base-300/40 text-base-content',
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

