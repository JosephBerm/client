'use client'

/**
 * TeamWorkloadTable Component
 *
 * Displays team workload distribution for sales managers.
 * Shows active quotes/orders per sales rep with overload indicators.
 *
 * **MAANG-Level Architecture:**
 * - Uses centralized EmptyState component
 * - Uses centralized Card component
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Components
 * @module dashboard/TeamWorkloadTable
 */

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Users } from 'lucide-react'

import EmptyState from '@_components/common/EmptyState'
import Card from '@_components/ui/Card'

import type { SalesRepWorkload } from '@_types/dashboard.types'

interface TeamWorkloadTableProps {
	/** Array of sales rep workload data */
	workload: SalesRepWorkload[]
}

/**
 * Team workload table for manager dashboard.
 *
 * @example
 * ```tsx
 * {stats?.teamWorkload && (
 *   <TeamWorkloadTable workload={stats.teamWorkload} />
 * )}
 * ```
 */
export function TeamWorkloadTable({ workload }: TeamWorkloadTableProps) {
	if (workload.length === 0) {
		return (
			<Card className="h-full">
				<h3 className="font-semibold text-lg text-base-content mb-4">Team Workload</h3>
				<EmptyState
					icon={<Users className="w-12 h-12" />}
					title="No team members found"
					description="Team workload data will appear once sales reps are assigned."
				/>
			</Card>
		)
	}

	// Calculate totals
	const totalQuotes = workload.reduce((sum, rep) => sum + rep.activeQuotes, 0)
	const totalOrders = workload.reduce((sum, rep) => sum + rep.activeOrders, 0)
	const overloadedCount = workload.filter((rep) => rep.isOverloaded).length

	return (
		<Card>
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold text-lg text-base-content">Team Workload</h3>
				{overloadedCount > 0 && (
					<span className="badge badge-warning gap-1">
						<AlertTriangle className="w-3 h-3" />
						{overloadedCount} overloaded
					</span>
				)}
			</div>
			<div className="overflow-x-auto -mx-2">
				<table className="table table-sm">
					<thead>
						<tr className="text-base-content/60">
							<th>Sales Rep</th>
							<th className="text-center">Active Quotes</th>
							<th className="text-center">Active Orders</th>
							<th className="text-center">Status</th>
						</tr>
					</thead>
					<tbody>
						{workload.map((rep, index) => (
							<motion.tr
								key={rep.salesRepId ?? index}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: index * 0.05 }}
								className={`hover:bg-base-200/50 transition-colors ${
									rep.isOverloaded ? 'bg-warning/5' : ''
								}`}
							>
								<td className="font-medium">{rep.salesRepName}</td>
								<td className="text-center">
									<span
										className={`font-semibold ${
											rep.isOverloaded ? 'text-warning' : ''
										}`}
									>
										{rep.activeQuotes}
									</span>
								</td>
								<td className="text-center">{rep.activeOrders}</td>
								<td className="text-center">
									{rep.isOverloaded ? (
										<span className="flex items-center justify-center gap-1 text-warning">
											<AlertTriangle className="w-4 h-4" />
											<span className="text-sm font-medium">Overloaded</span>
										</span>
									) : (
										<span className="flex items-center justify-center gap-1 text-success">
											<CheckCircle className="w-4 h-4" />
											<span className="text-sm font-medium">OK</span>
										</span>
									)}
								</td>
							</motion.tr>
						))}
					</tbody>
					<tfoot>
						<tr className="font-semibold bg-base-200/30">
							<td>Total</td>
							<td className="text-center">{totalQuotes}</td>
							<td className="text-center">{totalOrders}</td>
							<td></td>
						</tr>
					</tfoot>
				</table>
			</div>
		</Card>
	)
}

export default TeamWorkloadTable

