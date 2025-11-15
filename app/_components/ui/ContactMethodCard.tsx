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

import { useCallback, type ReactNode } from 'react'
import classNames from 'classnames'
import { PhoneIcon, MailIcon, MessageIcon, iconSizes } from '@_components/ui/ContactIcons'
import { trackPhoneClick, trackEmailClick, trackContactCTA } from '@_shared/utils/analytics'

/**
 * Contact method types
 */
export type ContactMethodType = 'chat' | 'email' | 'phone'

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
}: ContactMethodCardProps) {
	const config = CONTACT_METHOD_CONFIG[type]
	const Icon = config.icon
	const location = trackingLocation || config.defaultTrackingLocation

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
				trackContactCTA('Live Chat', {
					contactMethod: 'chat',
					ctaLocation: location,
				})
				break
		}
	}, [type, mainText, location, onClick])

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
		'group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100',
		'p-6 shadow-sm transition-all duration-300',
		'hover:border-primary/30 hover:shadow-md',
		'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
		// Mobile-first padding (increased on desktop)
		'md:p-8',
		// Text alignment and display - ensure consistent layout
		'text-left w-full',
		// Reset button defaults to match anchor tag behavior
		'block',
		// Custom className
		className
	)

	// Icon container styles
	const iconContainerStyles = classNames(
		'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
		'bg-primary/10 text-primary transition-all duration-300',
		'group-hover:bg-primary group-hover:text-primary-content'
	)

	// Render as link (email, phone) or button (chat)
	const content = (
		<div className="flex items-start gap-4">
			<div className={iconContainerStyles} aria-hidden="true">
				<Icon className={iconSizes.md} />
			</div>
			<div className="flex-1 min-w-0 space-y-1">
				<p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
					{title}
				</p>
				<p
					className={classNames(
						'text-lg font-semibold text-base-content md:text-xl',
						// Break words for email, break-words for phone
						type === 'email' ? 'break-all' : 'break-words'
					)}
				>
					{mainText}
				</p>
				<p className="text-sm text-base-content/60">{description}</p>
			</div>
		</div>
	)

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

