/**
 * Person Name Entity Class
 * 
 * Represents a person's full name with utility methods for formatting and validation.
 * Used throughout the application for user names, contact names, and personnel records.
 * Provides multiple formatting options for different display contexts.
 * 
 * **Features:**
 * - Multiple name formats (First Last, Last First, etc.)
 * - Initials generation
 * - Name validation
 * - Optional title and suffix support
 * - Type-safe with TypeScript
 * 
 * @example
 * ```typescript
 * // Create a name
 * const name = new Name({
 *   first: 'John',
 *   middle: 'Q',
 *   last: 'Doe',
 *   title: 'Dr.',
 *   suffix: 'Jr.'
 * });
 * 
 * // Get formatted versions
 * name.getFullName(); // "John Q Doe"
 * name.getFormattedName('lastFirst'); // "Doe, John"
 * name.getInitials(); // "JQD"
 * 
 * // Validate
 * name.validateName(); // true
 * ```
 */
export default class Name {
	/** First (given) name */
	public first: string = ''
	
	/** Middle name or initial (optional) */
	public middle?: string = ''
	
	/** Last (family) name */
	public last: string = ''
	
	/** Title/prefix (e.g., Dr., Mr., Ms.) (optional) */
	public title?: string = ''
	
	/** Suffix (e.g., Jr., Sr., III) (optional) */
	public suffix?: string = ''

	/**
	 * Creates a new Name instance.
	 * Accepts partial object for flexible initialization.
	 * 
	 * @param {Partial<Name>} param - Partial name data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Full name
	 * const name1 = new Name({ first: 'John', last: 'Doe' });
	 * 
	 * // With middle name
	 * const name2 = new Name({ first: 'Jane', middle: 'Elizabeth', last: 'Smith' });
	 * 
	 * // With title and suffix
	 * const name3 = new Name({
	 *   title: 'Dr.',
	 *   first: 'James',
	 *   last: 'Wilson',
	 *   suffix: 'Jr.'
	 * });
	 * ```
	 */
	constructor(param?: Partial<Name>) {
		if (param) {
			Object.assign(this, param)
		}
	}

	/**
	 * Converts name to string representation.
	 * Default format: "Last, First"
	 * 
	 * @returns {string} Formatted name string
	 * 
	 * @example
	 * ```typescript
	 * import { logger } from '@_core';
	 * 
	 * const name = new Name({ first: 'John', last: 'Doe' });
	 * logger.debug('Name formatted', { formatted: name.toString() }); // "Doe, John"
	 * String(name); // "Doe, John"
	 * ```
	 */
	public toString = (): string => {
		return this.getFormattedName('lastFirst')
	}

	/**
	 * Generates initials from the name.
	 * Includes first, middle (if present), and last name initials.
	 * 
	 * @returns {string} Uppercase initials (e.g., "JQD")
	 * 
	 * @example
	 * ```typescript
	 * new Name({ first: 'John', middle: 'Q', last: 'Doe' }).getInitials(); // "JQD"
	 * new Name({ first: 'Jane', last: 'Smith' }).getInitials(); // "JS"
	 * new Name({ first: 'Bob', middle: '', last: 'Jones' }).getInitials(); // "BJ"
	 * ```
	 */
	public getInitials = (): string => {
		// Get first initial
		let initials = this.first.charAt(0).toUpperCase()
		
		// Add middle initial if present
		if (this.middle) initials += this.middle.charAt(0).toUpperCase()
		
		// Add last initial
		initials += this.last.charAt(0).toUpperCase()
		
		return initials
	}

	/**
	 * Gets the full name including middle name if present.
	 * Format: "First [Middle] Last"
	 * 
	 * @returns {string} Full name with all parts
	 * 
	 * @example
	 * ```typescript
	 * new Name({ first: 'John', middle: 'Q', last: 'Doe' }).getFullName(); 
	 * // "John Q Doe"
	 * 
	 * new Name({ first: 'Jane', last: 'Smith' }).getFullName(); 
	 * // "Jane Smith"
	 * ```
	 */
	public getFullName = (): string => {
		let fullName = this.first
		if (this.middle) fullName += ` ${this.middle}`
		fullName += ` ${this.last}`
		return fullName
	}

	/**
	 * Gets a formatted version of the name based on specified format.
	 * Provides flexibility for different display contexts.
	 * 
	 * @param {'firstLast' | 'lastFirst' | 'last' | 'first'} format - Desired format
	 * @returns {string} Formatted name
	 * 
	 * @example
	 * ```typescript
	 * const name = new Name({ first: 'John', last: 'Doe' });
	 * 
	 * name.getFormattedName('firstLast'); // "John Doe" (casual/informal)
	 * name.getFormattedName('lastFirst'); // "Doe, John" (formal/alphabetical)
	 * name.getFormattedName('last');      // "Doe" (surname only)
	 * name.getFormattedName('first');     // "John" (given name only)
	 * ```
	 */
	public getFormattedName = (format: 'firstLast' | 'lastFirst' | 'last' | 'first' = 'firstLast'): string => {
		switch (format) {
			case 'firstLast':
				return `${this.first} ${this.last}`
			case 'lastFirst':
				return `${this.last}, ${this.first}`
			case 'last':
				return this.last
			case 'first':
				return this.first
			default:
				return ''
		}
	}

	/**
	 * Validates that the name has required fields (first and last name).
	 * Ensures non-empty trimmed values for both fields.
	 * 
	 * @returns {boolean} True if name is valid (has first and last name)
	 * 
	 * @example
	 * ```typescript
	 * new Name({ first: 'John', last: 'Doe' }).validateName(); // true
	 * new Name({ first: 'John', last: '' }).validateName(); // false
	 * new Name({ first: '', last: 'Doe' }).validateName(); // false
	 * new Name({ first: '  ', last: '  ' }).validateName(); // false (whitespace only)
	 * ```
	 */
	public validateName = (): boolean => {
		return this.first.trim() !== '' && this.last.trim() !== ''
	}
}

