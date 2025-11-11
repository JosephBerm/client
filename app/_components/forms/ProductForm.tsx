'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '@_utils/validation-schemas'
import { useFormSubmit } from '@_hooks/useFormSubmit'
import FormInput from './FormInput'
import FormTextArea from './FormTextArea'
import FormSelect from './FormSelect'
import Button from '../ui/Button'
import { Product } from '@_classes/Product'
import type Provider from '@_classes/Provider'
import API from '@_services/api'
import { useParams, useRouter } from 'next/navigation'
import Routes from '@_services/routes'

interface ProductFormProps {
  product?: Product
  onUpdate?: (product: Product) => void
}

export default function ProductForm({ product, onUpdate }: ProductFormProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [files, setFiles] = useState<File[]>([])
  const params = useParams()
  const router = useRouter()
  const isCreateMode = params?.id === 'create'

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      quantity: product?.stock || 0,
      category: product?.category || '',
      sku: product?.sku || '',
      manufacturer: product?.manufacturer || '',
    },
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const { data } = await API.Providers.getAll()
      if (data.payload) {
        setProviders((data.payload as Provider[]) || [])
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err)
    }
  }

  const { submit, isSubmitting } = useFormSubmit(
    async (data: ProductFormData) => {
      if (isCreateMode) {
        // Create mode: use FormData for file upload
        const formData = new FormData()
        formData.append('product.name', data.name)
        formData.append('product.description', data.description)
        formData.append('product.price', data.price.toString())
        formData.append('product.sku', data.sku || '')
        formData.append('product.stock', data.quantity.toString())
        formData.append('product.category', data.category)
        formData.append('product.manufacturer', data.manufacturer || '')
        
        files.forEach((file: File) => {
          formData.append('files', file)
        })

        return await API.Store.Products.create(formData)
      } else {
        // Update mode: use Product constructor to preserve methods
        const productData = new Product({
          ...product!,
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.quantity,
          category: data.category,
          sku: data.sku || '',
          manufacturer: data.manufacturer || '',
        })
        return await API.Store.Products.update(productData)
      }
    },
    {
      successMessage: `Product ${isCreateMode ? 'created' : 'updated'} successfully`,
      errorMessage: `Failed to ${isCreateMode ? 'create' : 'update'} product`,
      onSuccess: (result) => {
        if (!isCreateMode && result) {
          onUpdate?.(new Product(result))
        }
        router.push(`${Routes.InternalAppRoute}/store`)
      }
    }
  )

  const handleSubmit = async (data: ProductFormData) => {
    await submit(data)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <FormInput
        label="Product Name"
        {...form.register('name')}
        error={form.formState.errors.name}
        disabled={isSubmitting}
      />

      <FormTextArea
        label="Description"
        {...form.register('description')}
        error={form.formState.errors.description}
        disabled={isSubmitting}
        rows={4}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="SKU"
          {...form.register('sku')}
          error={form.formState.errors.sku}
          disabled={isSubmitting}
        />
        <FormInput
          label="Price"
          type="number"
          step="0.01"
          {...form.register('price', { valueAsNumber: true })}
          error={form.formState.errors.price}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Quantity/Stock"
          type="number"
          {...form.register('quantity', { valueAsNumber: true })}
          error={form.formState.errors.quantity}
          disabled={isSubmitting}
        />
        <FormInput
          label="Category"
          {...form.register('category')}
          error={form.formState.errors.category}
          disabled={isSubmitting}
        />
      </div>

      <FormInput
        label="Manufacturer"
        {...form.register('manufacturer')}
        error={form.formState.errors.manufacturer}
        disabled={isSubmitting}
      />

      {/* File upload for create mode */}
      {isCreateMode && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">Product Images</span>
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
          />
          {files.length > 0 && (
            <p className="text-sm text-base-content/70 mt-2">
              {files.length} file(s) selected
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
          {isCreateMode ? 'Create Product' : 'Update Product'}
        </Button>
      </div>
    </form>
  )
}

