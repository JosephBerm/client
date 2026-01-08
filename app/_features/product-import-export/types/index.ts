/**
 * Product Import/Export Types
 * MVP Feature #04: Bulk product management via CSV/JSON
 *
 * @module product-import-export/types
 */

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT JOB TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Import job status
 */
export type ImportStatus =
	| 'Pending'
	| 'Validating'
	| 'Processing'
	| 'Completed'
	| 'CompletedWithErrors'
	| 'Failed'
	| 'Cancelled'

/**
 * Import job response from API
 */
export interface ImportJobResponse {
	id: string
	entityType: string
	fileName: string
	fileFormat: string
	totalRows: number
	processedRows: number
	successCount: number
	errorCount: number
	skippedCount: number
	status: ImportStatus
	progressPercentage: number
	errors?: ImportRowError[]
	errorMessage?: string
	createdAt: string
	startedAt?: string
	completedAt?: string
	createdBy: string
}

/**
 * Row-level error from import
 */
export interface ImportRowError {
	row: number
	field?: string
	message: string
}

/**
 * Import job list with pagination
 */
export interface ImportJobListResponse {
	items: ImportJobResponse[]
	totalCount: number
	pageNumber: number
	pageSize: number
}

/**
 * Request to start import
 */
export interface StartImportRequest {
	updateExisting?: boolean
	createCategories?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Import validation result
 */
export interface ImportValidationResult {
	isValid: boolean
	totalRows: number
	validRows: number
	invalidRows: number
	errors: ImportRowError[]
	warnings: string[]
	preview?: ImportPreviewSummary
}

/**
 * Preview summary of what import will do
 */
export interface ImportPreviewSummary {
	newProducts: number
	updatedProducts: number
	skippedProducts: number
	newCategories: number
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Export filter options
 */
export interface ProductExportFilter {
	categoryId?: number
	providerId?: number
	includeArchived?: boolean
	searchTerm?: string
	format?: 'csv' | 'json'
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Template column definition
 */
export interface ImportTemplateColumn {
	name: string
	description: string
	required: boolean
	dataType: string
	example?: string
}

/**
 * Template metadata
 */
export interface ImportTemplateInfo {
	entityType: string
	format: string
	columns: ImportTemplateColumn[]
}
