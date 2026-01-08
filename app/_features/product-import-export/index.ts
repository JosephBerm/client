/**
 * Product Import/Export Feature Barrel Export
 * MVP Feature #04: Bulk product management via CSV/JSON
 *
 * **Usage:**
 * ```typescript
 * import { useStartImport, useExportToCsv } from '@_features/product-import-export'
 *
 * // For API calls, use centralized API object:
 * import API from '@_shared/services/api'
 * await API.ProductImportExport.startImport(file, options)
 * ```
 *
 * @module product-import-export
 */

// Types
export type {
	ImportStatus,
	ImportJobResponse,
	ImportRowError,
	ImportJobListResponse,
	StartImportRequest,
	ImportValidationResult,
	ImportPreviewSummary,
	ProductExportFilter,
	ImportTemplateColumn,
	ImportTemplateInfo,
} from './types'

// Hooks
export {
	productImportExportKeys,
	useStartImport,
	useImportStatus,
	useImportHistory,
	useCancelImport,
	useValidateImportFile,
	useExportToCsv,
	useExportToJson,
	useDownloadTemplate,
	useTemplateInfo,
} from './hooks'
