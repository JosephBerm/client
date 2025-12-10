/**
 * Formatters - Lib Module (Optimized for Tree-Shaking)
 * 
 * Pure formatting functions with no side effects.
 * Server + Client safe.
 * 
 * **Note**: Date formatting has been moved to `@_lib/dates`.
 * 
 * @module lib/formatters
 */

// Currency
export { formatCurrency } from './currency'

// Finance
export {
	formatFinanceCurrency,
	formatFinanceNumber,
	isEmptyFinanceData,
	isValidFinanceData,
} from './finance'

// Text
export { truncate } from './text'

