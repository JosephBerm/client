/**
 * OrderDetailSkeleton Component
 * 
 * Loading skeleton for the order detail page.
 * Provides visual feedback while order data is being fetched.
 * 
 * **Features:**
 * - Matches layout structure of actual content
 * - Animated pulse effect
 * - Responsive design
 * 
 * **Performance (Next.js 16 / React 19 Best Practices):**
 * - React.memo: YES - Component has NO props, structure never changes
 * - Static structure means memo prevents any potential re-creation
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/OrderDetailSkeleton
 */

'use client'

import { memo } from 'react'

import Card from '@_components/ui/Card'

/**
 * Order detail page loading skeleton.
 * 
 * Memoized because:
 * - Zero props means zero reasons to re-render
 * - Static skeleton structure is expensive to recreate
 * - Memo ensures single render during loading state
 * 
 * @example
 * ```tsx
 * {isLoading ? <OrderDetailSkeleton /> : <OrderContent order={order} />}
 * ```
 */
export const OrderDetailSkeleton = memo(function OrderDetailSkeleton() {
	return (
		<div className="space-y-6 animate-pulse">
			{/* Timeline skeleton */}
			<Card className="border border-base-300 bg-base-100 p-4 shadow-sm">
				<div className="flex items-center justify-between">
					{TIMELINE_STEPS.map((i) => (
						<div key={i} className="flex items-center">
							<div className="w-8 h-8 rounded-full bg-base-200" />
							{i < 5 && <div className="h-1 w-8 sm:w-12 md:w-16 mx-1 bg-base-200" />}
						</div>
					))}
				</div>
			</Card>

			{/* Main Layout */}
			<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				{/* Main Content */}
				<div className="space-y-6">
					<HeaderSkeleton />
					<LineItemsSkeleton />
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<ActionsSkeleton />
					<TimelineSkeleton />
					<QuickInfoSkeleton />
				</div>
			</div>
		</div>
	)
})

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS (defined outside to prevent recreation)
// ─────────────────────────────────────────────────────────────────────────────

const TIMELINE_STEPS = [1, 2, 3, 4, 5] as const
const LINE_ITEM_ROWS = [1, 2, 3] as const
const TOTAL_ROWS = [1, 2, 3, 4] as const
const TIMELINE_ITEMS = [1, 2, 3, 4] as const
const INFO_ROWS = [1, 2, 3] as const

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL SUB-COMPONENTS (not exported, simple static structures)
// ─────────────────────────────────────────────────────────────────────────────

function HeaderSkeleton() {
	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<div className="flex justify-between mb-4">
				<div className="space-y-2">
					<div className="h-6 w-32 bg-base-200 rounded" />
					<div className="h-4 w-48 bg-base-200 rounded" />
				</div>
				<div className="h-8 w-24 bg-base-200 rounded" />
			</div>
			<div className="grid grid-cols-2 gap-4">
				<SkeletonInfoBlock />
				<SkeletonInfoBlock />
			</div>
		</Card>
	)
}

function LineItemsSkeleton() {
	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<div className="h-6 w-40 bg-base-200 rounded mb-6" />
			<div className="space-y-3">
				{LINE_ITEM_ROWS.map((i) => (
					<div key={i} className="flex justify-between py-2">
						<div className="flex-1 space-y-2">
							<div className="h-4 w-48 bg-base-200 rounded" />
							<div className="h-3 w-24 bg-base-200 rounded" />
						</div>
						<div className="h-4 w-20 bg-base-200 rounded" />
					</div>
				))}
			</div>
			<div className="mt-4 pt-4 border-t border-base-200">
				<div className="flex justify-end">
					<div className="w-64 space-y-2">
						{TOTAL_ROWS.map((i) => (
							<div key={i} className="flex justify-between">
								<div className="h-4 w-20 bg-base-200 rounded" />
								<div className="h-4 w-16 bg-base-200 rounded" />
							</div>
						))}
					</div>
				</div>
			</div>
		</Card>
	)
}

function ActionsSkeleton() {
	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<div className="h-4 w-32 bg-base-200 rounded mb-4" />
			<div className="flex flex-wrap gap-3">
				<div className="h-10 w-32 bg-base-200 rounded" />
				<div className="h-10 w-28 bg-base-200 rounded" />
			</div>
		</Card>
	)
}

function TimelineSkeleton() {
	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<div className="h-4 w-28 bg-base-200 rounded mb-6" />
			<div className="space-y-4">
				{TIMELINE_ITEMS.map((i) => (
					<div key={i} className="flex gap-4">
						<div className="w-10 h-10 rounded-full bg-base-200" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-20 bg-base-200 rounded" />
							<div className="h-3 w-32 bg-base-200 rounded" />
						</div>
					</div>
				))}
			</div>
		</Card>
	)
}

function QuickInfoSkeleton() {
	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<div className="h-4 w-24 bg-base-200 rounded mb-4" />
			<div className="space-y-3">
				{INFO_ROWS.map((i) => (
					<div key={i} className="flex justify-between">
						<div className="h-4 w-20 bg-base-200 rounded" />
						<div className="h-4 w-16 bg-base-200 rounded" />
					</div>
				))}
			</div>
		</Card>
	)
}

function SkeletonInfoBlock() {
	return (
		<div className="space-y-2">
			<div className="h-3 w-16 bg-base-200 rounded" />
			<div className="h-4 w-32 bg-base-200 rounded" />
		</div>
	)
}

export default OrderDetailSkeleton
