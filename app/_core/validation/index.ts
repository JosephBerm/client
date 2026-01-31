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
	productPricingSchema,
	// Tenant schemas
	cssColorSchema,
	chartPaletteSchema,
	opacitySchema,
	daisyUIThemeNameSchema,
	DAISY_UI_THEME_NAMES,
	tenantThemeSchema,
	tenantUiConfigSchema,
	tenantConfigSchema,
	// Form types
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
	type ProductPricingFormData,
	type QuotePricingSummary,
	// Tenant form types
	type TenantThemeFormData,
	type TenantUiConfigFormData,
	type TenantConfigFormData,
} from './validation-schemas'

export { safeParseTenantConfig, validateTenantTheme, type SafeParseResult } from './guards'
