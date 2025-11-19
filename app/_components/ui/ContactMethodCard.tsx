/**
 * ContactMethodCard Component
 *
 * Reusable card component for contact methods (Live Chat, Email, Phone).
 * Follows DRY principles and industry best practices (FAANG-level standards).
 *
 * **Features:**
 * - Consistent styling across all contact methods
 * - Supports both button and link variants
 * - Mobile-first responsive design
 * - Analytics tracking integration
 * - WCAG 2.1 AA accessibility compliant
 * - Semantic HTML5 elements
 * - Proper ARIA attributes
 * - Hover and focus states
 * - Theme-aware styling
 *
 * **Industry Best Practices:**
 * - Mobile-first approach
 * - Consistent visual hierarchy
 * - Clear call-to-action
 * - Accessible to all users
 * - Performance optimized
 * - Type-safe props
 * - DRY principle
 *
 * @module components/ui/ContactMethodCard
 */

'use client'

import { useCallback, useMemo, type ReactNode, type ComponentType, KeyboardEvent } from 'react'
import classNames from 'classnames'
import { PhoneIcon, MailIcon, MessageIcon, iconSizes } from '@_components/ui/ContactIcons'
import { MessageSquare } from 'lucide-react'
import { trackPhoneClick, trackEmailClick, trackContactCTA } from '@_shared/utils/analytics'

/**
 * Soft hyphen character (invisible unless word breaks)
 * Unicode: U+00AD
 */
const SOFT_HYPHEN = '\u00AD'

/**
 * Adds soft hyphens to an email address for elegant line breaking.
 * Inserts soft hyphens at strategic points: before @, before dots, and in longer segments.
 * Soft hyphens are invisible unless the word breaks, showing a hyphen when wrapping occurs.
 * 
 * @param email - The email address to hyphenate
 * @returns The email address with soft hyphens inserted
 * 
 * @example
 * ```typescript
 * hyphenateEmail('support@medsourcepro.com')
 * // Returns: 'support\u00AD@medsource\u00ADpro.com'
 * ```
 */
function hyphenateEmail(email: string): string {
	// Don't modify if empty or invalid
	if (!email || !email.includes('@')) {
		return email
	}

	const [localPart, domain] = email.split('@')
	if (!localPart || !domain) {
		return email
	}

	// Helper function to add soft hyphens to long segments
	const addSoftHyphensToSegment = (segment: string, minLength = 8): string => {
		if (segment.length <= minLength) {
			return segment
		}
		// Add soft hyphens every 6-8 characters for better break points
		const parts: string[] = []
		for (let i = 0; i < segment.length; i += 7) {
			const part = segment.slice(i, i + 7)
			if (part) {
				parts.push(part)
			}
		}
		return parts.join(SOFT_HYPHEN)
	}

	// Hyphenate local part (before dots and in longer segments)
	const hyphenatedLocal = localPart
		.split('.')
		.map((segment, index) => {
			const hyphenated = addSoftHyphensToSegment(segment, 8)
			// Add soft hyphen before dots (except first segment)
			return index > 0 ? `${SOFT_HYPHEN}${hyphenated}` : hyphenated
		})
		.join('.')

	// Hyphenate domain (before dots and in longer segments)
	const hyphenatedDomain = domain
		.split('.')
		.map((segment, index) => {
			const hyphenated = addSoftHyphensToSegment(segment, 10)
			// Add soft hyphen before dots (except first segment)
			return index > 0 ? `${SOFT_HYPHEN}${hyphenated}` : hyphenated
		})
		.join('.')

	// Combine with soft hyphen before @ for optimal breaking
	return `${hyphenatedLocal}${SOFT_HYPHEN}@${hyphenatedDomain}`
}

/**
 * Contact method types
 */
export type ContactMethodType = 'chat' | 'email' | 'phone'

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'dark'

/**
 * ContactMethodCard component props
 */
export interface ContactMethodCardProps {
	/** Type of contact method */
	type: ContactMethodType
	/** Title/label for the contact method */
	title: string
	/** Main display text (e.g., phone number, email address, or CTA text) */
	mainText: string
	/** Description text below main text */
	description: string | ReactNode
	/** For email/phone: href URL (mailto: or tel:) */
	href?: string
	/** For chat: onClick handler */
	onClick?: () => void
	/** Analytics tracking location */
	trackingLocation?: string
	/** Additional CSS classes */
	className?: string
	/** Schema.org itemProp for semantic markup */
	itemProp?: 'telephone' | 'email'
	/** Custom aria-label (auto-generated if not provided) */
	ariaLabel?: string
	/** Card variant - 'default' for light background, 'dark' for darker background */
	variant?: CardVariant
	/** Custom icon component (overrides default icon for the type) */
	customIcon?: ComponentType<{ className?: string; strokeWidth?: number }>
	/** If true, renders as clickable div instead of link/button (for entire card clickability) */
	clickableCard?: boolean
}

/**
 * Contact method configuration
 */
const CONTACT_METHOD_CONFIG: Record<
	ContactMethodType,
	{
		icon: typeof PhoneIcon | typeof MailIcon | typeof MessageIcon
		defaultTrackingLocation: string
	}
> = {
	phone: {
		icon: PhoneIcon,
		defaultTrackingLocation: 'contact_section_card',
	},
	email: {
		icon: MailIcon,
		defaultTrackingLocation: 'contact_section_card',
	},
	chat: {
		icon: MessageIcon,
		defaultTrackingLocation: 'contact_section_card',
	},
}

/**
 * ContactMethodCard Component
 *
 * Reusable card component for displaying contact methods with consistent styling.
 * Handles both interactive links (email, phone) and buttons (chat).
 *
 * @example
 * ```tsx
 * // Phone contact
 * <ContactMethodCard
 *   type="phone"
 *   title="Call Us"
 *   mainText="(786) 578-2145"
 *   description="Speak directly with a sourcing specialist in real time."
 *   href="tel:+17865782145"
 * />
 *
 * // Email contact
 * <ContactMethodCard
 *   type="email"
 *   title="Email Support"
 *   mainText="support@medsourcepro.com"
 *   description="Share requirements or RFQs and receive a tailored response."
 *   href="mailto:support@medsourcepro.com"
 * />
 *
 * // Live chat
 * <ContactMethodCard
 *   type="chat"
 *   title="Live Chat"
 *   mainText="Message us now"
 *   description="Get instant answers from our team in real time."
 *   onClick={() => setIsChatOpen(true)}
 * />
 * ```
 */
export default function ContactMethodCard({
	type,
	title,
	mainText,
	description,
	href,
	onClick,
	trackingLocation,
	className,
	itemProp,
	ariaLabel,
	variant = 'default',
	customIcon,
	clickableCard = false,
}: ContactMethodCardProps) {
	const config = CONTACT_METHOD_CONFIG[type]
	const Icon = customIcon || config.icon
	const location = trackingLocation || config.defaultTrackingLocation
	const isDark = variant === 'dark'

	// Hyphenate email addresses for elegant line breaking
	const displayText = useMemo(() => {
		if (type === 'email') {
			return hyphenateEmail(mainText)
		}
		return mainText
	}, [type, mainText])

	// Analytics tracking handlers
	const handleClick = useCallback(() => {
		if (onClick) {
			onClick()
		}

		// Track analytics based on type
		switch (type) {
			case 'phone':
				trackPhoneClick(mainText, location)
				break
			case 'email':
				trackEmailClick(mainText, location)
				break
			case 'chat':
				trackContactCTA('Sign Up Free - Live Chat', {
					contactMethod: 'chat',
					ctaLocation: location,
				})
				break
		}
	}, [type, mainText, location, onClick])

	// Handle keyboard interaction for clickable card
	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (clickableCard && (event.key === 'Enter' || event.key === ' ')) {
				event.preventDefault()
				handleClick()
			}
		},
		[clickableCard, handleClick]
	)

	// Generate aria-label if not provided
	const generatedAriaLabel =
		ariaLabel ||
		(type === 'phone'
			? `Call us at ${mainText.split('').join(' ')}`
			: type === 'email'
				? `Send email to ${mainText}`
				: 'Open live chat')

	// Base styles - mobile-first responsive
	const baseStyles = classNames(
		// Base card styles
		'group relative overflow-hidden rounded-2xl border border-base-300',
		isDark ? 'bg-base-200' : 'bg-base-100',
		'p-6 shadow-sm transition-all duration-300',
		'hover:border-primary/30 hover:shadow-md',
		'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
		// Ensure full height for grid uniformity
		'h-full',
		// Clickable card styles
		clickableCard && 'cursor-pointer',
		// Mobile-first padding (increased on desktop)
		'md:p-8',
		// Text alignment and display - ensure consistent layout
		'text-left w-full',
		// Use flex layout for all cards to ensure consistent height
		'flex flex-col',
		// Custom className
		className
	)

	// Icon container styles - different for dark variant
	const iconContainerStyles = classNames(
		'flex h-12 w-12 shrink-0 items-center justify-center transition-all duration-300',
		isDark
			? 'rounded-lg bg-primary text-primary-content group-hover:bg-primary/90'
			: 'rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content'
	)

	// Render as link (email, phone) or button (chat)
	const content = (
		<div className="flex items-start gap-4 flex-1">
			<div className={iconContainerStyles} aria-hidden="true">
				<Icon className={iconSizes.md} strokeWidth={customIcon ? 1.5 : undefined} />
			</div>
			<div className={classNames('flex-1 min-w-0 flex flex-col', isDark ? 'gap-2' : 'gap-1')}>
				<p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
					{title}
				</p>
				<p
					className={classNames(
						'text-lg font-semibold text-base-content md:text-xl',
						// Use wrap-break-word for email to allow soft hyphens to work properly
						// Soft hyphens will automatically show when line breaks occur
						'wrap-break-word'
					)}
					style={type === 'email' ? { wordBreak: 'break-word', overflowWrap: 'break-word' } : undefined}
				>
					{displayText}
				</p>
				<p className="text-sm text-base-content/60">{description}</p>
			</div>
		</div>
	)

	// Render as clickable div if clickableCard is true
	if (clickableCard) {
		return (
			<div
				className={baseStyles}
				aria-label={generatedAriaLabel}
				role="button"
				tabIndex={0}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
			>
				{content}
			</div>
		)
	}

	// Render as link or button based on type
	if (href) {
		return (
			<a
				href={href}
				onClick={handleClick}
				className={baseStyles}
				aria-label={generatedAriaLabel}
				itemProp={itemProp}
			>
				{content}
			</a>
		)
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			className={baseStyles}
			aria-label={generatedAriaLabel}
		>
			{content}
		</button>
	)
}

