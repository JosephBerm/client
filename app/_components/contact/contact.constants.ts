/**
 * Contact Information Constants
 * 
 * Re-exports company contact information from centralized source.
 * This file maintains backward compatibility for contact page components
 * while delegating to the single source of truth in @_lib.
 * 
 * @deprecated Import directly from @_lib for new code:
 * ```typescript
 * import { COMPANY_CONTACT } from '@_lib'
 * ```
 * 
 * @module contact/contact.constants
 */

import { COMPANY_CONTACT } from '@_lib'

/**
 * Contact information configuration
 * 
 * @deprecated Use COMPANY_CONTACT from @_lib directly
 */
export const CONTACT_INFO = {
	phone: {
		display: COMPANY_CONTACT.phone.display,
		href: COMPANY_CONTACT.phone.href,
	},
	email: {
		display: COMPANY_CONTACT.email.display,
		href: COMPANY_CONTACT.email.href,
	},
	responseTime: COMPANY_CONTACT.responseTime.standard,
	emergencySupport: COMPANY_CONTACT.responseTime.emergency,
} as const

