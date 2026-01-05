'use client';

import { ReactNode } from 'react';

interface SidebarLayoutProps {
  children?: ReactNode;
  sidebar?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
}

/**
 * Sidebar Layout Component
 *
 * Layout with sidebar navigation on left or right side.
 * Useful for dashboards and documentation pages.
 * Uses DaisyUI semantic colors and mobile-first responsive design.
 *
 * TIER: Standard
 * CATEGORY: Layout
 */
export default function SidebarLayout({
  children,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = '250px',
}: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      {sidebarPosition === 'left' && sidebar && (
        <aside
          className="shrink-0 border-b border-base-300 bg-base-200/30 p-4 sm:border-b-0 sm:border-r"
          style={{ width: 'auto' }}
        >
          <div className="sm:sticky sm:top-4" style={{ width: sidebarWidth }}>
            {sidebar}
          </div>
        </aside>
      )}

      <main className="flex-1 p-4 sm:p-6">{children}</main>

      {sidebarPosition === 'right' && sidebar && (
        <aside
          className="shrink-0 border-t border-base-300 bg-base-200/30 p-4 sm:border-l sm:border-t-0"
          style={{ width: 'auto' }}
        >
          <div className="sm:sticky sm:top-4" style={{ width: sidebarWidth }}>
            {sidebar}
          </div>
        </aside>
      )}
    </div>
  );
}
