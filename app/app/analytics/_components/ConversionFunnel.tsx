'use client'

/**
 * ConversionFunnel Component
 *
 * Visual funnel showing quote pipeline stages.
 * Displays quotes at each stage from request to conversion.
 *
 * @see prd_analytics.md - Section 5.2 Frontend Components
 * @module analytics/components/ConversionFunnel
 */

import { Filter } from 'lucide-react'

import Card from '@_components/ui/Card'
import type { QuotePipelineData } from '@_types/analytics.types'

interface ConversionFunnelProps {
	/** Pipeline data */
	data: QuotePipelineData
	/** Whether data is loading */
	isLoading?: boolean
}

interface FunnelStage {
	key: keyof QuotePipelineData
	label: string
	color: string
	description: string
}

const stages: FunnelStage[] = [
	{ key: 'unread', label: 'New Requests', color: 'bg-info', description: 'Awaiting review' },
	{ key: 'read', label: 'In Progress', color: 'bg-warning', description: 'Being processed' },
	{ key: 'approved', label: 'Approved', color: 'bg-success', description: 'Sent to customer' },
	{ key: 'converted', label: 'Converted', color: 'bg-primary', description: 'Orders created' },
]

/**
 * Conversion funnel visualization.
 *
 * @example
 * ```tsx
 * <ConversionFunnel data={quotePipeline} isLoading={isLoading} />
 * ```
 */
export function ConversionFunnel({ data, isLoading = false }: ConversionFunnelProps) {
	if (isLoading) {
		return (
			<Card title="Quote Pipeline">
				<div className="flex items-center justify-center h-64">
					<span className="loading loading-spinner loading-lg text-primary"></span>
				</div>
			</Card>
		)
	}

	const total = data.total || 1 // Prevent division by zero
	const conversionRate =
		data.unread + data.read + data.approved > 0
			? ((data.converted / (data.unread + data.read + data.approved + data.converted)) * 100).toFixed(1)
			: '0'

	return (
		<Card>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Filter className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold text-base-content">Quote Pipeline</h3>
						<p className="text-sm text-base-content/60">
							{conversionRate}% conversion rate
						</p>
					</div>
				</div>
				<div className="badge badge-outline">{total} total</div>
			</div>

			{/* Funnel Stages */}
			<div className="space-y-3">
				{stages.map((stage, index) => {
					const value = data[stage.key] as number
					const percentage = total > 0 ? (value / total) * 100 : 0
					const widthPercent = 100 - index * 15 // Decreasing width for funnel effect

					return (
						<div key={stage.key} className="relative">
							{/* Stage bar */}
							<div
								className="relative h-12 rounded-lg overflow-hidden transition-all"
								style={{ width: `${widthPercent}%`, marginLeft: `${index * 7.5}%` }}
							>
								{/* Background */}
								<div className={`absolute inset-0 ${stage.color} opacity-20`} />
								{/* Fill */}
								<div
									className={`absolute inset-y-0 left-0 ${stage.color}`}
									style={{ width: `${Math.min(percentage * 2, 100)}%` }}
								/>
								{/* Content */}
								<div className="relative h-full flex items-center justify-between px-4">
									<div>
										<span className="font-medium text-base-content">{stage.label}</span>
										<span className="text-xs text-base-content/60 ml-2">
											{stage.description}
										</span>
									</div>
									<div className="text-right">
										<span className="font-bold text-base-content">{value}</span>
										<span className="text-xs text-base-content/60 ml-1">
											({percentage.toFixed(0)}%)
										</span>
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{/* Bottom stats */}
			<div className="mt-4 pt-4 border-t border-base-300 grid grid-cols-2 gap-4 text-sm">
				<div>
					<span className="text-base-content/60">Rejected:</span>
					<span className="ml-2 font-medium text-error">{data.rejected}</span>
				</div>
				<div>
					<span className="text-base-content/60">Expired:</span>
					<span className="ml-2 font-medium text-warning">{data.expired}</span>
				</div>
			</div>
		</Card>
	)
}

export default ConversionFunnel

