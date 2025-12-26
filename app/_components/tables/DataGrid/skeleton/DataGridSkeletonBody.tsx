/**
 * DataGridSkeletonBody - Body Skeleton
 *
 * Body container skeleton component for DataGrid.
 * Renders multiple skeleton rows with staggered animation.
 * Mobile-first responsive design.
 *
 * @module DataGrid/skeleton/DataGridSkeletonBody
 */

import type { DataGridSkeletonBodyProps } from './skeleton.types'
import {
	DEFAULT_COLUMN_WIDTHS,
	DEFAULT_SKELETON_ROWS,
	DEFAULT_STAGGER_DELAY,
	generateGridTemplateColumns,
} from './skeleton.constants'
import { DataGridSkeletonRow } from './DataGridSkeletonRow'

/**
 * DataGridSkeletonBody Component
 *
 * Renders the skeleton body containing multiple rows.
 * Implements staggered animation for visual appeal.
 *
 * @example
 * ```tsx
 * <DataGridSkeletonBody
 *   columns={5}
 *   rows={10}
 *   staggerDelay={50}
 * />
 * ```
 */
export function DataGridSkeletonBody({
	columns,
	rows = DEFAULT_SKELETON_ROWS,
	columnWidths = DEFAULT_COLUMN_WIDTHS,
	staggerDelay = DEFAULT_STAGGER_DELAY,
	className = '',
	gridTemplateColumns,
}: DataGridSkeletonBodyProps): React.ReactElement {
	const computedGridTemplateColumns = gridTemplateColumns ?? generateGridTemplateColumns(columns)

	return (
		<div
			className={`data-grid-skeleton-body divide-y divide-base-200 ${className}`.trim()}
			role="rowgroup"
			aria-hidden="true"
		>
			{Array.from({ length: rows }, (_, index) => (
				<DataGridSkeletonRow
					key={index}
					columns={columns}
					columnWidths={columnWidths}
					index={index}
					staggerDelay={staggerDelay}
					gridTemplateColumns={computedGridTemplateColumns}
				/>
			))}
		</div>
	)
}

DataGridSkeletonBody.displayName = 'DataGridSkeletonBody'
