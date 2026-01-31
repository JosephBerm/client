/**
 * useProvidersPage Hook
 *
 * Encapsulates all business logic for the Providers page.
 * Follows the same pattern as useCustomersPage for consistency.
 *
 * **Features:**
 * - Delete/Archive/Suspend modal management
 * - Provider stats fetching
 * - RBAC permission checks
 * - Status filter state (All, Active, Suspended, Archived)
 * - Refresh key for table re-fetching
 *
 * **React 19 / Next.js 16 Optimizations:**
 * - No useCallback needed (React Compiler auto-memoizes)
 * - useMemo only for expensive computations
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 *
 * STATUS WORKFLOW (Industry Best Practice):
 * Active -> Suspended -> Archived (can be restored at each step)
 *
 * @module providers/hooks
 */

'use client'

import { useState } from 'react'

import { useAuthStore } from '@_features/auth'

import { logger } from '@_core'
import { API, notificationService, usePermissions } from '@_shared'
import type Provider from '@_classes/Provider'

import { useProviderStats } from './useProviderStats'
import type { ProviderStatusKey } from '../types'

type ModalMode = 'delete' | 'archive' | 'suspend'

interface ModalState {
	isOpen: boolean
	provider: Provider | null
	mode: ModalMode
}

interface SuspendModalState extends ModalState {
	reason: string
}

interface UseProvidersPageReturn {
	// State
	modal: ModalState
	suspendReason: string
	setSuspendReason: (reason: string) => void
	refreshKey: number
	statusFilter: ProviderStatusKey | 'all'
	isDeleting: boolean
	isArchiving: boolean
	isSuspending: boolean
	isActivating: boolean
	// Stats
	stats: ReturnType<typeof useProviderStats>['stats']
	statsLoading: boolean
	// RBAC
	isAdmin: boolean
	canDelete: boolean
	canManageStatus: boolean
	// Actions
	openDeleteModal: (provider: Provider) => void
	openArchiveModal: (provider: Provider) => void
	openSuspendModal: (provider: Provider) => void
	closeModal: () => void
	handleDelete: () => void
	handleArchive: () => void
	handleSuspend: () => void
	handleActivate: (provider: Provider) => void
	setStatusFilter: (filter: ProviderStatusKey | 'all') => void
	refreshTable: () => void
}

/**
 * Hook for managing providers page state and actions.
 *
 * @example
 * ```tsx
 * const {
 *   modal,
 *   stats,
 *   isAdmin,
 *   handleDelete,
 *   handleArchive,
 *   handleSuspend,
 *   handleActivate,
 * } = useProvidersPage()
 * ```
 */
export function useProvidersPage(): UseProvidersPageReturn {
	// Auth state for RBAC
	const user = useAuthStore((state) => state.user)

	// RBAC: Use usePermissions hook for role-based checks
	const { isAdmin } = usePermissions()
	const canDelete = isAdmin
	const canManageStatus = isAdmin

	// Modal state
	const [modal, setModal] = useState<ModalState>({
		isOpen: false,
		provider: null,
		mode: 'delete',
	})
	const [suspendReason, setSuspendReason] = useState('')

	// UI state
	const [refreshKey, setRefreshKey] = useState(0)
	const [statusFilter, setStatusFilter] = useState<ProviderStatusKey | 'all'>('all')
	const [isDeleting, setIsDeleting] = useState(false)
	const [isArchiving, setIsArchiving] = useState(false)
	const [isSuspending, setIsSuspending] = useState(false)
	const [isActivating, setIsActivating] = useState(false)

	// Stats
	const { stats, isLoading: statsLoading, refetch: refetchStats } = useProviderStats()

	// Modal actions - React 19: No useCallback needed
	const openDeleteModal = (provider: Provider) => {
		setModal({ isOpen: true, provider, mode: 'delete' })
	}

	const openArchiveModal = (provider: Provider) => {
		setModal({ isOpen: true, provider, mode: 'archive' })
	}

	const openSuspendModal = (provider: Provider) => {
		setSuspendReason('')
		setModal({ isOpen: true, provider, mode: 'suspend' })
	}

	const closeModal = () => {
		if (!isDeleting && !isArchiving && !isSuspending) {
			setModal({ isOpen: false, provider: null, mode: 'delete' })
			setSuspendReason('')
		}
	}

	// Refresh table and stats
	const refreshTable = () => {
		setRefreshKey((prev) => prev + 1)
		void refetchStats()
	}

	/**
	 * Delete a provider (hard delete).
	 * Admin only action.
	 */
	const handleDelete = async () => {
		if (!modal.provider || !modal.provider.id) {
			return
		}

		setIsDeleting(true)
		try {
			const { data } = await API.Providers.delete(modal.provider.id)

			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to delete provider', {
					metadata: { providerId: modal.provider.id },
					component: 'ProvidersPage',
					action: 'deleteProvider',
				})
				return
			}

			notificationService.success(data.message ?? 'Provider deleted successfully', {
				metadata: { providerId: modal.provider.id },
				component: 'ProvidersPage',
				action: 'deleteProvider',
			})
			closeModal()
			refreshTable()
		} catch (error) {
			notificationService.error('An error occurred while deleting the provider', {
				metadata: { error, providerId: modal.provider.id },
				component: 'ProvidersPage',
				action: 'deleteProvider',
			})
			logger.error('Delete provider error', { error })
		} finally {
			setIsDeleting(false)
		}
	}

	/**
	 * Archive a provider (soft delete).
	 * Sets status to Archived, preserves all data.
	 */
	const handleArchive = async () => {
		if (!modal.provider || !modal.provider.id) {
			return
		}

		setIsArchiving(true)
		try {
			const { data } = await API.Providers.archive(modal.provider.id)

			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to archive provider', {
					metadata: { providerId: modal.provider.id },
					component: 'ProvidersPage',
					action: 'archiveProvider',
				})
				return
			}

			notificationService.success('Provider archived successfully', {
				metadata: { providerId: modal.provider.id },
				component: 'ProvidersPage',
				action: 'archiveProvider',
			})
			closeModal()
			refreshTable()
		} catch (error) {
			notificationService.error('An error occurred while archiving the provider', {
				metadata: { error, providerId: modal.provider.id },
				component: 'ProvidersPage',
				action: 'archiveProvider',
			})
			logger.error('Archive provider error', { error })
		} finally {
			setIsArchiving(false)
		}
	}

	/**
	 * Suspend a provider with reason.
	 * Sets status to Suspended, requires reason.
	 */
	const handleSuspend = async () => {
		if (!modal.provider || !modal.provider.id) {
			return
		}

		if (!suspendReason.trim()) {
			notificationService.warning('Please provide a reason for suspension')
			return
		}

		setIsSuspending(true)
		try {
			const { data } = await API.Providers.suspend(modal.provider.id, suspendReason)

			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to suspend provider', {
					metadata: { providerId: modal.provider.id },
					component: 'ProvidersPage',
					action: 'suspendProvider',
				})
				return
			}

			notificationService.success('Provider suspended successfully', {
				metadata: { providerId: modal.provider.id },
				component: 'ProvidersPage',
				action: 'suspendProvider',
			})
			closeModal()
			refreshTable()
		} catch (error) {
			notificationService.error('An error occurred while suspending the provider', {
				metadata: { error, providerId: modal.provider.id },
				component: 'ProvidersPage',
				action: 'suspendProvider',
			})
			logger.error('Suspend provider error', { error })
		} finally {
			setIsSuspending(false)
		}
	}

	/**
	 * Activate a provider (restore to active status).
	 * Sets status back to Active from any other status.
	 */
	const handleActivate = async (provider: Provider) => {
		if (!provider.id) {
			return
		}
		setIsActivating(true)
		try {
			const { data } = await API.Providers.activate(provider.id)

			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to activate provider')
				return
			}

			notificationService.success('Provider activated successfully')
			refreshTable()
		} catch (error) {
			notificationService.error('An error occurred while activating the provider')
			logger.error('Activate provider error', { error, providerId: provider.id })
		} finally {
			setIsActivating(false)
		}
	}

	return {
		// State
		modal,
		suspendReason,
		setSuspendReason,
		refreshKey,
		statusFilter,
		isDeleting,
		isArchiving,
		isSuspending,
		isActivating,
		// Stats
		stats,
		statsLoading,
		// RBAC
		isAdmin,
		canDelete,
		canManageStatus,
		// Actions - wrap async functions to return void
		openDeleteModal,
		openArchiveModal,
		openSuspendModal,
		closeModal,
		handleDelete: () => void handleDelete(),
		handleArchive: () => void handleArchive(),
		handleSuspend: () => void handleSuspend(),
		handleActivate: (provider: Provider) => void handleActivate(provider),
		setStatusFilter,
		refreshTable,
	}
}

export default useProvidersPage
