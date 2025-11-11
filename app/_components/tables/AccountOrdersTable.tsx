'use client'

import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import DataTable from './DataTable'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import { formatDate, formatCurrency } from '@_utils/table-helpers'
import { useAuthStore } from '@_stores/useAuthStore'
import Order from '@_classes/Order'
import API from '@_services/api'
import { toast } from 'react-toastify'
import Routes from '@_services/routes'

export default function AccountOrdersTable() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user?.customer?.id) {
      fetchOrders()
    }
  }, [user?.customer?.id])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      if (!user?.customer?.id) return

      const { data } = await API.Orders.getFromCustomer(user.customer.id)
      if (!data.payload) {
        toast.error(data.message || 'Failed to load orders')
        return
      }

      // Get last 5 orders
      const sortedOrders = data.payload
        .map((x: any) => new Order(x))
        .sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)

      setOrders(sortedOrders)
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      toast.error(error.message || 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            #{row.original.id}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => formatCurrency(row.original.total || 0),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <OrderStatusBadge status={row.original.status as any} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`${Routes.Orders.location}/${row.original.id}`)
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
        <h2 className="card-title">Recent Orders</h2>
        <DataTable
          columns={columns}
          data={orders}
          isLoading={isLoading}
          emptyMessage="No orders yet"
          manualPagination={false}
        />
      </div>
    </div>
  )
}

