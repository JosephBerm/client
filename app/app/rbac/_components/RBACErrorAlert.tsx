/**
 * RBACErrorAlert Component
 *
 * Displays error messages in a styled alert card.
 * Used for showing API errors or validation failures.
 *
 * Architecture: Pure presentation component.
 *
 * @module app/rbac/_components/RBACErrorAlert
 */

'use client'

import { AlertTriangle } from 'lucide-react'

import Card from '@_components/ui/Card'

// =========================================================================
// TYPES
// =========================================================================

interface RBACErrorAlertProps {
	/** Error message to display */
	message: string
	/** Additional CSS classes */
	className?: string
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Error Alert for RBAC pages
 *
 * Displays error messages with consistent styling.
 * Returns null if no message is provided.
 */
export function RBACErrorAlert({ message, className = '' }: RBACErrorAlertProps) {
	if (!message) return null

	return (
		<Card className={`mb-6 border border-error/30 bg-error/5 p-4 ${className}`}>
			<div className="flex items-center gap-3 text-error">
				<AlertTriangle className="h-5 w-5 flex-shrink-0" />
				<p>{message}</p>
			</div>
		</Card>
	)
}

export default RBACErrorAlert

