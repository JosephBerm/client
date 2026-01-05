/**
 * ExportModal - Advanced Export Options Modal
 *
 * Provides detailed export configuration including:
 * - Format selection (CSV, Excel, PDF)
 * - Scope selection (current page, all rows, selected, filtered)
 * - Column selection
 * - Filename customization
 *
 * @module ExportModal
 */

'use client'
'use memo'

import { useState, useEffect } from 'react'
import { X, Download, FileSpreadsheet, FileText, File, Check } from 'lucide-react'
import { useEscapeKey } from '@_shared'

import { useRichDataGridContext, useRichDataGridSelection } from '../../context/RichDataGridContext'
import {
	ExportFormat,
	ExportScope,
	exportData,
	type ExportConfig,
	type ExportResult,
	type ExportColumnConfig,
} from '../../utils/exportUtils'

// ============================================================================
// PROPS
// ============================================================================

export interface ExportModalProps {
	/** Whether modal is open */
	isOpen: boolean
	/** Close handler */
	onClose: () => void
	/** Base filename */
	filename?: string
	/** Callback when export completes */
	onExportComplete?: (result: ExportResult) => void
	/** Callback when export fails */
	onExportError?: (error: string) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Advanced export modal with full configuration options.
 *
 * @example
 * <ExportModal isOpen={showModal} onClose={() => setShowModal(false)} filename="products" />
 */
export function ExportModal({
	isOpen,
	onClose,
	filename = 'export',
	onExportComplete,
	onExportError,
}: ExportModalProps) {
	const { table } = useRichDataGridContext()
	const { selectedRows, selectedCount } = useRichDataGridSelection()

	// Form state
	const [format, setFormat] = useState<ExportFormat>(ExportFormat.Excel)
	const [scope, setScope] = useState<ExportScope>(ExportScope.FilteredRows)
	const [customFilename, setCustomFilename] = useState(filename)
	const [includeTimestamp, setIncludeTimestamp] = useState(true)
	const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set())
	const [isExporting, setIsExporting] = useState(false)
	const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('landscape')

	// Close on escape
	useEscapeKey(onClose, isOpen)

	// Initialize selected columns
	useEffect(() => {
		if (isOpen) {
			const visibleColumns = table
				.getVisibleLeafColumns()
				.filter((col) => col.id !== 'select')
				.map((col) => col.id)
			setSelectedColumns(new Set(visibleColumns))
			setCustomFilename(filename)
		}
	}, [isOpen, table, filename])

	// Update scope based on selection
	useEffect(() => {
		if (selectedCount > 0) {
			setScope(ExportScope.SelectedRows)
		}
	}, [selectedCount])

	// Get all available columns
	const allColumns = table
		.getAllLeafColumns()
		.filter((col) => col.id !== 'select')
		.map((col) => ({
			id: col.id,
			header: typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id,
		}))

	// Toggle column selection
	const toggleColumn = (columnId: string) => {
		setSelectedColumns((prev) => {
			const next = new Set(prev)
			if (next.has(columnId)) {
				next.delete(columnId)
			} else {
				next.add(columnId)
			}
			return next
		})
	}

	// Select/deselect all columns
	const toggleAllColumns = () => {
		if (selectedColumns.size === allColumns.length) {
			setSelectedColumns(new Set())
		} else {
			setSelectedColumns(new Set(allColumns.map((c) => c.id)))
		}
	}

	// Get row count for scope
	const getRowCount = (scopeType: ExportScope): number => {
		switch (scopeType) {
			case ExportScope.CurrentPage:
				return table.getRowModel().rows.length
			case ExportScope.AllPages:
				return table.getCoreRowModel().rows.length
			case ExportScope.FilteredRows:
				return table.getFilteredRowModel().rows.length
			case ExportScope.SelectedRows:
				return selectedCount
			default:
				return 0
		}
	}

	// Handle export
	const handleExport = async () => {
		if (selectedColumns.size === 0) {
			onExportError?.('Please select at least one column to export')
			return
		}

		setIsExporting(true)

		try {
			// Prepare column config
			const columns: ExportColumnConfig[] = allColumns
				.filter((col) => selectedColumns.has(col.id))
				.map((col) => ({
					id: col.id,
					header: col.header,
				}))

			const config: ExportConfig = {
				format,
				scope,
				filename: customFilename,
				columns,
				includeTimestamp,
				pdfOrientation,
				title: format === ExportFormat.PDF ? customFilename : undefined,
			}

			const result = await exportData(
				table,
				config,
				scope === ExportScope.SelectedRows ? selectedRows : undefined
			)

			if (result.success) {
				onExportComplete?.(result)
				onClose()
			} else {
				onExportError?.(result.error ?? 'Export failed')
			}
		} catch (error) {
			onExportError?.(error instanceof Error ? error.message : 'Export failed')
		} finally {
			setIsExporting(false)
		}
	}

	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div
				className="
					bg-base-100 dark:bg-base-200
					rounded-xl shadow-2xl
					w-full max-w-lg max-h-[90vh] overflow-hidden
					animate-in fade-in-0 zoom-in-95 duration-200
				"
				role="dialog"
				aria-modal="true"
				aria-labelledby="export-modal-title"
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-base-200 dark:border-base-content/10">
					<h2 id="export-modal-title" className="text-lg font-semibold text-base-content">
						Export Data
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="btn btn-ghost btn-sm btn-circle"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="px-6 py-4 overflow-y-auto max-h-[60vh] space-y-6">
					{/* Format Selection */}
					<div>
						<label className="block text-sm font-medium text-base-content mb-2">
							Export Format
						</label>
						<div className="grid grid-cols-3 gap-2">
							{[
								{ value: ExportFormat.CSV, label: 'CSV', icon: FileText },
								{ value: ExportFormat.Excel, label: 'Excel', icon: FileSpreadsheet },
								{ value: ExportFormat.PDF, label: 'PDF', icon: File },
							].map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => setFormat(option.value)}
									className={`
										flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors
										${format === option.value
											? 'border-primary bg-primary/10'
											: 'border-base-300 dark:border-base-content/20 hover:border-primary/50'
										}
									`}
								>
									<option.icon className="h-6 w-6" />
									<span className="text-sm font-medium">{option.label}</span>
								</button>
							))}
						</div>
					</div>

					{/* Scope Selection */}
					<div>
						<label className="block text-sm font-medium text-base-content mb-2">
							Export Scope
						</label>
						<div className="space-y-2">
							{[
								{ value: ExportScope.FilteredRows, label: 'Filtered Rows', count: getRowCount(ExportScope.FilteredRows) },
								{ value: ExportScope.CurrentPage, label: 'Current Page', count: getRowCount(ExportScope.CurrentPage) },
								{ value: ExportScope.AllPages, label: 'All Rows', count: getRowCount(ExportScope.AllPages) },
								{ value: ExportScope.SelectedRows, label: 'Selected Rows', count: getRowCount(ExportScope.SelectedRows), disabled: selectedCount === 0 },
							].map((option) => (
								<label
									key={option.value}
									className={`
										flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
										${scope === option.value
											? 'border-primary bg-primary/10'
											: 'border-base-300 dark:border-base-content/20 hover:border-primary/50'
										}
										${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
									`}
								>
									<input
										type="radio"
										name="scope"
										value={option.value}
										checked={scope === option.value}
										onChange={() => setScope(option.value)}
										disabled={option.disabled}
										className="radio radio-primary radio-sm"
									/>
									<span className="flex-1">{option.label}</span>
									<span className="badge badge-ghost badge-sm">{option.count} rows</span>
								</label>
							))}
						</div>
					</div>

					{/* Column Selection */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="text-sm font-medium text-base-content">
								Columns to Export
							</label>
							<button
								type="button"
								onClick={toggleAllColumns}
								className="btn btn-ghost btn-xs"
							>
								{selectedColumns.size === allColumns.length ? 'Deselect All' : 'Select All'}
							</button>
						</div>
						<div className="max-h-40 overflow-y-auto border border-base-300 dark:border-base-content/20 rounded-lg p-2 space-y-1">
							{allColumns.map((col) => (
								<label
									key={col.id}
									className="flex items-center gap-2 p-2 rounded hover:bg-base-200 dark:hover:bg-base-content/10 cursor-pointer"
								>
									<input
										type="checkbox"
										checked={selectedColumns.has(col.id)}
										onChange={() => toggleColumn(col.id)}
										className="checkbox checkbox-primary checkbox-sm"
									/>
									<span className="text-sm">{col.header}</span>
								</label>
							))}
						</div>
						<p className="text-xs text-base-content/50 mt-1">
							{selectedColumns.size} of {allColumns.length} columns selected
						</p>
					</div>

					{/* Filename */}
					<div>
						<label className="block text-sm font-medium text-base-content mb-2">
							Filename
						</label>
						<div className="flex gap-2">
							<input
								type="text"
								value={customFilename}
								onChange={(e) => setCustomFilename(e.target.value)}
								placeholder="Enter filename"
								className="input input-bordered input-sm flex-1 dark:bg-base-300 dark:border-base-content/20"
							/>
							<span className="self-center text-sm text-base-content/50">
								.{format}
							</span>
						</div>
						<label className="flex items-center gap-2 mt-2 cursor-pointer">
							<input
								type="checkbox"
								checked={includeTimestamp}
								onChange={(e) => setIncludeTimestamp(e.target.checked)}
								className="checkbox checkbox-primary checkbox-xs"
							/>
							<span className="text-xs text-base-content/70">Include timestamp in filename</span>
						</label>
					</div>

					{/* PDF Options */}
					{format === ExportFormat.PDF && (
						<div>
							<label className="block text-sm font-medium text-base-content mb-2">
								PDF Orientation
							</label>
							<div className="flex gap-2">
								{[
									{ value: 'portrait' as const, label: 'Portrait' },
									{ value: 'landscape' as const, label: 'Landscape' },
								].map((option) => (
									<button
										key={option.value}
										type="button"
										onClick={() => setPdfOrientation(option.value)}
										className={`
											btn btn-sm flex-1
											${pdfOrientation === option.value ? 'btn-primary' : 'btn-ghost'}
										`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-base-200 dark:border-base-content/10 bg-base-50 dark:bg-base-content/5">
					<button
						type="button"
						onClick={onClose}
						className="btn btn-ghost btn-sm"
						disabled={isExporting}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleExport}
						disabled={isExporting || selectedColumns.size === 0}
						className="btn btn-primary btn-sm gap-2"
					>
						{isExporting ? (
							<span className="loading loading-spinner loading-sm" />
						) : (
							<Download className="h-4 w-4" />
						)}
						Export {getRowCount(scope)} Rows
					</button>
				</div>
			</div>
		</div>
	)
}

export default ExportModal
