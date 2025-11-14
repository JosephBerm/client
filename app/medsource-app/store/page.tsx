'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Plus, Archive } from 'lucide-react'
import { toast } from 'react-toastify'
import ServerDataTable from '@_components/tables/ServerDataTable'
import ClientPageLayout from '@_components/layouts/ClientPageLayout'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import Modal from '@_components/ui/Modal'
import { formatDate, formatCurrency } from '@_shared'
import type { Product } from '@_classes/Product'
import { API } from '@_shared'
import { Routes } from '@_features/navigation'

export default function StorePage() {
  const router = useRouter()
  const [archiveModal, setArchiveModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  })
  const [refreshKey, setRefreshKey] = useState(0)

  // Column definitions
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product Name',
        cell: ({ row }) => (
          <Link
            href={`${Routes.Product.location}/${row.original.id}`}
            className="link link-primary font-semibold"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="line-clamp-3 max-w-md">
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => formatCurrency(row.original.price || 0),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
          const stock = row.original.stock || 0
          const variant = stock > 10 ? 'success' : stock > 0 ? 'warning' : 'error'
          return <Badge variant={variant}>{stock}</Badge>
        },
      },
      {
        accessorKey: 'categories',
        header: 'Categories',
        cell: ({ row }) => (
          <div className="flex gap-2 flex-wrap">
            {row.original.categories?.map((category: any) => (
              <Badge key={category.id} variant="info" size="sm">
                {category.name}
              </Badge>
            )) || 'N/A'}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`${Routes.InternalAppRoute}/${Routes.Store.location}/${row.original.id}`)
              }
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-warning hover:text-warning"
              onClick={() =>
                setArchiveModal({ isOpen: true, product: row.original })
              }
            >
              <Archive className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [router]
  )

  const handleArchive = async () => {
    if (!archiveModal.product) return

    try {
      const { data } = await API.Store.Products.delete(archiveModal.product.id!)

      if (data.statusCode !== 200) {
        toast.error(data.message || 'Failed to archive product')
        return
      }

      toast.success(data.message || 'Product archived successfully')
      setArchiveModal({ isOpen: false, product: null })
      // Refresh the table
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error('Error archiving product:', error)
      toast.error('An error occurred while archiving the product')
    }
  }

  return (
    <>
      <ClientPageLayout title="Products" description="Manage your medical equipment inventory">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button
            variant="primary"
            onClick={() => router.push(`${Routes.InternalAppRoute}/${Routes.Store.location}/create`)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <ServerDataTable<Product>
              key={refreshKey}
              columns={columns}
              endpoint="/products/search"
              initialPageSize={10}
              initialSortBy="createdAt"
              initialSortOrder="desc"
              filters={{ includes: ['Categories'] }}
              emptyMessage="No products found"
            />
          </div>
        </div>
      </ClientPageLayout>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal({ isOpen: false, product: null })}
        title="Archive Product"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to archive{' '}
            <strong>{archiveModal.product?.name}</strong>?
          </p>
          <p className="text-warning text-sm">
            This will hide the product from the store but won&apos;t delete it permanently.
          </p>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="ghost"
              onClick={() => setArchiveModal({ isOpen: false, product: null })}
            >
              Cancel
            </Button>
            <Button variant="accent" onClick={handleArchive}>
              Archive
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

