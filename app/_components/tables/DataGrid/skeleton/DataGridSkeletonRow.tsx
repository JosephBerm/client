/**
 * DataGridSkeletonRow - Single Row Skeleton
 *
 * Atomic skeleton row component for DataGrid.
 * Renders a single row with animated skeleton cells.
 *
 * @module DataGrid/skeleton/DataGridSkeletonRow
 */

import type { DataGridSkeletonRowProps, SkeletonColumnWidth } from './skeleton.types'
import {
	SKELETON_ROW_CLASS,
	SKELETON_CELL_CLASS,
	SKELETON_ELEMENT_CLASS,
	SKELETON_WIDTH_MAP,
	DEFAULT_COLUMN_WIDTHS,
	DEFAULT_STAGGER_DELAY,
	STAGGER_DELAY_CSS_VAR,
	generateGridTemplateColumns,
} from './skeleton.constants'

/**
 * Get the width class for a column at given index.
 */
function getColumnWidthClass(
	columnWidths: SkeletonColumnWidth[],
	index: number
): string {
	const widthVariant = columnWidths[index % columnWidths.length]
	return SKELETON_WIDTH_MAP[widthVariant]
}

/**
 * DataGridSkeletonRow Component
 *
 * Renders a single skeleton row for the DataGrid.
 * Supports staggered animation for visual appeal.
 * Mobile-first responsive design.
 *
 * @example
 * ```tsx
 * <DataGridSkeletonRow
 *   columns={5}
 *   index={0}
 *   staggerDelay={50}
 * />
 * ```
 */
export function DataGridSkeletonRow({
	columns,
	columnWidths = DEFAULT_COLUMN_WIDTHS,
	index = 0,
	staggerDelay = DEFAULT_STAGGER_DELAY,
	className = '',
	gridTemplateColumns,
}: DataGridSkeletonRowProps): React.ReactElement {
	// Style object for stagger animation
	const rowStyle = {
		[STAGGER_DELAY_CSS_VAR]: `${index * staggerDelay}ms`,
		animationDelay: `${index * staggerDelay}ms`,
		gridTemplateColumns: gridTemplateColumns ?? generateGridTemplateColumns(columns),
	}

	return (
		<div
			className={`${SKELETON_ROW_CLASS} grid gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 border-b border-base-200 ${className}`.trim()}
			style={rowStyle}
			role="row"
			aria-hidden="true"
		>
			{Array.from({ length: columns }, (_, cellIndex) => (
				<div
					key={cellIndex}
					className={`${SKELETON_CELL_CLASS} flex items-center min-w-0`}
					role="gridcell"
				>
					<div
						className={`${SKELETON_ELEMENT_CLASS} h-3 sm:h-4 ${getColumnWidthClass(columnWidths, cellIndex)} max-w-full rounded`}
					/>
				</div>
			))}
		</div>
	)
}

DataGridSkeletonRow.displayName = 'DataGridSkeletonRow'
