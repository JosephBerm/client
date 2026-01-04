/**
 * ResizeHandle - Column Resize Handle Component
 *
 * Provides a draggable handle for resizing table columns.
 * Works with TanStack Table's column resizing API.
 *
 * @module ResizeHandle
 */

'use client'
'use memo'

import type { Header } from '@tanstack/react-table'

// ============================================================================
// PROPS
// ============================================================================

export interface ResizeHandleProps<TData> {
	/** TanStack Table header */
	header: Header<TData, unknown>
	/** Resize mode: 'onChange' for live preview, 'onEnd' for final value only */
	resizeMode?: 'onChange' | 'onEnd'
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Draggable column resize handle.
 * Renders a vertical bar at the edge of column headers that can be dragged to resize.
 *
 * @example
 * <ResizeHandle header={header} />
 */
export function ResizeHandle<TData>({
	header,
	resizeMode = 'onChange',
}: ResizeHandleProps<TData>) {
	const isResizing = header.column.getIsResizing()

	return (
		<div
			onDoubleClick={() => header.column.resetSize()}
			onMouseDown={header.getResizeHandler()}
			onTouchStart={header.getResizeHandler()}
			className={`
				absolute top-0 right-0 h-full w-1 cursor-col-resize
				select-none touch-none
				transition-colors duration-150
				${isResizing
					? 'bg-primary w-1.5'
					: 'bg-transparent hover:bg-primary/50 group-hover:bg-base-content/20'
				}
			`}
			style={{
				transform: resizeMode === 'onEnd' && isResizing
					? `translateX(${header.column.getSize() - header.getSize()}px)`
					: undefined,
			}}
			role="separator"
			aria-orientation="vertical"
			aria-label={`Resize column ${header.column.id}`}
		>
			{/* Visual indicator line */}
			<div
				className={`
					absolute top-1/4 bottom-1/4 left-1/2 -translate-x-1/2
					w-0.5 rounded-full
					${isResizing ? 'bg-primary-content' : 'bg-transparent'}
				`}
			/>
		</div>
	)
}

export default ResizeHandle
