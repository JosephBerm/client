'use client'

import React from 'react'

import { useRouter } from 'next/navigation'


import { Routes } from '@_features/navigation'

import { formatDate } from '@_lib/dates'


import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../../_components'

import {
	useQuoteDetails,
	useQuotePermissions,
	useQuoteActions,
	useAutoMarkQuoteAsRead,
	QuoteHeader,
	QuoteContactInfo,
	QuoteProducts,
	QuoteActions,
	QuoteAssignment,
} from './_components'

export default function QuoteDetailsPage() {
	const router = useRouter()

	// Use custom hooks for data fetching and permissions (Phase 1)
	const { quote, isLoading, error, refresh } = useQuoteDetails()
	const permissions = useQuotePermissions(quote)
	
	// Get quote actions for auto-mark-as-read functionality
	const { handleMarkAsRead } = useQuoteActions(quote, permissions, refresh)
	
	// Auto-mark quote as Read when assigned sales rep opens Unread quote
	useAutoMarkQuoteAsRead({
		quote,
		permissions,
		handleMarkAsRead,
		isLoading,
	})

	// Early return if no permission to view
	if (!isLoading && quote && !permissions.canView) {
		return (
			<>
				<InternalPageHeader
					title="Access Denied"
					description="You do not have permission to view this quote."
					loading={false}
				/>
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<p className="text-base-content/70">
						You do not have permission to view this quote. Please contact your administrator if you believe this is an error.
					</p>
					<Button variant="ghost" onClick={() => router.push(Routes.Quotes.location)} className="mt-4">
						Back to Quotes
					</Button>
				</Card>
			</>
		)
	}

	// Show error state if fetch failed
	if (error) {
		return (
			<>
				<InternalPageHeader
					title="Error Loading Quote"
					description={error}
					loading={false}
				/>
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<p className="text-base-content/70">{error}</p>
					<Button variant="ghost" onClick={() => router.push(Routes.Quotes.location)} className="mt-4">
						Back to Quotes
					</Button>
				</Card>
			</>
		)
	}

	// Phase 3: Actions moved to useQuoteActions hook and QuoteActions component

	// Contact name (React Compiler auto-memoizes)
	const contactName = (() => {
		if (!quote?.name) {
			return 'Quote contact'
		}
		const name = quote.name as { first?: string; middle?: string; last?: string }
		return [name.first, name.middle, name.last].filter(Boolean).join(' ') || 'Quote contact'
	})()

	// Created date is already parsed in Quote class constructor
	const formattedCreatedDate = formatDate(quote?.createdAt, 'long')

	// Format address for QuoteContactInfo component
	const address = quote?.transitDetails
	const formattedAddress = address
		? [address.addressOne, address.city, address.state, address.zipCode, address.country]
				.filter(Boolean)
				.join(', ')
		: 'No address provided'

	return (
		<>
			<InternalPageHeader
				title="Quote Details"
				description="Review quote request details and convert to an order when ready."
				loading={isLoading}
				actions={
					<Button variant="ghost" onClick={() => router.back()}>
						Back
					</Button>
				}
			/>

			{quote && (
				<div className="space-y-8">
					{/* Phase 2: Core Components - Composed Layout */}
					<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
						{/* Left Column: Quote Info */}
						<div className="space-y-6">
							<QuoteHeader
								quote={quote}
								permissions={permissions}
								formattedCreatedDate={formattedCreatedDate}
							/>
							<QuoteContactInfo
								quote={quote}
								contactName={contactName}
								formattedAddress={formattedAddress}
							/>
						</div>

						{/* Right Column: Actions & Assignment (Phases 3 & 4) */}
						<div className="space-y-6">
							<QuoteActions quote={quote} permissions={permissions} onRefresh={refresh} />
							<QuoteAssignment quote={quote} permissions={permissions} onRefresh={refresh} />
						</div>
					</div>

					{/* Products Section */}
					<QuoteProducts quote={quote} />
				</div>
			)}
		</>
	)
}
