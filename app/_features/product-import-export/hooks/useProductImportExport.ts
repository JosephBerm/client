/**
 * Product Import/Export Hooks
 * MVP Feature #04: TanStack Query hooks for bulk product management
 *
 * **Architecture Pattern:**
 * - Uses centralized API.ProductImportExport for all API calls
 * - Follows project conventions for data fetching
 *
 * @module product-import-export/hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import API from '@_shared/services/api'
import type { ProductExportFilter, StartImportRequest } from '../types'

/**
 * Helper to trigger file download from blob
 */
function downloadBlob(blob: Blob, filename: string): void {
	const url = window.URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	window.URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════════════════
// QUERY KEY FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export const productImportExportKeys = {
	all: ['product-import-export'] as const,
	importJobs: () => [...productImportExportKeys.all, 'import-jobs'] as const,
	importJob: (id: string) => [...productImportExportKeys.importJobs(), id] as const,
	importHistory: (page: number, pageSize: number) =>
		[...productImportExportKeys.importJobs(), 'history', { page, pageSize }] as const,
	templateInfo: () => [...productImportExportKeys.all, 'template-info'] as const,
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook to start a product import
 */
export function useStartImport() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ file, options }: { file: File; options?: StartImportRequest }) => {
			const response = await API.ProductImportExport.startImport(file, options)
			return response.data.payload!
		},
		onSuccess: () => {
			// Invalidate import history to show new job
			queryClient.invalidateQueries({ queryKey: productImportExportKeys.importJobs() })
			// Also invalidate products as they may change
			queryClient.invalidateQueries({ queryKey: ['products'] })
		},
	})
}

/**
 * Hook to get import job status
 * Auto-refetches while job is processing
 */
export function useImportStatus(jobId: string | null, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: productImportExportKeys.importJob(jobId ?? ''),
		queryFn: async () => {
			if (!jobId) throw new Error('Job ID required')
			const response = await API.ProductImportExport.getJobStatus(jobId)
			return response.data.payload!
		},
		enabled: !!jobId && (options?.enabled ?? true),
		// Poll every 2 seconds while processing
		refetchInterval: (query) => {
			const status = query.state.data?.status
			if (status === 'Processing' || status === 'Validating' || status === 'Pending') {
				return 2000
			}
			return false
		},
	})
}

/**
 * Hook to get import job history
 */
export function useImportHistory(page = 1, pageSize = 10) {
	return useQuery({
		queryKey: productImportExportKeys.importHistory(page, pageSize),
		queryFn: async () => {
			const response = await API.ProductImportExport.getJobs(page, pageSize)
			return response.data.payload!
		},
	})
}

/**
 * Hook to cancel an import job
 */
export function useCancelImport() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (jobId: string) => {
			const response = await API.ProductImportExport.cancelJob(jobId)
			return response.data.payload!
		},
		onSuccess: (_, jobId) => {
			// Invalidate the specific job and the list
			queryClient.invalidateQueries({ queryKey: productImportExportKeys.importJob(jobId) })
			queryClient.invalidateQueries({ queryKey: productImportExportKeys.importJobs() })
		},
	})
}

/**
 * Hook to validate an import file
 */
export function useValidateImportFile() {
	return useMutation({
		mutationFn: async (file: File) => {
			const response = await API.ProductImportExport.validateFile(file)
			return response.data.payload!
		},
	})
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook to export products to CSV
 */
export function useExportToCsv() {
	return useMutation({
		mutationFn: async (filter?: ProductExportFilter) => {
			const response = await API.ProductImportExport.exportProducts({ ...filter, format: 'csv' })
			const blob = response.data as unknown as Blob
			const timestamp = new Date().toISOString().slice(0, 10)
			downloadBlob(blob, `products_export_${timestamp}.csv`)
			return blob
		},
	})
}

/**
 * Hook to export products to JSON
 */
export function useExportToJson() {
	return useMutation({
		mutationFn: async (filter?: ProductExportFilter) => {
			const response = await API.ProductImportExport.exportProducts({ ...filter, format: 'json' })
			const blob = response.data as unknown as Blob
			const timestamp = new Date().toISOString().slice(0, 10)
			downloadBlob(blob, `products_export_${timestamp}.json`)
			return blob
		},
	})
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook to download import template
 */
export function useDownloadTemplate() {
	return useMutation({
		mutationFn: async (format: 'csv' | 'json' = 'csv') => {
			const response = await API.ProductImportExport.downloadTemplate(format)
			const blob = response.data as unknown as Blob
			downloadBlob(blob, `product_import_template.${format}`)
			return blob
		},
	})
}

/**
 * Hook to get template column definitions
 */
export function useTemplateInfo() {
	return useQuery({
		queryKey: productImportExportKeys.templateInfo(),
		queryFn: async () => {
			const response = await API.ProductImportExport.getTemplateInfo()
			return response.data.payload!
		},
		staleTime: Infinity, // Template info rarely changes
	})
}
