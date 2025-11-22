/**
 * Quote Entity Class
 * 
 * Represents quote requests (RFQs - Requests for Quotation) from customers.
 * Quotes are preliminary requests for pricing before placing an order.
 * They can be converted to orders once approved and pricing is finalized.
 * 
 * **Features:**
 * - Customer contact information (name, email, phone)
 * - Company name
 * - Delivery/transit address
 * - List of requested products with quantities
 * - Additional description/notes
 * - Status tracking (Unread, Read, Approved, Rejected, Converted to Order)
 * - Timestamp tracking
 * 
 * **Quote Status Flow:**
 * 1. Unread - Initial state, awaiting review
 * 2. Read - Reviewed by staff
 * 3. Approved - Pricing approved, ready to convert to order
 * 4. Rejected - Quote declined
 * 5. Converted - Successfully converted to an order
 * 
 * **Related Entities:**
 * - Name: Structured name entity for contact person
 * - Address: Delivery/transit address
 * - CartProduct: Products with quantities
 * - Company: Associated company (if applicable)
 * 
 * @example
 * ```typescript
 * // Create a quote request
 * const quote = new Quote({
 *   name: new Name({
 *     first: 'John',
 *     last: 'Doe'
 *   }),
 *   companyName: 'Springfield Medical Center',
 *   emailAddress: 'john@springfieldmed.com',
 *   phoneNumber: '555-123-4567',
 *   transitDetails: new Address({
 *     addressOne: '123 Medical Plaza',
 *     city: 'Springfield',
 *     state: 'IL',
 *     zipCode: '62701',
 *     country: 'USA'
 *   }),
 *   products: [
 *     new CartProduct({
 *       product: product1,
 *       quantity: 100
 *     }),
 *     new CartProduct({
 *       product: product2,
 *       quantity: 50
 *     })
 *   ],
 *   description: 'Urgent order needed for new facility opening',
 *   status: QuoteStatus.Unread
 * });
 * 
 * // Update quote status
 * quote.status = QuoteStatus.Approved;
 * 
 * // Convert quote to order
 * const order = new Order();
 * order.CreateFromQuote(quote);
 * ```
 * 
 * @module Quote
 */

import { TypeOfBusiness, QuoteStatus } from '@_classes/Enums'
import { CartProduct } from '@_classes/Product'
import Address from './common/Address'
import Name from '@_classes/common/Name'
import Company from '@_classes/Company'
import { parseDateSafe } from '@_lib/dates'
// RichConstructor decorator not needed in modern Next.js

/**
 * Quote Entity Class
 * 
 * Main quote/RFQ entity representing a request for quotation from a customer.
 * Contains customer contact information, requested products, and delivery details.
 */
export default class Quote {
	/** Unique identifier (GUID, auto-generated) */
	id: string = ''
	
	/** Contact person's name (structured Name entity) */
	name: Name = new Name()
	
	/** Company/organization name */
	companyName: string = ''
	
	/** Delivery/transit address for the quote */
	transitDetails: Address = new Address()
	
	/** Contact email address */
	emailAddress: string = ''
	
	/** Contact phone number */
	phoneNumber: string = ''
	
	/** Array of requested products with quantities */
	products: CartProduct[] = []
	
	/** Additional notes/description from customer */
	description: string = ''
	
	/** Quote creation timestamp */
	createdAt: Date = new Date()
	
	/** Current quote status (Unread, Read, Approved, Rejected, Converted) */
	status: QuoteStatus = QuoteStatus.Unread

	/**
	 * Creates a new Quote instance.
	 * Deeply copies nested objects (name, address, products).
	 * Parses date strings to Date objects.
	 * 
	 * @param {Partial<Quote>} param - Partial quote data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Basic quote
	 * const quote = new Quote({
	 *   name: new Name({ first: 'Jane', last: 'Smith' }),
	 *   companyName: 'City Hospital',
	 *   emailAddress: 'jane@cityhospital.com',
	 *   phoneNumber: '555-987-6543',
	 *   description: 'Need bulk order of PPE supplies'
	 * });
	 * 
	 * // Quote with products and delivery address
	 * const quote2 = new Quote({
	 *   name: new Name({ first: 'Dr.', middle: 'James', last: 'Wilson' }),
	 *   companyName: 'Regional Medical',
	 *   emailAddress: 'orders@regionalmed.com',
	 *   phoneNumber: '555-555-5555',
	 *   transitDetails: new Address({
	 *     addressOne: '456 Health St',
	 *     city: 'Boston',
	 *     state: 'MA',
	 *     zipCode: '02101',
	 *     country: 'USA'
	 *   }),
	 *   products: [
	 *     new CartProduct({
	 *       productId: 'prod-1',
	 *       quantity: 200
	 *     }),
	 *     new CartProduct({
	 *       productId: 'prod-2',
	 *       quantity: 150
	 *     })
	 *   ],
	 *   description: 'Quarterly supply order',
	 *   status: QuoteStatus.Unread
	 * });
	 * ```
	 */
	constructor(param?: Partial<Quote>) {
		if (param) {
			Object.assign(this, param)
			
			// Deep copy contact name object
			if (param.name) {
				this.name = new Name(param.name)
			}
			
			// Deep copy transit/delivery address
			if (param.transitDetails) {
				this.transitDetails = new Address(param.transitDetails)
			}
			
			// Deep copy products array
			if (param.products) {
				this.products = param.products.map((p) => new CartProduct(p))
			}
			
			// Parse creation date from string if needed
			if (param.createdAt) {
				this.createdAt = parseDateSafe(param.createdAt) ?? new Date()
			}
		}
	}
}
