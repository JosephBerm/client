/**
 * MobileCardList Component
 * 
 * Renders table data as mobile-friendly card views.
 * Optimized for touch interactions and vertical scrolling.
 * 
 * @module MobileCardList
 */

'use client'

import { flexRender } from '@tanstack/react-table'

import { TABLE_THEME_CLASSES } from '../types/divTableConstants'
import { classNames } from '../utils/divTableUtils'

import type { MobileCardProps } from '../types/divTableTypes'
import type { Row, ColumnDef } from '@tanstack/react-table'

interface MobileCardListProps<TData> {
  rows: Row<TData>[]
  columns: ColumnDef<TData>[]
  ariaLabel: string
  customRenderer?: React.ComponentType<MobileCardProps<TData>>
}

/**
 * Mobile Card List Component
 * 
 * @example
 * ```tsx
 * <MobileCardList
 *   rows={rows}
 *   columns={columns}
 *   ariaLabel="Orders"
 * />
 * ```
 */
export function MobileCardList<TData>({
  rows,
  columns,
  ariaLabel,
  customRenderer: CustomCard,
}: MobileCardListProps<TData>) {
  return (
    <div role="list" aria-label={ariaLabel} className="mobile-card-list space-y-4 p-4">
      {rows.map((row, index) => (
        <div key={row.id}>
          {CustomCard ? (
            <CustomCard row={row} columns={columns} index={index} />
          ) : (
            <DefaultMobileCard row={row} columns={columns} index={index} />
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Default Mobile Card Component
 */
function DefaultMobileCard<TData>({ row, columns }: MobileCardProps<TData>) {
  const cells = row.getVisibleCells()

  return (
    <div
      role="article"
      className={classNames(
        'mobile-card',
        TABLE_THEME_CLASSES.mobileCard,
        'p-4 space-y-3'
      )}
      aria-label={`Row ${row.index + 1}`}
    >
      {/* Card body - key-value pairs */}
      <dl className="space-y-2">
        {cells.map((cell, index) => {
          const header = columns[index]?.header
          const headerText =
            typeof header === 'string' ? header : cell.column.id

          return (
            <div key={cell.id} className="flex justify-between items-start gap-4">
              <dt className="font-medium text-sm text-base-content/70 shrink-0">
                {headerText}:
              </dt>
              <dd className="text-sm text-base-content text-right flex-1">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

