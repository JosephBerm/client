/**
 * TipItem Component
 *
 * Displays a tip with an icon instead of a bullet point.
 * Used for tips, recommendations, and informational lists.
 *
 * **Features:**
 * - Icon prefix (Lucide icons)
 * - Subtle styling
 * - Theme-aware colors
 * - Consistent spacing
 *
 * **Use Cases:**
 * - Profile tips
 * - Security recommendations
 * - Feature explanations
 * - Help text lists
 *
 * @example
 * ```tsx
 * import TipItem from '@_components/ui/TipItem';
 * import { Bell, Lock, Phone } from 'lucide-react';
 *
 * <TipItem icon={<Bell />} text="Keep your contact info up to date for notifications" />
 * <TipItem icon={<Lock />} text="Your username cannot be changed after registration" />
 * <TipItem icon={<Phone />} text="Add a phone number for SMS updates" />
 * ```
 *
 * @module TipItem
 */

import type { ReactNode } from 'react'

import classNames from 'classnames'

// ============================================================================
// TYPES
// ============================================================================

export interface TipItemProps {
	/** Icon element (e.g., Lucide icon) */
	icon: ReactNode
	/** Tip text content */
	text: string
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TipItem Component
 *
 * Renders a tip with an icon prefix.
 * Icons are styled with primary color for visual consistency.
 */
export default function TipItem({
	icon,
	text,
	className,
}: TipItemProps) {
	return (
		<div
			className={classNames(
				'flex items-start gap-3',
				className
			)}
		>
			{/* Icon */}
			<div className="mt-0.5 shrink-0 text-primary [&>svg]:h-4 [&>svg]:w-4">
				{icon}
			</div>

			{/* Text */}
			<p className="text-sm text-base-content/70 leading-relaxed">
				{text}
			</p>
		</div>
	)
}
