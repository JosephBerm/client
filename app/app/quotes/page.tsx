'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import ServerDataTable from '@_components/tables/ServerDataTable'
import Button from '@_components/ui/Button'
import { InternalPageHeader } from '../_components'
import Badge from '@_components/ui/Badge'
import { formatDate, formatCurrency } from '@_shared'
import type Quote from '@_classes/Quote'
import { QuoteStatus } from '@_classes/Enums'
import { Routes } from '@_features/navigation'

export default function QuotesPage() {
  // Column definitions
  const columns = useMemo<ColumnDef<Quote>[]>(
    () => [
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
          const status = row.original.status
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
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <>
      <InternalPageHeader
        title="Quotes"
        description="Manage customer quote requests"
      />

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <ServerDataTable<Quote>
            columns={columns}
            endpoint="/quotes/search"
            initialPageSize={10}
            initialSortBy="createdAt"
            initialSortOrder="desc"
            emptyMessage="No quotes found"
          />
        </div>
      </div>
    </>
  )
}

