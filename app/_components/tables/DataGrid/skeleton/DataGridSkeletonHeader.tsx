/**
 * DataGridSkeletonHeader - Header Skeleton
 *
 * Header row skeleton component for DataGrid.
 * Renders skeleton header cells with appropriate styling.
 * Mobile-first responsive design.
 *
 * @module DataGrid/skeleton/DataGridSkeletonHeader
 */

import type { DataGridSkeletonHeaderProps, SkeletonColumnWidth } from './skeleton.types'
import {
	SKELETON_HEADER_CLASS,
	SKELETON_CELL_CLASS,
	SKELETON_ELEMENT_CLASS,
	SKELETON_WIDTH_MAP,
	DEFAULT_COLUMN_WIDTHS,
	generateGridTemplateColumns,
} from './skeleton.constants'

/**
 * Get the width class for a header column at given index.
 */
function getColumnWidthClass(
	columnWidths: SkeletonColumnWidth[],
	index: number
): string {
	const widthVariant = columnWidths[index % columnWidths.length]
	return SKELETON_WIDTH_MAP[widthVariant]
}

/**
 * DataGridSkeletonHeader Component
 *
 * Renders the skeleton header row for DataGrid.
 * Matches the visual style of the actual DataGrid header.
 *
 * @example
 * ```tsx
 * <DataGridSkeletonHeader
 *   columns={5}
 *   columnWidths={['md', 'lg', 'md', 'xl', 'sm']}
 * />
 * ```
 */
export function DataGridSkeletonHeader({
	columns,
	columnWidths = DEFAULT_COLUMN_WIDTHS,
	className = '',
	gridTemplateColumns,
}: DataGridSkeletonHeaderProps): React.ReactElement {
	const headerStyle = {
		gridTemplateColumns: gridTemplateColumns ?? generateGridTemplateColumns(columns),
	}

	return (
		<div
			className={`${SKELETON_HEADER_CLASS} grid gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 bg-base-200/50 border-b border-base-300 sticky top-0 ${className}`.trim()}
			style={headerStyle}
			role="row"
			aria-hidden="true"
		>
			{Array.from({ length: columns }, (_, cellIndex) => (
				<div
					key={cellIndex}
					className={`${SKELETON_CELL_CLASS} flex items-center min-w-0`}
					role="columnheader"
				>
					<div
						className={`${SKELETON_ELEMENT_CLASS} h-3 sm:h-4 ${getColumnWidthClass(columnWidths, cellIndex)} max-w-full rounded bg-base-300`}
					/>
				</div>
			))}
		</div>
	)
}

DataGridSkeletonHeader.displayName = 'DataGridSkeletonHeader'
