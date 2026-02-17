/**
 * Product Import/Export API Module
 *
 * Bulk product management via CSV/JSON files.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/product-import-export
 */

import type {
	ImportJobResponse,
	ImportJobListResponse,
	ImportValidationResult,
	ImportTemplateInfo,
	ProductExportFilter,
	StartImportRequest,
} from '@_features/product-import-export/types'

import { HttpService } from '../httpService'

// =========================================================================
// PRODUCT IMPORT/EXPORT API
// =========================================================================

/**
 * Product Import/Export API (MVP Feature #04)
 * Bulk product management via CSV/JSON.
 *
 * @see 04_PRODUCT_IMPORT_EXPORT_PLAN.md
 */
export const ProductImportExportApi = {
	/**
	 * Starts a product import from uploaded file.
	 */
	startImport: async (file: File, options?: StartImportRequest) => {
		const formData = new FormData()
		formData.append('file', file)
		const query = new URLSearchParams()
		if (options?.updateExisting !== undefined) {
			query.set('updateExisting', String(options.updateExisting))
		}
		if (options?.createCategories !== undefined) {
			query.set('createCategories', String(options.createCategories))
		}

		const queryString = query.toString()
		if (!queryString) {
			return HttpService.post<ImportJobResponse>('/products/import-export/import', formData)
		}
		return HttpService.post<ImportJobResponse>(`/products/import-export/import?${queryString}`, formData)
	},

	/**
	 * Gets import job status.
	 */
	getJobStatus: async (jobId: string) =>
		HttpService.get<ImportJobResponse>(`/products/import-export/import/${jobId}/status`),

	/**
	 * Gets all import jobs with pagination.
	 */
	getJobs: async (page = 1, pageSize = 10) =>
		HttpService.get<ImportJobListResponse>(
			`/products/import-export/import/history?page=${page}&pageSize=${pageSize}`
		),

	/**
	 * Cancels a running import job.
	 */
	cancelJob: async (jobId: string) =>
		HttpService.post<boolean>(`/products/import-export/import/${jobId}/cancel`, {}),

	/**
	 * Validates a file without importing.
	 */
	validateFile: async (file: File) => {
		const formData = new FormData()
		formData.append('file', file)
		return HttpService.post<ImportValidationResult>('/products/import-export/validate', formData)
	},

	/**
	 * Exports products to CSV or JSON.
	 */
	exportProducts: async (filter?: ProductExportFilter) => {
		const format = filter?.format || 'csv'
		const query = new URLSearchParams()
		if (filter?.categoryId) query.set('categoryId', String(filter.categoryId))
		if (filter?.providerId) query.set('providerId', String(filter.providerId))
		if (filter?.includeArchived !== undefined) query.set('includeArchived', String(filter.includeArchived))
		if (filter?.searchTerm) query.set('searchTerm', filter.searchTerm)

		const queryString = query.toString()
		const url = queryString
			? `/products/import-export/export/${format}?${queryString}`
			: `/products/import-export/export/${format}`

		return HttpService.download<Blob>(url, null, {
			method: 'GET',
			responseType: 'blob',
			headers: { Accept: format === 'csv' ? 'text/csv' : 'application/json' },
		})
	},

	/**
	 * Downloads an import template.
	 */
	downloadTemplate: async (format: 'csv' | 'json' = 'csv') =>
		HttpService.download<Blob>(`/products/import-export/template/${format}`, null, {
			method: 'GET',
			responseType: 'blob',
		}),

	/**
	 * Gets template column definitions.
	 */
	getTemplateInfo: async () => HttpService.get<ImportTemplateInfo>('/products/import-export/template/info'),
}
