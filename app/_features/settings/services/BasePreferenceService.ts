import { UserSettingsService, type UserSettings } from './UserSettingsService'

/**
 * Base Preference Service
 * 
 * Abstract base class for managing application preferences with system preference detection,
 * localStorage persistence, and DOM attribute application.
 * 
 * **FAANG-Level Pattern:**
 * This implements the Template Method pattern commonly used at Google, Meta, and Amazon
 * for reducing code duplication while maintaining type safety and flexibility.
 * 
 * **Benefits:**
 * - Eliminates code duplication between preference services
 * - Provides consistent API across all preference types
 * - Type-safe with TypeScript generics
 * - SSR-safe with server-side fallbacks
 * - Testable with dependency injection
 * 
 * **Architecture:**
 * - Service Layer Pattern (FAANG standard)
 * - Template Method Pattern for shared logic
 * - Generic types for compile-time safety
 * - Dependency inversion (uses UserSettingsService)
 * 
 * @template T - The type of the preference value
 * @module BasePreferenceService
 */
export abstract class BasePreferenceService<T> {
	/**
	 * The localStorage key for this preference in UserSettings
	 */
	protected abstract readonly settingKey: keyof UserSettings

	/**
	 * The DOM attribute name for this preference
	 */
	protected abstract readonly domAttribute: string

	/**
	 * Default value when no preference is set (server-side)
	 */
	protected abstract readonly defaultValue: T

	/**
	 * Detects the system preference for this setting.
	 * Subclasses must implement to query the appropriate media query.
	 * 
	 * @returns The system-detected preference value
	 */
	protected abstract detectSystemPreference(): T

	/**
	 * Validates a stored preference value.
	 * Subclasses can override to add validation logic.
	 * 
	 * @param value - The value to validate
	 * @returns True if valid, false otherwise
	 */
	protected validateValue(value: unknown): value is T {
		return true // Default: accept any value, subclasses can override
	}

	/**
	 * Serializes the preference value for DOM attribute storage.
	 * 
	 * @param value - The preference value
	 * @returns String representation for DOM attribute
	 */
	protected serializeForDOM(value: T): string {
		return String(value)
	}

	/**
	 * Deserializes a DOM attribute value to the preference type.
	 * 
	 * @param attributeValue - The DOM attribute value
	 * @returns The deserialized preference value, or null if invalid
	 */
	protected abstract deserializeFromDOM(attributeValue: string | null): T | null

	/**
	 * Retrieves the system preference.
	 * 
	 * **SSR Safety:**
	 * Returns default value on the server.
	 * 
	 * @returns The system preference or default value
	 */
	getSystemPreference(): T {
		if (typeof window === 'undefined') {return this.defaultValue}
		return this.detectSystemPreference()
	}

	/**
	 * Retrieves the stored preference from localStorage.
	 * 
	 * **Fallback Chain:**
	 * 1. Stored preference in localStorage (if valid)
	 * 2. System preference
	 * 3. Default value
	 * 
	 * **SSR Safety:**
	 * Returns default value on the server.
	 * 
	 * @returns The stored preference, system preference, or default
	 */
	getStoredPreference(): T {
		if (typeof window === 'undefined') {return this.defaultValue}

		const storedValue = UserSettingsService.getSetting(this.settingKey)
		
		if (storedValue !== undefined && this.validateValue(storedValue)) {
			return storedValue
		}

		// No valid stored preference, return system preference
		return this.getSystemPreference()
	}

	/**
	 * Retrieves the currently applied preference from the DOM.
	 * 
	 * **Fallback Chain:**
	 * 1. DOM attribute value (if valid)
	 * 2. Stored preference from localStorage
	 * 3. System preference
	 * 4. Default value
	 * 
	 * **SSR Safety:**
	 * Returns default value on the server.
	 * 
	 * @returns The currently applied preference
	 */
	getCurrentPreference(): T {
		if (typeof window === 'undefined') {return this.defaultValue}

		const attributeValue = document.documentElement.getAttribute(this.domAttribute)
		const deserializedValue = this.deserializeFromDOM(attributeValue)
		
		if (deserializedValue !== null && this.validateValue(deserializedValue)) {
			return deserializedValue
		}

		// Fallback to stored or system preference
		return this.getStoredPreference()
	}

	/**
	 * Saves the preference to localStorage.
	 * 
	 * Persists the user's choice so it can be restored on subsequent visits.
	 * This method is SSR-safe and will no-op on the server.
	 * 
	 * @param value - The preference value to store
	 */
	setStoredPreference(value: T): void {
		if (typeof window === 'undefined') {return}

		if (!this.validateValue(value)) {
			console.warn(`Invalid preference value for ${this.settingKey}:`, value)
			return
		}

		// Type assertion needed due to TypeScript's limitation with generic keyof
		UserSettingsService.setSetting(this.settingKey, value as any)
	}

	/**
	 * Applies the preference to the document via data attribute.
	 * 
	 * Updates the document's data attribute, which CSS and JavaScript
	 * can use to conditionally apply styles or behavior.
	 * 
	 * This method is SSR-safe and will no-op on the server.
	 * 
	 * @param value - The preference value to apply
	 */
	applyPreference(value: T): void {
		if (typeof window === 'undefined') {return}

		if (!this.validateValue(value)) {
			console.warn(`Invalid preference value for ${this.domAttribute}:`, value)
			return
		}

		document.documentElement.setAttribute(this.domAttribute, this.serializeForDOM(value))
	}

	/**
	 * Initializes the preference on application load.
	 * 
	 * This method should be called once when the application starts to:
	 * 1. Retrieve the stored preference (or use system preference)
	 * 2. Apply it to the document
	 * 3. Return the initialized preference for use in state management
	 * 
	 * **Usage:**
	 * Typically called in the UserSettingsInitializer component or by
	 * the store initialization method.
	 * 
	 * @returns The preference that was initialized and applied
	 */
	initializePreference(): T {
		const preference = this.getStoredPreference()
		this.applyPreference(preference)
		return preference
	}
}

