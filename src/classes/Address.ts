export default class Address {
	constructor(
		public country: string = '',
		public shippingAddress: string = '',
		public city: string = '',
		public state: string = '',
		public zipCode: string = ''
	) {}

	// Method to check if the address is fully populated
	isComplete(): boolean {
		return (
			this.country !== '' &&
			this.shippingAddress !== '' &&
			this.city !== '' &&
			this.state !== '' &&
			this.zipCode !== ''
		)
	}

	// Method to format the address as a single string
	formatAddress(): string {
		return `${this.shippingAddress}, ${this.city}, ${this.state}, ${this.zipCode}, ${this.country}`
	}

	// Method to update the address properties
	updateAddress(newAddress: Partial<Address>): void {
		this.country = newAddress.country ?? this.country
		this.shippingAddress = newAddress.shippingAddress ?? this.shippingAddress
		this.city = newAddress.city ?? this.city
		this.state = newAddress.state ?? this.state
		this.zipCode = newAddress.zipCode ?? this.zipCode
	}

	// Method to validate the address format (basic example)
	validate(): boolean {
		// Example: check if country and shippingAddress are not empty
		return this.country !== '' && this.shippingAddress !== ''
	}

	// Method to clear the address properties
	clear(): void {
		this.country = ''
		this.shippingAddress = ''
		this.city = ''
		this.state = ''
		this.zipCode = ''
	}

	// Method to compare two addresses
	isEqual(other: Address): boolean {
		return (
			this.country === other.country &&
			this.shippingAddress === other.shippingAddress &&
			this.city === other.city &&
			this.state === other.state &&
			this.zipCode === other.zipCode
		)
	}

	// Method to format the address as an object
	toObject(): Record<string, string | null> {
		return {
			country: this.country,
			shippingAddress: this.shippingAddress,
			city: this.city,
			state: this.state,
			zipCode: this.zipCode,
		}
	}
}
