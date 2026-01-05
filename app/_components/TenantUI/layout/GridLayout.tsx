'use client';

import { ReactNode } from 'react';
import classNames from 'classnames';

interface GridLayoutProps {
  children?: ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}

/**
 * Grid Layout Component
 *
 * Responsive grid container for organizing content.
 * Uses mobile-first breakpoints: sm (640px) → md (768px) → lg (1024px) → xl (1280px)
 *
 * TIER: Trial (available to all tiers)
 * CATEGORY: Layout
 */
export default function GridLayout({
  children,
  columns = 3,
  gap = '1.5rem',
  className = '',
}: GridLayoutProps) {
  // Mobile-first responsive column classes
  // Pattern: base (mobile) → sm → md → lg → xl
  const columnClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  const gridClass = columnClasses[columns] || columnClasses[3];

  return (
    <div
      className={classNames('grid', gridClass, className)}
      style={{ gap }}
    >
      {children}
    </div>
  );
}
