/**
 * Domain Classes and Models - Barrel Export
 * 
 * Centralized export for all domain models, DTOs, and helper classes.
 * These classes represent the core business entities and utilities.
 * 
 * @module classes
 */

// Core Base Classes
export { default as Guid } from './Base/Guid'
export { PagedResult } from './Base/PagedResult'
export { GenericSearchFilter } from './Base/GenericSearchFilter'
export { default as CustomerSummary } from './Base/CustomerSummary'

// Common Utilities
export { default as Address } from './common/Address'
export { default as Name } from './common/Name'

// Enums
export * from './Enums'
export * from './SharedEnums'

// Helper Classes (Enum Helpers - FAANG Pattern)
export * from './Helpers'

// Entity Classes
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

// Request/Filter Classes
export * from './RequestClasses'
export { default as FinanceSearchFilter } from './FinanceSearchFilter'
export { default as FinanceNumbers } from './FinanceNumbers'
export { default as LoginCredentials } from './LoginCredentials'
export { PagedData } from './PagedData'
export * from './CarouselTypes'

