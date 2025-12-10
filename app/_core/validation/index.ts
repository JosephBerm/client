/**
 * Validation - Core Module (Optimized for Tree-Shaking)
 * 
 * Application-wide Zod validation schemas.
 * Server + Client safe.
 * 
 * @module core/validation
 */

export {
	emailSchema,
	passwordSchema,
	usernameSchema,
	phoneSchema,
	nameSchema,
	addressSchema,
	loginSchema,
	signupSchema,
	changePasswordSchema,
	profileUpdateSchema,
	productSchema,
	orderSchema,
	quoteSchema,
	customerSchema,
	providerSchema,
	contactSchema,
	searchFilterSchema,
	type LoginFormData,
	type SignupFormData,
	type ChangePasswordFormData,
	type ProfileUpdateFormData,
	type ProductFormData,
	type OrderFormData,
	type QuoteFormData,
	type CustomerFormData,
	type ProviderFormData,
	type ContactFormData,
	type SearchFilterFormData,
} from './validation-schemas'

