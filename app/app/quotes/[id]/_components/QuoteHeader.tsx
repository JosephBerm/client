/**
 * QuoteHeader Component
 * 
 * **Story:** The quote's identity card - shows status, priority, and key dates.
 * Always visible to all roles, but with different detail levels.
 * 
 * **Reuses:**
 * - QuoteStatusHelper (existing)
 * - QuoteStatusBadge (created in Phase 1, following OrderStatusBadge pattern)
 * - Badge, Card (existing UI components)
 * - formatDate (existing utility)
 * 
 * **Customer View:** Simple status badge + creation date
 * **SalesRep+ View:** Full status, priority, expiration, SLA tracking
 * 
 * @module app/quotes/[id]/_components/QuoteHeader
 */

'use client'

import { Clock, AlertCircle, FileText, Calendar, Zap } from 'lucide-react'

import { formatDate } from '@_lib/dates'

import QuoteStatusHelper from '@_classes/Helpers/QuoteStatusHelper'
import type Quote from '@_classes/Quote'
import { QuoteStatus, QuotePriority } from '@_classes/Enums'

import { QuoteStatusBadge } from '@_components/common'
import Badge from '@_components/ui/Badge'
import Card from '@_components/ui/Card'

import type { QuoteWithPermissionsProps } from './types'

/**
 * QuoteHeader Component Props
 */
export interface QuoteHeaderProps extends QuoteWithPermissionsProps {
	/** Formatted creation date string */
	formattedCreatedDate: string
}

/**
 * QuoteHeader Component
 * 
 * Displays quote identity information: status, priority, creation date, and expiration.
 * Uses QuoteStatusHelper for status metadata (DRY - no duplicate STATUS_CONFIG).
 * 
 * @param props - Component props
 * @returns QuoteHeader component
 */
export default function QuoteHeader({ quote, permissions, formattedCreatedDate }: QuoteHeaderProps) {
	if (!quote) return null

	// Use QuoteStatusHelper (existing - no duplicate STATUS_CONFIG!)
	const statusMeta = QuoteStatusHelper.getMetadata(quote.status)

	// Calculate expiration info
	const isExpired = quote.validUntil ? quote.validUntil.getTime() < Date.now() : false
	const daysUntilExpiry = quote.validUntil
		? Math.ceil((quote.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
		: null

	// Priority badge configuration
	const getPriorityBadge = () => {
		if (!permissions.canUpdate) return null
		
		const priorityConfig = {
			[QuotePriority.Standard]: { label: 'Standard', variant: 'neutral' as const, icon: Clock },
			[QuotePriority.High]: { label: 'High', variant: 'warning' as const, icon: Zap },
			[QuotePriority.Urgent]: { label: 'Urgent', variant: 'error' as const, icon: AlertCircle },
		}
		
		const config = priorityConfig[quote.priority ?? QuotePriority.Standard]
		if (!config) return null
		
		const Icon = config.icon
		return (
			<Badge variant={config.variant} size="sm" className="flex items-center gap-1.5">
				<Icon className="h-3 w-3" />
				{config.label} Priority
			</Badge>
		)
	}

	// SLA display
	const getSLADisplay = () => {
		if (!permissions.canUpdate) return null
		
		const slaMap = {
			[QuotePriority.Urgent]: '4 hours',
			[QuotePriority.High]: '24 hours',
			[QuotePriority.Standard]: '48 hours',
		}
		
		const sla = slaMap[quote.priority ?? QuotePriority.Standard]
		return (
			<div className="flex items-center gap-2 text-sm text-base-content/70">
				<Clock className="h-4 w-4 text-base-content/50" />
				<span>SLA: {sla}</span>
			</div>
		)
	}

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm animate-elegant-reveal">
			{/* Header Section - Status, Priority, Date */}
			<div className="flex flex-wrap items-start justify-between gap-4 mb-6">
				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-3 mb-3">
						<QuoteStatusBadge status={quote.status} />
						{getPriorityBadge()}
					</div>
					<div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-base-content/50" />
							<span>Requested {formattedCreatedDate}</span>
						</div>
						{getSLADisplay()}
					</div>
				</div>
			</div>

			{/* Description */}
			{quote.description && (
				<div className="mb-6 p-4 rounded-lg bg-base-200/50 border border-base-200">
					<div className="flex items-start gap-3">
						<FileText className="h-4 w-4 text-base-content/60 mt-0.5 shrink-0" />
						<p className="text-sm text-base-content/80 leading-relaxed">{quote.description}</p>
					</div>
				</div>
			)}

			{/* Additional Info (SalesRep+ only) */}
			{permissions.canUpdate && (
				<div className="space-y-4 pt-4 border-t border-base-200">
					{/* Expiration Warning */}
					{quote.validUntil && (
						<div className={`flex items-center gap-3 p-3 rounded-lg ${
							isExpired 
								? 'bg-error/10 border border-error/20' 
								: daysUntilExpiry !== null && daysUntilExpiry <= 7
								? 'bg-warning/10 border border-warning/20'
								: 'bg-base-200/50 border border-base-200'
						}`}>
							{isExpired ? (
								<>
									<AlertCircle className="h-5 w-5 text-error shrink-0" />
									<div className="flex-1">
										<p className="text-sm font-semibold text-error">Quote Expired</p>
										<p className="text-xs text-base-content/60 mt-0.5">
											Expired {formatDate(quote.validUntil, 'long')}
										</p>
									</div>
								</>
							) : daysUntilExpiry !== null && daysUntilExpiry <= 7 ? (
								<>
									<Clock className="h-5 w-5 text-warning shrink-0" />
									<div className="flex-1">
										<p className="text-sm font-semibold text-warning">
											Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
										</p>
										<p className="text-xs text-base-content/60 mt-0.5">
											Valid until {formatDate(quote.validUntil, 'long')}
										</p>
									</div>
								</>
							) : daysUntilExpiry !== null ? (
								<>
									<Clock className="h-5 w-5 text-base-content/50 shrink-0" />
									<div className="flex-1">
										<p className="text-sm font-medium text-base-content">
											Valid until {formatDate(quote.validUntil, 'long')}
										</p>
										<p className="text-xs text-base-content/60 mt-0.5">
											{daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'} remaining
										</p>
									</div>
								</>
							) : null}
						</div>
					)}

					{/* Status Description (if SalesRep+) */}
					{statusMeta && (
						<div className="rounded-xl border border-base-200 bg-linear-to-br from-base-100 to-base-200/30 p-4">
							<h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-2">
								Status Information
							</h3>
							<p className="text-base font-semibold text-base-content mb-1">{statusMeta.display}</p>
							<p className="text-sm text-base-content/70 leading-relaxed">{statusMeta.description}</p>
						</div>
					)}
				</div>
			)}
		</Card>
	)
}

