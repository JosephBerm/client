/**
 * QuotesDataGrid Component
 * 
 * Client component that displays a server-side paginated table of quotes
 * with delete functionality. Uses RichDataGrid for advanced data operations.
 * 
 * **Features (Phase 2.2 Migration):**
 * - RichDataGrid with global search and sorting
 * - Server-side pagination via /quotes/search/rich endpoint
 * - Status filtering with faceted counts
 * - Text search on company name and email
 * 
 * **Next.js 16 Optimization:**
 * - React Compiler enabled - automatic memoization
 * - No manual useMemo/useCallback needed
 * 
 * **Next.js Pattern**: Co-located in _components (private folder) following
 * Next.js project structure conventions.
 * 
 * @see RICHDATAGRID_MIGRATION_PLAN.md - Phase 2.2
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @module app/quotes/_components/QuotesDataGrid
 */

'use client'

import { useCallback, useState } from 'react'

import Link from 'next/link'

import { Download, Eye, Trash2 } from 'lucide-react'

import { logger } from '@_core'

import { Routes } from '@_features/navigation'

import { formatDate, API, notificationService } from '@_shared'

import QuoteStatusHelper from '@_classes/Helpers/QuoteStatusHelper'
import type Quote from '@_classes/Quote'

import { QuoteStatusBadge } from '@_components/common'
import {
	RichDataGrid,
	createRichColumnHelper,
	createColumnId,
	FilterType,
	SortDirection,
	BulkActionVariant,
	type BulkAction,
} from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult, RichColumnDef } from '@_components/tables/RichDataGrid'
import Button from '@_components/ui/Button'
import ConfirmationModal from '@_components/ui/ConfirmationModal'

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
  // FETCHER (React Compiler auto-memoizes)
  // ---------------------------------------------------------------------------

  const fetcher = useCallback(
    async (filter: RichSearchFilter): Promise<RichPagedResult<Quote>> => {
      const response = await API.Quotes.richSearch(filter)

      if (response.data?.payload) {
        return response.data.payload
      }

      // Return empty result on error
      return {
        data: [],
        page: 1,
        pageSize: filter.pageSize,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },
    []
  )

  // ---------------------------------------------------------------------------
  // COLUMN DEFINITIONS (React Compiler auto-memoizes)
  // ---------------------------------------------------------------------------
  
  const columnHelper = createRichColumnHelper<Quote>()
  
  const columns: RichColumnDef<Quote, unknown>[] = [
    // Quote ID - Text filter, searchable
    columnHelper.accessor('id', {
      header: 'Quote ID',
      filterType: FilterType.Text,
      cell: ({ row }) => (
        <Link
          href={Routes.Quotes.detail(row.original.id ?? '')}
          className="link link-primary font-semibold"
        >
          #{row.original.id?.substring(0, 8) ?? 'N/A'}...
        </Link>
      ),
    }),

    // Company Name - Text filter, searchable
    columnHelper.accessor('companyName', {
      header: 'Company',
      filterType: FilterType.Text,
      searchable: true,
      cell: ({ row }) => row.original.companyName || 'N/A',
    }),

    // Email - Text filter, searchable
    columnHelper.accessor('emailAddress', {
      header: 'Email',
      filterType: FilterType.Text,
      searchable: true,
    }),

    // Phone - Text filter
    columnHelper.accessor('phoneNumber', {
      header: 'Phone',
      filterType: FilterType.Text,
    }),

    // Status - Select filter, faceted
    columnHelper.accessor('status', {
      header: 'Status',
      filterType: FilterType.Select,
      faceted: true,
      cell: ({ row }) => <QuoteStatusBadge status={row.original.status} />,
    }),

    // Created At - Date filter
    columnHelper.accessor('createdAt', {
      header: 'Requested',
      filterType: FilterType.Date,
      cell: ({ row }) => formatDate(row.original.createdAt),
    }),

    // Actions - Display only
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={Routes.Quotes.detail(row.original.id ?? '')}>
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
    }),
  ]

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <>
      <div data-testid="quotes-table">
      <RichDataGrid<Quote>
        columns={columns}
        fetcher={fetcher}
        filterKey={String(refreshKey)}
        defaultPageSize={10}
        defaultSorting={[{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending }]}
        enableGlobalSearch
        enableColumnFilters
        enableRowSelection
        enableColumnResizing
        bulkActions={[
          {
            id: 'export-csv',
            label: 'Export CSV',
            icon: <Download className="w-4 h-4" />,
            variant: BulkActionVariant.Default,
            onAction: async (rows: Quote[]) => {
              const headers = 'Quote ID,Company,Email,Phone,Status,Requested\n'
              const csv = rows.map(r =>
                `"${r.id}","${r.companyName ?? ''}","${r.emailAddress ?? ''}","${r.phoneNumber ?? ''}","${QuoteStatusHelper.getDisplay(r.status)}","${formatDate(r.createdAt)}"`
              ).join('\n')
              const blob = new Blob([headers + csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              URL.revokeObjectURL(url)
              notificationService.success(`Exported ${rows.length} quotes`)
            },
          },
          {
            id: 'delete-selected',
            label: 'Delete Selected',
            icon: <Trash2 className="w-4 h-4" />,
            variant: BulkActionVariant.Danger,
            confirmMessage: (count) => `Are you sure you want to delete ${count} quote(s)? This action cannot be undone.`,
            onAction: async (rows: Quote[]) => {
              const promises = rows.map(r => API.Quotes.delete(r.id ?? ''))
              await Promise.all(promises)
              notificationService.success(`Deleted ${rows.length} quotes`)
              setRefreshKey(prev => prev + 1)
            },
          },
        ] satisfies BulkAction<Quote>[]}
        searchPlaceholder="Search quotes by company or email..."
        persistStateKey="quotes-grid"
        emptyState={
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-base-content/60">No quotes found</p>
            <p className="text-sm text-base-content/40">
              Quotes will appear here when customers submit quote requests.
            </p>
          </div>
        }
        ariaLabel="Quotes table"
      />
      </div>

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

