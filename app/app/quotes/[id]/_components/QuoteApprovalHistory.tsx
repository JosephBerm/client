/**
 * QuoteApprovalHistory Component
 *
 * **Story:** Show the approval history and audit trail for a quote.
 * Displays status changes, approvals, rejections, and pricing overrides.
 *
 * **Features:**
 * - Status change timeline
 * - Approval/rejection history
 * - Pricing override records (when backend API available)
 * - User attribution for each action
 * - Timestamp for each event
 *
 * **Note:** Currently displays basic status history from quote data.
 * Full audit trail will be available when backend API is implemented.
 *
 * @module app/quotes/[id]/_components/QuoteApprovalHistory
 */

'use client'

import { useMemo } from 'react'

import { CheckCircle, XCircle, Clock, FileCheck, User, DollarSign } from 'lucide-react'

import { formatDate } from '@_lib/dates'

import type Quote from '@_classes/Quote'
import { QuoteStatus } from '@_classes/Enums'

import Card from '@_components/ui/Card'

import type { QuoteWithPermissionsProps } from './types'

/**
 * Approval history entry interface
 */
interface HistoryEntry {
	action: string
	description: string
	timestamp: Date | string
	user?: string
	icon: typeof CheckCircle
	variant: 'success' | 'error' | 'info' | 'warning'
}

/**
 * QuoteApprovalHistory Component Props
 */
export interface QuoteApprovalHistoryProps extends QuoteWithPermissionsProps {
	/** Additional CSS classes */
	className?: string
}

/**
 * QuoteApprovalHistory Component
 *
 * Displays approval history and audit trail for a quote.
 * Shows status changes and key events in chronological order.
 *
 * @param props - Component props
 * @returns QuoteApprovalHistory component
 */
export default function QuoteApprovalHistory({ quote, permissions, className }: QuoteApprovalHistoryProps) {
	if (!quote) return null

	// Build history entries from quote data
	// TODO: Replace with backend audit trail API when available
	const historyEntries = useMemo<HistoryEntry[]>(() => {
		const entries: HistoryEntry[] = []

		// Quote created
		if (quote.createdAt) {
			entries.push({
				action: 'Quote Created',
				description: 'Quote request was submitted',
				timestamp: quote.createdAt,
				icon: FileCheck,
				variant: 'info',
			})
		}

		// Status changes based on current status
		if (quote.status === QuoteStatus.Read) {
			entries.push({
				action: 'Marked as Read',
				description: 'Quote was reviewed and ownership taken',
				timestamp: quote.createdAt || new Date(),
				user: quote.assignedSalesRepId || undefined,
				icon: CheckCircle,
				variant: 'info',
			})
		}

		if (quote.status === QuoteStatus.Approved) {
			entries.push({
				action: 'Approved',
				description: 'Quote pricing was approved',
				timestamp: quote.createdAt || new Date(),
				icon: CheckCircle,
				variant: 'success',
			})
		}

		if (quote.status === QuoteStatus.Rejected) {
			entries.push({
				action: 'Rejected',
				description: 'Quote was rejected',
				timestamp: quote.createdAt || new Date(),
				icon: XCircle,
				variant: 'error',
			})
		}

		if (quote.status === QuoteStatus.Converted) {
			entries.push({
				action: 'Converted to Order',
				description: 'Quote was converted to an order',
				timestamp: quote.createdAt || new Date(),
				icon: CheckCircle,
				variant: 'success',
			})
		}

		// Sort by timestamp (most recent first)
		return entries.sort((a, b) => {
			const timeA = new Date(a.timestamp).getTime()
			const timeB = new Date(b.timestamp).getTime()
			return timeB - timeA
		})
	}, [quote])

	if (historyEntries.length === 0) {
		return null
	}

	// Only show to Sales Rep+ roles
	if (!permissions.canUpdate && !permissions.canView) {
		return null
	}

	return (
		<Card
			className={`border border-base-300 bg-base-100 p-6 shadow-sm ${className || ''}`}
			data-testid='approval-history'
			data-audit-trail='true'>
			{/* Header */}
			<div className='flex items-center gap-3 mb-6'>
				<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-info/10'>
					<Clock className='h-5 w-5 text-info' />
				</div>
				<div>
					<h3 className='text-lg font-semibold text-base-content'>Approval History</h3>
					<p className='text-sm text-base-content/60 mt-0.5'>Status changes and key events</p>
				</div>
			</div>

			{/* History Timeline */}
			<div className='space-y-4'>
				{historyEntries.map((entry, index) => {
					const Icon = entry.icon
					const variantClasses = {
						success: 'text-success bg-success/10 border-success/20',
						error: 'text-error bg-error/10 border-error/20',
						info: 'text-info bg-info/10 border-info/20',
						warning: 'text-warning bg-warning/10 border-warning/20',
					}

					return (
						<div
							key={index}
							className='flex items-start gap-4 pb-4 border-b border-base-200 last:border-0 last:pb-0'>
							{/* Icon */}
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-lg border shrink-0 ${
									variantClasses[entry.variant]
								}`}>
								<Icon className='h-5 w-5' />
							</div>

							{/* Content */}
							<div className='flex-1 min-w-0'>
								<div className='flex items-start justify-between gap-4 mb-1'>
									<div>
										<p className='font-semibold text-base-content'>{entry.action}</p>
										<p className='text-sm text-base-content/70 mt-0.5'>{entry.description}</p>
									</div>
									<span className='text-xs text-base-content/50 whitespace-nowrap shrink-0'>
										{formatDate(entry.timestamp, 'short')}
									</span>
								</div>
								{entry.user && (
									<div className='flex items-center gap-1.5 mt-2 text-xs text-base-content/60'>
										<User className='h-3 w-3' />
										<span>User: {entry.user}</span>
									</div>
								)}
							</div>
						</div>
					)
				})}
			</div>

			{/* Note about full audit trail */}
			{permissions.canUpdate && (
				<div className='mt-6 p-3 rounded-lg bg-base-200/50 border border-base-200'>
					<p className='text-xs text-base-content/60'>
						<Clock className='h-3 w-3 inline mr-1' />
						Full audit trail with detailed pricing overrides and user actions will be available when backend
						API is implemented.
					</p>
				</div>
			)}
		</Card>
	)
}
