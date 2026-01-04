/**
 * ExportButton - Export Dropdown Component
 *
 * Provides quick export options for CSV, Excel, and PDF formats.
 * Integrates with RichDataGrid context for data access.
 *
 * @module ExportButton
 */

'use client'
'use memo'

import { useState, useRef } from 'react'
import { Download, FileSpreadsheet, FileText, File, ChevronDown } from 'lucide-react'
import { useRichDataGridContext, useRichDataGridSelection } from '../../context/RichDataGridContext'
import { useClickOutside } from '../../hooks/useClickOutside'
import { ExportFormat, ExportScope, quickExport, type ExportResult } from '../../utils/exportUtils'

// ============================================================================
// PROPS
// ============================================================================

export interface ExportButtonProps {
	/** Base filename for exports (without extension) */
	filename?: string
	/** Show advanced export modal option */
	showAdvanced?: boolean
	/** Callback when export completes */
	onExportComplete?: (result: ExportResult) => void
	/** Callback when export fails */
	onExportError?: (error: string) => void
	/** Additional CSS classes */
	className?: string
	/** Button size variant */
	size?: 'sm' | 'md' | 'lg'
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Export dropdown button with CSV, Excel, and PDF options.
 *
 * @example
 * <ExportButton filename="products" onExportComplete={(r) => toast.success(`Exported ${r.rowCount} rows`)} />
 */
export function ExportButton({
	filename = 'export',
	showAdvanced = true,
	onExportComplete,
	onExportError,
	className = '',
	size = 'sm',
}: ExportButtonProps) {
	const { table } = useRichDataGridContext()
	const { selectedRows, selectedCount } = useRichDataGridSelection()
	const [isOpen, setIsOpen] = useState(false)
	const [isExporting, setIsExporting] = useState(false)
	const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useClickOutside(dropdownRef, () => setIsOpen(false), isOpen)

	// Handle export action
	const handleExport = async (format: ExportFormat) => {
		setIsExporting(true)
		setExportingFormat(format)

		try {
			const result = await quickExport(
				table,
				format,
				filename,
				selectedCount > 0 ? selectedRows : undefined
			)

			if (result.success) {
				onExportComplete?.(result)
			} else {
				onExportError?.(result.error ?? 'Export failed')
			}
		} catch (error) {
			onExportError?.(error instanceof Error ? error.message : 'Export failed')
		} finally {
			setIsExporting(false)
			setExportingFormat(null)
			setIsOpen(false)
		}
	}

	// Size classes
	const sizeClasses = {
		sm: 'btn-sm min-h-[32px]',
		md: 'btn-md min-h-[40px]',
		lg: 'btn-lg min-h-[48px]',
	}

	const iconSizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
	}

	// Export format options
	const exportOptions = [
		{
			format: ExportFormat.CSV,
			label: 'Export as CSV',
			icon: <FileText className={iconSizeClasses[size]} />,
			description: 'Comma-separated values',
		},
		{
			format: ExportFormat.Excel,
			label: 'Export as Excel',
			icon: <FileSpreadsheet className={iconSizeClasses[size]} />,
			description: 'Microsoft Excel (.xlsx)',
		},
		{
			format: ExportFormat.PDF,
			label: 'Export as PDF',
			icon: <File className={iconSizeClasses[size]} />,
			description: 'PDF document',
		},
	]

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				disabled={isExporting}
				className={`
					btn btn-outline ${sizeClasses[size]} gap-2
					dark:border-base-content/20 dark:hover:bg-base-content/10
					touch-manipulation
					${isExporting ? 'loading' : ''}
				`}
				aria-expanded={isOpen}
				aria-haspopup="menu"
			>
				{isExporting ? (
					<span className="loading loading-spinner loading-sm" />
				) : (
					<Download className={iconSizeClasses[size]} />
				)}
				<span className="hidden sm:inline">Export</span>
				{selectedCount > 0 && (
					<span className="badge badge-primary badge-sm">{selectedCount}</span>
				)}
				<ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div
					className="
						absolute right-0 top-full mt-1 z-50
						bg-base-100 dark:bg-base-200
						border border-base-300 dark:border-base-content/20
						rounded-lg shadow-lg dark:shadow-2xl
						min-w-[220px] max-w-[90vw]
						animate-in fade-in-0 zoom-in-95 duration-150
					"
					role="menu"
				>
					{/* Export Scope Info */}
					<div className="px-3 py-2 border-b border-base-200 dark:border-base-content/10">
						<p className="text-xs text-base-content/60">
							{selectedCount > 0
								? `Export ${selectedCount} selected rows`
								: 'Export all filtered rows'}
						</p>
					</div>

					{/* Export Options */}
					<div className="py-1">
						{exportOptions.map((option) => (
							<button
								key={option.format}
								type="button"
								onClick={() => handleExport(option.format)}
								disabled={isExporting}
								className={`
									w-full flex items-center gap-3 px-3 py-2.5
									text-left text-sm
									hover:bg-base-200 dark:hover:bg-base-content/10
									transition-colors touch-manipulation
									${isExporting && exportingFormat === option.format ? 'bg-base-200 dark:bg-base-content/10' : ''}
									disabled:opacity-50
								`}
								role="menuitem"
							>
								<span className="text-base-content/60">
									{isExporting && exportingFormat === option.format ? (
										<span className="loading loading-spinner loading-sm" />
									) : (
										option.icon
									)}
								</span>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-base-content">{option.label}</p>
									<p className="text-xs text-base-content/50">{option.description}</p>
								</div>
							</button>
						))}
					</div>

					{/* Advanced Export Option */}
					{showAdvanced && (
						<div className="border-t border-base-200 dark:border-base-content/10 p-2">
							<button
								type="button"
								onClick={() => {
									setIsOpen(false)
									// TODO: Open advanced export modal
								}}
								className="btn btn-ghost btn-xs w-full touch-manipulation"
							>
								Advanced Export Options...
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default ExportButton
