'use client'

/**
 * TaskList Component
 *
 * Displays a list of dashboard tasks requiring attention.
 * Tasks are displayed with urgency indicators and action links.
 *
 * **MAANG-Level Architecture:**
 * - Uses centralized EmptyState component
 * - Uses centralized Card component
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Components
 * @module dashboard/TaskList
 */

import Link from 'next/link'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, ChevronRight, Clock } from 'lucide-react'

import EmptyState from '@_components/common/EmptyState'
import Card from '@_components/ui/Card'

import type { DashboardTask } from '@_types/dashboard.types'

interface TaskListProps {
	/** Array of tasks to display */
	tasks: DashboardTask[]
	/** Card title */
	title: string
	/** Whether to show urgent indicators (default: true) */
	showUrgent?: boolean
	/** Maximum tasks to display (default: 10) */
	maxItems?: number
}

/**
 * Task list for displaying action items.
 *
 * @example
 * ```tsx
 * <TaskList
 *   tasks={[...urgentTasks, ...regularTasks]}
 *   title="Today's Tasks"
 *   showUrgent
 * />
 * ```
 */
export function TaskList({ tasks, title, showUrgent = true, maxItems = 10 }: TaskListProps) {
	const displayTasks = tasks.slice(0, maxItems)

	if (tasks.length === 0) {
		return (
			<Card className="h-full">
				<h3 className="font-semibold text-lg text-base-content mb-4">{title}</h3>
				<EmptyState
					icon={<CheckCircle className="w-12 h-12 text-success" />}
					title="All caught up!"
					description="No tasks require your attention right now."
				/>
			</Card>
		)
	}

	return (
		<Card className="h-full">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold text-lg text-base-content">{title}</h3>
				{tasks.length > maxItems && (
					<span className="text-sm text-base-content/50">
						+{tasks.length - maxItems} more
					</span>
				)}
			</div>
			<ul className="space-y-2">
				{displayTasks.map((task, index) => (
					<motion.li
								key={task.quoteId ?? task.orderId ?? index}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.05 }}
					>
						<Link
							href={task.actionUrl}
							className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group ${
								task.isUrgent && showUrgent
									? 'bg-error/5 hover:bg-error/10 border border-error/20'
									: 'bg-base-200/50 hover:bg-base-200'
							}`}
						>
							<div className="shrink-0 mt-0.5">
								{task.isUrgent && showUrgent ? (
									<AlertCircle className="w-5 h-5 text-error" />
								) : (
									<Clock className="w-5 h-5 text-base-content/40" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p
									className={`font-medium text-sm truncate ${
										task.isUrgent && showUrgent ? 'text-error' : 'text-base-content'
									}`}
								>
									{task.title}
								</p>
								<p className="text-xs text-base-content/50 truncate mt-0.5">
									{task.description}
								</p>
							</div>
							<ChevronRight className="w-4 h-4 text-base-content/30 group-hover:text-base-content/60 transition-colors shrink-0" />
						</Link>
					</motion.li>
				))}
			</ul>
		</Card>
	)
}

export default TaskList

