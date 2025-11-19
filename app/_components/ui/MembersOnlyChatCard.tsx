/**
 * MembersOnlyChatCard Component
 *
 * Specialized card component for displaying "Members Only" live chat access.
 * Encourages users to sign up for a free account to access live chat support.
 * Follows DRY principles and industry best practices (FAANG-level standards).
 *
 * **Features:**
 * - Clear "Members Only" messaging
 * - Prominent "Sign Up Free" CTA button
 * - Consistent styling with other contact method cards
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
 * @module components/ui/MembersOnlyChatCard
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, ArrowRight } from 'lucide-react'
import classNames from 'classnames'
import Button from '@_components/ui/Button'
import { trackContactCTA } from '@_shared/utils/analytics'
import { Routes } from '@_features/navigation'

/**
 * MembersOnlyChatCard component props
 */
export interface MembersOnlyChatCardProps {
	/** Analytics tracking location */
	trackingLocation?: string
	/** Additional CSS classes */
	className?: string
	/** Custom aria-label (auto-generated if not provided) */
	ariaLabel?: string
}

/**
 * MembersOnlyChatCard Component
 *
 * Card component for displaying "Members Only" live chat access with sign-up CTA.
 * Encourages users to create a free account to access live chat support.
 *
 * @example
 * ```tsx
 * <MembersOnlyChatCard trackingLocation="contact_page_card" />
 * ```
 */
export default function MembersOnlyChatCard({
	trackingLocation = 'contact_section_card',
	className,
	ariaLabel,
}: MembersOnlyChatCardProps) {
	const router = useRouter()

	// Analytics tracking handler
	const handleSignUpClick = useCallback(() => {
		trackContactCTA('Sign Up Free - Live Chat', {
			contactMethod: 'chat',
			ctaLocation: trackingLocation,
		})
		router.push(Routes.openLoginModal())
	}, [trackingLocation, router])

	// Generate aria-label if not provided
	const generatedAriaLabel = ariaLabel || 'Sign up for free account to access live chat support'

	// Base styles - mobile-first responsive - Darker card style matching image
	const baseStyles = classNames(
		// Base card styles - darker background like the image
		'group relative overflow-hidden rounded-2xl border border-base-300 bg-base-200',
		'p-6 shadow-sm transition-all duration-300',
		'hover:border-primary/30 hover:shadow-md',
		'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
		// Mobile-first padding (increased on desktop)
		'md:p-8',
		// Text alignment and display - ensure consistent layout
		'flex flex-col gap-4',
		// Custom className
		className
	)

	// Icon container styles - Square with rounded corners, purple background matching image
	const iconContainerStyles = classNames(
		'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
		'bg-primary text-primary-content transition-all duration-300',
		'group-hover:bg-primary/90'
	)

	return (
		<div className={baseStyles} aria-label={generatedAriaLabel}>
			<div className="flex items-start gap-4">
				<div className={iconContainerStyles} aria-hidden="true">
					<MessageSquare className="h-6 w-6" strokeWidth={1.5} />
				</div>
				<div className="flex-1 min-w-0 space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
						LIVE CHAT
					</p>
					<h3 className="text-lg font-semibold text-base-content md:text-xl">
						Members Only
					</h3>
					<p className="text-sm text-base-content/60">
						Create a free account to access our live chat support.
					</p>
				</div>
			</div>

			<div className="mt-2">
				<Button
					variant="primary"
					onClick={handleSignUpClick}
					rightIcon={<ArrowRight className="w-4 h-4" />}
					className="w-full max-w-xs mx-auto"
				>
					Sign Up Free
				</Button>
			</div>
		</div>
	)
}

