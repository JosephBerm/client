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
		if (options?.updateExisting !== undefined) {
			formData.append('updateExisting', String(options.updateExisting))
		}
		if (options?.createCategories !== undefined) {
			formData.append('createCategories', String(options.createCategories))
		}
		return HttpService.post<ImportJobResponse>('/products/import', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},

	/**
	 * Gets import job status.
	 */
	getJobStatus: async (jobId: string) => HttpService.get<ImportJobResponse>(`/products/import/${jobId}`),

	/**
	 * Gets all import jobs with pagination.
	 */
	getJobs: async (page = 1, pageSize = 10) =>
		HttpService.get<ImportJobListResponse>(`/products/import?page=${page}&pageSize=${pageSize}`),

	/**
	 * Cancels a running import job.
	 */
	cancelJob: async (jobId: string) => HttpService.post<boolean>(`/products/import/${jobId}/cancel`, {}),

	/**
	 * Validates a file without importing.
	 */
	validateFile: async (file: File) => {
		const formData = new FormData()
		formData.append('file', file)
		return HttpService.post<ImportValidationResult>('/products/import/validate', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},

	/**
	 * Exports products to CSV or JSON.
	 */
	exportProducts: async (filter?: ProductExportFilter) => {
		const format = filter?.format || 'csv'
		return HttpService.download<Blob>('/products/export', filter || {}, {
			responseType: 'blob',
			headers: { Accept: format === 'csv' ? 'text/csv' : 'application/json' },
		})
	},

	/**
	 * Downloads an import template.
	 */
	downloadTemplate: async (format: 'csv' | 'json' = 'csv') =>
		HttpService.download<Blob>(
			`/products/import/template?format=${format}`,
			{},
			{
				responseType: 'blob',
			}
		),

	/**
	 * Gets template column definitions.
	 */
	getTemplateInfo: async () => HttpService.get<ImportTemplateInfo>('/products/import/template/info'),
}
