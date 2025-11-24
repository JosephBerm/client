/**
 * NavigationIcon Component
 * 
 * Renders navigation icons using Lucide React components.
 * Maintains DRY principles by using centralized icon mapping.
 * Memoized to prevent unnecessary re-renders.
 * 
 * **Features:**
 * - Centralized icon management
 * - Type-safe icon selection
 * - Performance optimized (memoized)
 * - Consistent styling
 * 
 * @module NavigationIcon
 */

import { memo } from 'react'

import { logger } from '@_core'

import type { NavigationIconType } from '@_types/navigation'

import { getIconComponent } from '@_helpers/icon-mapping'

interface NavigationIconProps {
	/** Icon identifier from NavigationIconType */
	icon: NavigationIconType
	/** Optional CSS classes */
	className?: string
	/** Icon size in pixels */
	size?: number
}

/**
 * NavigationIcon Component
 * 
 * Renders a Lucide icon component based on the provided icon identifier.
 * Uses centralized icon mapping for consistency and maintainability.
 * 
 * @component
 * @param props - Component props
 * @returns Icon component
 * 
 * @example
 * ```tsx
 * <NavigationIcon icon="dashboard" size={24} className="text-blue-500" />
 * <NavigationIcon icon="settings" size={20} />
 * ```
 */
const NavigationIcon = memo(function NavigationIcon({
	icon,
	className = '',
	size = 24,
}: NavigationIconProps) {
	const IconComponent = getIconComponent(icon)

	if (!IconComponent) {
		logger.warn('Icon not found', {
			icon,
			component: 'NavigationIcon',
		})
		return null
	}

	return <IconComponent size={size} className={className} />
})

export default NavigationIcon

