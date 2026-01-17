/**
 * Export Types - Lightweight Type Definitions
 *
 * This module contains ONLY type definitions for the export functionality.
 * It deliberately avoids importing heavy libraries (ExcelJS, jsPDF, papaparse)
 * to enable code splitting and lazy loading of the actual export implementation.
 *
 * MAANG Pattern: Separation of Types from Implementation
 * - Types are statically imported (zero runtime cost)
 * - Implementation is dynamically imported only when needed
 * - Reduces initial bundle size by ~1.2MB on data grid pages
 *
 * @see https://web.dev/code-splitting-with-dynamic-imports-in-nextjs/
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
 *
 * @module exportTypes
 */

import type { Table, Row, Column } from '@tanstack/react-table'

// Re-export enums from the main types file (these are already lightweight)
export { ExportFormat, ExportScope } from '../types/richDataGridTypes'

// ============================================================================
// TYPE DEFINITIONS (Zero Runtime Cost)
// ============================================================================

/**
 * Column configuration for export.
 * Defines how each column should be exported.
 */
export interface ExportColumnConfig {
	/** Column ID from TanStack Table */
	id: string
	/** Display header text for the exported file */
	header: string
	/** Optional accessor function to extract value from row data */
	accessor?: (row: unknown) => unknown
	/** Optional formatter for display value in export */
	formatter?: (value: unknown) => string
	/** Column width for Excel/PDF (in characters or points) */
	width?: number
	/** Text alignment in exported document */
	align?: 'left' | 'center' | 'right'
}

/**
 * Export options configuration.
 * Comprehensive settings for controlling export behavior.
 *
 * @template TData - The type of data in the table rows
 */
export interface ExportConfig<TData = unknown> {
	/** Export format (CSV, Excel, PDF) */
	format: import('../types/richDataGridTypes').ExportFormat
	/** Export scope (current page, all rows, selected, filtered) */
	scope: import('../types/richDataGridTypes').ExportScope
	/** Filename (without extension) */
	filename: string
	/** Column configurations (if not provided, uses all visible columns) */
	columns?: ExportColumnConfig[]
	/** Sheet name for Excel export */
	sheetName?: string
	/** Title for PDF export header */
	title?: string
	/** Include timestamp in filename (e.g., "export_2024-01-15") */
	includeTimestamp?: boolean
	/** Custom row transformer for data manipulation before export */
	transformRow?: (row: TData) => Record<string, unknown>
	/** PDF orientation setting */
	pdfOrientation?: 'portrait' | 'landscape'
	/** PDF page size setting */
	pdfPageSize?: 'a4' | 'letter' | 'legal'
}

/**
 * Export result with metadata.
 * Returned after export operation completes.
 */
export interface ExportResult {
	/** Whether export was successful */
	success: boolean
	/** Number of rows exported */
	rowCount: number
	/** Filename with extension that was generated */
	filename: string
	/** Error message if export failed */
	error?: string
}

// ============================================================================
// FUNCTION SIGNATURES (For Type-Only Imports)
// ============================================================================

/**
 * Type signature for the main export function.
 * Use this for type annotations without importing the implementation.
 */
export type ExportDataFn<TData = unknown> = (
	table: Table<TData>,
	config: ExportConfig<TData>,
	selectedRows?: TData[]
) => Promise<ExportResult>

/**
 * Type signature for quick export helper.
 */
export type QuickExportFn<TData = unknown> = (
	table: Table<TData>,
	format: import('../types/richDataGridTypes').ExportFormat,
	filename: string,
	selectedRows?: TData[]
) => Promise<ExportResult>

/**
 * Type signature for format-specific export functions.
 */
export type FormatExportFn<TData = unknown> = (
	table: Table<TData>,
	config: ExportConfig<TData>,
	selectedRows?: TData[]
) => Promise<ExportResult>

// ============================================================================
// DYNAMIC IMPORT HELPER TYPE
// ============================================================================

/**
 * Type for the dynamically imported export utilities module.
 * Use this when working with `await import('./exportUtils')`.
 *
 * @example
 * const exportModule: ExportUtilsModule = await import('./exportUtils')
 * await exportModule.quickExport(table, ExportFormat.Excel, 'products')
 */
export interface ExportUtilsModule {
	exportData: ExportDataFn
	quickExport: QuickExportFn
	exportToCSV: FormatExportFn
	exportToExcel: FormatExportFn
	exportToPDF: FormatExportFn
}
