/**
 * Company Information Constants
 * 
 * Centralized source of truth for MedSource Pro company contact information.
 * Used across the entire application for consistency and easy maintenance.
 * 
 * **FAANG-Level Best Practices:**
 * - Single source of truth: All company contact info in one place
 * - Type safety: TypeScript ensures consistency
 * - Server-safe: Pure data, no side effects, works in Server Components
 * - Easy maintenance: Change once, update everywhere
 * - Barrel exports: Accessible via @_lib import
 * 
 * **Usage:**
 * ```typescript
 * import { COMPANY_CONTACT } from '@_lib'
 * 
 * // In Server Component
 * export default function Page() {
 *   return <a href={COMPANY_CONTACT.phone.href}>{COMPANY_CONTACT.phone.display}</a>
 * }
 * 
 * // In Client Component
 * 'use client'
 * import { COMPANY_CONTACT } from '@_lib'
 * ```
 * 
 * @module lib/constants/company
 */

/**
 * Company contact information configuration
 * 
 * Contains all contact methods, formatted for different use cases:
 * - display: Human-readable format for UI
 * - href: Clickable link format (tel:, mailto:)
 * - formatted: International format for schema.org/structured data
 */
export const COMPANY_CONTACT = {
	/**
	 * Primary phone number
	 * Used for customer support, sales inquiries, and general contact
	 */
	phone: {
		/** Human-readable display format: (786) 571-2819 */
		display: '(786) 571-2819',
		/** Clickable tel: link format: tel:+17865712819 */
		href: 'tel:+17865712819',
		/** International format for schema.org: +1-786-571-2819 */
		formatted: '+1-786-571-2819',
		/** Raw number without formatting: 7865712819 */
		raw: '7865712819',
		/** Country code: +1 (US/Canada) */
		countryCode: '+1',
	} as const,

	/**
	 * Primary support email address
	 * Used for customer support, inquiries, and general contact
	 */
	email: {
		/** Email address: support@medsourcepro.com */
		display: 'support@medsourcepro.com',
		/** Clickable mailto: link format */
		href: 'mailto:support@medsourcepro.com',
		/** Email domain: medsourcepro.com */
		domain: 'medsourcepro.com',
	} as const,

	/**
	 * Support response time expectations
	 * Used in contact sections and customer communications
	 */
	responseTime: {
		/** Standard response time: 2 hours */
		standard: '2 hours',
		/** Emergency support availability: 24/7 */
		emergency: '24/7',
	} as const,
} as const

/**
 * Type export for COMPANY_CONTACT
 * Useful for type checking and autocomplete
 */
export type CompanyContact = typeof COMPANY_CONTACT

