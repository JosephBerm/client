/**
 * Confirmation Utility Functions
 * 
 * Shared utilities for confirmation dialogs.
 * 
 * @module RBAC ConfirmationUtils
 */

/**
 * Shows a confirmation dialog.
 * Returns a promise that resolves to true if confirmed, false otherwise.
 * 
 * @param message - Confirmation message
 * @returns Promise<boolean>
 */
export function confirmAction(message: string): Promise<boolean> {
	return Promise.resolve(window.confirm(message))
}

/**
 * Confirms deletion of an entity.
 * 
 * @param entityName - Name of the entity being deleted
 * @param entityIdentifier - Identifier to display (e.g., name, ID)
 * @returns Promise<boolean>
 */
export function confirmDelete(entityName: string, entityIdentifier: string): Promise<boolean> {
	return confirmAction(`Are you sure you want to delete ${entityName} "${entityIdentifier}"?`)
}
