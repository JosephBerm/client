'use client'

/**
 * ConversionFunnel Component (visx)
 *
 * Production-grade quote pipeline visualization using visx FunnelChart.
 * Full MAANG-grade chart with interactivity, tooltips, and accessibility.
 *
 * **Migrated**: Originally CSS-based, now powered by visx FunnelChart.
 * See PHASE_7_CLEANUP.md for migration details.
 *
 * @see prd_analytics.md - Section 5.2 Frontend Components
 * @module analytics/components/ConversionFunnel
 */

import { useMemo } from 'react'
import { Filter } from 'lucide-react'

import Card from '@_components/ui/Card'
import {
	FunnelChart,
	type FunnelStage,
	ChartHeader,
} from '@_components/charts'
import type { QuotePipelineData } from '@_types/analytics.types'

interface ConversionFunnelProps {
	/** Pipeline data */
	data: QuotePipelineData
	/** Whether data is loading */
	isLoading?: boolean
}

/**
 * Stage configuration with colors and descriptions.
 */
const STAGE_CONFIG: Array<{
	key: keyof QuotePipelineData
	name: string
	description: string
	color: string
}> = [
	{
		key: 'unread',
		name: 'New Requests',
		description: 'Awaiting review',
		color: 'oklch(var(--in))', // info
	},
	{
		key: 'read',
		name: 'In Progress',
		description: 'Being processed',
		color: 'oklch(var(--wa))', // warning
	},
	{
		key: 'approved',
		name: 'Approved',
		description: 'Sent to customer',
		color: 'oklch(var(--su))', // success
	},
	{
		key: 'converted',
		name: 'Converted',
		description: 'Orders created',
		color: 'oklch(var(--p))', // primary
	},
]

/**
 * Conversion funnel visualization using visx.
 *
 * @example
 * ```tsx
 * <ConversionFunnel data={quotePipeline} isLoading={isLoading} />
 * ```
 */
export function ConversionFunnel({
	data,
	isLoading = false,
}: ConversionFunnelProps) {
	// Transform QuotePipelineData to FunnelStage[]
	const funnelData = useMemo((): FunnelStage[] => {
		return STAGE_CONFIG.map((config) => ({
			id: config.key,
			name: config.name,
			value: data[config.key] as number,
			color: config.color,
			description: config.description,
		}))
	}, [data])

	// Calculate conversion rate
	const conversionRate = useMemo(() => {
		const totalActive = data.unread + data.read + data.approved + data.converted
		if (totalActive === 0) return 0
		return (data.converted / totalActive) * 100
	}, [data])

	return (
		<Card>
			<ChartHeader
				title="Quote Pipeline"
				subtitle={`${conversionRate.toFixed(1)}% conversion rate`}
				icon={Filter}
				actions={
					<div className="badge badge-outline">{data.total} total</div>
				}
			/>

			<FunnelChart
				data={funnelData}
				height={220}
				showPercentages
				showValues
				percentageMode="absolute"
				isLoading={isLoading}
				ariaLabel="Quote pipeline conversion funnel"
			/>

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
