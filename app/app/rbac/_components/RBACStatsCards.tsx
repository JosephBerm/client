/**
 * RBACStatsCards Component
 *
 * Displays RBAC overview statistics in a responsive card grid.
 * Shows roles, permissions, total users, and staff accounts.
 *
 * Architecture: Pure presentation component - receives data via props.
 *
 * @see prd_rbac_management.md
 * @module app/rbac/_components/RBACStatsCards
 */

'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Users, UserCog } from 'lucide-react'

import Card from '@_components/ui/Card'

import type { RBACOverview } from '@_types/rbac-management'

// =========================================================================
// TYPES
// =========================================================================

interface RBACStatsCardsProps {
	/** RBAC overview data containing roles, permissions, and user stats */
	overview: RBACOverview
}

interface StatCardProps {
	/** Card title */
	title: string
	/** Numeric value to display */
	value: number
	/** Icon component */
	icon: typeof Shield
	/** Gradient colors for icon background */
	gradient: string
	/** Animation delay for staggered entrance */
	delay: number
}

// =========================================================================
// STAT CARD COMPONENT
// =========================================================================

/**
 * Individual stat card with animated entrance.
 * Extracted for DRY compliance and reusability.
 */
function StatCard({ title, value, icon: Icon, gradient, delay }: StatCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay }}
		>
			<Card className="border border-base-300 bg-base-100 p-4 shadow-sm">
				<div className="flex items-center gap-4">
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}
					>
						<Icon className="h-6 w-6 text-white" />
					</div>
					<div>
						<p className="text-2xl font-bold text-base-content">{value}</p>
						<p className="text-sm text-base-content/60">{title}</p>
					</div>
				</div>
			</Card>
		</motion.div>
	)
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

/**
 * RBAC Statistics Cards Grid
 *
 * Displays four key metrics:
 * 1. Total roles defined in the system
 * 2. Total permissions configured
 * 3. Total user accounts
 * 4. Staff accounts (all non-customer roles, calculated dynamically)
 */
export function RBACStatsCards({ overview }: RBACStatsCardsProps) {
	// Calculate staff accounts dynamically from roles data
	// Staff = users with roles above the lowest role level (customer)
	const lowestRoleLevel = overview.roles.length > 0
		? Math.min(...overview.roles.map(r => r.level))
		: 0

	// Sum up all users in roles above the lowest level
	const staffAccountsCount = Object.entries(overview.userStats.countByRole)
		.filter(([level]) => Number(level) > lowestRoleLevel)
		.reduce((sum, [, count]) => sum + count, 0)

	// Stats configuration - defines what cards to show
	const stats: Omit<StatCardProps, 'delay'>[] = [
		{
			title: 'Roles Defined',
			value: overview.roles.length,
			icon: Shield,
			gradient: 'from-purple-500 to-purple-600',
		},
		{
			title: 'Permissions',
			value: overview.permissions.length,
			icon: Lock,
			gradient: 'from-blue-500 to-blue-600',
		},
		{
			title: 'Total Users',
			value: overview.userStats.totalUsers,
			icon: Users,
			gradient: 'from-amber-500 to-amber-600',
		},
		{
			title: 'Staff Accounts',
			value: staffAccountsCount,
			icon: UserCog,
			gradient: 'from-rose-500 to-rose-600',
		},
	]

	return (
		<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat, index) => (
				<StatCard key={stat.title} {...stat} delay={index * 0.1} />
			))}
		</div>
	)
}

export default RBACStatsCards

