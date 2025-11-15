/**
 * Contact Icons Component
 * 
 * Memoized icon components for contact section to optimize performance.
 * Reduces hydration cost by preventing unnecessary re-renders of icon components.
 * 
 * **Performance Benefits:**
 * - Memoized to prevent re-renders
 * - Tree-shakeable (only import what you need)
 * - Optimized for repeated use in lists
 * - Consistent sizing and styling
 * 
 * **FAANG Principles:**
 * - Performance optimization (React.memo)
 * - DRY principle (centralized icon configuration)
 * - Type safety
 * - Accessibility (proper ARIA attributes)
 * 
 * @module components/ui/ContactIcons
 */

import { memo } from 'react'
import {
	Phone,
	Mail,
	MessageCircle,
	Calendar,
	Clock,
	CheckCircle2,
	MapPin,
	Globe,
	type LucideProps,
} from 'lucide-react'

/**
 * Base icon props with optional className override
 */
interface IconProps extends Partial<LucideProps> {
	className?: string
	'aria-hidden'?: boolean | 'true' | 'false'
}

/**
 * Default icon configuration for consistent styling
 */
const defaultIconProps: Partial<LucideProps> = {
	strokeWidth: 1.5,
	'aria-hidden': 'true' as const,
}

/**
 * Phone icon - memoized for performance
 * Used for phone number links and call-to-action buttons
 */
export const PhoneIcon = memo<IconProps>(({ className, ...props }: IconProps) => (
	<Phone {...defaultIconProps} {...props} className={className} />
))
PhoneIcon.displayName = 'PhoneIcon'

/**
 * Mail icon - memoized for performance
 * Used for email links and contact forms
 */
export const MailIcon = memo<IconProps>(({ className, ...props }: IconProps) => (
	<Mail {...defaultIconProps} {...props} className={className} />
))
MailIcon.displayName = 'MailIcon'

/**
 * Message icon - memoized for performance
 * Used for contact forms and messaging CTAs
 */
export const MessageIcon = memo<IconProps>(({ className, ...props }: IconProps) => (
	<MessageCircle {...defaultIconProps} {...props} className={className} />
))
MessageIcon.displayName = 'MessageIcon'

/**
 * Calendar icon - memoized for performance
 * Used for scheduling and business hours
 */
export const CalendarIcon = memo<IconProps>(({ className, ...props }: IconProps) => (
	<Calendar {...defaultIconProps} {...props} className={className} />
))
CalendarIcon.displayName = 'CalendarIcon'

/**
 * Clock icon - memoized for performance
 * Used for response times and business hours
 */
export const ClockIcon = memo<IconProps>(({ className, ...props }: IconProps) => (
	<Clock {...defaultIconProps} {...props} className={className} />
))
ClockIcon.displayName = 'ClockIcon'

/**
 * CheckCircle icon - memoized for performance
 * Used for trust signals and feature lists
 */
export const CheckIcon = memo<IconProps>(({ className, ...props }: IconProps) => (
	<CheckCircle2 {...defaultIconProps} {...props} className={className} />
))
CheckIcon.displayName = 'CheckIcon'

/**
 * MapPin icon - memoized for performance
 * Used for location and address information
 */
export const LocationIcon = memo<IconProps>(({ className, ...props }: IconProps) => (
	<MapPin {...defaultIconProps} {...props} className={className} />
))
LocationIcon.displayName = 'LocationIcon'

/**
 * Globe icon - memoized for performance
 * Used for timezone and international indicators
 */
export const GlobeIcon = memo<IconProps>(({ className, ...props }: IconProps) => (
	<Globe {...defaultIconProps} {...props} className={className} />
))
GlobeIcon.displayName = 'GlobeIcon'

/**
 * Icon size classes for consistent sizing
 */
export const iconSizes = {
	xs: 'h-4 w-4',
	sm: 'h-5 w-5',
	md: 'h-6 w-6',
	lg: 'h-7 w-7',
	xl: 'h-8 w-8',
} as const

/**
 * Helper function to get icon with size
 * 
 * @example
 * ```typescript
 * <PhoneIcon className={iconSizes.md} />
 * ```
 */
export function getIconSize(size: keyof typeof iconSizes = 'md'): string {
	return iconSizes[size]
}

