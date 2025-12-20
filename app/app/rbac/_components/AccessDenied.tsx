/**
 * AccessDenied Component
 *
 * Reusable component for displaying access denied messages.
 * Used across RBAC pages when user lacks required permissions.
 *
 * Architecture: Pure presentation component with optional navigation.
 *
 * @see prd_rbac_management.md
 * @module app/rbac/_components/AccessDenied
 */

'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, Shield } from 'lucide-react'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../../_components'

// =========================================================================
// TYPES
// =========================================================================

interface AccessDeniedProps {
	/** Page title shown in header */
	title?: string
	/** Page description shown in header */
	description?: string
	/** Main heading inside the card */
	heading?: string
	/** Detailed message explaining the restriction */
	message?: string
	/** Whether to show the back button */
	showBackButton?: boolean
	/** Custom action button (replaces back button if provided) */
	action?: React.ReactNode
	/** Icon variant */
	variant?: 'warning' | 'error'
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Access Denied Display
 *
 * Shows a friendly error message when users try to access
 * pages they don't have permission for.
 *
 * Features:
 * - Customizable title, heading, and message
 * - Optional back button
 * - Custom action support
 * - Two icon variants (warning/error)
 */
export function AccessDenied({
	title = 'Access Denied',
	description = 'You do not have permission to view this page.',
	heading = 'Access Restricted',
	message = 'You need higher privileges to access this page.',
	showBackButton = true,
	action,
	variant = 'warning',
}: AccessDeniedProps) {
	const router = useRouter()

	const Icon = variant === 'error' ? Shield : AlertTriangle
	const colorClass = variant === 'error' ? 'text-error' : 'text-warning'

	return (
		<>
			<InternalPageHeader
				title={title}
				description={description}
				loading={false}
			/>
			<Card className="border border-error/30 bg-error/5 p-8 text-center">
				<Icon className={`mx-auto mb-4 h-12 w-12 ${colorClass}`} />
				<h2 className="mb-2 text-xl font-semibold text-base-content">{heading}</h2>
				<p className="mb-6 text-base-content/60">{message}</p>

				{/* Action area */}
				{action ? (
					action
				) : showBackButton ? (
					<Button variant="primary" onClick={() => router.back()}>
						Go Back
					</Button>
				) : null}
			</Card>
		</>
	)
}

export default AccessDenied
