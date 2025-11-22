'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Plus, Trash2 } from 'lucide-react'
import { notificationService } from '@_shared'
import ServerDataGrid from '@_components/tables/ServerDataGrid'
import Button from '@_components/ui/Button'
import { InternalPageHeader } from '../_components'
import Modal from '@_components/ui/Modal'
import { formatDate } from '@_shared'
import { logger } from '@_core'
import { API } from '@_shared'
import { Routes } from '@_features/navigation'
import type Provider from '@_classes/Provider'

export default function ProvidersPage() {
  const router = useRouter()
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; provider: Provider | null }>({
    isOpen: false,
    provider: null,
  })
  const [refreshKey, setRefreshKey] = useState(0)

  // Column definitions
  const columns = useMemo<ColumnDef<Provider>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Provider Name',
        cell: ({ row }) => (
          <Link
            href={Routes.Providers.detail(row.original.id)}
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
        accessorKey: 'identifier',
        header: 'Identifier',
        cell: ({ row }) => row.original.identifier || 'N/A',
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
            <Link href={Routes.Providers.detail(row.original.id)}>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-error hover:text-error"
              onClick={() =>
                setDeleteModal({ isOpen: true, provider: row.original })
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

  const handleDelete = async () => {
    if (!deleteModal.provider) return

    try {
      const { data } = await API.Providers.delete(deleteModal.provider.id!)

      if (data.statusCode !== 200) {
        notificationService.error(data.message || 'Failed to delete provider', {
          metadata: { providerId: deleteModal.provider?.id },
          component: 'ProvidersPage',
          action: 'deleteProvider',
        })
        return
      }

      notificationService.success(data.message || 'Provider deleted successfully', {
        metadata: { providerId: deleteModal.provider?.id },
        component: 'ProvidersPage',
        action: 'deleteProvider',
      })
      setDeleteModal({ isOpen: false, provider: null })
      // Refresh the table
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      notificationService.error('An error occurred while deleting the provider', {
        metadata: { error, providerId: deleteModal.provider?.id },
        component: 'ProvidersPage',
        action: 'deleteProvider',
      })
    }
  }

  return (
    <>
      <InternalPageHeader
        title="Providers"
        description="Manage medical equipment providers"
        actions={
          <Button
            variant="primary"
            onClick={() => router.push(`${Routes.InternalAppRoute}/providers/create`)}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Create Provider
          </Button>
        }
      />

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <ServerDataGrid<Provider>
            key={refreshKey}
            columns={columns}
            endpoint="/providers/search"
            initialPageSize={10}
            emptyMessage="No providers found"
            ariaLabel="Providers table"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, provider: null })}
        title="Delete Provider"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete{' '}
            <strong>{deleteModal.provider?.name}</strong>?
          </p>
          <p className="text-error text-sm">This action cannot be undone.</p>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ isOpen: false, provider: null })}
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

