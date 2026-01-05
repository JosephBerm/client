/**
 * ExportButton - Export Dropdown Component
 *
 * Provides quick export options for CSV, Excel, and PDF formats.
 * Uses shared Dropdown component with portal rendering.
 *
 * @module ExportButton
 */

'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react'

import { Dropdown } from '@_components/ui/Dropdown'
import { useRichDataGridContext, useRichDataGridSelection } from '../../context/RichDataGridContext'
import { ExportFormat, quickExport, type ExportResult } from '../../utils/exportUtils'

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

	// Size classes for icon
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
		<Dropdown open={isOpen} onOpenChange={setIsOpen} className={className}>
			<Dropdown.Trigger
				variant="outline"
				leftIcon={
					isExporting ? (
						<span className="loading loading-spinner loading-sm" />
					) : (
						<Download className={iconSizeClasses[size]} />
					)
				}
				badge={selectedCount > 0 ? selectedCount : undefined}
				disabled={isExporting}
			>
				<span className="hidden sm:inline">Export</span>
			</Dropdown.Trigger>

			<Dropdown.Content align="end" width={240}>
				{/* Export Scope Info */}
				<Dropdown.Header>
					<span className="text-xs text-base-content/60">
						{selectedCount > 0
							? `Export ${selectedCount} selected rows`
							: 'Export all filtered rows'}
					</span>
				</Dropdown.Header>

				{/* Export Options */}
				<Dropdown.Section>
					{exportOptions.map((option) => (
						<Dropdown.Item
							key={option.format}
							icon={
								isExporting && exportingFormat === option.format ? (
									<span className="loading loading-spinner loading-sm" />
								) : (
									option.icon
								)
							}
							description={option.description}
							disabled={isExporting}
							onClick={() => handleExport(option.format)}
						>
							{option.label}
						</Dropdown.Item>
					))}
				</Dropdown.Section>

				{/* Advanced Export Option */}
				{showAdvanced && (
					<>
						<Dropdown.Divider />
						<Dropdown.Footer className="py-2">
							<button
								type="button"
								onClick={() => {
									setIsOpen(false)
									// TODO: Open advanced export modal
								}}
								className="btn btn-ghost btn-xs w-full text-base-content/70 hover:text-base-content"
							>
								Advanced Export Options...
							</button>
						</Dropdown.Footer>
					</>
				)}
			</Dropdown.Content>
		</Dropdown>
	)
}

export default ExportButton
