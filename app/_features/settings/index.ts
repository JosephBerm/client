/**
 * Settings Feature - Main Barrel Export (Optimized for Tree-Shaking)
 * 
 * User settings, theme management, and preferences.
 * 
 * @example
 * ```typescript
 * import { ThemeService, useUserSettingsStore } from '@_features/settings'
 * ```
 * 
 * @module settings
 */

// ============================================================================
// SERVICES
// ============================================================================

export { getSettingsSections } from './services/SettingsService'
export {
	UserSettingsService,
	type UserSettings,
} from './services/UserSettingsService'
export { ThemeService } from './services/ThemeService'
export { ReducedMotionService } from './services/ReducedMotionService'
export { BasePreferenceService } from './services/BasePreferenceService'

// ============================================================================
// STORES (Client-Only - have 'use client')
// ============================================================================

export { useUserSettingsStore } from './stores/useUserSettingsStore'

