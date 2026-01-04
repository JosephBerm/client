/**
 * API Data Transfer Object (DTO) Types
 * 
 * These interfaces define the contract between frontend and backend APIs.
 * They match the backend DTOs in server/Classes/Others/ for type safety.
 * 
 * Using DTOs provides:
 * - Clear separation between API contracts and internal entities
 * - Type-safe serialization/deserialization
 * - Documentation of API expectations
 * - Easier testing and mocking
 * 
 * @module api.types
 */

import type { TypeOfBusiness } from '@_classes/Enums'

// =============================================================================
// QUOTE API TYPES
// =============================================================================

/**
 * Request DTO for creating a new quote.
 * Matches backend: server/Classes/Others/CreateQuoteRequest.cs
 * 
 * @example
 * ```typescript
 * const request: CreateQuoteRequest = {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   emailAddress: 'john@example.com',
 *   items: [
 *     { productId: 'abc-123-guid', quantity: 2 }
 *   ]
 * };
 * await API.Public.sendQuote(request);
 * ```
 */
export interface CreateQuoteRequest {
	// =========================================================================
	// CONTACT INFORMATION (Required for guest users)
	// =========================================================================
	
	/** First name of the contact person. Required. */
	firstName: string
	
	/** Last name of the contact person. Required. */
	lastName: string
	
	/** Middle name of the contact person. Optional. */
	middleName?: string
	
	/** Email address for quote communications. Required. */
	emailAddress: string
	
	/** Phone number for contact. Optional. */
	phoneNumber?: string
	
	// =========================================================================
	// COMPANY INFORMATION
	// =========================================================================
	
	/** Company/organization name. Optional. */
	companyName?: string
	
	/** Type of business. Defaults to 'Other'. */
	typeOfBusiness?: TypeOfBusiness
	
	// =========================================================================
	// QUOTE DETAILS
	// =========================================================================
	
	/** Additional notes or description for the quote request. Optional. */
	description?: string
	
	/** Products requested in the quote. Required, at least one. */
	items: QuoteItemRequest[]
	
	// =========================================================================
	// REFERRAL TRACKING
	// =========================================================================
	
	/** Sales rep email/ID who referred this customer. Optional. */
	referredBy?: string
	
	/** Source of referral: 'url', 'qr', or 'manual'. Optional. */
	referralSource?: string
	
	// =========================================================================
	// AUTHENTICATED USER FIELDS
	// =========================================================================
	
	/** Customer ID for authenticated users. Optional. */
	customerId?: number
}

/**
 * Individual item in a quote request.
 * Matches backend: QuoteItemRequest class
 */
export interface QuoteItemRequest {
	/** Product ID as GUID string. Required. */
	productId: string
	
	/** Quantity requested. Must be >= 1. */
	quantity: number
}

/**
 * Response DTO after creating a quote.
 * Matches backend: server/Classes/Others/CreateQuoteResponse
 */
export interface CreateQuoteResponse {
	/** The generated quote ID (GUID). */
	id: string
	
	/** Sequential quote number for reference. */
	quoteNumber: number
	
	/** Quote status (always "Unread" for new quotes). */
	status: string
	
	/** Server timestamp when quote was created. */
	createdAt: string
	
	/** Quote validity expiration date. */
	validUntil: string
	
	/** Number of items in the quote. */
	itemCount: number
	
	/** Success message for the user. */
	message: string
}

// =============================================================================
// COMMON API TYPES
// =============================================================================

/**
 * Standard API response wrapper.
 * All backend endpoints return data in this format.
 *
 * **CANONICAL LOCATION**: This is the single source of truth for ApiResponse.
 * Import from `@_shared` or `@_shared/services/api.types` - do NOT redefine elsewhere.
 *
 * @example
 * ```typescript
 * // Success response
 * {
 *   payload: { id: 1, name: 'Admin' },
 *   message: 'role_created_successfully',
 *   statusCode: 200,
 *   metaData: null
 * }
 *
 * // Error response
 * {
 *   payload: null,
 *   message: 'Role name already exists',
 *   statusCode: 400,
 *   metaData: null
 * }
 * ```
 */
export interface ApiResponse<T> {
	/** The actual data payload (null on error). */
	payload: T | null

	/** Success or error message from the server. */
	message: string | null

	/** HTTP status code (200, 201, 400, 401, 404, 500, etc.). */
	statusCode: number

	/** Optional metadata (pagination info, debug info, etc.). */
	metaData?: unknown
}

/**
 * Paginated response wrapper.
 */
export interface PagedResponse<T> {
	/** Array of items for current page. */
	items: T[]
	
	/** Total number of items across all pages. */
	totalCount: number
	
	/** Current page number (1-indexed). */
	page: number
	
	/** Number of items per page. */
	pageSize: number
	
	/** Total number of pages. */
	totalPages: number
	
	/** Whether there's a next page. */
	hasNextPage: boolean
	
	/** Whether there's a previous page. */
	hasPreviousPage: boolean
}

