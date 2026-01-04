/**
 * Centralized Zod Validation Schemas
 * 
 * Single source of truth for all form validation rules across the application.
 * Promotes consistency, reusability, and easy maintenance of validation logic.
 * Used with useZodForm hook and React Hook Form for type-safe form handling.
 * 
 * **Benefits:**
 * - DRY validation logic (define once, use everywhere)
 * - Type-safe forms with automatic TypeScript inference
 * - Consistent error messages
 * - Composable schemas (reuse common validators)
 * - Easy to update validation rules globally
 * 
 * **Schema Categories:**
 * - **Common**: Email, password, username, phone (reusable primitives)
 * - **Complex**: Name, address (nested objects)
 * - **Auth**: Login, signup, change password
 * - **User**: Profile update
 * - **Business**: Product, order, quote, customer, provider
 * - **Utility**: Contact form, search filters
 * 
 * @example
 * ```typescript
 * // Use with useZodForm hook
 * import { loginSchema } from '@_core';
 * import { useZodForm } from '@_shared';
 * 
 * const form = useZodForm(loginSchema, {
 *   defaultValues: { identifier: '', password: '', rememberMe: false }
 * });
 * 
 * // Type-safe form data (automatically inferred)
 * const handleSubmit = (data: LoginFormData) => {
 *   // data.identifier, data.password, data.rememberMe are all typed
 * };
 * ```
 * 
 * @module validation-schemas
 */

import { z } from 'zod'

// ==========================================
// COMMON VALIDATORS (Reusable Primitives)
// ==========================================

/**
 * Email validation schema.
 * Validates proper email format and ensures non-empty input.
 * 
 * @constant
 * @example emailSchema.parse('user@example.com') // Valid
 */
export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required')

/**
 * Strong password validation schema.
 * 
 * **Requirements:**
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*, etc.)
 * 
 * @constant
 * @example
 * passwordSchema.parse('SecurePass123!') // Valid
 * passwordSchema.parse('weak') // Invalid
 */
export const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

/**
 * Username validation schema.
 * 
 * **Requirements:**
 * - 3-50 characters
 * - Only letters, numbers, and underscores
 * - No spaces or special characters
 * 
 * @constant
 * @example
 * usernameSchema.parse('john_doe123') // Valid
 * usernameSchema.parse('john doe') // Invalid (contains space)
 */
export const usernameSchema = z
	.string()
	.min(3, 'Username must be at least 3 characters')
	.max(50, 'Username must not exceed 50 characters')
	.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

/**
 * Phone number validation schema (E.164 format).
 * 
 * **Format:** Optional + prefix, 1-15 digits
 * Optional field (can be empty string or undefined)
 * 
 * @constant
 * @example
 * phoneSchema.parse('+12025551234') // Valid
 * phoneSchema.parse('') // Valid (optional)
 */
export const phoneSchema = z
	.string()
	.regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
	.optional()
	.or(z.literal(''))

// ==========================================
// COMPLEX VALIDATORS (Nested Objects)
// ==========================================

/**
 * Person name validation schema.
 * Validates full name with optional middle name.
 * 
 * @constant
 * @example
 * ```typescript
 * nameSchema.parse({
 *   first: 'John',
 *   middle: 'Q',
 *   last: 'Doe'
 * });
 * ```
 */
export const nameSchema = z.object({
	first: z.string().min(1, 'First name is required').max(50, 'First name must not exceed 50 characters'),
	middle: z.string().optional(),
	last: z.string().min(1, 'Last name is required').max(50, 'Last name must not exceed 50 characters'),
})

/**
 * Physical address validation schema.
 * Standard address format for shipping and billing.
 * 
 * @constant
 * @example
 * ```typescript
 * addressSchema.parse({
 *   street: '123 Main St',
 *   city: 'Springfield',
 *   state: 'IL',
 *   zipCode: '62701',
 *   country: 'USA'
 * });
 * ```
 */
export const addressSchema = z.object({
	street: z.string().min(1, 'Street is required'),
	city: z.string().min(1, 'City is required'),
	state: z.string().min(1, 'State/Province is required'),
	zipCode: z.string().min(1, 'ZIP/Postal code is required'),
	country: z.string().min(1, 'Country is required'),
})

// ==========================================
// AUTHENTICATION SCHEMAS
// ==========================================

/**
 * Login form validation schema.
 * Accepts email or username as identifier.
 * 
 * @constant
 * @example
 * ```typescript
 * loginSchema.parse({
 *   identifier: 'john@example.com',
 *   password: 'password123',
 *   rememberMe: true
 * });
 * ```
 */
export const loginSchema = z.object({
	identifier: z.string().min(1, 'Email or username is required'),
	password: z.string().min(1, 'Password is required'),
	rememberMe: z.boolean().optional().default(false),
})

/** Type-safe form data inferred from loginSchema */
export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Signup/registration form validation schema.
 * Includes password confirmation and terms acceptance.
 * Uses `.refine()` for cross-field validation (password matching).
 * 
 * @constant
 * @example
 * ```typescript
 * signupSchema.parse({
 *   username: 'johndoe',
 *   email: 'john@example.com',
 *   password: 'SecurePass123!',
 *   confirmPassword: 'SecurePass123!',
 *   name: { first: 'John', last: 'Doe' },
 *   acceptTerms: true
 * });
 * ```
 */
export const signupSchema = z
	.object({
		username: usernameSchema,
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(1, 'Please confirm your password'),
		name: nameSchema,
		dateOfBirth: z.coerce.date().optional(),
		acceptTerms: z.boolean().refine((val) => val === true, {
			message: 'You must accept the terms and conditions',
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'], // Show error on confirmPassword field
	})

/** Type-safe form data inferred from signupSchema */
export type SignupFormData = z.infer<typeof signupSchema>

/**
 * Change password form validation schema.
 * Requires current password and new password confirmation.
 * 
 * @constant
 * @example
 * ```typescript
 * changePasswordSchema.parse({
 *   oldPassword: 'OldPass123!',
 *   newPassword: 'NewPass456!',
 *   confirmNewPassword: 'NewPass456!'
 * });
 * ```
 */
export const changePasswordSchema = z
	.object({
		oldPassword: z.string().min(1, 'Current password is required'),
		newPassword: passwordSchema,
		confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords don't match",
		path: ['confirmNewPassword'], // Show error on confirmation field
	})

/** Type-safe form data inferred from changePasswordSchema */
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// ==========================================
// USER PROFILE SCHEMAS
// ==========================================

/**
 * Profile update form validation schema.
 * Allows users to update personal information.
 * 
 * @constant
 * @example
 * ```typescript
 * profileUpdateSchema.parse({
 *   username: 'johndoe',
 *   email: 'john@example.com',
 *   name: { first: 'John', last: 'Doe' },
 *   phone: '+12025551234',
 *   shippingDetails: { street: '123 Main St', ... }
 * });
 * ```
 */
export const profileUpdateSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	name: nameSchema,
	dateOfBirth: z.coerce.date().optional().nullable(),
	phone: phoneSchema,
	mobile: phoneSchema,
	shippingDetails: addressSchema.optional(),
})

/** Type-safe form data inferred from profileUpdateSchema */
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

// ==========================================
// BUSINESS ENTITY SCHEMAS
// ==========================================

/**
 * Product form validation schema.
 * Used for creating and updating medical supply products.
 * 
 * **Fields:**
 * - name: Product name (required, max 200 chars)
 * - description: Product description (required)
 * - price: Display price (required, must be positive)
 * - cost: Vendor cost (admin/sales rep only, optional)
 * - quantity: Stock quantity (required, non-negative)
 * - categoryIds: Array of category IDs (optional, for category selection)
 * - sku: Stock Keeping Unit (optional)
 * - manufacturer: Manufacturer name (optional)
 * - providerId: Provider/vendor ID (optional)
 * 
 * @constant
 * @example
 * ```typescript
 * productSchema.parse({
 *   name: 'Surgical Gloves',
 *   description: 'Latex-free surgical gloves',
 *   price: 29.99,
 *   cost: 15.00,  // Admin/Sales Rep only
 *   quantity: 100,
 *   categoryIds: [1, 2],
 *   sku: 'SG-001',
 *   manufacturer: 'MedSupply Co',
 *   providerId: 5
 * });
 * ```
 */
export const productSchema = z.object({
	name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
	description: z.string().min(1, 'Description is required'),
	price: z.coerce.number().nonnegative('Price must be non-negative'),
	cost: z.coerce.number().nonnegative('Cost must be non-negative').nullable().optional(),
	quantity: z.coerce.number().int().nonnegative('Quantity cannot be negative'),
	categoryIds: z.array(z.coerce.number().int()).optional().default([]),
	sku: z.string().optional(),
	manufacturer: z.string().optional(),
	providerId: z.coerce.number().int().nullable().optional(),
})

/** Type-safe form data inferred from productSchema */
export type ProductFormData = z.infer<typeof productSchema>

/**
 * Order form validation schema.
 * For creating new orders with customer and shipping information.
 * 
 * @constant
 */
export const orderSchema = z.object({
	customerId: z.coerce.number().positive('Customer is required'),
	shippingAddress: addressSchema,
	notes: z.string().optional(),
})

/** Type-safe form data inferred from orderSchema */
export type OrderFormData = z.infer<typeof orderSchema>

/**
 * Quote/RFQ form validation schema.
 * Supports multiple items with expiration date.
 * 
 * **Authentication States:**
 * - Authenticated users: customerId required, name/email optional (uses account data)
 * - Non-authenticated users: firstName, lastName, email required, customerId optional
 * 
 * @constant
 * @example
 * ```typescript
 * // Authenticated user
 * quoteSchema.parse({
 *   customerId: 123,
 *   items: [
 *     { productId: 'prod-1', quantity: 10, price: 99.99 },
 *     { productId: 'prod-2', quantity: 5, price: 49.99 }
 *   ],
 *   notes: 'Bulk discount requested',
 *   validUntil: new Date('2024-12-31')
 * });
 * 
 * // Non-authenticated user
 * quoteSchema.parse({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com',
 *   items: [
 *     { productId: 'prod-1', quantity: 10, price: 99.99 }
 *   ],
 *   notes: 'Urgent order needed',
 *   validUntil: new Date('2024-12-31')
 * });
 * ```
 */
/**
 * Quote schema with improved validation for authenticated vs guest users.
 * Uses superRefine for better error messages on specific fields.
 * 
 * **Authentication Detection:**
 * - Checks `isAuthenticated` flag (set by form when user is logged in)
 * - Falls back to `customerId > 0` for backward compatibility
 * - Allows authenticated users without customerId (e.g., admin accounts)
 */
export const quoteSchema = z
	.object({
		// Authenticated user fields
		customerId: z.coerce.number().nonnegative().optional(),
		// Hidden field to indicate authentication status (set by form)
		isAuthenticated: z.boolean().optional().default(false),
		
		// Non-authenticated user fields
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		email: z.string().optional(),
		
		// Common fields
		items: z
			.array(
				z.object({
					productId: z.string().min(1, 'Product is required'),
					quantity: z.coerce.number().int().positive('Quantity must be positive'),
					price: z.coerce.number().positive('Price must be positive'),
				})
			)
			.min(1, 'At least one item is required'),
		notes: z.string().optional(),
		validUntil: z.coerce.date(),
	})
	.superRefine((data, ctx) => {
		// Determine if user is authenticated
		// Check isAuthenticated flag first (set by form for logged-in users)
		// Fall back to customerId > 0 for backward compatibility
		const isAuthenticated = data.isAuthenticated === true || (data.customerId && data.customerId > 0)
		
		if (isAuthenticated) {
			// Authenticated users don't need guest fields (even if customerId is 0/null)
			return
		}
		
		// For non-authenticated users, validate guest fields with specific error messages
		if (!data.firstName || data.firstName.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'First name is required',
				path: ['firstName'],
			})
		}
		
		if (!data.lastName || data.lastName.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Last name is required',
				path: ['lastName'],
			})
		}
		
		if (!data.email || data.email.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Email address is required',
				path: ['email'],
			})
		} else if (!z.string().email().safeParse(data.email).success) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Please enter a valid email address',
				path: ['email'],
			})
		}
	})

/** Type-safe form data inferred from quoteSchema */
export type QuoteFormData = z.infer<typeof quoteSchema>

/**
 * Customer (Company) form validation schema.
 * For managing customer/company records.
 * 
 * Enhanced to include business classification, status, and sales rep assignment
 * per the Customer Management PRD (prd_customers.md).
 * 
 * **Fields:**
 * - Core: name, email, phone, taxId, website, identifier
 * - Classification: typeOfBusiness, status
 * - Sales Rep: primarySalesRepId (SalesManager+ only)
 * - Addresses: address, shippingAddress, billingAddress
 * - Internal: internalNotes (staff only, not visible to customers)
 * 
 * @see prd_customers.md - Customer Management PRD
 * @constant
 */
export const customerSchema = z.object({
	// Core fields
	name: z.string().min(1, 'Company name is required'),
	email: emailSchema,
	phone: phoneSchema,
	taxId: z.string().optional(),
	website: z.string().url('Invalid URL').optional().or(z.literal('')),
	identifier: z.string().optional(),
	
	// Business classification
	typeOfBusiness: z.number().int().min(0).max(6).optional(), // TypeOfBusiness enum (0-6)
	status: z.number().int().min(0).max(4).optional(), // CustomerStatus enum (0-4)
	
	// Sales rep assignment (SalesManager+ only)
	primarySalesRepId: z.number().int().positive().nullable().optional(),
	
	// Addresses
	address: addressSchema.optional(),
	shippingAddress: addressSchema.optional(),
	billingAddress: addressSchema.optional(),
	
	// Internal notes (staff only - not visible to customers)
	internalNotes: z.string().max(5000, 'Notes cannot exceed 5000 characters').optional(),
})

/** Type-safe form data inferred from customerSchema */
export type CustomerFormData = z.infer<typeof customerSchema>

/**
 * Provider (Supplier) form validation schema.
 * For managing provider/supplier records.
 * 
 * @constant
 */
export const providerSchema = z.object({
	name: z.string().min(1, 'Provider name is required'),
	email: emailSchema,
	phone: phoneSchema,
	address: addressSchema.optional(),
	taxId: z.string().optional(),
	website: z.string().url('Invalid URL').optional().or(z.literal('')),
})

/** Type-safe form data inferred from providerSchema */
export type ProviderFormData = z.infer<typeof providerSchema>

// ==========================================
// UTILITY SCHEMAS
// ==========================================

/**
 * Contact form validation schema.
 * For the public contact us form.
 * 
 * @constant
 * @example
 * ```typescript
 * contactSchema.parse({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   subject: 'Product Inquiry',
 *   message: 'I would like more information about...'
 * });
 * ```
 */
export const contactSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: emailSchema,
	subject: z.string().min(1, 'Subject is required'),
	message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
})

/** Type-safe form data inferred from contactSchema */
export type ContactFormData = z.infer<typeof contactSchema>

/**
 * Search filter validation schema.
 * For server-side search, pagination, and sorting.
 * 
 * @constant
 * @example
 * ```typescript
 * searchFilterSchema.parse({
 *   query: 'surgical',
 *   page: 1,
 *   pageSize: 20,
 *   sortBy: 'price',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export const searchFilterSchema = z.object({
	query: z.string().optional(),
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().default(10),
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).optional(),
})

/** Type-safe form data inferred from searchFilterSchema */
export type SearchFilterFormData = z.infer<typeof searchFilterSchema>

// ==========================================
// QUOTE PRICING SCHEMAS
// @see prd_quotes_pricing.md
// ==========================================

/**
 * Product pricing validation schema.
 * Used in QuotePricingEditor component.
 * 
 * **Business Rules:**
 * - vendorCost: Optional, must be non-negative if provided
 * - customerPrice: Optional (but required before sending quote), must be non-negative
 * - customerPrice must be >= vendorCost when both are set
 * 
 * @see prd_quotes_pricing.md - US-QP-001, US-QP-002
 * 
 * @example
 * ```typescript
 * // Valid pricing
 * productPricingSchema.parse({
 *   productId: 'abc-123-def',
 *   vendorCost: 100.00,
 *   customerPrice: 150.00,
 * }); // OK
 * 
 * // Invalid: customerPrice < vendorCost
 * productPricingSchema.parse({
 *   productId: 'abc-123-def',
 *   vendorCost: 100.00,
 *   customerPrice: 80.00,
 * }); // Error: Customer price must be >= vendor cost
 * ```
 */
export const productPricingSchema = z.object({
	productId: z.string().min(1, 'Product ID is required'),
	vendorCost: z.coerce.number().nonnegative('Vendor cost must be non-negative').nullable(),
	customerPrice: z.coerce.number().nonnegative('Customer price must be non-negative').nullable(),
}).refine(
	(data) => {
		// If both are set, customer price must be >= vendor cost
		if (data.vendorCost != null && data.customerPrice != null) {
			return data.customerPrice >= data.vendorCost
		}
		return true
	},
	{
		message: 'Customer price must be greater than or equal to vendor cost',
		path: ['customerPrice'],
	}
)

/** Type-safe form data inferred from productPricingSchema */
export type ProductPricingFormData = z.infer<typeof productPricingSchema>

/**
 * Quote pricing summary type (from API).
 * Contains totals, margins, and can-send status.
 * 
 * @see prd_quotes_pricing.md - US-QP-003
 */
export interface QuotePricingSummary {
	/** Quote ID */
	quoteId: string
	/** Sum of (vendorCost × quantity) for all products */
	totalVendorCost: number | null
	/** Sum of (customerPrice × quantity) for all products */
	totalCustomerPrice: number | null
	/** Total margin (totalCustomerPrice - totalVendorCost) */
	totalMargin: number | null
	/** Total margin percentage */
	totalMarginPercent: number | null
	/** Count of products with customerPrice set */
	productsWithPricing: number
	/** Total products in quote */
	totalProducts: number
	/** True if all products have customerPrice set */
	canSendToCustomer: boolean
}

// ==========================================
// ORDER WORKFLOW SCHEMAS
// @see prd_orders.md
// ==========================================

/**
 * Confirm payment validation schema.
 * Used when sales rep confirms payment for an order.
 * 
 * @see prd_orders.md - US-ORD-003
 * 
 * @example
 * ```typescript
 * confirmPaymentSchema.parse({
 *   paymentReference: 'CHK-12345',
 *   notes: 'Payment received via check',
 * })
 * ```
 */
export const confirmPaymentSchema = z.object({
	paymentReference: z.string().max(100, 'Payment reference cannot exceed 100 characters').optional(),
	notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
})

/** Type-safe form data inferred from confirmPaymentSchema */
export type ConfirmPaymentFormData = z.infer<typeof confirmPaymentSchema>

/**
 * Update order status validation schema.
 * Used for status transitions (Processing, Shipped, Delivered).
 * 
 * **Business Rules:**
 * - trackingNumber required when newStatus is Shipped (500)
 * - cancellationReason required when newStatus is Cancelled (0)
 * 
 * @see prd_orders.md - US-ORD-004, US-ORD-005
 */
export const updateOrderStatusSchema = z.object({
	newStatus: z.coerce.number().int(),
	trackingNumber: z.string().max(100, 'Tracking number cannot exceed 100 characters').optional(),
	carrier: z.string().max(50, 'Carrier cannot exceed 50 characters').optional(),
	cancellationReason: z.string().max(500, 'Cancellation reason cannot exceed 500 characters').optional(),
	internalNotes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
}).refine(
	(data) => {
		// Shipped (500) requires tracking number
		if (data.newStatus === 500 && !data.trackingNumber) {
			return false
		}
		return true
	},
	{
		message: 'Tracking number is required when marking as Shipped',
		path: ['trackingNumber'],
	}
).refine(
	(data) => {
		// Cancelled (0) requires reason
		if (data.newStatus === 0 && !data.cancellationReason) {
			return false
		}
		return true
	},
	{
		message: 'Cancellation reason is required',
		path: ['cancellationReason'],
	}
)

/** Type-safe form data inferred from updateOrderStatusSchema */
export type UpdateOrderStatusFormData = z.infer<typeof updateOrderStatusSchema>

/**
 * Add tracking validation schema.
 * Used when adding tracking to a specific order item.
 * 
 * @see prd_orders.md - US-ORD-004
 */
export const addTrackingSchema = z.object({
	orderItemId: z.coerce.number().int().positive('Order item ID is required'),
	trackingNumber: z.string().min(1, 'Tracking number is required').max(100, 'Tracking number cannot exceed 100 characters'),
	carrier: z.string().max(50, 'Carrier cannot exceed 50 characters').optional(),
})

/** Type-safe form data inferred from addTrackingSchema */
export type AddTrackingFormData = z.infer<typeof addTrackingSchema>

/**
 * Request cancellation validation schema.
 * Used when customer requests order cancellation.
 * 
 * @see prd_orders.md - US-ORD-006
 */
export const requestCancellationSchema = z.object({
	reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)').max(500, 'Reason cannot exceed 500 characters'),
})

/** Type-safe form data inferred from requestCancellationSchema */
export type RequestCancellationFormData = z.infer<typeof requestCancellationSchema>

// ==========================================
// RBAC ROLE MANAGEMENT SCHEMAS
// @see prd_rbac_management.md
// ==========================================

/**
 * Role name (identifier) validation.
 * Must be lowercase, alphanumeric with underscores only.
 * This becomes the immutable identifier (like AWS IAM role names).
 *
 * @example "sales_rep", "regional_manager", "warehouse_staff"
 */
export const roleNameSchema = z
	.string()
	.min(2, 'Role name must be at least 2 characters')
	.max(50, 'Role name cannot exceed 50 characters')
	.regex(
		/^[a-z][a-z0-9_]*$/,
		'Role name must start with a letter and contain only lowercase letters, numbers, and underscores'
	)
	.refine(
		(name) => !name.includes('__'),
		'Role name cannot contain consecutive underscores'
	)

/**
 * Role display name validation.
 * Human-readable name shown in UI.
 */
export const roleDisplayNameSchema = z
	.string()
	.min(2, 'Display name must be at least 2 characters')
	.max(100, 'Display name cannot exceed 100 characters')
	.regex(
		/^[a-zA-Z][a-zA-Z0-9\s\-&'.()]*$/,
		'Display name must start with a letter and contain only letters, numbers, spaces, and basic punctuation'
	)

/**
 * Role level validation.
 * Must be a positive integer within safe range.
 *
 * **Business Rules:**
 * - 0 is reserved for "no access" scenarios
 * - 1-999: Reserved for future expansion
 * - 1000-9998: Standard role levels
 * - 9999: Super Admin (typically locked)
 */
export const roleLevelSchema = z.coerce
	.number()
	.int('Level must be a whole number')
	.min(1, 'Level must be at least 1')
	.max(9999, 'Level cannot exceed 9999')

/**
 * Role badge variant for UI theming.
 * Maps to DaisyUI/TailwindCSS color schemes.
 */
export const roleBadgeVariantSchema = z.enum([
	'default',
	'primary',
	'secondary',
	'accent',
	'info',
	'success',
	'warning',
	'error',
	'neutral',
])

/**
 * Role form validation schema.
 * Complete validation for creating and editing roles.
 *
 * **MAANG Patterns Applied:**
 * - AWS IAM: Immutable role name (identifier)
 * - Google Cloud IAM: Display name separate from ID
 * - Okta: Level-based hierarchy with presets
 * - Azure AD: Badge/color for visual differentiation
 *
 * @see prd_rbac_management.md - Role CRUD requirements
 *
 * @example
 * ```typescript
 * roleSchema.parse({
 *   name: 'regional_manager',
 *   displayName: 'Regional Manager',
 *   level: 3500,
 *   description: 'Manages sales operations for a geographic region',
 *   badgeVariant: 'secondary',
 *   isActive: true,
 * })
 * ```
 */
export const roleSchema = z.object({
	/** Immutable identifier (lowercase_snake_case) */
	name: roleNameSchema,

	/** Human-readable display name */
	displayName: roleDisplayNameSchema,

	/** Access level (higher = more access) */
	level: roleLevelSchema,

	/** Description of role purpose and responsibilities */
	description: z
		.string()
		.max(500, 'Description cannot exceed 500 characters')
		.optional(),

	/** Badge color variant for UI display */
	badgeVariant: roleBadgeVariantSchema.optional().default('default'),

	/** Whether role is active (inactive roles cannot be assigned) */
	isActive: z.boolean().optional().default(true),
})

/** Type-safe form data inferred from roleSchema */
export type RoleFormData = z.infer<typeof roleSchema>

/**
 * Role update schema (name is immutable after creation).
 * Used when editing existing roles.
 */
export const roleUpdateSchema = roleSchema.omit({ name: true }).extend({
	/** Role ID for update target */
	id: z.number().int().positive('Invalid role ID'),
})

/** Type-safe form data for role updates */
export type RoleUpdateFormData = z.infer<typeof roleUpdateSchema>


