'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import ServerDataTable from '@_components/tables/ServerDataTable'
import ClientPageLayout from '@_components/layouts/ClientPageLayout'
import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'
import { formatDate } from '@_shared'
import { logger } from '@_core'
import { API } from '@_shared'
import type Provider from '@_classes/Provider'
import { Routes } from '@_features/navigation'

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
            href={`/medsource-app/providers/${row.original.id}`}
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
            <Link href={`/medsource-app/providers/${row.original.id}`}>
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
        toast.error(data.message || 'Failed to delete provider')
        return
      }

      toast.success(data.message || 'Provider deleted successfully')
      setDeleteModal({ isOpen: false, provider: null })
      // Refresh the table
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      logger.error('Failed to delete provider', {
        error,
        providerId: deleteModal.provider?.id,
        component: 'ProvidersPage',
      })
      toast.error('An error occurred while deleting the provider')
    }
  }

  return (
    <>
      <ClientPageLayout title="Providers" description="Manage medical equipment providers">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button
            variant="primary"
            onClick={() => router.push(`${Routes.InternalAppRoute}/providers/create`)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Provider
          </Button>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <ServerDataTable<Provider>
              key={refreshKey}
              columns={columns}
              endpoint="/providers/search"
              initialPageSize={10}
              emptyMessage="No providers found"
            />
          </div>
        </div>
      </ClientPageLayout>

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

