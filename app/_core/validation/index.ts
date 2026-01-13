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
	adminCreateAccountSchema,
	changePasswordSchema,
	profileUpdateSchema,
	productSchema,
	orderSchema,
	quoteSchema,
	customerSchema,
	providerSchema,
	contactSchema,
	searchFilterSchema,
	// Pricing Engine schemas
	createPriceListSchema,
	updatePriceListSchema,
	priceListItemSchema,
	volumeTierSchema,
	setVolumeTiersSchema,
	pricingRequestSchema,
	type LoginFormData,
	type SignupFormData,
	type AdminCreateAccountFormData,
	type ChangePasswordFormData,
	type ProfileUpdateFormData,
	type ProductFormData,
	type OrderFormData,
	type QuoteFormData,
	type CustomerFormData,
	type ProviderFormData,
	type ContactFormData,
	type SearchFilterFormData,
	// Pricing Engine form types
	type CreatePriceListFormData,
	type UpdatePriceListFormData,
	type PriceListItemFormData,
	type VolumeTierFormData,
	type SetVolumeTiersFormData,
	type PricingRequestFormData,
} from './validation-schemas'
