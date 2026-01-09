/**
 * Quotes Page
 * 
 * Admin page for managing customer quote requests.
 * Uses RichDataGrid for server-side pagination.
 * 
 * **Next.js 16 Optimization:**
 * - Page is a Server Component (no 'use client' directive)
 * - Static shell rendered on server for better FCP
 * - Only QuotesDataGrid (interactive) is a Client Component
 * 
 * **Next.js Conventions**:
 * - loading.tsx provides loading state (Suspense boundary)
 * - _components folder contains co-located components
 * - Page component kept minimal following separation of concerns
 * 
 * **Route**: /app/quotes
 * 
 * @module app/quotes/page
 */

import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../_components'

import { QuotesDataGrid } from './_components'

// ============================================================================
// PAGE COMPONENT (Server Component)
// ============================================================================

export default function QuotesPage() {
  return (
    <>
      <InternalPageHeader
        title="Quotes"
        description="Manage customer quote requests"
      />

      <Card>
        <div className="card-body">
          <QuotesDataGrid />
        </div>
      </Card>
    </>
  )
}
