/**
 * Lib - Main Barrel Export
 * 
 * Pure utility functions with no side effects.
 * Can be used anywhere without concerns about dependencies.
 * 
 * @example
 * ```typescript
 * import { formatCurrency, formatDate, parseDate, addDays } from '@_lib'
 * ```
 * 
 * @module lib
 */

// Formatters (currency, text)
export * from './formatters'

// Date utilities (centralized date handling)
// Clean wildcard export - no conflicts since formatDate is not exported from formatters
export * from './dates'

