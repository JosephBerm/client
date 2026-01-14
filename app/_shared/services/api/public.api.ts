/**
 * Public API Module
 *
 * No authentication required. Used for public-facing forms.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/public
 */

import type ContactRequest from '@_classes/ContactRequest'
import type { CreateQuoteRequest, CreateQuoteResponse } from '../api.types'

import { HttpService } from '../httpService'

// =========================================================================
// PUBLIC API
// =========================================================================

/**
 * Public API Endpoints
 * No authentication required. Used for public-facing forms.
 */
export const PublicApi = {
	/**
	 * Submits a quote request from public website.
	 * Uses CreateQuoteRequest DTO for clean API contract.
	 */
	sendQuote: async (request: CreateQuoteRequest) => HttpService.post<CreateQuoteResponse>('/quotes', request),

	/**
	 * Submits a contact form request from public website.
	 */
	sendContactRequest: async (contactRequest: ContactRequest) => HttpService.post<any>('/contact', contactRequest),
}
