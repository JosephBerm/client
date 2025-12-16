/**
 * Error Message Translation Utility
 * 
 * MAANG Best Practice: Centralized translation of backend error codes to user-friendly messages.
 * This pattern supports internationalization (i18n) and consistent UX.
 * 
 * **Industry Standards:**
 * - Google: Message keys mapped to localized strings in i18n bundles
 * - Meta: Error codes translated client-side with fallback messages
 * - Amazon: API returns error codes, frontend displays user-friendly text
 * - Netflix: Centralized error message catalog for consistency
 * 
 * **Next.js i18n Ready:**
 * When adding i18n support, replace the hardcoded strings with next-intl or similar.
 * The structure is already prepared for this transition.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/internationalization
 * @see https://next-intl-docs.vercel.app/
 * 
 * @module shared/utils/errorMessages
 */

// ============================================================================
// ERROR MESSAGE CATALOG
// ============================================================================

/**
 * Comprehensive error message translations.
 * Keys match backend message codes for consistent API-to-UI mapping.
 * 
 * **Categories:**
 * - Account/Auth: Registration, login, permissions
 * - Validation: Form input errors
 * - Resource: CRUD operations
 * - System: Server/network errors
 */
export const ERROR_MESSAGES: Record<string, string> = {
	// ==========================================================================
	// ACCOUNT & AUTHENTICATION
	// ==========================================================================
	
	// Registration/Creation
	'email_already_exists': 'An account with this email already exists.',
	'username_already_exists': 'This username is already taken. Please choose another.',
	'invalid_email': 'Please enter a valid email address.',
	'invalid_username': 'Username must be at least 3 characters.',
	'invalid_role': 'Invalid role selection.',
	'weak_password': 'Password does not meet security requirements.',
	'failed_to_create_account': 'Unable to create account. Please try again.',
	'account_creation_failed': 'Failed to create account. Please try again.',
	
	// Authentication
	'authentication_required': 'Please log in to continue.',
	'invalid_credentials': 'Invalid email or password.',
	'session_expired': 'Your session has expired. Please log in again.',
	'token_invalid': 'Authentication token is invalid.',
	'token_expired': 'Your session has expired. Please log in again.',
	
	// Authorization
	'admin_access_required': 'Administrator access is required.',
	'insufficient_permissions': 'You don\'t have permission to perform this action.',
	'forbidden': 'Access denied.',
	'user_not_found': 'User account not found.',
	'cannot_modify_own_role': 'You cannot change your own role.',
	'admin_cannot_downgrade_self': 'Administrators cannot downgrade their own role.',
	
	// Password
	'password_too_short': 'Password must be at least 8 characters.',
	'password_missing_uppercase': 'Password must contain an uppercase letter.',
	'password_missing_lowercase': 'Password must contain a lowercase letter.',
	'password_missing_number': 'Password must contain a number.',
	'password_missing_special': 'Password must contain a special character.',
	// Backend password validation keys (used by AccountController.ValidatePasswordStrength)
	'password_needs_uppercase': 'Password must contain at least one uppercase letter.',
	'password_needs_lowercase': 'Password must contain at least one lowercase letter.',
	'password_needs_number': 'Password must contain at least one number.',
	'password_needs_special_char': 'Password must contain at least one special character.',
	'password_is_not_valid': 'Password does not meet security requirements. Please ensure it has at least 8 characters, includes uppercase and lowercase letters, a number, and a special character.',
	'password_reset_failed': 'Failed to reset password. Please try again.',
	'current_password_incorrect': 'Current password is incorrect.',
	
	// ==========================================================================
	// VALIDATION ERRORS
	// ==========================================================================
	
	'validation_error': 'Please check your input and try again.',
	'required_field_missing': 'Please fill in all required fields.',
	'invalid_format': 'Invalid format. Please check your input.',
	'value_out_of_range': 'Value is out of acceptable range.',
	'invalid_date': 'Please enter a valid date.',
	'invalid_phone': 'Please enter a valid phone number.',
	
	// ==========================================================================
	// RESOURCE ERRORS (CRUD)
	// ==========================================================================
	
	// Generic
	'not_found': 'The requested item was not found.',
	'already_exists': 'This item already exists.',
	'create_failed': 'Failed to create. Please try again.',
	'update_failed': 'Failed to save changes. Please try again.',
	'delete_failed': 'Failed to delete. Please try again.',
	
	// Quotes
	'quote_not_found': 'Quote not found.',
	'quote_already_converted': 'This quote has already been converted to an order.',
	'quote_expired': 'This quote has expired.',
	'cannot_modify_archived_quote': 'Cannot modify an archived quote.',
	
	// Orders
	'order_not_found': 'Order not found.',
	'order_already_fulfilled': 'This order has already been fulfilled.',
	'order_cannot_be_cancelled': 'This order cannot be cancelled.',
	
	// Products
	'product_not_found': 'Product not found.',
	'product_out_of_stock': 'This product is currently out of stock.',
	'insufficient_stock': 'Not enough stock available.',
	
	// ==========================================================================
	// SYSTEM ERRORS
	// ==========================================================================
	
	'server_error': 'A server error occurred. Please try again later.',
	'network_error': 'Network error. Please check your connection.',
	'timeout': 'Request timed out. Please try again.',
	'service_unavailable': 'Service temporarily unavailable. Please try again later.',
	'rate_limited': 'Too many requests. Please wait a moment.',
	'maintenance': 'System is under maintenance. Please try again later.',
	
	// ==========================================================================
	// SUCCESS MESSAGES (for reference, not typically translated)
	// ==========================================================================
	
	'account_created_successfully': 'Account created successfully!',
	'password_reset_successfully': 'Password has been reset successfully.',
	'changes_saved': 'Changes saved successfully.',
	'deleted_successfully': 'Deleted successfully.',
}

// ============================================================================
// TRANSLATION FUNCTIONS
// ============================================================================

/**
 * Translates a backend message key to a user-friendly message.
 * 
 * **Usage:**
 * ```typescript
 * // In catch block or error handler
 * const userMessage = translateError(response.message);
 * notificationService.error(userMessage);
 * ```
 * 
 * @param messageKey - Backend message key (e.g., 'email_already_exists')
 * @param fallback - Optional fallback message if key not found
 * @returns User-friendly error message
 */
export function translateError(
	messageKey: string | null | undefined,
	fallback: string = 'An unexpected error occurred. Please try again.'
): string {
	if (!messageKey) {
		return fallback
	}
	return ERROR_MESSAGES[messageKey] ?? fallback
}

/**
 * Translates a backend message key, returning undefined if not found.
 * Useful when you want to handle unknown messages differently.
 * 
 * @param messageKey - Backend message key
 * @returns User-friendly message or undefined
 */
export function tryTranslateError(messageKey: string | null | undefined): string | undefined {
	if (!messageKey) {
		return undefined
	}
	return ERROR_MESSAGES[messageKey]
}

/**
 * Checks if a message key has a translation.
 * Useful for conditional logic around error handling.
 * 
 * @param messageKey - Backend message key
 * @returns Whether translation exists
 */
export function hasTranslation(messageKey: string): boolean {
	return messageKey in ERROR_MESSAGES
}

/**
 * Gets all available error message keys.
 * Useful for debugging and documentation.
 * 
 * @returns Array of all message keys
 */
export function getAvailableErrorKeys(): string[] {
	return Object.keys(ERROR_MESSAGES)
}

