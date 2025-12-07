/**
 * Icon Mapping Helper
 * 
 * Centralized icon mapping system for consistent icon usage throughout the app.
 * Maps string identifiers to Lucide React icon components.
 * 
 * **Benefits:**
 * - Single source of truth for icon mappings
 * - Type-safe icon selection
 * - Easy to add/modify icons
 * - Prevents import duplication
 * 
 * @module IconMapping
 */

import {
	LayoutDashboard,
	Package,
	ClipboardList,
	Receipt,
	Users,
	Hospital,
	Factory,
	BarChart3,
	User,
	Settings,
	Store,
	Bell,
	type LucideIcon,
} from 'lucide-react'

import type { NavigationIconType } from '@_types/navigation'

/**
 * Icon component mapping.
 * Maps NavigationIconType strings to Lucide React icon components.
 */
const iconMapping: Record<NavigationIconType, LucideIcon> = {
	dashboard: LayoutDashboard,
	package: Package,
	'clipboard-list': ClipboardList,
	receipt: Receipt,
	users: Users,
	hospital: Hospital,
	factory: Factory,
	'bar-chart': BarChart3,
	user: User,
	settings: Settings,
	store: Store,
	bell: Bell,
}

/**
 * Retrieves the Lucide icon component for a given icon identifier.
 * 
 * @param icon - The icon identifier
 * @returns The corresponding Lucide icon component
 * 
 * @example
 * ```tsx
 * const Icon = getIconComponent('dashboard')
 * return <Icon size={24} />
 * ```
 */
export function getIconComponent(icon: NavigationIconType): LucideIcon {
	return iconMapping[icon]
}

/**
 * Checks if an icon identifier is valid.
 * 
 * @param icon - The icon identifier to check
 * @returns True if the icon exists in the mapping
 */
export function isValidIcon(icon: string): icon is NavigationIconType {
	return icon in iconMapping
}

