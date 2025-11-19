/**
 * Contact Information Constants
 * 
 * Centralized configuration for contact page information.
 * Used across contact page components for consistency.
 * 
 * @module contact/contact.constants
 */

/**
 * Contact information configuration
 */
export const CONTACT_INFO = {
	phone: {
		display: '(786) 578-2145',
		href: 'tel:+17865782145',
	},
	email: {
		display: 'support@medsourcepro.com',
		href: 'mailto:support@medsourcepro.com',
	},
	responseTime: '2 hours',
	emergencySupport: '24/7',
} as const

