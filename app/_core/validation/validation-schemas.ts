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
 * @constant
 * @example
 * ```typescript
 * productSchema.parse({
 *   name: 'Surgical Gloves',
 *   description: 'Latex-free surgical gloves',
 *   price: 29.99,
 *   quantity: 100,
 *   category: 'PPE',
 *   sku: 'SG-001',
 *   manufacturer: 'MedSupply Co'
 * });
 * ```
 */
export const productSchema = z.object({
	name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
	description: z.string().min(1, 'Description is required'),
	price: z.coerce.number().positive('Price must be positive'),
	quantity: z.coerce.number().int().nonnegative('Quantity cannot be negative'),
	category: z.string().min(1, 'Category is required'),
	sku: z.string().optional(),
	manufacturer: z.string().optional(),
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
 */
export const quoteSchema = z
	.object({
		// Authenticated user fields
		customerId: z.coerce.number().nonnegative().optional(),
		
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
		const isAuthenticated = data.customerId && data.customerId > 0
		
		if (isAuthenticated) {
			// Authenticated users don't need guest fields
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
 * @constant
 */
export const customerSchema = z.object({
	name: z.string().min(1, 'Company name is required'),
	email: emailSchema,
	phone: phoneSchema,
	address: addressSchema.optional(),
	taxId: z.string().optional(),
	website: z.string().url('Invalid URL').optional().or(z.literal('')),
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


