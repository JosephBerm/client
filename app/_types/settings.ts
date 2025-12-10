/**
 * Settings Types
 * 
 * Type definitions for the Settings Modal system.
 * Provides type-safe interfaces for settings sections, items, and their various types.
 * 
 * **Architecture:**
 * - Discriminated unions for type-safe setting items
 * - Flexible structure supporting multiple setting types
 * - Extensible for future setting types
 * 
 * **Setting Types:**
 * - **select**: Dropdown selection (e.g., theme, language)
 * - **toggle**: Boolean checkbox (e.g., notifications)
 * - **button**: Action trigger (e.g., clear cache)
 * - **custom**: Fully custom React component
 * 
 * @module settings
 */

import type { ComponentType } from 'react'

import type { LucideIcon } from 'lucide-react'

/**
 * Select option interface for dropdown settings.
 */
export interface SelectOption {
	/** Option value (stored in state) */
	value: string
	/** Display label for the option */
	label: string
}

/**
 * Base interface for all setting items.
 * Contains properties common to all setting types.
 */
interface BaseSettingItem {
	/** Unique identifier for the setting */
	id: string
	/** Display label for the setting */
	label: string
	/** Optional description/help text */
	description?: string
}

/**
 * Select (dropdown) setting item.
 * Used for choosing from a list of options.
 */
export interface SelectSettingItem extends BaseSettingItem {
	type: 'select'
	/** Current selected value */
	value: string
	/** Available options */
	options: SelectOption[]
	/** Optional placeholder text */
	placeholder?: string
	/** Callback when selection changes */
	onChange: (value: string) => void
}

/**
 * Toggle (checkbox) setting item.
 * Used for boolean on/off settings.
 */
export interface ToggleSettingItem extends BaseSettingItem {
	type: 'toggle'
	/** Current checked state */
	checked: boolean
	/** Callback when toggle changes */
	onChange: (checked: boolean) => void
}

/**
 * Button setting item.
 * Used for triggering actions.
 */
export interface ButtonSettingItem extends BaseSettingItem {
	type: 'button'
	/** Button style variant */
	variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'error'
	/** Callback when button is clicked */
	onClick: () => void
}

/**
 * Custom setting item.
 * Allows for fully custom React components.
 */
export interface CustomSettingItem extends BaseSettingItem {
	type: 'custom'
	/** Custom React component type (not instance) */
	component: ComponentType
}

/**
 * Union type of all possible setting items.
 * Uses discriminated union with 'type' as the discriminator.
 */
export type SettingItem =
	| SelectSettingItem
	| ToggleSettingItem
	| ButtonSettingItem
	| CustomSettingItem

/**
 * Settings section interface.
 * Groups related settings together with a title and icon.
 */
export interface SettingsSection {
	/** Unique identifier for the section */
	id: string
	/** Display title for the section */
	title: string
	/** Icon component from lucide-react */
	icon: LucideIcon
	/** Optional description for the section */
	description?: string
	/** Array of setting items in this section */
	items: SettingItem[]
}

