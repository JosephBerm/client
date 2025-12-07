/**
 * AnalyticsMetricCard Component
 * 
 * Reusable metric card for displaying individual analytics metrics.
 * Used in sales performance and order analytics sections.
 * 
 * **Features:**
 * - Label and value display
 * - Consistent styling
 * - Responsive design
 * 
 * @module components/analytics/AnalyticsMetricCard
 */

interface AnalyticsMetricCardProps {
	/** Metric label (e.g., "Total Sales") */
	label: string
	/** Formatted value to display */
	value: string
}

/**
 * AnalyticsMetricCard Component
 * 
 * Displays a single metric in a card format.
 * 
 * @param props - Component props
 * @returns Metric card component
 */
export default function AnalyticsMetricCard({ label, value }: AnalyticsMetricCardProps) {
	return (
		<div className="rounded-lg border border-base-200 p-4">
			<p className="text-xs uppercase tracking-wide text-base-content/60">{label}</p>
			<p className="mt-2 text-lg font-semibold text-base-content">{value}</p>
		</div>
	)
}
