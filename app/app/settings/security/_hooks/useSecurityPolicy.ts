/**
 * useSecurityPolicy Hook
 *
 * Data fetching and mutation hook for tenant security policy management.
 * Handles loading, updating, and resetting security policies.
 *
 * **Features:**
 * - Fetch current policy on mount
 * - Update policy with optimistic UI
 * - Reset to defaults
 * - Load and apply policy templates
 * - Error handling with user feedback
 *
 * @module useSecurityPolicy
 */

'use client'

import { useState, useCallback, useEffect } from 'react'

import { API, notificationService } from '@_shared'
import type {
	SecurityPolicyResponse,
	UpdateSecurityPolicyRequest,
	PolicyTemplate,
	PolicyTemplatesResponse,
} from '@_shared'

import { logger } from '@_core'

// =========================================================================
// TYPES
// =========================================================================

export interface UseSecurityPolicyReturn {
	/** Current policy data */
	policy: SecurityPolicyResponse | null
	/** Available policy templates */
	templates: PolicyTemplate[]
	/** Whether policy is loading */
	isLoading: boolean
	/** Whether policy is being saved */
	isSaving: boolean
	/** Error message if any */
	error: string | null
	/** Refetch the current policy */
	refetch: () => Promise<void>
	/** Update the policy */
	updatePolicy: (updates: UpdateSecurityPolicyRequest) => Promise<boolean>
	/** Reset policy to defaults */
	resetPolicy: () => Promise<boolean>
	/** Apply a template */
	applyTemplate: (template: PolicyTemplate) => Promise<boolean>
}

// =========================================================================
// HOOK
// =========================================================================

/**
 * Hook for managing tenant security policy.
 *
 * @returns Security policy state and actions
 */
export function useSecurityPolicy(): UseSecurityPolicyReturn {
	const [policy, setPolicy] = useState<SecurityPolicyResponse | null>(null)
	const [templates, setTemplates] = useState<PolicyTemplate[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Fetches the current security policy.
	 */
	const fetchPolicy = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await API.SecurityPolicy.get()

			if (response.data.statusCode === 200 && response.data.payload) {
				setPolicy(response.data.payload)
			} else {
				setError(response.data.message ?? 'Failed to load security policy')
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load security policy'
			setError(message)
			logger.error('Failed to fetch security policy', {
				component: 'useSecurityPolicy',
				error: message,
			})
		} finally {
			setIsLoading(false)
		}
	}, [])

	/**
	 * Fetches available policy templates.
	 */
	const fetchTemplates = useCallback(async () => {
		try {
			const response = await API.SecurityPolicy.getTemplates()

			if (response.data.statusCode === 200 && response.data.payload) {
				setTemplates(response.data.payload.templates)
			}
		} catch (err) {
			logger.debug('Failed to fetch policy templates', {
				component: 'useSecurityPolicy',
				error: err instanceof Error ? err.message : 'Unknown error',
			})
		}
	}, [])

	/**
	 * Updates the security policy.
	 *
	 * @param updates - Partial policy updates
	 * @returns True if successful
	 */
	const updatePolicy = useCallback(async (updates: UpdateSecurityPolicyRequest): Promise<boolean> => {
		setIsSaving(true)
		setError(null)

		try {
			const response = await API.SecurityPolicy.update(updates)

			if (response.data.statusCode === 200 && response.data.payload) {
				setPolicy(response.data.payload)
				notificationService.success('Security policy updated successfully')
				return true
			} else {
				const errorMessage = response.data.message ?? 'Failed to update security policy'
				setError(errorMessage)
				notificationService.error(errorMessage)
				return false
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update security policy'
			setError(message)
			notificationService.error(message)
			logger.error('Failed to update security policy', {
				component: 'useSecurityPolicy',
				error: message,
			})
			return false
		} finally {
			setIsSaving(false)
		}
	}, [])

	/**
	 * Resets the policy to default values.
	 *
	 * @returns True if successful
	 */
	const resetPolicy = useCallback(async (): Promise<boolean> => {
		setIsSaving(true)
		setError(null)

		try {
			const response = await API.SecurityPolicy.reset()

			if (response.data.statusCode === 200 && response.data.payload) {
				setPolicy(response.data.payload)
				notificationService.success('Security policy reset to defaults')
				return true
			} else {
				const errorMessage = response.data.message ?? 'Failed to reset security policy'
				setError(errorMessage)
				notificationService.error(errorMessage)
				return false
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to reset security policy'
			setError(message)
			notificationService.error(message)
			logger.error('Failed to reset security policy', {
				component: 'useSecurityPolicy',
				error: message,
			})
			return false
		} finally {
			setIsSaving(false)
		}
	}, [])

	/**
	 * Applies a policy template.
	 *
	 * @param template - Template to apply
	 * @returns True if successful
	 */
	const applyTemplate = useCallback(
		async (template: PolicyTemplate): Promise<boolean> => {
			const success = await updatePolicy(template.policy)
			if (success) {
				notificationService.success(`Applied "${template.displayName}" template`)
			}
			return success
		},
		[updatePolicy]
	)

	// Fetch policy and templates on mount
	useEffect(() => {
		void fetchPolicy()
		void fetchTemplates()
	}, [fetchPolicy, fetchTemplates])

	return {
		policy,
		templates,
		isLoading,
		isSaving,
		error,
		refetch: fetchPolicy,
		updatePolicy,
		resetPolicy,
		applyTemplate,
	}
}
