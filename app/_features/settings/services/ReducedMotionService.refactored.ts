import { BasePreferenceService } from './BasePreferenceService'

/**
 * Reduced Motion Service
 * 
 * Manages reduced motion preferences and application to the document.
 * Extends BasePreferenceService for DRY code and consistent API.
 * 
 * **Responsibilities:**
 * - Detecting system reduced motion preference
 * - Persisting reduced motion preference via UserSettingsService
 * - Applying preference to document via data-reduced-motion attribute
 * - Providing preference initialization on app load
 * 
 * **FAANG-Level Improvements:**
 * - Extends BasePreferenceService (eliminates 80+ lines of duplication)
 * - Template Method pattern for shared logic
 * - Type-safe with TypeScript generics
 * - Consistent with other preference services
 * 
 * **Preference Mapping:**
 * - **System preference enabled** → Reduced motion enabled
 * - **System preference disabled** → Full motion enabled
 * - **User override** → User's explicit choice
 * 
 * @module ReducedMotionService
 * @see {@link BasePreferenceService} - Base class with shared logic
 * @see {@link useUserSettingsStore} - Store that uses this service
 */
class ReducedMotionServiceClass extends BasePreferenceService<boolean> {
	protected readonly settingKey = 'prefersReducedMotion' as const
	protected readonly domAttribute = 'data-reduced-motion'
	protected readonly defaultValue = false

	/**
	 * Detects the system reduced motion preference.
	 */
	protected detectSystemPreference(): boolean {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches
	}

	/**
	 * Validates that a value is a boolean.
	 */
	protected validateValue(value: unknown): value is boolean {
		return typeof value === 'boolean'
	}

	/**
	 * Deserializes a DOM attribute value to a boolean.
	 */
	protected deserializeFromDOM(attributeValue: string | null): boolean | null {
		if (attributeValue === null) {return null}
		if (attributeValue === 'true') {return true}
		if (attributeValue === 'false') {return false}
		return null
	}
}

// Export singleton instance (FAANG pattern: single instance for stateless service)
export const ReducedMotionService = new ReducedMotionServiceClass()

