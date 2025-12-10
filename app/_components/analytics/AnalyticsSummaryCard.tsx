/**
 * AnalyticsSummaryCard Component
 * 
 * Individual summary card for displaying key financial metrics.
 * Used in the analytics dashboard to show revenue, profit, orders, and profit margin.
 * 
 * **Features:**
 * - Color-coded by metric type (primary, success, warning, info)
 * - Responsive design
 * - Theme-aware styling
 * 
 * @module components/analytics/AnalyticsSummaryCard
 */

interface AnalyticsSummaryCardProps {
	/** Card title (e.g., "Total Revenue") */
	title: string
	/** Formatted value to display */
	value: string
	/** Border color class */
	borderClass: string
	/** Background color class */
	bgClass: string
	/** Text color class */
	titleClass: string
}

/**
 * AnalyticsSummaryCard Component
 * 
 * Displays a single financial metric in a styled card.
 * 
 * @param props - Component props
 * @returns Summary card component
 */
export default function AnalyticsSummaryCard({
	title,
	value,
	borderClass,
	bgClass,
	titleClass,
}: AnalyticsSummaryCardProps) {
	return (
		<div className={`rounded-xl border ${borderClass} ${bgClass} p-6 shadow-sm`}>
			<p className={`text-sm font-medium ${titleClass}`}>{title}</p>
			<p className={`mt-2 text-2xl font-bold ${titleClass}`}>{value}</p>
		</div>
	)
}
