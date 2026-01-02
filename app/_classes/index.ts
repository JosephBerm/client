/**
 * Domain Classes and Models - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Centralized export for all domain models, DTOs, and helper classes.
 * These classes represent the core business entities and utilities.
 * 
 * **Architecture:**
 * - Pure TypeScript classes and interfaces
 * - No React dependencies
 * - Server + Client safe
 * - FAANG-level enum helpers
 * 
 * @module classes
 */

// ============================================================================
// CORE BASE CLASSES
// ============================================================================

export { default as Guid } from './Base/Guid'
export { PagedResult } from './Base/PagedResult'
export { GenericSearchFilter } from './Base/GenericSearchFilter'
export { default as CustomerSummary } from './Base/CustomerSummary'

// ============================================================================
// COMMON UTILITIES
// ============================================================================

export { default as Address } from './common/Address'
export { default as Name } from './common/Name'

// ============================================================================
// ENUMS (Business Logic Enums)
// ============================================================================

export {
	TypeOfBusiness,
	QuoteStatus,
	NotificationType,
	AccountRole,
	AccountStatus,
	OrderStatus,
	PublicRouteType,
	InternalRouteType,
	CustomerStatus,
	getAccountStatusLabel,
	canAccountLogin,
	getAccountStatusSeverity,
	type AccountRoleType,
} from './Enums'

export { Theme } from './SharedEnums'

// ============================================================================
// ENUM HELPERS (FAANG Pattern - Metadata + Type Safety)
// ============================================================================

export {
	default as OrderStatusHelper,
	type OrderStatusMetadata,
	type OrderStatusVariant,
	type OrderStatusCategory,
} from './Helpers/OrderStatusHelper'

export {
	default as ThemeHelper,
	type ThemeMetadata,
} from './Helpers/ThemeHelper'

export {
	default as NotificationTypeHelper,
	type NotificationTypeMetadata,
	type NotificationVariant,
	type NotificationPriority,
} from './Helpers/NotificationTypeHelper'

export {
	default as AccountRoleHelper,
	type AccountRoleMetadata,
	type AccountRoleVariant,
} from './Helpers/AccountRoleHelper'

export {
	default as QuoteStatusHelper,
	type QuoteStatusMetadata,
	type QuoteStatusVariant,
} from './Helpers/QuoteStatusHelper'

export {
	default as TypeOfBusinessHelper,
	type TypeOfBusinessMetadata,
	type BusinessIndustryCategory,
} from './Helpers/TypeOfBusinessHelper'

// ============================================================================
// ENTITY CLASSES (Business Domain Models)
// ============================================================================

export { default as Company } from './Company'
export { default as User } from './User'
export { Product } from './Product'
export { default as ProductsCategory } from './ProductsCategory'
export { default as Provider } from './Provider'
export { default as Order } from './Order'
export { default as Quote } from './Quote'
export { default as ContactRequest } from './ContactRequest'
export { default as Notification } from './Notification'
export { default as UploadedFile } from './UploadedFile'
export { default as Home } from './Home'
export { default as HtmlImage } from './HtmlImage'
export { default as About } from './About'

// ============================================================================
// REQUEST/FILTER CLASSES (DTOs and Query Objects)
// ============================================================================

export { SubmitOrderRequest } from './RequestClasses'
export { default as FinanceSearchFilter } from './FinanceSearchFilter'
export { default as FinanceNumbers } from './FinanceNumbers'
export { default as LoginCredentials } from './LoginCredentials'
export { PagedData } from './PagedData'

// Carousel types
export type {
	CarouselCTA,
	CarouselOverlay,
	CarouselSlideWithOverlay,
	CarouselContentResponse,
} from './CarouselTypes'

