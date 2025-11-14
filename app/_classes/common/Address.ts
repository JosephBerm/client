/**
 * Physical Address Entity Class
 * 
 * Represents a physical mailing/shipping address with utility methods for formatting,
 * validation, and comparison. Used for shipping addresses, billing addresses, and
 * company/provider locations throughout the application.
 * 
 * **Features:**
 * - Multiple formatting options (full, city/state, country-specific)
 * - Validation and completeness checking
 * - Address comparison
 * - Update and clear operations
 * - Type-safe with TypeScript
 * 
 * @example
 * ```typescript
 * // Create an address
 * const address = new Address({
 *   addressOne: '123 Main St',
 *   city: 'Springfield',
 *   state: 'IL',
 *   zipCode: '62701',
 *   country: 'USA'
 * });
 * 
 * // Format address
 * address.getFullAddress(); // "123 Main St, Springfield, IL 62701, USA"
 * address.getCityState(); // "Springfield, IL"
 * 
 * // Validate
 * address.isComplete(); // true
 * address.validate(); // true
 * ```
 */
export default class Address {
	/** Country name */
	public country: string = ''
	
	/** Street address (line 1) */
	public addressOne: string = ''
	
	/** City name */
	public city: string = ''
	
	/** State/Province code or name */
	public state: string = ''
	
	/** ZIP/Postal code */
	public zipCode: string = ''

	/**
	 * Creates a new Address instance.
	 * Accepts partial object for flexible initialization.
	 * 
	 * @param {Partial<Address>} param - Partial address data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Full address
	 * const addr1 = new Address({
	 *   addressOne: '456 Oak Ave',
	 *   city: 'Boston',
	 *   state: 'MA',
	 *   zipCode: '02101',
	 *   country: 'USA'
	 * });
	 * 
	 * // Partial address (to be completed later)
	 * const addr2 = new Address({ country: 'USA' });
	 * ```
	 */
	constructor(param?: Partial<Address>) {
		if (param) {
			Object.assign(this, param)
		}
	}

	/**
	 * Checks if all required address fields are populated.
	 * Ensures no field is an empty string.
	 * 
	 * @returns {boolean} True if all fields have values
	 * 
	 * @example
	 * ```typescript
	 * new Address({
	 *   addressOne: '123 Main St',
	 *   city: 'Springfield',
	 *   state: 'IL',
	 *   zipCode: '62701',
	 *   country: 'USA'
	 * }).isComplete(); // true
	 * 
	 * new Address({
	 *   addressOne: '123 Main St',
	 *   city: '',
	 *   state: 'IL'
	 * }).isComplete(); // false (missing city, zipCode, country)
	 * ```
	 */
	isComplete(): boolean {
		return (
			this.country !== '' &&
			this.addressOne !== '' &&
			this.city !== '' &&
			this.state !== '' &&
			this.zipCode !== ''
		)
	}

	/**
	 * Formats the address as a single comma-separated string.
	 * Standard format includes all fields.
	 * 
	 * @returns {string} Formatted address string
	 * 
	 * @example
	 * ```typescript
	 * address.formatAddress();
	 * // "123 Main St, Springfield, IL, 62701, USA"
	 * ```
	 */
	formatAddress(): string {
		return `${this.addressOne}, ${this.city}, ${this.state}, ${this.zipCode}, ${this.country}`
	}

	/**
	 * Updates address properties with new values.
	 * Only updates fields that are provided (partial update).
	 * 
	 * @param {Partial<Address>} newAddress - New address values to apply
	 * 
	 * @example
	 * ```typescript
	 * const address = new Address({
	 *   addressOne: '123 Main St',
	 *   city: 'Springfield',
	 *   state: 'IL',
	 *   zipCode: '62701',
	 *   country: 'USA'
	 * });
	 * 
	 * // Update only city and zipCode
	 * address.updateAddress({ city: 'Chicago', zipCode: '60601' });
	 * // Other fields remain unchanged
	 * ```
	 */
	updateAddress(newAddress: Partial<Address>): void {
		this.country = newAddress.country ?? this.country
		this.addressOne = newAddress.addressOne ?? this.addressOne
		this.city = newAddress.city ?? this.city
		this.state = newAddress.state ?? this.state
		this.zipCode = newAddress.zipCode ?? this.zipCode
	}

	/**
	 * Validates that the address has minimum required fields.
	 * Checks that country and street address are not empty.
	 * 
	 * @returns {boolean} True if address has minimum required fields
	 * 
	 * @example
	 * ```typescript
	 * new Address({
	 *   country: 'USA',
	 *   addressOne: '123 Main St'
	 * }).validate(); // true
	 * 
	 * new Address({
	 *   country: 'USA',
	 *   addressOne: ''
	 * }).validate(); // false
	 * ```
	 */
	validate(): boolean {
		// Check minimum required fields: country and street address
		return this.country !== '' && this.addressOne !== ''
	}

	/**
	 * Clears all address fields to empty strings.
	 * Useful for resetting forms or removing stored addresses.
	 * 
	 * @example
	 * ```typescript
	 * const address = new Address({
	 *   addressOne: '123 Main St',
	 *   city: 'Springfield',
	 *   state: 'IL',
	 *   zipCode: '62701',
	 *   country: 'USA'
	 * });
	 * 
	 * address.clear();
	 * address.isComplete(); // false
	 * address.country; // ""
	 * ```
	 */
	clear(): void {
		this.country = ''
		this.addressOne = ''
		this.city = ''
		this.state = ''
		this.zipCode = ''
	}

	/**
	 * Compares this address with another address for equality.
	 * All fields must match exactly (case-sensitive).
	 * 
	 * @param {Address} other - Address to compare with
	 * @returns {boolean} True if all fields match
	 * 
	 * @example
	 * ```typescript
	 * const addr1 = new Address({
	 *   addressOne: '123 Main St',
	 *   city: 'Springfield',
	 *   state: 'IL',
	 *   zipCode: '62701',
	 *   country: 'USA'
	 * });
	 * 
	 * const addr2 = new Address({
	 *   addressOne: '123 Main St',
	 *   city: 'Springfield',
	 *   state: 'IL',
	 *   zipCode: '62701',
	 *   country: 'USA'
	 * });
	 * 
	 * addr1.isEqual(addr2); // true
	 * 
	 * const addr3 = new Address({
	 *   addressOne: '456 Oak Ave',
	 *   city: 'Springfield',
	 *   state: 'IL',
	 *   zipCode: '62701',
	 *   country: 'USA'
	 * });
	 * 
	 * addr1.isEqual(addr3); // false (different street)
	 * ```
	 */
	isEqual(other: Address): boolean {
		return (
			this.country === other.country &&
			this.addressOne === other.addressOne &&
			this.city === other.city &&
			this.state === other.state &&
			this.zipCode === other.zipCode
		)
	}

	/**
	 * Converts the address to a plain object.
	 * Note: Uses 'shippingAddress' key for addressOne (legacy compatibility).
	 * 
	 * @returns {Record<string, string | null>} Address as key-value object
	 * 
	 * @example
	 * ```typescript
	 * address.toObject();
	 * // {
	 * //   country: 'USA',
	 * //   shippingAddress: '123 Main St',
	 * //   city: 'Springfield',
	 * //   state: 'IL',
	 * //   zipCode: '62701'
	 * // }
	 * ```
	 */
	toObject(): Record<string, string | null> {
		return {
			country: this.country,
			shippingAddress: this.addressOne, // Legacy key name
			city: this.city,
			state: this.state,
			zipCode: this.zipCode,
		}
	}

	/**
	 * Gets the complete address as a single formatted string.
	 * Format: "Street, City, State ZIP, Country"
	 * 
	 * @returns {string} Full address string
	 * 
	 * @example
	 * ```typescript
	 * address.getFullAddress();
	 * // "123 Main St, Springfield, IL 62701, USA"
	 * ```
	 */
	getFullAddress(): string {
		return `${this.addressOne}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`
	}

	/**
	 * Gets just the city and state portion of the address.
	 * Useful for location displays without full address.
	 * 
	 * @returns {string} City and state formatted as "City, State"
	 * 
	 * @example
	 * ```typescript
	 * address.getCityState(); // "Springfield, IL"
	 * ```
	 */
	getCityState(): string {
		return `${this.city}, ${this.state}`
	}

	/**
	 * Gets a country-specific formatted address.
	 * USA addresses exclude country name, others include it.
	 * 
	 * @returns {string} Formatted address appropriate for the country
	 * 
	 * @example
	 * ```typescript
	 * // US address (no country in output)
	 * new Address({
	 *   addressOne: '123 Main St',
	 *   city: 'Springfield',
	 *   state: 'IL',
	 *   zipCode: '62701',
	 *   country: 'USA'
	 * }).getFormattedAddress();
	 * // "123 Main St, Springfield, IL 62701"
	 * 
	 * // International address (includes country)
	 * new Address({
	 *   addressOne: '10 Downing St',
	 *   city: 'London',
	 *   zipCode: 'SW1A 2AA',
	 *   state: 'England',
	 *   country: 'UK'
	 * }).getFormattedAddress();
	 * // "10 Downing St, London, SW1A 2AA, England, UK"
	 * ```
	 */
	getFormattedAddress(): string {
		// US addresses don't need country in formatted output
		if (this.country.toLowerCase() === 'usa' || this.country.toLowerCase() === 'united states') {
			return `${this.addressOne}, ${this.city}, ${this.state} ${this.zipCode}`
		} else {
			// International addresses include country
			return `${this.addressOne}, ${this.city}, ${this.zipCode}, ${this.state}, ${this.country}`
		}
	}

	/**
	 * Static utility to get all property keys of the Address class.
	 * Useful for form generation or iteration.
	 * 
	 * @static
	 * @returns {Array<keyof Address>} Array of address property keys
	 * 
	 * @example
	 * ```typescript
	 * const keys = Address.getKeys();
	 * // ['country', 'addressOne', 'city', 'state', 'zipCode']
	 * 
	 * // Use for form field generation
	 * import { logger } from '@_core';
	 * 
	 * keys.forEach(key => {
	 *   logger.debug('Address field', { field: key });
	 * });
	 * ```
	 */
	public static getKeys(): (keyof Address)[] {
        return Object.keys(new Address()) as (keyof Address)[];
    }
}

