/**
 * SocialLoginButtons Component
 * 
 * Social authentication buttons with provider icons.
 * Supports Google, Apple, Microsoft, and Phone authentication.
 * 
 * **Features:**
 * - Animated show/hide transitions
 * - Provider-specific icons (SVG)
 * - Mobile-first responsive design
 * - Accessible with ARIA labels
 * 
 * @module LoginModal/SocialLoginButtons
 */

'use client'

import type { ReactElement } from 'react'

import Button from '@_components/ui/Button'

import {
	SOCIAL_PROVIDERS,
	SOCIAL_LABELS,
	ANIMATION_CLASSES,
	LAYOUT_CLASSES,
	ARIA_LABELS,
} from './LoginModal.constants'

import type { SocialLoginButtonsProps, SocialProvider } from './LoginModal.types'

// ============================================================================
// SOCIAL PROVIDER ICONS
// ============================================================================

/**
 * Icon size constant for social provider icons.
 * Using size-5 (20px) for optimal visual balance at button size md.
 * Matches Lucide icon sizing patterns in the codebase.
 */
const ICON_CLASS = 'size-5' as const

/**
 * Social provider icon components.
 * SVG icons for each OAuth provider.
 * 
 * Note: These are static JSX elements, not components,
 * to avoid unnecessary re-renders.
 * 
 * Brand colors are intentionally hardcoded per provider brand guidelines.
 */
const SocialIcons: Record<SocialProvider, ReactElement> = {
	google: (
		<svg className={ICON_CLASS} viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
			<path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
			<path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
			<path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
			<path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
		</svg>
	),
	apple: (
		<svg className={ICON_CLASS} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' focusable='false'>
			<path d='M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 4.96 6.62 9.38 6.4c1.35-.07 2.34.93 3.08.93.74 0 2.03-.93 3.43-.84.58.03 2.17.23 3.2 1.79-2.59 1.5-2.21 4.78-1.05 6.13-2.98 1.74-3.85 4.09-3.99 5.87zm-3.03-17.5c-.27-.32-.71-.53-1.15-.53-.55 0-1.07.33-1.41.75-.27.32-.51.85-.45 1.34.6.04 1.2-.24 1.46-.56.28-.33.51-.86.55-1.1z' />
		</svg>
	),
	microsoft: (
		<svg className={ICON_CLASS} viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
			<path fill='#F25022' d='M1 1h10v10H1z' />
			<path fill='#00A4EF' d='M13 1h10v10H13z' />
			<path fill='#7FBA00' d='M1 13h10v10H1z' />
			<path fill='#FFB900' d='M13 13h10v10H13z' />
		</svg>
	),
	phone: (
		<svg className={ICON_CLASS} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true' focusable='false'>
			<path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
		</svg>
	),
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SocialLoginButtons Component
 * 
 * Renders social authentication buttons with animated visibility.
 * Uses Button's leftIcon prop for proper icon alignment.
 * 
 * @param props - Component props
 * @returns Social login buttons section
 */
export default function SocialLoginButtons({
	isHidden,
	onSocialLogin,
}: SocialLoginButtonsProps) {
	return (
		<div
			className={`${ANIMATION_CLASSES.TRANSITION} ${
				isHidden
					? `${ANIMATION_CLASSES.HIDDEN} mb-0`
					: `${ANIMATION_CLASSES.VISIBLE} mb-4 sm:mb-5 md:mb-6`
			}`}
		>
			<div className={LAYOUT_CLASSES.SOCIAL_BUTTONS}>
				{SOCIAL_PROVIDERS.map((provider) => (
					<Button
						key={provider}
						type='button'
						variant='outline'
						size='md'
						onClick={() => onSocialLogin(provider)}
						leftIcon={SocialIcons[provider]}
						className={LAYOUT_CLASSES.SOCIAL_BUTTON}
						aria-label={ARIA_LABELS.CONTINUE_WITH(SOCIAL_LABELS[provider])}
					>
						Continue with {SOCIAL_LABELS[provider]}
					</Button>
				))}
			</div>
		</div>
	)
}

