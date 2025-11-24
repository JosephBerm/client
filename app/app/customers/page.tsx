'use client'

import { useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Eye, Plus, Trash2 } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { notificationService , formatDate , API } from '@_shared'

import { logger } from '@/app/_core'

import type Company from '@_classes/Company'

import ServerDataGrid from '@_components/tables/ServerDataGrid'
import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'

import { InternalPageHeader } from '../_components'



import type { ColumnDef } from '@tanstack/react-table'

export default function CustomersPage() {
  const router = useRouter()
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; customer: Company | null }>({
    isOpen: false,
    customer: null,
  })
  const [refreshKey, setRefreshKey] = useState(0)

  // Column definitions
  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Company Name',
        cell: ({ row }) => (
          <Link
            href={Routes.Customers.detail(row.original.id)}
            className="link link-primary font-semibold"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => row.original.phone || 'N/A',
      },
      {
        accessorKey: 'taxId',
        header: 'Tax ID',
        cell: ({ row }) => row.original.taxId || 'N/A',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link href={Routes.Customers.detail(row.original.id)}>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-error hover:text-error"
              onClick={() =>
                setDeleteModal({ isOpen: true, customer: row.original })
              }
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  // Async delete handler
  const handleDeleteAsync = async () => {
    if (!deleteModal.customer) {return}

    try {
      const { data } = await API.Customers.delete(deleteModal.customer.id)

      if (data.statusCode !== 200) {
        notificationService.error(data.message || 'Failed to delete customer', {
          metadata: { customerId: deleteModal.customer?.id },
          component: 'CustomersPage',
          action: 'deleteCustomer',
        })
        return
      }

      notificationService.success(data.message || 'Customer deleted successfully', {
        metadata: { customerId: deleteModal.customer?.id },
        component: 'CustomersPage',
        action: 'deleteCustomer',
      })
      setDeleteModal({ isOpen: false, customer: null })
      // Refresh the table
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      notificationService.error('An error occurred while deleting the customer', {
        metadata: { error, customerId: deleteModal.customer?.id },
        component: 'CustomersPage',
        action: 'deleteCustomer',
      })
    }
  }

  /**
   * Wrapper for delete to handle promise in onClick handler.
   * FAANG Pattern: Non-async wrapper for async event handlers.
   */
  const handleDelete = () => {
    void handleDeleteAsync().catch((error) => {
      // Error already handled in handleDeleteAsync, but catch any unhandled rejections
      logger.error('Unhandled delete error', {
        error,
        component: 'CustomersPage',
        action: 'handleDelete',
      })
    })
  }

  return (
    <>
      <InternalPageHeader
        title="Customers"
        description="Manage customer companies"
        actions={
          <Button
            variant="primary"
            onClick={() => router.push(Routes.Customers.create())}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Create Customer
          </Button>
        }
      />

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <ServerDataGrid<Company>
            key={refreshKey}
            columns={columns}
            endpoint="/customers/search"
            initialPageSize={10}
            emptyMessage="No customers found"
            ariaLabel="Customers table"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, customer: null })}
        title="Delete Customer"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete{' '}
            <strong>{deleteModal.customer?.name}</strong>?
          </p>
          <p className="text-error text-sm">This action cannot be undone.</p>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ isOpen: false, customer: null })}
            >
              Cancel
            </Button>
            <Button variant="error" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

