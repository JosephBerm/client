/**
 * BusinessTypeBadge Component
 * 
 * Displays the type of business for a customer organization.
 * Uses emoji icons for quick visual identification.
 * 
 * @module customers/components
 */

'use client'

import { TypeOfBusiness } from '@_classes/Enums'

import { getBusinessTypeConfig } from '../constants'

interface BusinessTypeBadgeProps {
	/** Business type value */
	type: TypeOfBusiness
	/** Show icon only */
	iconOnly?: boolean
	/** Display size */
	size?: 'sm' | 'md' | 'lg'
	/** Additional CSS classes */
	className?: string
}

/**
 * Size classes for badges.
 */
const SIZE_CLASSES = {
	sm: 'badge-sm text-xs gap-1',
	md: 'badge-md text-sm gap-1.5',
	lg: 'badge-lg text-base gap-2',
}

/**
 * BusinessTypeBadge Component
 * 
 * Renders a badge displaying the customer's business type.
 * Uses emoji icons for visual distinction between business categories.
 */
function BusinessTypeBadge({
	type,
	iconOnly = false,
	size = 'md',
	className = '',
}: BusinessTypeBadgeProps) {
	const config = getBusinessTypeConfig(type)
	const sizeClass = SIZE_CLASSES[size]

	return (
		<span
			className={`badge badge-outline badge-primary ${sizeClass} ${className}`}
			title={config.description}
		>
			<span aria-hidden="true">{config.icon}</span>
			{!iconOnly && <span>{config.label}</span>}
		</span>
	)
}

export default BusinessTypeBadge

