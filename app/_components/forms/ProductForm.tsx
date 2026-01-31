/**
 * ProductForm Component
 *
 * Comprehensive form for creating and updating medical supply products.
 * Handles product details, image uploads (create mode), categories, and provider relationships.
 * Uses React Hook Form with Zod validation and DRY submission pattern.
 *
 * **Features:**
 * - Create and update modes (URL-based detection)
 * - Product information fields (name, description, price, cost, stock, etc.)
 * - Category selection dropdown (fetched from API)
 * - Provider selection dropdown
 * - Multi-file image upload (create mode only)
 * - Cost field for admin/sales rep (hidden from customers)
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
 * - Price (required, display price to customers)
 * - Cost (admin/staff only, vendor cost)
 * - Quantity/Stock (required, number)
 * - Categories (multi-select dropdown)
 * - Manufacturer (optional)
 * - Provider (optional dropdown)
 * - Product Images (create mode only, multi-file)
 *
 * @see prd_products.md - Product Management PRD
 * @module ProductForm
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'

import { Routes } from '@_features/navigation'

import { productSchema, type ProductFormData } from '@_core'
import { logger } from '@_core'

import { useFormSubmit, usePermissions, API, flattenCategories } from '@_shared'

import { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'
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
 * Includes category selection, provider selection, and cost field for staff.
 */
export default function ProductForm({ product, onUpdate }: ProductFormProps) {
	const [providers, setProviders] = useState<Provider[]>([])
	const [categories, setCategories] = useState<ProductsCategory[]>([])
	const [files, setFiles] = useState<File[]>([])
	const [isLoadingData, setIsLoadingData] = useState(true)
	
	const params = useParams()
	const router = useRouter()
	const isCreateMode = params?.id === 'create'
	
	// RBAC: Check if user can see cost field (SalesRep or above)
	const { isSalesRepOrAbove } = usePermissions()

	const form = useForm<ProductFormData>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: product?.name ?? '',
			description: product?.description ?? '',
			price: product?.price ?? 0,
			cost: product?.cost ?? undefined,
			quantity: product?.stock ?? 0,
			categoryIds: product?.categoryIds ?? [],
			sku: product?.sku ?? '',
			manufacturer: product?.manufacturer ?? '',
			providerId: product?.providerId ?? undefined,
		},
	})

	// Fetch providers and categories on mount
	useEffect(() => {
		const fetchData = async () => {
			setIsLoadingData(true)
			try {
				// Fetch in parallel for better performance
				const [providersRes, categoriesRes] = await Promise.all([
					API.Providers.getActive<Provider>(),
					API.Store.Products.getAllCategories(),
				])

				if (providersRes.data.payload) {
					setProviders((providersRes.data.payload as Provider[]) ?? [])
				}

				if (categoriesRes.data.payload) {
					setCategories((categoriesRes.data.payload as ProductsCategory[]) ?? [])
				}
			} catch (err) {
				logger.error('Failed to fetch form data', {
					error: err,
					component: 'ProductForm',
				})
			} finally {
				setIsLoadingData(false)
			}
		}

		void fetchData()
	}, [])

	// useFormSubmit for create/update operations
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
				formData.append('product.manufacturer', data.manufacturer ?? '')
				
				// Cost field (admin/staff only)
				if (data.cost != null) {
					formData.append('product.cost', data.cost.toString())
				}

				// Provider ID
				if (data.providerId != null) {
					formData.append('product.providerId', data.providerId.toString())
				}

				// Category IDs as comma-separated string
				if (data.categoryIds && data.categoryIds.length > 0) {
					formData.append('product.categoryIds', data.categoryIds.join(','))
				}

				files.forEach((file: File) => {
					formData.append('files', file)
				})

				return API.Store.Products.create(formData)
			} else {
				// Update mode: construct plain object payload for API
				// Explicitly type the update call to match create's return type
				const updatePayload = {
					id: product!.id,
					name: data.name,
					description: data.description,
					price: data.price,
					stock: data.quantity,
					sku: data.sku ?? '',
					manufacturer: data.manufacturer ?? '',
					providerId: data.providerId ?? undefined,
					cost: data.cost ?? undefined,
					categoryIds: data.categoryIds ?? [],
				}

				return API.Store.Products.update<Product>(updatePayload as unknown as Product)
			}
		},
		{
			successMessage: `Product ${isCreateMode ? 'created' : 'updated'} successfully`,
			errorMessage: `Failed to ${isCreateMode ? 'create' : 'update'} product`,
			onSuccess: (result) => {
				if (!isCreateMode && result) {
					onUpdate?.(new Product(result))
				}
				router.push(Routes.InternalStore.location)
			},
		}
	)

	/**
	 * Form submission handler
	 */
	const handleSubmit = useCallback(
		(data: ProductFormData): void => {
			void submit(data).catch((error) => {
				logger.error('Unhandled form submission error', {
					error,
					component: 'ProductForm',
					action: 'handleSubmit',
				})
			})
		},
		[submit]
	)

	/**
	 * Form onSubmit handler
	 * Uses void to handle the Promise from handleSubmit to satisfy ESLint no-misused-promises
	 */
	const onFormSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault()
			void form.handleSubmit(handleSubmit)(e).catch((error) => {
				logger.error('Unhandled form submission error', {
					error,
					component: 'ProductForm',
					action: 'onFormSubmit',
				})
			})
		},
		[form, handleSubmit]
	)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFiles(Array.from(e.target.files))
		}
	}

	// Use shared utility for DRY
	const flatCategories = flattenCategories(categories)

	return (
		<form onSubmit={onFormSubmit} className="space-y-6">
			{/* Basic Information */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
					Basic Information
				</h3>

				<FormInput
					label="Product Name"
					placeholder="Enter product name"
					{...form.register('name')}
					error={form.formState.errors.name}
					disabled={isSubmitting}
				/>

				<FormTextArea
					label="Description"
					placeholder="Enter product description..."
					{...form.register('description')}
					error={form.formState.errors.description}
					disabled={isSubmitting}
					rows={4}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInput
						label="SKU"
						placeholder="Stock Keeping Unit"
						{...form.register('sku')}
						error={form.formState.errors.sku}
						disabled={isSubmitting}
					/>
					<FormInput
						label="Manufacturer"
						placeholder="e.g., MedSupply Co"
						{...form.register('manufacturer')}
						error={form.formState.errors.manufacturer}
						disabled={isSubmitting}
					/>
				</div>
			</div>

			{/* Pricing & Inventory */}
			<div className="space-y-4 pt-4 border-t border-base-300">
				<h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
					Pricing & Inventory
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<FormInput
						label="Display Price"
						type="number"
						step="0.01"
						min="0"
						placeholder="0.00"
						{...form.register('price', { valueAsNumber: true })}
						error={form.formState.errors.price}
						disabled={isSubmitting}
						helperText="Price shown to customers"
					/>

					{/* Cost field - only visible to SalesRep or above */}
					{isSalesRepOrAbove && (
						<FormInput
							label="Vendor Cost"
							type="number"
							step="0.01"
							min="0"
							placeholder="0.00"
							{...form.register('cost', { valueAsNumber: true })}
							error={form.formState.errors.cost}
							disabled={isSubmitting}
							helperText="Internal cost (staff only)"
						/>
					)}

					<FormInput
						label="Stock Quantity"
						type="number"
						min="0"
						placeholder="0"
						{...form.register('quantity', { valueAsNumber: true })}
						error={form.formState.errors.quantity}
						disabled={isSubmitting}
						helperText="Available inventory"
					/>
				</div>
			</div>

			{/* Classification */}
			<div className="space-y-4 pt-4 border-t border-base-300">
				<h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
					Classification
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Categories Multi-Select */}
					<div className="form-control">
						<label htmlFor="categories-select" className="label">
							<span className="label-text font-bold">Categories</span>
						</label>
						<Controller
							name="categoryIds"
							control={form.control}
							render={({ field }) => (
								<select
									id="categories-select"
									multiple
									className="select select-bordered w-full h-32"
									value={field.value?.map(String) ?? []}
									onChange={(e) => {
										const selected = Array.from(e.target.selectedOptions, (opt) =>
											parseInt(opt.value, 10)
										)
										field.onChange(selected)
									}}
									disabled={isSubmitting || isLoadingData}
								>
									{flatCategories.map((cat) => (
										<option key={cat.id ?? ''} value={cat.id ?? ''}>
											{'—'.repeat(cat.depth)} {cat.name}
										</option>
									))}
								</select>
							)}
						/>
						<label className="label">
							<span className="label-text-alt text-base-content/50">
								Hold Ctrl/Cmd to select multiple
							</span>
						</label>
						{form.formState.errors.categoryIds && (
							<p className="text-error text-sm mt-1">
								{form.formState.errors.categoryIds.message}
							</p>
						)}
					</div>

					{/* Provider Dropdown */}
					<div className="form-control">
						<label htmlFor="provider-select" className="label">
							<span className="label-text font-bold">Provider / Vendor</span>
						</label>
						<Controller
							name="providerId"
							control={form.control}
							render={({ field }) => (
								<select
									id="provider-select"
									className="select select-bordered w-full"
									value={field.value ?? ''}
									onChange={(e) => {
										const val = e.target.value
										field.onChange(val || undefined)
									}}
									disabled={isSubmitting || isLoadingData}
								>
									<option value="">No provider selected</option>
									{providers.map((provider) => (
										<option key={provider.id ?? ''} value={provider.id ?? ''}>
											{provider.name}
										</option>
									))}
								</select>
							)}
						/>
						<label className="label">
							<span className="label-text-alt text-base-content/50">
								Source vendor for this product
							</span>
						</label>
						{form.formState.errors.providerId && (
							<p className="text-error text-sm mt-1">
								{form.formState.errors.providerId.message}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* File upload for create mode */}
			{isCreateMode && (
				<div className="space-y-4 pt-4 border-t border-base-300">
					<h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
						Product Images
					</h3>

					<div className="form-control">
						<label htmlFor="product-images-input" className="label">
							<span className="label-text font-bold">Upload Images</span>
						</label>
						<input
							id="product-images-input"
							type="file"
							multiple
							accept="image/*"
							onChange={handleFileChange}
							className="file-input file-input-bordered w-full"
							disabled={isSubmitting}
						/>
						{files.length > 0 && (
							<p className="text-sm text-base-content/70 mt-2">
								{files.length} file(s) selected
							</p>
						)}
						<label className="label">
							<span className="label-text-alt text-base-content/50">
								Upload multiple images to showcase the product
							</span>
						</label>
					</div>
				</div>
			)}

			{/* Form Actions */}
			<div className="flex justify-end gap-4 pt-6 border-t border-base-300">
				<Button
					type="button"
					variant="ghost"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button 
					type="submit" 
					variant="primary" 
					loading={isSubmitting} 
					disabled={isSubmitting || isLoadingData}
				>
					{isCreateMode ? 'Create Product' : 'Update Product'}
				</Button>
			</div>
		</form>
	)
}
