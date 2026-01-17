/**
 * Audit Log Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Matches the Audit Log page layout:
 * - Page header with title and actions
 * - Info banner
 * - Stats summary cards
 * - Data grid with audit log entries
 *
 * @module app/rbac/audit/loading
 */

import { InternalPageHeader } from '../../_components'

/**
 * DataGridSkeleton - Loading skeleton for RichDataGrid tables
 * Specialized for audit log entries
 */
function DataGridSkeleton() {
	return (
		<div className='card bg-base-100 border border-base-300 shadow-sm p-4 sm:p-6'>
			{/* Header */}
			<div className='mb-4 sm:mb-6'>
				<div className='h-6 w-40 bg-base-300 rounded motion-safe:animate-pulse mb-2' />
				<div className='h-4 w-56 bg-base-200 rounded motion-safe:animate-pulse' />
			</div>

			{/* Search bar skeleton */}
			<div className='mb-4 flex gap-3'>
				<div className='h-10 flex-1 bg-base-200 rounded motion-safe:animate-pulse' />
				<div className='h-10 w-24 bg-base-200 rounded motion-safe:animate-pulse' />
			</div>

			{/* Table rows skeleton */}
			<div className='space-y-3'>
				{/* Header row */}
				<div className='flex items-center gap-4 py-3 border-b border-base-200'>
					<div className='h-4 w-4 bg-base-300 rounded motion-safe:animate-pulse' />
					<div className='h-4 w-36 bg-base-300 rounded motion-safe:animate-pulse' />
					<div className='h-4 w-32 bg-base-300 rounded motion-safe:animate-pulse' />
					<div className='h-4 w-36 bg-base-300 rounded motion-safe:animate-pulse' />
					<div className='h-4 w-16 bg-base-300 rounded motion-safe:animate-pulse' />
					<div className='h-4 w-28 bg-base-300 rounded motion-safe:animate-pulse hidden lg:block' />
				</div>
				{/* Data rows */}
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
					<div
						key={i}
						className='flex items-center gap-4 py-3'>
						<div className='h-4 w-4 bg-base-200 rounded motion-safe:animate-pulse' />
						<div className='flex items-center gap-2'>
							<div className='h-4 w-4 bg-base-300 rounded motion-safe:animate-pulse' />
							<div className='h-4 w-32 bg-base-200 rounded motion-safe:animate-pulse' />
						</div>
						<div className='flex flex-col gap-1'>
							<div className='h-4 w-28 bg-base-200 rounded motion-safe:animate-pulse' />
							<div className='h-3 w-36 bg-base-100 rounded motion-safe:animate-pulse' />
						</div>
						<div className='h-6 w-24 bg-base-300 rounded motion-safe:animate-pulse font-mono' />
						<div className='h-6 w-16 bg-success/10 rounded-full motion-safe:animate-pulse' />
						<div className='h-4 w-24 bg-base-200 rounded motion-safe:animate-pulse hidden lg:block' />
					</div>
				))}
			</div>

			{/* Pagination skeleton */}
			<div className='mt-4 flex items-center justify-between'>
				<div className='h-4 w-40 bg-base-200 rounded motion-safe:animate-pulse' />
				<div className='flex gap-2'>
					<div className='h-8 w-8 bg-base-200 rounded motion-safe:animate-pulse' />
					<div className='h-8 w-8 bg-base-300 rounded motion-safe:animate-pulse' />
					<div className='h-8 w-8 bg-base-200 rounded motion-safe:animate-pulse' />
				</div>
			</div>
		</div>
	)
}

/**
 * Info banner skeleton
 */
function InfoBannerSkeleton() {
	return (
		<div className='mb-6 card bg-info/5 border border-info/20 p-4'>
			<div className='flex items-start gap-3'>
				<div className='h-5 w-5 bg-info/30 rounded motion-safe:animate-pulse' />
				<div className='flex-1'>
					<div className='h-5 w-56 bg-info/30 rounded motion-safe:animate-pulse mb-2' />
					<div className='h-4 w-full max-w-2xl bg-info/20 rounded motion-safe:animate-pulse' />
				</div>
			</div>
		</div>
	)
}

/**
 * Stats cards skeleton for audit page
 */
function StatsCardsSkeleton() {
	return (
		<div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
			{[1, 2, 3, 4].map((i) => (
				<div
					key={i}
					className='card border border-base-300 p-4'>
					<div className='flex items-center gap-3'>
						<div className='h-9 w-9 bg-base-200 rounded-lg motion-safe:animate-pulse' />
						<div>
							<div className='h-3 w-16 bg-base-200 rounded motion-safe:animate-pulse mb-1' />
							<div className='h-5 w-20 bg-base-300 rounded motion-safe:animate-pulse' />
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

export default function AuditLogLoading() {
	return (
		<div
			className='w-full min-w-0'
			role='status'
			aria-label='Loading audit log'>
			<InternalPageHeader
				title='Permission Audit Log'
				description='Track all permission checks and access attempts in the system'
				loading
			/>

			<InfoBannerSkeleton />
			<StatsCardsSkeleton />
			<DataGridSkeleton />
		</div>
	)
}
