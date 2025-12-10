/**
 * Analytics Tracking Utility
 * 
 * Centralized analytics and event tracking for user interactions.
 * Built on top of the logger system with support for future analytics platforms
 * (Google Analytics, Mixpanel, Amplitude, etc.)
 * 
 * **Features:**
 * - Event tracking with structured metadata
 * - Conversion funnel tracking
 * - User interaction tracking
 * - Performance metrics
 * - Privacy-compliant (GDPR/CCPA ready)
 * 
 * **FAANG Principles:**
 * - Data-driven decision making (Meta, Google)
 * - Structured event taxonomy (Airbnb, Uber)
 * - Privacy-first tracking (Apple, Google)
 * - Type-safe events (TypeScript best practices)
 * 
 * @module shared/utils/analytics
 */

import { logger } from '@_core'

/**
 * Standard event categories for consistent tracking
 */
export enum EventCategory {
	/** Page navigation and views */
	NAVIGATION = 'navigation',
	/** User authentication events */
	AUTH = 'auth',
	/** Contact and lead generation */
	CONTACT = 'contact',
	/** E-commerce and cart events */
	ECOMMERCE = 'ecommerce',
	/** User engagement (clicks, scrolls, etc.) */
	ENGAGEMENT = 'engagement',
	/** Form interactions */
	FORM = 'form',
	/** Search interactions */
	SEARCH = 'search',
	/** Error and exception tracking */
	ERROR = 'error',
}

/**
 * Standard event actions for consistent naming
 */
export enum EventAction {
	/** User clicked something */
	CLICK = 'click',
	/** User submitted a form */
	SUBMIT = 'submit',
	/** User viewed something */
	VIEW = 'view',
	/** User started an action */
	START = 'start',
	/** User completed an action */
	COMPLETE = 'complete',
	/** User cancelled an action */
	CANCEL = 'cancel',
	/** Generic error occurred */
	ERROR = 'error',
	/** User scrolled to a section */
	SCROLL = 'scroll',
}

/**
 * Event metadata interface
 */
export interface EventMetadata {
	/** Event category */
	category: EventCategory
	/** Event action */
	action: EventAction
	/** Event label (descriptive name) */
	label: string
	/** Event value (numeric, e.g., order amount, duration) */
	value?: number
	/** Additional custom properties */
	properties?: Record<string, any>
	/** User ID (if authenticated) */
	userId?: string
	/** Session ID */
	sessionId?: string
	/** Page URL */
	url?: string
	/** Referrer URL */
	referrer?: string
}

/**
 * Contact-specific event metadata
 */
export interface ContactEventMetadata extends Omit<EventMetadata, 'category'> {
	category: EventCategory.CONTACT
	/** Contact method (phone, email, form, chat) */
	contactMethod?: 'phone' | 'email' | 'form' | 'chat' | 'consultation'
	/** CTA location on page */
	ctaLocation?: string
	/** A/B test variant (if applicable) */
	variant?: string
}

/**
 * Track a generic analytics event
 * 
 * @param {string} eventName - Name of the event
 * @param {EventMetadata} metadata - Event metadata
 * 
 * @example
 * ```typescript
 * trackEvent('cta_clicked', {
 *   category: EventCategory.ENGAGEMENT,
 *   action: EventAction.CLICK,
 *   label: 'Schedule Consultation',
 *   properties: { location: 'contact_section' }
 * });
 * ```
 */
export function trackEvent(eventName: string, metadata: EventMetadata): void {
	// Log to internal logger
	logger.info(`Analytics Event: ${eventName}`, {
		component: 'Analytics',
		action: 'track_event',
		data: {
			eventName,
			...metadata,
			timestamp: new Date().toISOString(),
			url: typeof window !== 'undefined' ? window.location.href : undefined,
			referrer: typeof window !== 'undefined' ? document.referrer : undefined,
		},
	})

	// Future: Send to external analytics platforms
	// if (typeof window !== 'undefined' && window.gtag) {
	//   window.gtag('event', eventName, {
	//     event_category: metadata.category,
	//     event_label: metadata.label,
	//     value: metadata.value,
	//     ...metadata.properties
	//   });
	// }

	// Future: Send to Mixpanel, Amplitude, etc.
	// if (typeof window !== 'undefined' && window.mixpanel) {
	//   window.mixpanel.track(eventName, metadata);
	// }
}

/**
 * Track contact CTA clicks
 * 
 * @param {string} ctaName - Name of the CTA button/link
 * @param {Partial<ContactEventMetadata>} metadata - Additional metadata
 * 
 * @example
 * ```typescript
 * trackContactCTA('Schedule Consultation', {
 *   action: EventAction.CLICK,
 *   contactMethod: 'consultation',
 *   ctaLocation: 'hero_section'
 * });
 * ```
 */
export function trackContactCTA(
	ctaName: string,
	metadata: Partial<ContactEventMetadata> = {}
): void {
	trackEvent('contact_cta_clicked', {
		category: EventCategory.CONTACT,
		action: EventAction.CLICK,
		label: ctaName,
		...metadata,
	})
}

/**
 * Track phone number clicks
 * 
 * @param {string} phoneNumber - Phone number clicked
 * @param {string} location - Location on page where click occurred
 * 
 * @example
 * ```typescript
 * trackPhoneClick('(786) 578-2145', 'contact_section');
 * ```
 */
export function trackPhoneClick(phoneNumber: string, location: string): void {
	trackContactCTA('Phone Call', {
		action: EventAction.CLICK,
		contactMethod: 'phone',
		ctaLocation: location,
		properties: {
			phoneNumber,
		},
	})
}

/**
 * Track email clicks
 * 
 * @param {string} email - Email address clicked
 * @param {string} location - Location on page where click occurred
 * 
 * @example
 * ```typescript
 * trackEmailClick('support@medsourcepro.com', 'contact_section');
 * ```
 */
export function trackEmailClick(email: string, location: string): void {
	trackContactCTA('Email Click', {
		action: EventAction.CLICK,
		contactMethod: 'email',
		ctaLocation: location,
		properties: {
			email,
		},
	})
}

/**
 * Track form submissions
 * 
 * @param {string} formName - Name of the form
 * @param {boolean} success - Whether submission was successful
 * @param {Record<string, any>} formData - Non-PII form data for tracking
 * 
 * @example
 * ```typescript
 * trackFormSubmission('contact_form', true, {
 *   hasMessage: true,
 *   hasPhone: false
 * });
 * ```
 */
export function trackFormSubmission(
	formName: string,
	success: boolean,
	formData?: Record<string, any>
): void {
	trackEvent(success ? 'form_submitted' : 'form_error', {
		category: EventCategory.FORM,
		action: success ? EventAction.COMPLETE : EventAction.ERROR,
		label: formName,
		properties: {
			success,
			...formData,
		},
	})
}

/**
 * Track form field interactions
 * 
 * @param {string} formName - Name of the form
 * @param {string} fieldName - Name of the field
 * @param {string} action - Action performed ('focus', 'blur', 'change')
 * 
 * @example
 * ```typescript
 * trackFormField('contact_form', 'email', 'focus');
 * ```
 */
export function trackFormField(
	formName: string,
	fieldName: string,
	action: 'focus' | 'blur' | 'change'
): void {
	trackEvent('form_field_interaction', {
		category: EventCategory.FORM,
		action: EventAction.CLICK,
		label: `${formName}:${fieldName}`,
		properties: {
			formName,
			fieldName,
			interactionType: action,
		},
	})
}

/**
 * Track page views
 * 
 * @param {string} pageName - Name of the page
 * @param {Record<string, any>} properties - Additional page properties
 * 
 * @example
 * ```typescript
 * trackPageView('Contact Page', { section: 'contact' });
 * ```
 */
export function trackPageView(pageName: string, properties?: Record<string, any>): void {
	trackEvent('page_view', {
		category: EventCategory.NAVIGATION,
		action: EventAction.VIEW,
		label: pageName,
		properties,
	})
}

/**
 * Track scroll depth
 * 
 * @param {number} depth - Scroll depth percentage (0-100)
 * @param {string} section - Section name (if applicable)
 * 
 * @example
 * ```typescript
 * trackScrollDepth(75, 'contact_section');
 * ```
 */
export function trackScrollDepth(depth: number, section?: string): void {
	trackEvent('scroll_depth', {
		category: EventCategory.ENGAGEMENT,
		action: EventAction.SCROLL,
		label: section || 'page',
		value: Math.round(depth),
		properties: {
			depth: Math.round(depth),
			section,
		},
	})
}

/**
 * Track conversion events
 * 
 * @param {string} conversionName - Name of the conversion
 * @param {number} value - Conversion value (e.g., order amount)
 * @param {Record<string, any>} properties - Additional conversion properties
 * 
 * @example
 * ```typescript
 * trackConversion('consultation_scheduled', 0, {
 *   source: 'contact_page',
 *   method: 'form'
 * });
 * ```
 */
export function trackConversion(
	conversionName: string,
	value?: number,
	properties?: Record<string, any>
): void {
	trackEvent('conversion', {
		category: EventCategory.ECOMMERCE,
		action: EventAction.COMPLETE,
		label: conversionName,
		value,
		properties,
	})
}

/**
 * Track errors for debugging and monitoring
 * 
 * @param {string} errorName - Name/type of the error
 * @param {Error | string} error - Error object or message
 * @param {Record<string, any>} context - Additional error context
 * 
 * @example
 * ```typescript
 * trackError('form_validation_failed', error, {
 *   formName: 'contact_form',
 *   field: 'email'
 * });
 * ```
 */
export function trackError(
	errorName: string,
	error: Error | string,
	context?: Record<string, any>
): void {
	trackEvent('error_occurred', {
		category: EventCategory.ERROR,
		action: EventAction.ERROR,
		label: errorName,
		properties: {
			errorMessage: typeof error === 'string' ? error : error.message,
			errorStack: typeof error === 'string' ? undefined : error.stack,
			...context,
		},
	})
}

/**
 * Create a performance timer for tracking operation duration
 * 
 * @param {string} operationName - Name of the operation to time
 * @returns {Function} Function to call when operation completes
 * 
 * @example
 * ```typescript
 * const endTimer = trackPerformance('api_call');
 * await fetchData();
 * endTimer(); // Automatically logs duration
 * ```
 */
export function trackPerformance(operationName: string): () => void {
	const startTime = performance.now()

	return () => {
		const duration = performance.now() - startTime

		trackEvent('performance_timing', {
			category: EventCategory.ENGAGEMENT,
			action: EventAction.COMPLETE,
			label: operationName,
			value: Math.round(duration),
			properties: {
				operation: operationName,
				duration: Math.round(duration),
				durationMs: duration,
			},
		})
	}
}

/**
 * Batch multiple events together for efficient tracking
 * Useful for tracking multiple related events at once
 * 
 * @param {Array<{name: string, metadata: EventMetadata}>} events - Array of events to track
 * 
 * @example
 * ```typescript
 * trackBatch([
 *   { name: 'form_started', metadata: {...} },
 *   { name: 'field_focused', metadata: {...} },
 * ]);
 * ```
 */
export function trackBatch(events: Array<{ name: string; metadata: EventMetadata }>): void {
	events.forEach(({ name, metadata }) => trackEvent(name, metadata))
}

/**
 * Initialize analytics with user context
 * Call this on app load or after user authentication
 * 
 * @param {object} context - User context
 * 
 * @example
 * ```typescript
 * initializeAnalytics({
 *   userId: 'user-123',
 *   email: 'user@example.com',
 *   plan: 'enterprise'
 * });
 * ```
 */
export function initializeAnalytics(context: {
	userId?: string
	email?: string
	[key: string]: any
}): void {
	logger.info('Analytics initialized', {
		component: 'Analytics',
		action: 'initialize',
		data: context,
	})

	// Future: Set user properties in analytics platforms
	// if (typeof window !== 'undefined' && window.gtag) {
	//   window.gtag('set', 'user_properties', context);
	// }
}

