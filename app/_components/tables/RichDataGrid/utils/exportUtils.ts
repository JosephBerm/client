/**
 * Export Utilities for RichDataGrid
 *
 * IMPORTANT: This module contains heavy library dependencies (~1.2MB combined).
 * It should ONLY be imported dynamically using `await import('./exportUtils')`.
 *
 * Libraries included:
 * - CSV: papaparse (1.2M+ weekly downloads)
 * - Excel: ExcelJS (2.9M weekly downloads, better security than xlsx)
 * - PDF: jsPDF + jspdf-autotable (2.6M+ weekly downloads)
 *
 * MAANG Pattern: Dynamic Import for Code Splitting
 * - Types are defined in ./exportTypes.ts (zero-cost, static import safe)
 * - This module is loaded on-demand when user triggers export
 * - Reduces initial page load by ~1.2MB for data grid routes
 *
 * @example
 * // CORRECT: Dynamic import (lazy loading)
 * const handleExport = async () => {
 *   const { quickExport } = await import('./exportUtils')
 *   await quickExport(table, ExportFormat.Excel, 'filename')
 * }
 *
 * // WRONG: Static import (bundles with page)
 * import { quickExport } from './exportUtils' // Don't do this!
 *
 * @see ./exportTypes.ts for lightweight type definitions
 * @module exportUtils
 */

import Papa from 'papaparse'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import type { Table, Row, Column } from '@tanstack/react-table'

// Import types from the lightweight types module
import { ExportFormat, ExportScope } from '../types'
import type { ExportColumnConfig, ExportConfig, ExportResult } from './exportTypes'

// Re-export types for consumers who dynamic-import this module
export { ExportFormat, ExportScope }
export type { ExportColumnConfig, ExportConfig, ExportResult }

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get timestamp string for filename.
 */
function getTimestamp(): string {
	const now = new Date()
	return now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

/**
 * Trigger file download using native Blob API.
 * No external library needed for modern browsers.
 */
function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}

/**
 * Get cell value from a TanStack Table row.
 */
function getCellValue<TData>(
	row: Row<TData>,
	columnId: string,
	accessor?: (row: TData) => unknown
): unknown {
	if (accessor) {
		return accessor(row.original)
	}
	return row.getValue(columnId)
}

/**
 * Format cell value for export.
 */
function formatCellValue(value: unknown, formatter?: (value: unknown) => string): string {
	if (formatter) {
		return formatter(value)
	}
	if (value === null || value === undefined) {
		return ''
	}
	if (value instanceof Date) {
		return value.toLocaleDateString()
	}
	if (typeof value === 'object') {
		return JSON.stringify(value)
	}
	return String(value)
}

/**
 * Get column header text from TanStack Table column.
 */
function getColumnHeader<TData>(column: Column<TData, unknown>): string {
	const header = column.columnDef.header
	if (typeof header === 'string') {
		return header
	}
	// Fallback to column ID
	return column.id
}

/**
 * Get rows based on export scope.
 */
function getRowsForExport<TData>(
	table: Table<TData>,
	scope: ExportScope,
	selectedRows?: TData[]
): Row<TData>[] {
	switch (scope) {
		case ExportScope.CurrentPage:
			return table.getRowModel().rows
		case ExportScope.AllPages:
			return table.getCoreRowModel().rows
		case ExportScope.FilteredRows:
			return table.getFilteredRowModel().rows
		case ExportScope.SelectedRows:
			if (selectedRows && selectedRows.length > 0) {
				// Get rows that match selected originals
				const selectedSet = new Set(selectedRows)
				return table.getCoreRowModel().rows.filter((row) => selectedSet.has(row.original))
			}
			return table.getFilteredSelectedRowModel().rows
		default:
			return table.getRowModel().rows
	}
}

/**
 * Prepare export columns from table or config.
 */
function prepareExportColumns<TData>(
	table: Table<TData>,
	configColumns?: ExportColumnConfig[]
): ExportColumnConfig[] {
	if (configColumns && configColumns.length > 0) {
		return configColumns
	}

	// Use visible columns from table
	return table.getVisibleLeafColumns()
		.filter((col) => col.id !== 'select') // Exclude selection column
		.map((col) => ({
			id: col.id,
			header: getColumnHeader(col),
			width: col.getSize(),
		}))
}

/**
 * Prepare data rows for export.
 */
function prepareExportData<TData>(
	rows: Row<TData>[],
	columns: ExportColumnConfig[],
	transformRow?: (row: TData) => Record<string, unknown>
): Record<string, string>[] {
	return rows.map((row) => {
		const rowData: Record<string, string> = {}

		if (transformRow) {
			const transformed = transformRow(row.original)
			columns.forEach((col) => {
				rowData[col.header] = formatCellValue(transformed[col.id], col.formatter)
			})
		} else {
			columns.forEach((col) => {
				const value = getCellValue(row, col.id, col.accessor)
				rowData[col.header] = formatCellValue(value, col.formatter)
			})
		}

		return rowData
	})
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export data to CSV using papaparse.
 */
export async function exportToCSV<TData>(
	table: Table<TData>,
	config: ExportConfig<TData>,
	selectedRows?: TData[]
): Promise<ExportResult> {
	try {
		const columns = prepareExportColumns(table, config.columns)
		const rows = getRowsForExport(table, config.scope, selectedRows)
		const data = prepareExportData(rows, columns, config.transformRow)

		// Use papaparse to generate CSV
		const csv = Papa.unparse(data, {
			quotes: true, // Quote all fields
			header: true,
		})

		// Create blob and download
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const timestamp = config.includeTimestamp ? `_${getTimestamp()}` : ''
		const filename = `${config.filename}${timestamp}.csv`

		downloadBlob(blob, filename)

		return {
			success: true,
			rowCount: rows.length,
			filename,
		}
	} catch (error) {
		return {
			success: false,
			rowCount: 0,
			filename: '',
			error: error instanceof Error ? error.message : 'CSV export failed',
		}
	}
}

/**
 * Export data to Excel using ExcelJS.
 */
export async function exportToExcel<TData>(
	table: Table<TData>,
	config: ExportConfig<TData>,
	selectedRows?: TData[]
): Promise<ExportResult> {
	try {
		const columns = prepareExportColumns(table, config.columns)
		const rows = getRowsForExport(table, config.scope, selectedRows)
		const data = prepareExportData(rows, columns, config.transformRow)

		// Create workbook and worksheet
		const workbook = new ExcelJS.Workbook()
		workbook.creator = 'MedSource Pro'
		workbook.created = new Date()

		const worksheet = workbook.addWorksheet(config.sheetName ?? 'Data')

		// Add headers
		worksheet.columns = columns.map((col) => ({
			header: col.header,
			key: col.header,
			width: col.width ? Math.ceil(col.width / 8) : 15, // Convert pixels to Excel width units
		}))

		// Style header row
		const headerRow = worksheet.getRow(1)
		headerRow.font = { bold: true }
		headerRow.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFE0E0E0' },
		}
		headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

		// Add data rows
		data.forEach((row) => {
			worksheet.addRow(row)
		})

		// Auto-fit columns based on content
		worksheet.columns.forEach((column) => {
			if (column.values) {
				const lengths = column.values.map((v) => (v ? String(v).length : 0))
				const maxLength = Math.max(...lengths, 10)
				column.width = Math.min(maxLength + 2, 50)
			}
		})

		// Add borders to all cells
		worksheet.eachRow((row, rowNumber) => {
			row.eachCell((cell) => {
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				}
			})
		})

		// Generate buffer and download
		const buffer = await workbook.xlsx.writeBuffer()
		const blob = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		})
		const timestamp = config.includeTimestamp ? `_${getTimestamp()}` : ''
		const filename = `${config.filename}${timestamp}.xlsx`

		downloadBlob(blob, filename)

		return {
			success: true,
			rowCount: rows.length,
			filename,
		}
	} catch (error) {
		return {
			success: false,
			rowCount: 0,
			filename: '',
			error: error instanceof Error ? error.message : 'Excel export failed',
		}
	}
}

/**
 * Export data to PDF using jsPDF + jspdf-autotable.
 */
export async function exportToPDF<TData>(
	table: Table<TData>,
	config: ExportConfig<TData>,
	selectedRows?: TData[]
): Promise<ExportResult> {
	try {
		const columns = prepareExportColumns(table, config.columns)
		const rows = getRowsForExport(table, config.scope, selectedRows)
		const data = prepareExportData(rows, columns, config.transformRow)

		// Create PDF document
		const doc = new jsPDF({
			orientation: config.pdfOrientation ?? 'landscape',
			unit: 'pt',
			format: config.pdfPageSize ?? 'a4',
		})

		// Add title if provided
		if (config.title) {
			doc.setFontSize(18)
			doc.setFont('helvetica', 'bold')
			doc.text(config.title, 40, 40)
		}

		// Prepare table data for autotable
		const headers = columns.map((col) => col.header)
		const tableData = data.map((row) => columns.map((col) => row[col.header] ?? ''))

		// Add table using autotable
		autoTable(doc, {
			head: [headers],
			body: tableData,
			startY: config.title ? 60 : 40,
			styles: {
				fontSize: 9,
				cellPadding: 4,
				overflow: 'linebreak',
				valign: 'middle',
			},
			headStyles: {
				fillColor: [66, 139, 202],
				textColor: 255,
				fontStyle: 'bold',
				halign: 'center',
			},
			alternateRowStyles: {
				fillColor: [245, 245, 245],
			},
			columnStyles: columns.reduce(
				(acc, col, index) => {
					acc[index] = {
						halign: (col.align ?? 'left') as 'left' | 'center' | 'right',
						cellWidth: col.width ? col.width / 2 : 'auto',
					}
					return acc
				},
				{} as { [key: string]: { halign: 'left' | 'center' | 'right'; cellWidth: number | 'auto' } }
			),
			margin: { top: 40, right: 40, bottom: 40, left: 40 },
			didDrawPage: (data) => {
				// Add page numbers
				const pageCount = doc.getNumberOfPages()
				const pageNumber = doc.getCurrentPageInfo().pageNumber
				doc.setFontSize(8)
				doc.setFont('helvetica', 'normal')
				doc.text(
					`Page ${pageNumber} of ${pageCount}`,
					doc.internal.pageSize.width - 80,
					doc.internal.pageSize.height - 20
				)
				// Add timestamp
				doc.text(
					`Generated: ${new Date().toLocaleString()}`,
					40,
					doc.internal.pageSize.height - 20
				)
			},
		})

		// Generate blob and download
		const pdfBlob = doc.output('blob')
		const timestamp = config.includeTimestamp ? `_${getTimestamp()}` : ''
		const filename = `${config.filename}${timestamp}.pdf`

		downloadBlob(pdfBlob, filename)

		return {
			success: true,
			rowCount: rows.length,
			filename,
		}
	} catch (error) {
		return {
			success: false,
			rowCount: 0,
			filename: '',
			error: error instanceof Error ? error.message : 'PDF export failed',
		}
	}
}

/**
 * Main export function - routes to appropriate format handler.
 */
export async function exportData<TData>(
	table: Table<TData>,
	config: ExportConfig<TData>,
	selectedRows?: TData[]
): Promise<ExportResult> {
	switch (config.format) {
		case ExportFormat.CSV:
			return exportToCSV(table, config, selectedRows)
		case ExportFormat.Excel:
			return exportToExcel(table, config, selectedRows)
		case ExportFormat.PDF:
			return exportToPDF(table, config, selectedRows)
		default:
			return {
				success: false,
				rowCount: 0,
				filename: '',
				error: `Unsupported export format: ${config.format}`,
			}
	}
}

/**
 * Quick export helper with sensible defaults.
 */
export async function quickExport<TData>(
	table: Table<TData>,
	format: ExportFormat,
	filename: string,
	selectedRows?: TData[]
): Promise<ExportResult> {
	return exportData(table, {
		format,
		scope: selectedRows && selectedRows.length > 0 ? ExportScope.SelectedRows : ExportScope.FilteredRows,
		filename,
		includeTimestamp: true,
	}, selectedRows)
}
