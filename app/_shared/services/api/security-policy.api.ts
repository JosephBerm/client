/**
 * Security Policy API Module
 *
 * Tenant-configurable security policies for MFA, sessions, trusted devices.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/security-policy
 */

import type {
	SecurityPolicyResponse,
	UpdateSecurityPolicyRequest,
	PolicyTemplatesResponse,
} from '../api.types'

import { HttpService } from '../httpService'

// =========================================================================
// SECURITY POLICY API
// =========================================================================

/**
 * Security Policy Management API
 * Tenant-configurable security policies for MFA, sessions, trusted devices, and step-up authentication.
 *
 * @see SECURITY_POLICY_MATRIX.md
 */
export const SecurityPolicyApi = {
	/**
	 * Gets the current tenant's security policy.
	 */
	get: async () => HttpService.get<SecurityPolicyResponse>('/tenant/security-policy'),

	/**
	 * Updates the tenant's security policy.
	 * This is a step-up protected endpoint - may require MFA re-verification.
	 */
	update: async (policy: UpdateSecurityPolicyRequest) =>
		HttpService.put<SecurityPolicyResponse>('/tenant/security-policy', policy),

	/**
	 * Resets the tenant's security policy to default values.
	 * This is a step-up protected endpoint - may require MFA re-verification.
	 */
	reset: async () => HttpService.post<SecurityPolicyResponse>('/tenant/security-policy/reset', {}),

	/**
	 * Gets available policy templates.
	 */
	getTemplates: async () => HttpService.get<PolicyTemplatesResponse>('/tenant/security-policy/templates'),
}
