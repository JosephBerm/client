/**
 * Enum Helpers - Barrel Export
 *
 * FAANG-level enum helper classes following the metadata pattern.
 * Each helper provides type-safe, centralized access to enum metadata.
 *
 * **Pattern (Google/Netflix/Stripe):**
 * - Exhaustive metadata mapping with Record<Enum, Metadata>
 * - Static helper methods for querying
 * - TypeScript enforces completeness
 * - Zero magic strings
 * - Single source of truth
 *
 * **Benefits:**
 * - Add enum value → TypeScript forces metadata → Everything works
 * - No hardcoded display names/variants scattered in codebase
 * - Type-safe queries and validations
 * - Self-documenting (toList for dropdowns)
 * - Unit testable
 *
 * **Usage:**
 * ```typescript
 * import { OrderStatusHelper, ThemeHelper } from '@_classes/Helpers'
 *
 * // Get display name
 * const statusName = OrderStatusHelper.getDisplay(order.status)
 *
 * // Get UI variant
 * const variant = OrderStatusHelper.getVariant(order.status)
 *
 * // Populate dropdown
 * <FormSelect
 *   options={OrderStatusHelper.toList.map(meta => ({
 *     value: meta.value,
 *     label: meta.display,
 *   }))}
 * />
 *
 * // Check theme properties
 * if (ThemeHelper.isDarkTheme(currentTheme)) {
 *   // Apply dark-specific logic
 * }
 * ```
 *
 * @module Helpers
 */

// Core Helpers
export { default as OrderStatusHelper } from './OrderStatusHelper'
export type { OrderStatusMetadata, OrderStatusVariant, OrderStatusCategory } from './OrderStatusHelper'

export { default as ThemeHelper } from './ThemeHelper'
export type { ThemeMetadata } from './ThemeHelper'

export { default as NotificationTypeHelper } from './NotificationTypeHelper'
export type { NotificationTypeMetadata, NotificationVariant, NotificationPriority } from './NotificationTypeHelper'

export { default as QuoteStatusHelper } from './QuoteStatusHelper'
export type { QuoteStatusMetadata, QuoteStatusVariant } from './QuoteStatusHelper'

export { default as TypeOfBusinessHelper } from './TypeOfBusinessHelper'
export type { TypeOfBusinessMetadata, BusinessIndustryCategory } from './TypeOfBusinessHelper'
