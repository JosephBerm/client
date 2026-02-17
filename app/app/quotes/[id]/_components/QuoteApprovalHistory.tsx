/**
 * QuoteApprovalHistory Component
 *
 * **Story:** Show the approval history and audit trail for a quote.
 * Displays status changes, approvals, rejections, and pricing overrides.
 *
 * **Features:**
 * - Status change timeline from backend audit events
 * - Approval/rejection history with exact event timestamps
 * - User attribution for each action when available
 *
 * @module app/quotes/[id]/_components/QuoteApprovalHistory
 */

'use client'

import { CheckCircle, XCircle, Clock, FileCheck, User, AlertTriangle } from 'lucide-react'

import { formatDate, parseDateOrNow } from '@_lib/dates'

import Card from '@_components/ui/Card'

import { useQuoteActivity } from './hooks/useQuoteActivity'

import type { QuoteActivityLogItem } from './hooks/useQuoteActivity'
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
	const { data: activity = [], isLoading: isActivityLoading } = useQuoteActivity(quote?.id ?? null)

	if (!quote) {
		return null
	}

	const mapActivityToHistoryEntry = (item: QuoteActivityLogItem): HistoryEntry => {
		switch (item.action) {
			case 'QUOTE_CREATED':
				return {
					action: 'Quote Created',
					description: item.actionDetails ?? 'Quote request was submitted',
					timestamp: item.timestamp,
					user: item.userId ?? undefined,
					icon: FileCheck,
					variant: 'info',
				}
			case 'QUOTE_APPROVED':
				return {
					action: 'Approved',
					description: item.actionDetails ?? 'Quote pricing was approved',
					timestamp: item.timestamp,
					user: item.userId ?? undefined,
					icon: CheckCircle,
					variant: 'success',
				}
			case 'QUOTE_REJECTED':
				return {
					action: 'Rejected',
					description: item.actionDetails ?? 'Quote was rejected',
					timestamp: item.timestamp,
					user: item.userId ?? undefined,
					icon: XCircle,
					variant: 'error',
				}
			case 'QUOTE_CONVERTED':
				return {
					action: 'Converted to Order',
					description: item.actionDetails ?? 'Quote was converted to an order',
					timestamp: item.timestamp,
					user: item.userId ?? undefined,
					icon: CheckCircle,
					variant: 'success',
				}
			case 'STATUS_CHANGED':
				return {
					action: 'Status Updated',
					description: item.actionDetails ?? 'Quote status changed',
					timestamp: item.timestamp,
					user: item.userId ?? undefined,
					icon: Clock,
					variant: 'warning',
				}
			default:
				return {
					action: item.action.replaceAll('_', ' '),
					description: item.actionDetails ?? 'Quote activity recorded',
					timestamp: item.timestamp,
					user: item.userId ?? undefined,
					icon: AlertTriangle,
					variant: 'info',
				}
		}
	}

	const historyEntries = activity
		.map(mapActivityToHistoryEntry)
		.sort((a, b) => parseDateOrNow(b.timestamp).getTime() - parseDateOrNow(a.timestamp).getTime())

	if (historyEntries.length === 0) {
		return null
	}

	// Only show to Sales Rep+ roles
	if (!permissions.canUpdate && !permissions.canView) {
		return null
	}

	return (
		<Card
			className={`border border-base-300 bg-base-100 p-6 shadow-sm ${className ?? ''}`}
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
				{isActivityLoading && <p className='text-sm text-base-content/60'>Loading quote activity...</p>}
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
		</Card>
	)
}
