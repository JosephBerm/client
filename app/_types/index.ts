/**
 * Types - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Centralized type definitions for the application.
 * Pure TypeScript types - zero runtime cost.
 * 
 * **Architecture:**
 * - Single source of truth for shared types
 * - Enables DRY-compliant type usage
 * - Supports Dependency Inversion Principle
 * - Zero bundle impact (types only)
 * 
 * @example
 * ```typescript
 * import type { BreadcrumbItem, NavigationRoute, NavigationSection } from '@_types'
 * ```
 * 
 * @module types
 */

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type {
	BreadcrumbItem,
	NavigationIconType,
	NavigationRoute,
	NavigationSection,
} from './navigation'

export { AccountRole } from './navigation'

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export type {
	SelectOption,
	SelectSettingItem,
	ToggleSettingItem,
	ButtonSettingItem,
	CustomSettingItem,
	SettingItem,
	SettingsSection,
} from './settings'

