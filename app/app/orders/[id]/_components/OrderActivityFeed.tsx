/**
 * OrderActivityFeed Component
 *
 * Activity feed sourced from commerce event logs with a fallback to timestamps.
 *
 * @module app/orders/[id]/_components/OrderActivityFeed
 */

'use client'

import { useMemo } from 'react'

import { formatDate } from '@_shared'
import { parseDateSafe } from '@_lib/dates'

import type Order from '@_classes/Order'

import Card from '@_components/ui/Card'

import { useOrderActivity } from './hooks'

export interface OrderActivityFeedProps {
	order: Order
}

interface ActivityEntry {
	label: string
	timestamp: Date
}

export function OrderActivityFeed({ order }: OrderActivityFeedProps) {
	const { data: activityLogs, isLoading } = useOrderActivity(order.id)

	const entries = useMemo(() => {
		if (activityLogs && activityLogs.length > 0) {
			return mapAuditEntries(activityLogs)
		}
		return buildFallbackEntries(order)
	}, [activityLogs, order])

	return (
		<Card className="border border-base-200 bg-base-100 p-6 shadow-sm">
			<h3 className="text-sm font-semibold uppercase text-base-content/60 mb-4">
				Activity Feed
			</h3>

			{isLoading ? (
				<p className="text-sm text-base-content/60">Loading activity...</p>
			) : entries.length === 0 ? (
				<p className="text-sm text-base-content/60">No activity yet.</p>
			) : (
				<ul className="space-y-4">
					{entries.map((entry) => (
						<li key={`${entry.label}-${entry.timestamp.toISOString()}`} className="flex gap-3">
							<div className="mt-1 h-2 w-2 rounded-full bg-primary/60" aria-hidden="true" />
							<div className="flex-1">
								<p className="text-sm text-base-content">{entry.label}</p>
								<p className="text-xs text-base-content/60">
									<time dateTime={entry.timestamp.toISOString()}>
										{formatDate(entry.timestamp, 'datetime')}
									</time>
								</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</Card>
	)
}

function buildFallbackEntries(order: Order): ActivityEntry[] {
	const candidates: Array<ActivityEntry | null> = [
		order.createdAt ? { label: 'Order placed', timestamp: order.createdAt } : null,
		order.paymentConfirmedAt
			? { label: 'Payment confirmed', timestamp: order.paymentConfirmedAt }
			: null,
		order.processingAt ? { label: 'Order moved to processing', timestamp: order.processingAt } : null,
		order.shippedAt ? { label: 'Order shipped', timestamp: order.shippedAt } : null,
		order.deliveredAt ? { label: 'Order delivered', timestamp: order.deliveredAt } : null,
		order.cancelledAt ? { label: 'Order cancelled', timestamp: order.cancelledAt } : null,
	]

	return candidates
		.filter((entry): entry is ActivityEntry => entry != null)
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

function mapAuditEntries(logs: Array<{ action: string; actionDetails?: string | null; timestamp: string }>): ActivityEntry[] {
	return logs
		.map((log) => {
			const timestamp = parseDateSafe(log.timestamp)
			if (!timestamp) {
				return null
			}
			return {
				label: getActionLabel(log.action, log.actionDetails),
				timestamp,
			}
		})
		.filter((entry): entry is ActivityEntry => entry != null)
}

function getActionLabel(action: string, details?: string | null): string {
	switch (action) {
		case 'QUOTE_CREATED':
			return 'Quote created'
		case 'QUOTE_APPROVED':
			return 'Quote approved'
		case 'QUOTE_CONVERTED':
			return 'Quote converted to order'
		case 'QUOTE_REJECTED':
			return 'Quote rejected'
		case 'QUOTE_EXPIRED':
			return 'Quote expired'
		case 'ORDER_CREATED':
			return 'Order created'
		case 'PAYMENT_CONFIRMED':
			return 'Payment confirmed'
		case 'STATUS_CHANGED':
			return details ? `Status updated (${details})` : 'Status updated'
		case 'TRACKING_ADDED':
			return details ? `Tracking added (${details})` : 'Tracking added'
		case 'DELIVERED':
			return 'Order delivered'
		case 'CANCELLED':
			return details ? `Order cancelled (${details})` : 'Order cancelled'
		case 'CANCELLATION_REQUESTED':
			return details ? `Cancellation requested (${details})` : 'Cancellation requested'
		default:
			return details ? `${action}: ${details}` : action
	}
}

export default OrderActivityFeed
