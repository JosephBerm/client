/**
 * Product Help Section Component
 * 
 * Displays help/support link.
 * Server component - no client-side interactivity needed.
 * 
 * @module ProductDetail/ProductHelpSection
 */

import Link from 'next/link'

import { Mail } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { ANIMATION_DELAYS, HELP_LABELS } from './ProductDetail.constants'

/**
 * Product Help Section
 * 
 * Renders help section with contact support link.
 */
export default function ProductHelpSection() {
	return (
		<div
			className="animate-fade-in mt-2 flex items-center justify-center gap-2 text-sm text-base-content/50 transition-colors hover:text-primary"
			style={{ animationDelay: ANIMATION_DELAYS.HELP }}
		>
			<Mail className="h-4 w-4" />
			<Link href={Routes.Contact.location} className="font-medium">
				{HELP_LABELS.QUESTIONS}
			</Link>
		</div>
	)
}

