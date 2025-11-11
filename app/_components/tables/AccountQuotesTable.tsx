'use client'

import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import DataTable from './DataTable'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import { formatDate } from '@_utils/table-helpers'
import { useAuthStore } from '@_stores/useAuthStore'
import Quote from '@_classes/Quote'
import API from '@_services/api'
import { toast } from 'react-toastify'
import Routes from '@_services/routes'

export default function AccountQuotesTable() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user?.customer?.id) {
      fetchQuotes()
    }
  }, [user?.customer?.id])

  const fetchQuotes = async () => {
    try {
      setIsLoading(true)
      if (!user?.customer?.id) return

      const { data } = await API.Quotes.getAll<Quote[]>()
      if (!data.payload) {
        toast.error(data.message || 'Failed to load quotes')
        return
      }

      // Filter by customer and get last 5 quotes
      const sortedQuotes = data.payload
        .map((x: any) => new Quote(x))
        .filter((q: Quote) => q.companyName === user.customer?.name)
        .sort((a: Quote, b: Quote) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)

      setQuotes(sortedQuotes)
    } catch (error: any) {
      console.error('Failed to fetch quotes:', error)
      toast.error(error.message || 'Failed to load quotes')
    } finally {
      setIsLoading(false)
    }
  }

  const columns: ColumnDef<Quote>[] = useMemo(
    () => [
      {
        accessorKey: 'companyName',
        header: 'Company',
        cell: ({ row }) => row.original.companyName || 'N/A',
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone',
      },
      {
        accessorKey: 'createdAt',
        header: 'Requested',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const { QuoteStatus } = require('@_classes/Enums')
          const status = row.original.status
          const variant = status === QuoteStatus.Read ? 'success' : 'warning'
          return <Badge variant={variant}>{status}</Badge>
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`${Routes.InternalAppRoute}/quotes/${row.original.id}`)
            }
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        ),
      },
    ],
    [router]
  )

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Recent Quotes</h2>
        <DataTable
          columns={columns}
          data={quotes}
          isLoading={isLoading}
          emptyMessage="No quotes yet"
          manualPagination={false}
        />
      </div>
    </div>
  )
}

