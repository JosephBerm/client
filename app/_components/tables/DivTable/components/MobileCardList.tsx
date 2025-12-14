/**
 * MobileCardList Component
 * 
 * MAANG-level mobile card design inspired by Linear, Stripe, and Apple HIG.
 * 
 * **Design Principles:**
 * - Visual hierarchy through typography and spacing
 * - Depth through subtle shadows and glass effects
 * - Touch-friendly interactions with proper tap targets (44px min)
 * - Smooth micro-interactions for feedback
 * - Accessible focus states
 * 
 * @module MobileCardList
 */

'use client'

import { flexRender } from '@tanstack/react-table'

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
    <div 
      role="list" 
      aria-label={ariaLabel} 
      className="mobile-card-list space-y-3 sm:space-y-4 p-3 sm:p-4"
    >
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
 * 
 * MAANG-level card design with:
 * - Glass morphism effect (subtle backdrop blur)
 * - Layered shadows for depth
 * - Hover lift animation
 * - Responsive grid layout
 * - Clear visual hierarchy
 */
function DefaultMobileCard<TData>({ row, columns }: MobileCardProps<TData>) {
  const cells = row.getVisibleCells()

  return (
    <article
      className={classNames(
        // Base card styling - MAANG glass morphism pattern
        'group relative',
        'bg-base-100/80 dark:bg-base-200/60',
        'backdrop-blur-sm',
        // Borders - subtle, refined
        'border border-base-300/50 dark:border-base-content/10',
        // Shadows - layered depth (Linear/Stripe pattern)
        'shadow-sm dark:shadow-lg dark:shadow-black/20',
        // Rounded corners - modern 16px radius
        'rounded-2xl',
        // Hover state - subtle lift effect
        'transition-all duration-200 ease-out',
        'hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/30',
        'hover:border-base-300 dark:hover:border-base-content/20',
        'hover:-translate-y-0.5',
        // Focus for accessibility
        'focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-base-100',
        // Spacing
        'p-4 sm:p-5',
        // Overflow for internal effects
        'overflow-hidden'
      )}
      aria-label={`Row ${row.index + 1}`}
    >
      {/* Subtle gradient overlay for depth */}
      <div 
        className="absolute inset-0 bg-linear-to-br from-base-content/2 to-transparent pointer-events-none" 
        aria-hidden="true" 
      />
      
      {/* Card content */}
      <dl className="relative space-y-3 sm:space-y-4">
        {cells.map((cell, cellIndex) => {
          const header = columns[cellIndex]?.header
          const headerText =
            typeof header === 'string' ? header : cell.column.id
          const isActionsColumn = headerText.toLowerCase() === 'actions'

          return (
            <div 
              key={cell.id} 
              className={classNames(
                'grid gap-2',
                // Actions get special treatment - full width, centered
                isActionsColumn 
                  ? 'pt-3 mt-1 border-t border-base-300/30 dark:border-base-content/10' 
                  : 'grid-cols-[auto_1fr] items-baseline'
              )}
            >
              {/* Label */}
              <dt 
                className={classNames(
                  'text-xs font-medium uppercase tracking-wider',
                  'text-base-content/50 dark:text-base-content/40',
                  isActionsColumn && 'sr-only' // Hide "Actions:" label visually
                )}
              >
                {headerText}
              </dt>
              
              {/* Value */}
              <dd 
                className={classNames(
                  'text-sm',
                  isActionsColumn 
                    ? 'flex items-center justify-start gap-2 sm:gap-3' 
                    : 'text-right text-base-content font-medium'
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </dd>
            </div>
          )
        })}
      </dl>
    </article>
  )
}

