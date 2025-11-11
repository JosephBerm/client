/**
 * ContactRequest Entity Class
 * 
 * Represents a contact form submission from the public website.
 * Used for potential customers to inquire about products, services, or support.
 * Captured from the public contact form and stored for follow-up.
 * 
 * **Features:**
 * - Contact person name (structured Name entity)
 * - Phone number
 * - Email address
 * - Company name
 * - Custom message/inquiry
 * 
 * **Use Cases:**
 * - Public contact form submissions
 * - Lead generation
 * - Customer inquiries
 * - Support requests
 * 
 * **Related Entities:**
 * - Name: Structured name entity for contact person
 * 
 * @example
 * ```typescript
 * // Create contact request from form
 * const contactRequest = new ContactRequest({
 *   name: new Name({
 *     first: 'John',
 *     last: 'Doe'
 *   }),
 *   phoneNumber: '555-123-4567',
 *   emailAddress: 'john@example.com',
 *   companyName: 'ABC Medical Center',
 *   message: 'We are interested in bulk orders of PPE supplies. Please contact us to discuss pricing.'
 * });
 * 
 * // Submit to backend
 * const response = await API.Public.sendContactRequest(contactRequest);
 * if (response.data.statusCode === 200) {
 *   console.log('Contact request submitted successfully');
 * }
 * 
 * // Form submission handler
 * const handleContactSubmit = async (formData) => {
 *   const request = new ContactRequest({
 *     name: new Name({
 *       first: formData.firstName,
 *       last: formData.lastName
 *     }),
 *     phoneNumber: formData.phone,
 *     emailAddress: formData.email,
 *     companyName: formData.company,
 *     message: formData.message
 *   });
 *   
 *   await API.Public.sendContactRequest(request);
 * };
 * ```
 * 
 * @module ContactRequest
 */

import Name from '@_classes/common/Name'

/**
 * ContactRequest Entity Class
 * 
 * Main contact request entity representing a customer inquiry from the public website.
 * Contains contact information and custom message for follow-up.
 */
export default class ContactRequest {
	/** Contact person's full name (structured Name entity) */
	public name: Name = new Name()
	
	/** Contact phone number */
	public phoneNumber: string = ''
	
	/** Contact email address */
	public emailAddress: string = ''
	
	/** Company/organization name */
	public companyName: string = ''
	
	/** Custom message or inquiry from contact */
	public message: string = ''

	/**
	 * Creates a new ContactRequest instance.
	 * Deeply copies nested Name object.
	 * 
	 * @param {Partial<ContactRequest>} partial - Partial contact request data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Basic contact request
	 * const request = new ContactRequest({
	 *   name: new Name({ first: 'Jane', last: 'Smith' }),
	 *   emailAddress: 'jane@company.com',
	 *   phoneNumber: '555-987-6543',
	 *   companyName: 'City Hospital',
	 *   message: 'Please send catalog'
	 * });
	 * 
	 * // Inquiry with detailed message
	 * const inquiry = new ContactRequest({
	 *   name: new Name({
	 *     first: 'Dr.',
	 *     middle: 'Michael',
	 *     last: 'Johnson'
	 *   }),
	 *   emailAddress: 'michael.johnson@hospital.com',
	 *   phoneNumber: '555-111-2222',
	 *   companyName: 'Regional Medical Center',
	 *   message: 'We need to establish a purchasing agreement for medical supplies. Our facility serves 500+ patients daily and requires reliable supply chain partners.'
	 * });
	 * ```
	 */
	constructor(partial?: Partial<ContactRequest>) {
		if (partial) {
			Object.assign(this, partial) // Assign provided properties

			// Deep copy nested name object
			if (partial.name) {
				this.name = new Name(partial.name)
			}
		}
	}
}
