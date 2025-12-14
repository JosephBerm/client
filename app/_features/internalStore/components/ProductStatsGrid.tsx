/**
 * ProductStatsGrid Component
 * 
 * Displays product statistics in a responsive grid layout.
 * Follows the same pattern as ProviderStatsGrid and CustomerStatsGrid.
 * 
 * **Features:**
 * - Responsive grid (1-2-4 columns)
 * - Loading skeletons
 * - Currency formatting for inventory value
 * - Color-coded indicators for warnings
 * - Mobile-first design
 * 
 * @module internalStore/components
 */

'use client'

import { AlertTriangle, Archive, Box, DollarSign, FolderOpen, Package, PackageX } from 'lucide-react'

import { formatCurrency } from '@_shared'

import type { ProductStatsGridProps } from '../types'

/**
 * Individual stat card component.
 */
interface StatCardProps {
	/** Card title */
	title: string
	/** Card value */
	value: string | number
	/** Lucide icon */
	icon: React.ReactNode
	/** Optional variant for color styling */
	variant?: 'default' | 'warning' | 'error' | 'success'
	/** Optional subtitle */
	subtitle?: string
}

function StatCard({ title, value, icon, variant = 'default', subtitle }: StatCardProps) {
	const variantStyles = {
		default: 'bg-base-100 text-base-content',
		warning: 'bg-warning/10 text-warning',
		error: 'bg-error/10 text-error',
		success: 'bg-success/10 text-success',
	}

	const iconStyles = {
		default: 'text-primary',
		warning: 'text-warning',
		error: 'text-error',
		success: 'text-success',
	}

	return (
		<div className={`rounded-xl p-4 ${variantStyles[variant]} border border-base-200`}>
			<div className="flex items-start justify-between">
				<div className="flex-1 min-w-0">
					<p className="text-xs font-medium uppercase tracking-wide text-base-content/60">
						{title}
					</p>
					<p className="mt-1 text-2xl font-bold tabular-nums">
						{value}
					</p>
					{subtitle && (
						<p className="mt-0.5 text-xs text-base-content/50">
							{subtitle}
						</p>
					)}
				</div>
				<div className={`shrink-0 ${iconStyles[variant]}`}>
					{icon}
				</div>
			</div>
		</div>
	)
}

/**
 * Loading skeleton for stat cards.
 */
function StatCardSkeleton() {
	return (
		<div className="rounded-xl bg-base-100 border border-base-200 p-4">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="h-3 w-20 bg-base-300 rounded motion-safe:animate-pulse" />
					<div className="mt-2 h-8 w-16 bg-base-300 rounded motion-safe:animate-pulse" />
				</div>
				<div className="h-6 w-6 bg-base-300 rounded motion-safe:animate-pulse" />
			</div>
		</div>
	)
}

/**
 * ProductStatsGrid - Displays product statistics.
 * 
 * @example
 * ```tsx
 * <ProductStatsGrid
 *   stats={stats}
 *   isLoading={statsLoading}
 *   showArchived={showArchived}
 * />
 * ```
 */
export function ProductStatsGrid({
	stats,
	isLoading,
	showArchived = false,
}: ProductStatsGridProps) {
	if (isLoading) {
		return (
			<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<StatCardSkeleton key={i} />
				))}
			</div>
		)
	}

	if (!stats) {
		return null
	}

	// Show different stats based on archived view
	if (showArchived) {
		return (
			<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Archived Products"
					value={stats.archivedProducts}
					icon={<Archive className="h-6 w-6" />}
					variant="warning"
				/>
				<StatCard
					title="Active Products"
					value={stats.activeProducts}
					icon={<Package className="h-6 w-6" />}
					subtitle="Available in store"
				/>
				<StatCard
					title="Total Products"
					value={stats.totalProducts}
					icon={<Box className="h-6 w-6" />}
				/>
				<StatCard
					title="Categories"
					value={stats.categoryCount}
					icon={<FolderOpen className="h-6 w-6" />}
				/>
			</div>
		)
	}

	return (
		<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<StatCard
				title="Total Products"
				value={stats.activeProducts}
				icon={<Package className="h-6 w-6" />}
				subtitle={`${stats.archivedProducts} archived`}
			/>
			<StatCard
				title="Low Stock"
				value={stats.lowStockProducts}
				icon={<AlertTriangle className="h-6 w-6" />}
				variant={stats.lowStockProducts > 0 ? 'warning' : 'default'}
				subtitle="Less than 10 units"
			/>
			<StatCard
				title="Out of Stock"
				value={stats.outOfStockProducts}
				icon={<PackageX className="h-6 w-6" />}
				variant={stats.outOfStockProducts > 0 ? 'error' : 'default'}
				subtitle="Needs restocking"
			/>
			<StatCard
				title="Inventory Value"
				value={formatCurrency(stats.totalInventoryValue)}
				icon={<DollarSign className="h-6 w-6" />}
				variant="success"
				subtitle={`${stats.categoryCount} categories`}
			/>
		</div>
	)
}

export default ProductStatsGrid

