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
 * STATUS WORKFLOW (Industry Best Practice):
 * Active -> Suspended -> Archived (can be restored at each step)
 * 
 * @module providers/hooks
 */

'use client'

import { useCallback, useState } from 'react'

import { useAuthStore } from '@_features/auth'

import { logger } from '@_core'
import { API, HttpService, notificationService } from '@_shared'
import { AccountRole } from '@_classes/Enums'
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
	// Auth state
	const { user } = useAuthStore()
	const isAdmin = user?.role === AccountRole.Admin

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

	// Modal actions
	const openDeleteModal = useCallback((provider: Provider) => {
		setModal({ isOpen: true, provider, mode: 'delete' })
	}, [])

	const openArchiveModal = useCallback((provider: Provider) => {
		setModal({ isOpen: true, provider, mode: 'archive' })
	}, [])

	const openSuspendModal = useCallback((provider: Provider) => {
		setSuspendReason('')
		setModal({ isOpen: true, provider, mode: 'suspend' })
	}, [])

	const closeModal = useCallback(() => {
		setModal({ isOpen: false, provider: null, mode: 'delete' })
		setSuspendReason('')
	}, [])

	// Refresh table
	const refreshTable = useCallback(() => {
		setRefreshKey((prev) => prev + 1)
	}, [])

	// Delete handler
	const handleDeleteAsync = useCallback(async () => {
		if (!modal.provider) {
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
			void refetchStats()
		} catch (error) {
			notificationService.error('An error occurred while deleting the provider', {
				metadata: { error, providerId: modal.provider.id },
				component: 'ProvidersPage',
				action: 'deleteProvider',
			})
		} finally {
			setIsDeleting(false)
		}
	}, [modal.provider, closeModal, refreshTable, refetchStats])

	// Archive handler
	const handleArchiveAsync = useCallback(async () => {
		if (!modal.provider) {
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
			void refetchStats()
		} catch (error) {
			notificationService.error('An error occurred while archiving the provider', {
				metadata: { error, providerId: modal.provider.id },
				component: 'ProvidersPage',
				action: 'archiveProvider',
			})
		} finally {
			setIsArchiving(false)
		}
	}, [modal.provider, closeModal, refreshTable, refetchStats])

	// Suspend handler
	const handleSuspendAsync = useCallback(async () => {
		if (!modal.provider) {
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
			void refetchStats()
		} catch (error) {
			notificationService.error('An error occurred while suspending the provider', {
				metadata: { error, providerId: modal.provider.id },
				component: 'ProvidersPage',
				action: 'suspendProvider',
			})
		} finally {
			setIsSuspending(false)
		}
	}, [modal.provider, suspendReason, closeModal, refreshTable, refetchStats])

	// Activate handler (restore to active status)
	const handleActivateAsync = useCallback(async (provider: Provider) => {
		setIsActivating(true)
		try {
			const { data } = await API.Providers.activate(provider.id)

			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to activate provider')
				return
			}

			notificationService.success('Provider activated successfully')
			refreshTable()
			void refetchStats()
		} catch (error) {
			notificationService.error('An error occurred while activating the provider')
			logger.error('Activate provider error', { error, providerId: provider.id })
		} finally {
			setIsActivating(false)
		}
	}, [refreshTable, refetchStats])

	// Wrapper functions for async handlers
	const handleDelete = useCallback(() => {
		void handleDeleteAsync().catch((error) => {
			logger.error('Unhandled delete error', {
				error,
				component: 'ProvidersPage',
				action: 'handleDelete',
			})
		})
	}, [handleDeleteAsync])

	const handleArchive = useCallback(() => {
		void handleArchiveAsync().catch((error) => {
			logger.error('Unhandled archive error', {
				error,
				component: 'ProvidersPage',
				action: 'handleArchive',
			})
		})
	}, [handleArchiveAsync])

	const handleSuspend = useCallback(() => {
		void handleSuspendAsync().catch((error) => {
			logger.error('Unhandled suspend error', {
				error,
				component: 'ProvidersPage',
				action: 'handleSuspend',
			})
		})
	}, [handleSuspendAsync])

	const handleActivate = useCallback((provider: Provider) => {
		void handleActivateAsync(provider).catch((error) => {
			logger.error('Unhandled activate error', {
				error,
				component: 'ProvidersPage',
				action: 'handleActivate',
			})
		})
	}, [handleActivateAsync])

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
		canDelete: isAdmin,
		canManageStatus: isAdmin,
		// Actions
		openDeleteModal,
		openArchiveModal,
		openSuspendModal,
		closeModal,
		handleDelete,
		handleArchive,
		handleSuspend,
		handleActivate,
		setStatusFilter,
		refreshTable,
	}
}

export default useProvidersPage

