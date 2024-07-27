export default class Address {
	public country: string = ''
	public addressOne: string = ''
	public city: string = ''
	public state: string = ''
	public zipCode: string = ''

	constructor(param?: Partial<Address>) {
		if (param) {
			Object.assign(this, param)
		}
	}

	// Method to check if the address is fully populated
	isComplete(): boolean {
		return (
			this.country !== '' &&
			this.addressOne !== '' &&
			this.city !== '' &&
			this.state !== '' &&
			this.zipCode !== ''
		)
	}

	// Method to format the address as a single string
	formatAddress(): string {
		return `${this.addressOne}, ${this.city}, ${this.state}, ${this.zipCode}, ${this.country}`
	}

	// Method to update the address properties
	updateAddress(newAddress: Partial<Address>): void {
		this.country = newAddress.country ?? this.country
		this.addressOne = newAddress.addressOne ?? this.addressOne
		this.city = newAddress.city ?? this.city
		this.state = newAddress.state ?? this.state
		this.zipCode = newAddress.zipCode ?? this.zipCode
	}

	// Method to validate the address format (basic example)
	validate(): boolean {
		// Example: check if country and shippingAddress are not empty
		return this.country !== '' && this.addressOne !== ''
	}

	// Method to clear the address properties
	clear(): void {
		this.country = ''
		this.addressOne = ''
		this.city = ''
		this.state = ''
		this.zipCode = ''
	}

	// Method to compare two addresses
	isEqual(other: Address): boolean {
		return (
			this.country === other.country &&
			this.addressOne === other.addressOne &&
			this.city === other.city &&
			this.state === other.state &&
			this.zipCode === other.zipCode
		)
	}

	// Method to format the address as an object
	toObject(): Record<string, string | null> {
		return {
			country: this.country,
			shippingAddress: this.addressOne,
			city: this.city,
			state: this.state,
			zipCode: this.zipCode,
		}
	}

	// Getter for the full address
	get fullAddress(): string {
		return `${this.addressOne}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`
	}

	// Getter for city and state
	get cityState(): string {
		return `${this.city}, ${this.state}`
	}

	// Getter for a country-specific formatted address
	get formattedAddress(): string {
		if (this.country.toLowerCase() === 'usa' || this.country.toLowerCase() === 'united states') {
			return `${this.addressOne}, ${this.city}, ${this.state} ${this.zipCode}`
		} else {
			return `${this.addressOne}, ${this.city}, ${this.zipCode}, ${this.state}, ${this.country}`
		}
	}
}
