/**
 * Tooltip UI Component
 *
 * Simple tooltip component using native HTML title attribute for accessibility.
 * For basic tooltip needs without heavy dependencies.
 *
 * **Features:**
 * - Accessible via native title attribute
 * - Lightweight (no external dependencies)
 * - Works with any child element
 *
 * @example
 * ```tsx
 * import { Tooltip } from '@_components/ui/Tooltip';
 *
 * <Tooltip content="This is helpful text">
 *   <button>Hover me</button>
 * </Tooltip>
 * ```
 *
 * @module Tooltip
 */

import type { ReactNode } from 'react'

interface TooltipProps {
	/** Tooltip content to display */
	content: string
	/** Element to wrap with tooltip */
	children: ReactNode
}

/**
 * Lightweight tooltip using DaisyUI's tooltip classes.
 */
export function Tooltip({ content, children }: TooltipProps) {
	return (
		<div className="tooltip" data-tip={content}>
			{children}
		</div>
	)
}

export default Tooltip
