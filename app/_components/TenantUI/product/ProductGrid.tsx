'use client';

import { ReactNode } from 'react';
import classNames from 'classnames';

interface ProductGridProps {
  children?: ReactNode;
  columns?: number;
  itemsPerPage?: number;
  className?: string;
}

/**
 * Product Grid Component
 *
 * Grid layout optimized for displaying product cards.
 * Includes responsive columns and pagination support.
 * Mobile-first responsive design (sm: → lg: → xl:).
 *
 * TIER: Standard
 * CATEGORY: Product
 */
export default function ProductGrid({
  children,
  columns = 3,
  itemsPerPage = 12,
  className = '',
}: ProductGridProps) {
  // Mobile-first responsive column classes
  // Pattern: base (mobile) → sm → lg → xl
  const columnClasses: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  };

  const gridClass = columnClasses[columns] || columnClasses[3];

  return (
    <div className="space-y-6">
      <div className={classNames('grid gap-4 sm:gap-6', gridClass, className)}>
        {children}
      </div>

      {/* Pagination placeholder - can be added based on itemsPerPage */}
    </div>
  );
}
