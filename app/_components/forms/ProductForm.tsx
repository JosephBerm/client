/**
 * ProductForm Component
 *
 * Comprehensive form for creating and updating medical supply products.
 * Handles product details, image uploads (create mode), and provider relationships.
 * Uses React Hook Form with Zod validation and DRY submission pattern.
 *
 * **Features:**
 * - Create and update modes (URL-based detection)
 * - Product information fields (name, description, price, stock, etc.)
 * - Multi-file image upload (create mode only)
 * - Provider selection (future enhancement)
 * - Zod validation with type safety
 * - useFormSubmit hook integration
 * - Responsive grid layout
 * - Loading states during submission
 * - Success callback and navigation
 * - Toast notifications
 *
 * **Modes:**
 * - **Create Mode**: params.id === 'create', includes file upload, uses FormData
 * - **Update Mode**: params.id is product ID, updates existing product
 *
 * **Form Fields:**
 * - Product Name (required)
 * - Description (required, textarea)
 * - SKU (optional)
 * - Price (required, number)
 * - Quantity/Stock (required, number)
 * - Category (required)
 * - Manufacturer (optional)
 * - Product Images (create mode only, multi-file)
 *
 * **Use Cases:**
 * - Admin product catalog management
 * - Adding new products to inventory
 * - Updating product details and pricing
 * - Bulk image upload during product creation
 *
 * @example
 * ```tsx
 * import ProductForm from '@_components/forms/ProductForm';
 * import { Product } from '@_classes/Product';
 *
 * // Create mode (at /app/store/create)
 * function CreateProductPage() {
 *   return (
 *     <div className="container mx-auto p-6">
 *       <h1 className="text-2xl font-bold mb-6">Create New Product</h1>
 *       <ProductForm />
 *     </div>
 *   );
 * }
 *
 * // Update mode (at /app/store/[id])
 * function EditProductPage() {
 *   const [product, setProduct] = useState<Product | null>(null);
 *
 *   useEffect(() => {
 *     // Fetch product data
 *     fetchProduct(id).then(setProduct);
 *   }, [id]);
 *
 *   if (!product) return <div>Loading...</div>;
 *
 *   return (
 *     <div className="container mx-auto p-6">
 *       <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
 *       <ProductForm
 *         product={product}
 *         onUpdate={(updated) => {
 *           setProduct(updated);
 *           logger.info('Product updated', { productId: updated.id });
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @module ProductForm
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Routes } from '@_features/navigation'

import { productSchema, type ProductFormData } from '@_core'
import { logger } from '@_core'

import { useFormSubmit , API } from '@_shared'

import { Product } from '@_classes/Product'
import type Provider from '@_classes/Provider'

import Button from '@_components/ui/Button'

import FormInput from './FormInput'
import FormTextArea from './FormTextArea'



/**
 * ProductForm component props interface.
 */
interface ProductFormProps {
	/**
	 * Existing product for update mode.
	 * If provided, form is in update mode.
	 * If undefined, form is in create mode.
	 */
	product?: Product

	/**
	 * Callback fired after successful product update.
	 * Only called in update mode.
	 * @param product - Updated product object
	 */
	onUpdate?: (product: Product) => void
}

/**
 * ProductForm Component
 *
 * Full-featured product management form with create/update modes.
 * Handles complex submission logic including file uploads for new products.
 *
 * **Create Mode Behavior:**
 * - Detects create mode via URL params (params.id === 'create')
 * - Shows file upload field for product images
 * - Uses FormData to submit product data + files
 * - Navigates to product list after successful creation
 *
 * **Update Mode Behavior:**
 * - Receives existing product via props
 * - Pre-fills form with product data
 * - No file upload (images managed separately)
 * - Updates product entity while preserving methods
 * - Calls onUpdate callback with updated product
 * - Navigates to product list after successful update
 *
 * **Submission Logic:**
 * - Create: FormData with product.* fields and files array
 * - Update: Product entity constructed to preserve class methods
 * - Both modes use useFormSubmit for DRY error handling
 *
 * **State Management:**
 * - providers: Array of available providers (future feature)
 * - files: Selected files for upload (create mode only)
 * - form: React Hook Form instance with Zod validation
 * - isSubmitting: Loading state from useFormSubmit
 *
 * @param props - Component props including product and onUpdate
 * @returns ProductForm component
 */
export default function ProductForm({ product, onUpdate }: ProductFormProps) {
  const [_providers, setProviders] = useState<Provider[]>([])
  const [files, setFiles] = useState<File[]>([])
  const params = useParams()
  const router = useRouter()
  const isCreateMode = params?.id === 'create'

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      quantity: product?.stock ?? 0,
      category: product?.category ?? '',
      sku: product?.sku ?? '',
      manufacturer: product?.manufacturer ?? '',
    },
  })

  useEffect(() => {
    void fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const { data } = await API.Providers.getAll()
      if (data.payload) {
        setProviders((data.payload as Provider[]) ?? [])
      }
    } catch (err) {
      logger.error('Failed to fetch providers', {
        error: err,
        component: 'ProductForm',
      })
    }
  }

  // ESLint: useFormSubmit is a custom hook that takes an async function and options object (not a dependency array).
  // The async function intentionally captures files, isCreateMode, and product from closure.
  // These are not React hook dependencies - they're closure variables used in the submit function.
  // The function is recreated on each render, which is acceptable for this use case.
  // The second parameter is an options object, not a dependency array, so ESLint's warning is a false positive.
  const { submit, isSubmitting } = useFormSubmit(
    async (data: ProductFormData) => {
      if (isCreateMode) {
        // Create mode: use FormData for file upload
        const formData = new FormData()
        formData.append('product.name', data.name)
        formData.append('product.description', data.description)
        formData.append('product.price', data.price.toString())
        formData.append('product.sku', data.sku ?? '')
        formData.append('product.stock', data.quantity.toString())
        formData.append('product.category', data.category)
        formData.append('product.manufacturer', data.manufacturer ?? '')
        
        files.forEach((file: File) => {
          formData.append('files', file)
        })

        return API.Store.Products.create(formData)
      } else {
        // Update mode: use Product constructor to preserve methods
        const productData = new Product({
          ...product!,
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.quantity,
          category: data.category,
          sku: data.sku ?? '',
          manufacturer: data.manufacturer ?? '',
        })
        return API.Store.Products.update(productData)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    {
      successMessage: `Product ${isCreateMode ? 'created' : 'updated'} successfully`,
      errorMessage: `Failed to ${isCreateMode ? 'create' : 'update'} product`,
      onSuccess: (result) => {
        if (!isCreateMode && result) {
          onUpdate?.(new Product(result))
        }
        router.push(Routes.InternalStore.location)
      }
    }
  )

  /**
   * Form submission handler for React Hook Form.
   * Wraps async handler to satisfy ESLint's no-misused-promises rule.
   * React Hook Form supports async handlers, but we need to handle the Promise explicitly.
   * 
   * FAANG Pattern: Extract event handlers from JSX for separation of concerns.
   */
  const handleSubmit = useCallback((data: ProductFormData): void => {
    void submit(data).catch((error) => {
      // Error already handled in submit function, but catch any unhandled rejections
      logger.error('Unhandled form submission error', {
        error,
        component: 'ProductForm',
        action: 'handleSubmit',
      })
    })
  }, [submit])

  /**
   * Form onSubmit handler that properly handles React Hook Form's Promise return.
   * Extracted from JSX for clean code and separation of concerns.
   * 
   * FAANG Pattern: Use useCallback for stable event handlers to prevent unnecessary re-renders.
   */
  const onFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    const submitHandler = form.handleSubmit(handleSubmit)
    const result = submitHandler(e)
    // React Hook Form's handleSubmit may return a Promise if handler is async
    // Handle it explicitly to satisfy ESLint's no-misused-promises rule
    if (result instanceof Promise) {
      void result.catch((error) => {
        logger.error('Unhandled form submission error', {
          error,
          component: 'ProductForm',
          action: 'onFormSubmit',
        })
      })
    }
  }, [form, handleSubmit])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
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
          <label htmlFor="product-images-input" className="label">
            <span className="label-text font-bold">Product Images</span>
          </label>
          <input
            id="product-images-input"
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

