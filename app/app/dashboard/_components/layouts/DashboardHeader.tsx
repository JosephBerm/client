'use client'

/**
 * Dashboard Header Component
 *
 * Displays personalized greeting and error state.
 * Standalone component that tells the "welcome" story.
 *
 * @see prd_dashboard.md - Welcome Header section
 * @module dashboard/layouts/DashboardHeader
 */

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import { parseDateOrNow } from '@_lib/dates'

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get greeting based on time of day.
 * Pure function - uses centralized date utilities.
 */
function getGreeting(): string {
	const hour = parseDateOrNow().getHours()
	if (hour < 12) {
		return 'Good morning'
	}
	if (hour < 18) {
		return 'Good afternoon'
	}
	return 'Good evening'
}

// =============================================================================
// TYPES
// =============================================================================

interface DashboardHeaderProps {
	/** User's first name for personalized greeting */
	firstName: string
	/** Optional error message to display */
	error?: Error | null
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DashboardHeader({ firstName, error }: DashboardHeaderProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
		>
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold text-base-content">
					{getGreeting()}, {firstName}
				</h1>
				<p className="text-base-content/60 mt-1">
					Here&apos;s what&apos;s happening today
				</p>
			</div>
			{error && (
				<div className="flex items-center gap-2 text-error text-sm">
					<AlertCircle className="w-4 h-4" />
					Failed to load some data
				</div>
			)}
		</motion.div>
	)
}

export default DashboardHeader

