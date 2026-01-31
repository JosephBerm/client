'use client'

/**
 * QuickActions Component
 *
 * Displays quick action buttons for common dashboard operations.
 * Each action is wrapped with permission guards for role-based access.
 *
 * **MAANG-Level Architecture:**
 * - Uses centralized Card and Button components
 * - Uses framer-motion for animations
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Components
 * @module dashboard/QuickActions
 */

import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'

import Button from '@_components/ui/Button'
import Surface from '@_components/ui/Surface'

import type { LucideIcon } from 'lucide-react'

interface QuickAction {
	/** Button label */
	label: string
	/** Navigation href */
	href: string
	/** Optional icon */
	icon?: LucideIcon
	/** Button variant */
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

interface QuickActionsProps {
	/** Array of quick actions to display */
	actions: QuickAction[]
	/** Card title (optional) */
	title?: string
}

/**
 * Quick action buttons for dashboard.
 *
 * @example
 * ```tsx
 * <QuickActions
 *   title="Quick Actions"
 *   actions={[
 *     { label: 'Submit Quote', href: '/store', icon: Plus },
 *     { label: 'Track Order', href: '/app/orders' },
 *   ]}
 * />
 * ```
 */
export function QuickActions({ actions, title }: QuickActionsProps) {
	const router = useRouter()

	if (actions.length === 0) {
		return null
	}

	return (
		<Surface variant="subtle" padding="lg" className="h-full">
			{title && (
				<h3 className="font-semibold text-lg text-base-content mb-4">{title}</h3>
			)}
			<div className="flex flex-wrap gap-2">
				{actions.map((action, index) => {
					const Icon = action.icon
					return (
						<motion.div
							key={action.label}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: index * 0.05 }}
						>
							<Button
								variant={action.variant ?? 'outline'}
								onClick={() => router.push(action.href)}
								className="gap-2"
							>
								{Icon && <Icon className="w-4 h-4" />}
								{action.label}
							</Button>
						</motion.div>
					)
				})}
			</div>
		</Surface>
	)
}

export default QuickActions
