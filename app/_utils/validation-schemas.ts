import { z } from 'zod'

// Common validators
export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required')

export const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

export const usernameSchema = z
	.string()
	.min(3, 'Username must be at least 3 characters')
	.max(50, 'Username must not exceed 50 characters')
	.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

export const phoneSchema = z
	.string()
	.regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
	.optional()
	.or(z.literal(''))

// Name schema
export const nameSchema = z.object({
	first: z.string().min(1, 'First name is required').max(50, 'First name must not exceed 50 characters'),
	middle: z.string().optional(),
	last: z.string().min(1, 'Last name is required').max(50, 'Last name must not exceed 50 characters'),
})

// Address schema
export const addressSchema = z.object({
	street: z.string().min(1, 'Street is required'),
	city: z.string().min(1, 'City is required'),
	state: z.string().min(1, 'State/Province is required'),
	zipCode: z.string().min(1, 'ZIP/Postal code is required'),
	country: z.string().min(1, 'Country is required'),
})

// Login schema
export const loginSchema = z.object({
	identifier: z.string().min(1, 'Email or username is required'),
	password: z.string().min(1, 'Password is required'),
	rememberMe: z.boolean().optional().default(false),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Signup schema
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
		path: ['confirmPassword'],
	})

export type SignupFormData = z.infer<typeof signupSchema>

// Change password schema
export const changePasswordSchema = z
	.object({
		oldPassword: z.string().min(1, 'Current password is required'),
		newPassword: passwordSchema,
		confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords don't match",
		path: ['confirmNewPassword'],
	})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// Profile update schema
export const profileUpdateSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	name: nameSchema,
	dateOfBirth: z.coerce.date().optional().nullable(),
	phone: phoneSchema,
	mobile: phoneSchema,
	shippingDetails: addressSchema.optional(),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

// Product schema
export const productSchema = z.object({
	name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
	description: z.string().min(1, 'Description is required'),
	price: z.coerce.number().positive('Price must be positive'),
	quantity: z.coerce.number().int().nonnegative('Quantity cannot be negative'),
	category: z.string().min(1, 'Category is required'),
	sku: z.string().optional(),
	manufacturer: z.string().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

// Order schema
export const orderSchema = z.object({
	customerId: z.coerce.number().positive('Customer is required'),
	shippingAddress: addressSchema,
	notes: z.string().optional(),
})

export type OrderFormData = z.infer<typeof orderSchema>

// Quote schema
export const quoteSchema = z.object({
	customerId: z.coerce.number().positive('Customer is required'),
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

export type QuoteFormData = z.infer<typeof quoteSchema>

// Contact form schema
export const contactSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: emailSchema,
	subject: z.string().min(1, 'Subject is required'),
	message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
})

export type ContactFormData = z.infer<typeof contactSchema>

// Customer schema
export const customerSchema = z.object({
	name: z.string().min(1, 'Company name is required'),
	email: emailSchema,
	phone: phoneSchema,
	address: addressSchema.optional(),
	taxId: z.string().optional(),
	website: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type CustomerFormData = z.infer<typeof customerSchema>

// Provider schema
export const providerSchema = z.object({
	name: z.string().min(1, 'Provider name is required'),
	email: emailSchema,
	phone: phoneSchema,
	address: addressSchema.optional(),
	taxId: z.string().optional(),
	website: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type ProviderFormData = z.infer<typeof providerSchema>

// Search filter schema
export const searchFilterSchema = z.object({
	query: z.string().optional(),
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().default(10),
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type SearchFilterFormData = z.infer<typeof searchFilterSchema>


