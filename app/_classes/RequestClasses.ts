/**
 * Request Model Classes
 * 
 * Contains data transfer object (DTO) classes for specific API request operations.
 * These classes structure request payloads for backend endpoints.
 * 
 * **Classes:**
 * - SubmitOrderRequest: Request model for submitting quotes/invoices via email
 * 
 * @module RequestClasses
 */

/**
 * SubmitOrderRequest Entity Class
 * 
 * Request model for submitting quotes or invoices to customers via email.
 * Used with order submission endpoints to send finalized documents to one or more email recipients.
 * 
 * **Features:**
 * - Quote/order ID reference
 * - Multiple recipient email addresses
 * - Used for quote and invoice email submissions
 * 
 * **Related Endpoints:**
 * - API.Orders.submitQuote(SubmitOrderRequest)
 * - API.Orders.submitInvoice(SubmitOrderRequest)
 * 
 * @example
 * ```typescript
 * // Submit quote to customer
 * const submitRequest = new SubmitOrderRequest({
 *   quoteId: 12345,
 *   emails: ['customer@example.com', 'procurement@example.com']
 * });
 * 
 * import { logger } from '@_core';
 * 
 * const response = await API.Orders.submitQuote(submitRequest);
 * if (response.data.statusCode === 200) {
 *   logger.info('Quote submitted successfully', { quoteId: submitRequest.quoteId });
 * }
 * 
 * // Submit invoice after order approval
 * const invoiceRequest = new SubmitOrderRequest({
 *   quoteId: 12345,
 *   emails: ['billing@customer.com', 'ap@customer.com']
 * });
 * 
 * await API.Orders.submitInvoice(invoiceRequest);
 * 
 * // From form data
 * const handleSubmitQuote = async (quoteId: number, emailList: string) => {
 *   const emails = emailList.split(',').map(e => e.trim());
 *   const request = new SubmitOrderRequest({
 *     quoteId,
 *     emails
 *   });
 *   await API.Orders.submitQuote(request);
 * };
 * ```
 */
export class SubmitOrderRequest {
	/** Quote/order ID to submit (null if not yet created) */
	quoteId: number | null = null
	
	/** Array of recipient email addresses for the submission */
	emails: string[] = []

	/**
	 * Creates a new SubmitOrderRequest instance.
	 * Performs shallow copy of properties.
	 * 
	 * @param {Partial<SubmitOrderRequest>} partial - Partial request data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Single recipient
	 * const request1 = new SubmitOrderRequest({
	 *   quoteId: 123,
	 *   emails: ['customer@example.com']
	 * });
	 * 
	 * // Multiple recipients
	 * const request2 = new SubmitOrderRequest({
	 *   quoteId: 456,
	 *   emails: [
	 *     'primary@customer.com',
	 *     'backup@customer.com',
	 *     'accounting@customer.com'
	 *   ]
	 * });
	 * 
	 * // From user input
	 * const emailInput = 'user1@example.com, user2@example.com';
	 * const request3 = new SubmitOrderRequest({
	 *   quoteId: orderId,
	 *   emails: emailInput.split(',').map(e => e.trim()).filter(Boolean)
	 * });
	 * ```
	 */
	constructor(partial?: Partial<SubmitOrderRequest>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}
}
