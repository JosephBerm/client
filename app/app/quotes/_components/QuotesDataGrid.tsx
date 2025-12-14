/**
 * QuotesDataGrid Component
 * 
 * Client component that displays a server-side paginated table of quotes
 * with delete functionality. Uses ServerDataGrid for data fetching.
 * 
 * **Next.js 16 Optimization:**
 * - React Compiler enabled - automatic memoization
 * - No manual useMemo/useCallback needed
 * 
 * **Next.js Pattern**: Co-located in _components (private folder) following
 * Next.js project structure conventions.
 * 
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @module app/quotes/_components/QuotesDataGrid
 */

'use client'

import { useState } from 'react'

import Link from 'next/link'

import { Eye, Trash2 } from 'lucide-react'

import { logger } from '@_core'

import { Routes } from '@_features/navigation'

import { formatDate, API, notificationService } from '@_shared'

import { QuoteStatus } from '@_classes/Enums'
import type Quote from '@_classes/Quote'

import ServerDataGrid from '@_components/tables/ServerDataGrid'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import ConfirmationModal from '@_components/ui/ConfirmationModal'

import type { ColumnDef } from '@tanstack/react-table'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Delete modal state interface
 */
interface DeleteModalState {
  isOpen: boolean
  quote: Quote | null
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function QuotesDataGrid() {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    quote: null,
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  // ---------------------------------------------------------------------------
  // HANDLERS (React Compiler auto-memoizes)
  // ---------------------------------------------------------------------------
  
  const openDeleteModal = (quote: Quote) => {
    setDeleteModal({ isOpen: true, quote })
  }
  
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, quote: null })
  }
  
  const handleDeleteAsync = async (): Promise<void> => {
    if (!deleteModal.quote?.id) return
    
    setIsDeleting(true)
    
    try {
      const { data } = await API.Quotes.delete(deleteModal.quote.id)
      
      if (data.statusCode === 200) {
        notificationService.success('Quote deleted successfully', {
          metadata: { quoteId: deleteModal.quote.id },
          component: 'QuotesDataGrid',
          action: 'deleteQuote',
        })
        closeDeleteModal()
        setRefreshKey((prev) => prev + 1)
      } else {
        notificationService.error(data.message || 'Failed to delete quote', {
          metadata: { quoteId: deleteModal.quote.id },
          component: 'QuotesDataGrid',
          action: 'deleteQuote',
        })
      }
    } catch (error) {
      notificationService.error('An error occurred while deleting the quote', {
        metadata: { error, quoteId: deleteModal.quote?.id },
        component: 'QuotesDataGrid',
        action: 'deleteQuote',
      })
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleDelete = () => {
    void handleDeleteAsync().catch((error) => {
      logger.error('Unhandled delete error', {
        error,
        component: 'QuotesDataGrid',
        action: 'handleDelete',
      })
    })
  }

  // ---------------------------------------------------------------------------
  // COLUMN DEFINITIONS (React Compiler auto-memoizes)
  // ---------------------------------------------------------------------------
  
  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: 'id',
      header: 'Quote ID',
      cell: ({ row }) => (
        <Link
          href={Routes.Quotes.detail(row.original.id)}
          className="link link-primary font-semibold"
        >
          #{row.original.id?.substring(0, 8)}...
        </Link>
      ),
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => row.original.companyName || 'N/A',
    },
    {
      accessorKey: 'emailAddress',
      header: 'Email',
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { status } = row.original
        const variant = status === QuoteStatus.Read ? 'success' : 'warning'
        const label = status === QuoteStatus.Read ? 'Read' : 'Unread'
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Requested',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={Routes.Quotes.detail(row.original.id)}>
            <Button variant="ghost" size="sm" aria-label="View quote details">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:text-error"
            onClick={() => openDeleteModal(row.original)}
            aria-label="Delete quote"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <>
      <ServerDataGrid<Quote>
        key={refreshKey}
        columns={columns}
        endpoint="/quotes/search"
        initialPageSize={10}
        initialSortBy="createdAt"
        initialSortOrder="desc"
        emptyMessage="No quotes found"
        ariaLabel="Quotes table"
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Quote"
        message={`Are you sure you want to delete the quote from "${deleteModal.quote?.companyName || deleteModal.quote?.emailAddress || 'Unknown'}"?`}
        details="This action cannot be undone. The quote and all associated data will be permanently removed."
        variant="danger"
        confirmText="Delete Quote"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </>
  )
}

