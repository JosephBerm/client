/**
 * External Authentication API Module
 *
 * Handles social login operations (Google, Microsoft, Apple).
 * Includes provider availability check and account linking.
 *
 * @module api/external-auth
 */

import { HttpService } from '../httpService'

// =========================================================================
// TYPES
// =========================================================================

/**
 * Information about an available external login provider.
 */
export interface ExternalProvider {
	name: string
	displayName: string
	isAvailable: boolean
}

/**
 * Response from the providers endpoint.
 */
export interface ProvidersResponse {
	providers: ExternalProvider[]
}

/**
 * Information about a linked external account.
 */
export interface LinkedAccount {
	provider: string
	providerDisplayName?: string
	email?: string
	pictureUrl?: string
	linkedAt: string
	lastUsedAt?: string
}

// =========================================================================
// EXTERNAL AUTH API
// =========================================================================

/**
 * External Authentication API for social login operations.
 */
export const ExternalAuthApi = {
	/**
	 * Get available external login providers.
	 * Frontend uses this to show/hide social login buttons.
	 */
	async getAvailableProviders(): Promise<ProvidersResponse> {
		const response = await HttpService.get<ProvidersResponse>(
			'/auth/external/providers'
		)
		return response.data?.payload ?? { providers: [] }
	},

	/**
	 * Get the challenge URL for a provider.
	 * Frontend redirects to this URL to initiate OAuth flow.
	 *
	 * @param provider - Provider name (google, microsoft)
	 * @param returnUrl - URL to redirect back to after auth
	 */
	getChallengeUrl(provider: string, returnUrl?: string): string {
		const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5254/api'
		const params = new URLSearchParams()
		if (returnUrl) {
			params.set('returnUrl', returnUrl)
		}
		const queryString = params.toString()
		return `${baseUrl}/auth/external/challenge/${provider.toLowerCase()}${queryString ? `?${queryString}` : ''}`
	},

	/**
	 * Initiate social login by redirecting to provider.
	 *
	 * @param provider - Provider name (google, microsoft)
	 * @param returnUrl - URL to redirect back to after auth (optional)
	 */
	initiateLogin(provider: string, returnUrl?: string): void {
		const url = this.getChallengeUrl(provider, returnUrl)
		window.location.href = url
	},

	/**
	 * Get the link account URL for a provider.
	 * Used to add a social login to an existing account.
	 *
	 * @param provider - Provider name (google, microsoft)
	 * @param returnUrl - URL to redirect back to after linking
	 */
	getLinkUrl(provider: string, returnUrl?: string): string {
		const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5254/api'
		const params = new URLSearchParams()
		if (returnUrl) {
			params.set('returnUrl', returnUrl)
		}
		const queryString = params.toString()
		return `${baseUrl}/auth/external/link/${provider.toLowerCase()}${queryString ? `?${queryString}` : ''}`
	},

	/**
	 * Initiate account linking by redirecting to provider.
	 *
	 * @param provider - Provider name (google, microsoft)
	 * @param returnUrl - URL to redirect back to after linking (optional)
	 */
	initiateLink(provider: string, returnUrl?: string): void {
		const url = this.getLinkUrl(provider, returnUrl)
		window.location.href = url
	},

	/**
	 * Get all external accounts linked to the current user.
	 */
	async getLinkedAccounts(): Promise<LinkedAccount[]> {
		const response = await HttpService.get<LinkedAccount[]>('/auth/external/linked')
		return response.data?.payload ?? []
	},

	/**
	 * Unlink an external account from the current user.
	 *
	 * @param provider - Provider name to unlink (google, microsoft)
	 */
	async unlinkAccount(provider: string): Promise<void> {
		await HttpService.delete(`/auth/external/unlink/${provider.toLowerCase()}`)
	},
}

export default ExternalAuthApi
