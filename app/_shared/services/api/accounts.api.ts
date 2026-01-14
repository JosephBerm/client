/**
 * Accounts API Module
 *
 * User account management, profile updates, password changes, and MFA operations.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/accounts
 */

import type CustomerSummary from '@_classes/Base/CustomerSummary'
import type { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type { PagedResult } from '@_classes/Base/PagedResult'
import type User from '@_classes/User'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'

import { HttpService } from '../httpService'

// =========================================================================
// TYPES
// =========================================================================

/**
 * Role distribution statistics returned by RBAC dashboard API.
 */
export interface RoleDistribution {
	totalUsers: number
	customerCount: number
	salesRepCount: number
	salesManagerCount: number
	fulfillmentCoordinatorCount: number
	adminCount: number
}

/**
 * Request model for admin account creation.
 */
export interface AdminCreateAccountRequest {
	/** Email address (required, must be unique) */
	email: string
	/** Username (optional, defaults to email) */
	username?: string
	/** First name (optional) */
	firstName?: string
	/** Last name (optional) */
	lastName?: string
	/** Role level (numeric, defaults to Customer=0) */
	role: number
	/** Temporary password (optional, auto-generated if not provided) */
	temporaryPassword?: string
	/** Whether to send invitation email (default: true) */
	sendInvitationEmail: boolean
}

/**
 * Response model for admin account creation.
 */
export interface AdminCreateAccountResponse {
	/** The created account (password cleared) */
	account: User
	/** Temporary password (only if auto-generated) */
	temporaryPassword?: string
	/** Whether invitation email was sent */
	invitationEmailSent: boolean
}

/**
 * Request DTO for changing account status (unified endpoint).
 */
export interface ChangeAccountStatusRequest {
	/** Target account status (AccountStatus enum value) */
	status: number
	/** Optional reason (required for Suspended status, max 500 chars) */
	reason?: string
}

/**
 * Response DTO for account status changes.
 */
export interface StatusChangeResult {
	/** Whether the status change was successful */
	success: boolean
	/** Previous account status (AccountStatus enum value) */
	oldStatus: number
	/** New account status (AccountStatus enum value) */
	newStatus: number
	/** Error message if status change failed */
	errorMessage?: string
	/** Timestamp when status was changed (ISO string) */
	changedAt: string
}

// =========================================================================
// MFA NAMESPACE
// =========================================================================

/**
 * MFA API for two-factor authentication operations.
 */
export const MfaApi = {
	/**
	 * Starts TOTP setup by generating a new secret.
	 * Returns QR code URI and base32 secret for manual entry.
	 */
	startTotpSetup: async () =>
		HttpService.post<{ otpAuthUri: string; secret: string }>('/account/mfa/totp/setup/start', {}),

	/**
	 * Confirms TOTP setup by verifying the first code.
	 * Returns backup codes on success.
	 */
	confirmTotpSetup: async (code: string) =>
		HttpService.post<{ backupCodes: string[] }>('/account/mfa/totp/setup/confirm', { code }),

	/**
	 * Disables MFA for the current user.
	 * Requires password and optional MFA code for step-up auth.
	 */
	disable: async (password: string, mfaCode?: string) =>
		HttpService.post<boolean>('/account/mfa/disable', { password, mfaCode }),

	/**
	 * Regenerates backup codes (invalidates old ones).
	 */
	regenerateBackupCodes: async (password: string, mfaCode?: string) =>
		HttpService.post<{ backupCodes: string[] }>('/account/mfa/backup-codes/regenerate', { password, mfaCode }),

	/**
	 * Gets user's MFA settings status.
	 */
	getSettings: async () =>
		HttpService.get<{ isEnabled: boolean; enabledMethods: number; totpConfirmedAt?: string }>('/account/mfa/settings'),

	/**
	 * Gets list of trusted devices for current user.
	 */
	getTrustedDevices: async () =>
		HttpService.get<
			Array<{
				id: string
				createdAt: string
				lastUsedAt: string
				expiresAt: string
				ipFirstSeen?: string
				userAgentFirstSeen?: string
			}>
		>('/account/mfa/trusted-devices'),

	/**
	 * Revokes a specific trusted device.
	 */
	revokeDevice: async (deviceId: string) =>
		HttpService.post<boolean>(`/account/mfa/trusted-devices/${deviceId}/revoke`, {}),

	/**
	 * Revokes all trusted devices (step-up auth required).
	 */
	revokeAllDevices: async (password: string, mfaCode?: string) =>
		HttpService.post<{ revokedCount: number }>('/account/mfa/trusted-devices/revoke-all', { password, mfaCode }),
}

// =========================================================================
// ACCOUNTS API
// =========================================================================

/**
 * Account Management API
 * Handles user accounts, profiles, passwords, and analytics.
 */
export const AccountsApi = {
	/**
	 * Gets current user account or specific account by ID.
	 */
	get: async <_T>(id: string | null | undefined) => HttpService.get<User>(`/account${id ? '/' + id : ''}`),

	/**
	 * Updates user account information.
	 * Returns the updated user account for state synchronization.
	 */
	update: async (account: User) => HttpService.put<User>('/account', account),

	/**
	 * Changes password for current user.
	 */
	changePassword: async <T>(oldPassword: string, newPassword: string) =>
		HttpService.put<T>('/account/changepassword', { oldPassword, newPassword }),

	/**
	 * Changes password for specific user (admin only or self-service).
	 */
	changePasswordById: async <T>(userId: string, oldPassword: string, newPassword: string) =>
		HttpService.put<T>(`/account/changepasswordById`, { userId, oldPassword, newPassword }),

	/**
	 * Admin-only: Reset any user's password without requiring old password.
	 */
	adminResetPassword: async (userId: string, newPassword: string) =>
		HttpService.put<boolean>('/account/admin/reset-password', { userId: parseInt(userId, 10), newPassword }),

	/**
	 * Gets accounts by role level list.
	 */
	getByRole: async (roleLevels?: number[]) => {
		const roleParam = roleLevels?.length ? `?roles=${encodeURIComponent(roleLevels.join('|'))}` : ''
		return HttpService.get<User[]>(`/account/by-role${roleParam}`)
	},

	/**
	 * Gets all user accounts (admin only).
	 */
	getAll: async () => HttpService.get<User[]>('/account/all'),

	/**
	 * Centralized account search with flexible filtering, pagination, and sorting.
	 */
	search: async (search: GenericSearchFilter) => HttpService.post<PagedResult<User>>(`/account/search`, search),

	/**
	 * Rich search for accounts with advanced filtering, sorting, and facets.
	 */
	richSearch: async (filter: RichSearchFilter) =>
		HttpService.post<RichPagedResult<User>>(`/account/search/rich`, filter),

	/**
	 * Gets dashboard analytics summary for current user.
	 */
	getDashboardSummary: async () => HttpService.get<CustomerSummary>('/account/analytics'),

	/**
	 * Deletes a user account (admin only).
	 */
	delete: async (id: string) => HttpService.delete<boolean>(`/account/${id}`),

	/**
	 * Updates user role (admin only).
	 */
	updateRole: async (id: string, role: number) => HttpService.put<User>(`/account/${id}/role`, { role }),

	/**
	 * Gets role distribution statistics (admin only).
	 */
	getRoleStats: async () => HttpService.get<RoleDistribution>('/account/role-stats'),

	/**
	 * Admin-only: Create a new user account with specified role.
	 */
	adminCreate: async (request: AdminCreateAccountRequest) =>
		HttpService.post<AdminCreateAccountResponse>('/account/admin/create', request),

	/**
	 * MFA (Two-Factor Authentication) operations.
	 */
	Mfa: MfaApi,

	/**
	 * Admin-only: Change account status (unified endpoint).
	 */
	changeStatus: async (id: string, status: number, reason?: string) => {
		const request: ChangeAccountStatusRequest = {
			status,
			...(reason && { reason }),
		}
		return HttpService.put<StatusChangeResult>(`/account/${id}/status`, request)
	},
}
