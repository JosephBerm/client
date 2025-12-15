/**
 * Permission Utility Functions
 * 
 * Shared utilities for formatting and grouping permissions.
 * 
 * @module RBAC PermissionUtils
 */

import type { Permission } from '@_shared/services/api'

/**
 * Formats a permission into a readable string.
 * Format: resource:action:context or resource:action
 */
export function formatPermissionString(permission: Permission): string {
	if (permission.context) {
		return `${permission.resource}:${permission.action}:${permission.context}`
	}
	return `${permission.resource}:${permission.action}`
}

/**
 * Groups permissions by resource.
 */
export function groupPermissionsByResource(
	permissions: Permission[]
): Record<string, Permission[]> {
	return permissions.reduce((acc, perm) => {
		const resource = perm.resource
		if (!acc[resource]) {
			acc[resource] = []
		}
		acc[resource].push(perm)
		return acc
	}, {} as Record<string, Permission[]>)
}

/**
 * Formats permission action:context for display.
 */
export function formatPermissionDisplay(permission: Permission): string {
	if (permission.context) {
		return `${permission.action}:${permission.context}`
	}
	return permission.action
}
