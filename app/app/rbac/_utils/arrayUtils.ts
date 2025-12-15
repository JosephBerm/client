/**
 * Array Utility Functions
 * 
 * Shared utilities for array operations.
 * 
 * @module RBAC ArrayUtils
 */

/**
 * Toggles an item in an array.
 * If item exists, removes it. If not, adds it.
 * 
 * @param array - Current array
 * @param item - Item to toggle
 * @returns New array with item toggled
 */
export function toggleArrayItem<T>(array: T[], item: T): T[] {
	if (array.includes(item)) {
		return array.filter(i => i !== item)
	} else {
		return [...array, item]
	}
}
