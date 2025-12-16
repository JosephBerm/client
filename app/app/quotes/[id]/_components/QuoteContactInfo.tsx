/**
 * QuoteContactInfo Component
 * 
 * **Story:** Shows who submitted this quote and how to contact them.
 * Reuses contact display pattern from AccountOverview component.
 * 
 * **Reuses:**
 * - Contact display pattern from AccountOverview
 * - COMPANY_CONTACT from @_lib (for fallback phone number)
 * - Card, icons from existing UI components
 * 
 * **Features:**
 * - Email with mailto link
 * - Phone with tel link (uses COMPANY_CONTACT if quote phone missing)
 * - Company name
 * - Delivery address
 * 
 * @module app/quotes/[id]/_components/QuoteContactInfo
 */

'use client'

import { Mail, Phone, Building2, MapPin } from 'lucide-react'

import { COMPANY_CONTACT } from '@_lib'

import type Quote from '@_classes/Quote'

import Card from '@_components/ui/Card'

import type { QuoteComponentProps } from './types'

/**
 * QuoteContactInfo Component Props
 */
export interface QuoteContactInfoProps extends QuoteComponentProps {
	/** Formatted contact name */
	contactName: string
	/** Formatted address string */
	formattedAddress: string
}

/**
 * QuoteContactInfo Component
 * 
 * Displays customer contact information for the quote.
 * Reuses the contact display pattern from AccountOverview for consistency.
 * 
 * @param props - Component props
 * @returns QuoteContactInfo component
 */
export default function QuoteContactInfo({
	quote,
	contactName,
	formattedAddress,
}: QuoteContactInfoProps) {
	if (!quote) return null

	// Use COMPANY_CONTACT for fallback phone (centralized constant)
	const phoneNumber = quote.phoneNumber || COMPANY_CONTACT.phone.raw
	const phoneHref = quote.phoneNumber
		? `tel:${quote.phoneNumber.replace(/\D/g, '')}`
		: COMPANY_CONTACT.phone.href

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm animate-elegant-reveal">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
					<Building2 className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h2 className="text-xl font-semibold text-base-content">{contactName}</h2>
					{quote.companyName && (
						<p className="text-sm text-base-content/60 mt-0.5">{quote.companyName}</p>
					)}
				</div>
			</div>

			{/* Description */}
			{quote.description && (
				<p className="text-sm text-base-content/70 mb-6 leading-relaxed">{quote.description}</p>
			)}

			{/* Contact Information Grid */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* Email */}
				<div className="flex items-start gap-3 p-3 rounded-lg bg-base-200/30 border border-base-200 hover:bg-base-200/50 transition-colors">
					<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
						<Mail className="h-4 w-4 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-xs font-medium uppercase tracking-wide text-base-content/60 mb-1">
							Email
						</p>
						{quote.emailAddress ? (
							<a
								href={`mailto:${quote.emailAddress}`}
								className="link link-primary text-sm font-medium truncate block"
								title={quote.emailAddress}
							>
								{quote.emailAddress}
							</a>
						) : (
							<p className="text-sm text-base-content/50">No email provided</p>
						)}
					</div>
				</div>

				{/* Phone */}
				<div className="flex items-start gap-3 p-3 rounded-lg bg-base-200/30 border border-base-200 hover:bg-base-200/50 transition-colors">
					<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
						<Phone className="h-4 w-4 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-xs font-medium uppercase tracking-wide text-base-content/60 mb-1">
							Phone
						</p>
						<a
							href={phoneHref}
							className="link link-primary text-sm font-medium block"
							title={phoneNumber}
						>
							{quote.phoneNumber || COMPANY_CONTACT.phone.display}
						</a>
					</div>
				</div>

				{/* Company */}
				{quote.companyName && (
					<div className="flex items-start gap-3 p-3 rounded-lg bg-base-200/30 border border-base-200">
						<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
							<Building2 className="h-4 w-4 text-primary" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-medium uppercase tracking-wide text-base-content/60 mb-1">
								Company
							</p>
							<p className="text-sm font-medium text-base-content truncate" title={quote.companyName}>
								{quote.companyName}
							</p>
						</div>
					</div>
				)}

				{/* Address */}
				<div className="flex items-start gap-3 p-3 rounded-lg bg-base-200/30 border border-base-200">
					<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
						<MapPin className="h-4 w-4 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-xs font-medium uppercase tracking-wide text-base-content/60 mb-1">
							Delivery Address
						</p>
						<p className="text-sm text-base-content/80 leading-relaxed" title={formattedAddress}>
							{formattedAddress}
						</p>
					</div>
				</div>
			</div>
		</Card>
	)
}

