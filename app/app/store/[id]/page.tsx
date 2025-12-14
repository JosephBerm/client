/**
 * Product Detail/Edit Page
 * 
 * Handles both product creation and editing in a single page.
 * Uses URL param 'create' for create mode, or product ID for edit mode.
 * 
 * **Features:**
 * - Create new products with image upload
 * - Edit existing product details
 * - Image gallery management (edit mode)
 * - SKU, price, stock, category management
 * - Responsive mobile-first design
 * 
 * **Business Flow:**
 * - Admin creates/updates products
 * - Products appear in public store for customers
 * - Product info (price, stock) used in quote generation
 * 
 * @module app/store/[id]
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, ImageIcon, Package, Save, Trash2, Upload } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { getStockStatusConfig } from '@_features/internalStore'

import { logger } from '@_core'
import { notificationService, useRouteParam, API, formatCurrency } from '@_shared'

import { Product } from '@_classes/Product'

import ProductForm from '@_components/forms/ProductForm'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../../_components'

/**
 * Product image gallery component for edit mode.
 * Displays uploaded images with delete functionality.
 */
interface ProductImageGalleryProps {
	product: Product
	onImageDelete: (imageName: string) => void
	isDeleting: boolean
}

function ProductImageGallery({ product, onImageDelete, isDeleting }: ProductImageGalleryProps) {
	const files = product.files || []

	if (files.length === 0) {
		return (
			<div className="rounded-xl border-2 border-dashed border-base-300 bg-base-200/50 p-8">
				<div className="flex flex-col items-center gap-3 text-center">
					<ImageIcon className="h-12 w-12 text-base-content/30" />
					<div>
						<p className="text-base-content/60 font-medium">No images uploaded</p>
						<p className="text-sm text-base-content/40 mt-1">
							Upload images to showcase this product
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
			{files.map((file) => (
				<div
					key={file.id || file.name}
					className="group relative aspect-square rounded-lg overflow-hidden border border-base-300 bg-base-200"
				>
					{/* Image */}
					<img
						src={`/api/products/image?productId=${product.id}&image=${encodeURIComponent(file.name ?? '')}`}
						alt={file.name ?? 'Product image'}
						className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
						loading="lazy"
					/>

					{/* Delete overlay */}
					<div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200">
						<Button
							variant="error"
							size="sm"
							className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 btn-square"
							onClick={() => onImageDelete(file.name ?? '')}
							disabled={isDeleting}
							aria-label={`Delete image ${file.name}`}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>

					{/* Image name */}
					<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
						<p className="text-xs text-white truncate">
							{file.name}
						</p>
					</div>
				</div>
			))}
		</div>
	)
}

/**
 * Product info card for edit mode.
 * Shows current product details at a glance.
 */
interface ProductInfoCardProps {
	product: Product
}

function ProductInfoCard({ product }: ProductInfoCardProps) {
	const stockStatus = getStockStatusConfig(product.stock || 0)

	return (
		<div className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-base-300 p-4 sm:p-6">
			<div className="flex items-start gap-4">
				{/* Product thumbnail */}
				<div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-base-200 border border-base-300">
					{product.hasImage() ? (
						<img
							src={`/api/products/image?productId=${product.id}&image=${encodeURIComponent(product.getFileName())}`}
							alt={product.name}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="h-full w-full flex items-center justify-center">
							<Package className="h-8 w-8 text-base-content/30" />
						</div>
					)}
				</div>

				{/* Product info */}
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-base-content truncate">
						{product.name}
					</h3>
					{product.sku && (
						<p className="text-sm text-base-content/60 mt-0.5">
							SKU: {product.sku}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-2 mt-2">
						<span className="text-lg font-bold text-primary tabular-nums">
							{formatCurrency(product.price || 0)}
						</span>
						<Badge variant={stockStatus.variant} size="sm">
							{product.stock || 0} in stock
						</Badge>
					</div>

					{/* Categories */}
					{product.categories && product.categories.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-2">
							{product.categories.map((cat) => (
								<Badge key={cat.id} variant="info" size="sm">
									{cat.name}
								</Badge>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

/**
 * ManageProductPage - Product create/edit page.
 */
export default function ManageProductPage() {
	const router = useRouter()
	const productId = useRouteParam('id')
	const isCreateMode = productId === 'create'

	const [product, setProduct] = useState<Product | null>(null)
	const [isLoading, setIsLoading] = useState(!isCreateMode)
	const [isDeletingImage, setIsDeletingImage] = useState(false)

	// Fetch product in edit mode
	useEffect(() => {
		if (!productId) {
			router.back()
			return
		}

		if (isCreateMode) {
			return
		}

		const fetchProduct = async () => {
			try {
				setIsLoading(true)
				const { data } = await API.Store.Products.get(productId)

				if (!data.payload) {
					notificationService.error(data.message || 'Unable to load product', {
						metadata: { productId },
						component: 'ManageProductPage',
						action: 'fetchProduct',
					})
					router.push(Routes.InternalStore.location)
					return
				}

				setProduct(new Product(data.payload))
			} catch (error) {
				notificationService.error('Unable to load product', {
					metadata: { error, productId },
					component: 'ManageProductPage',
					action: 'fetchProduct',
				})
				router.push(Routes.InternalStore.location)
			} finally {
				setIsLoading(false)
			}
		}

		void fetchProduct()
	}, [isCreateMode, productId, router])

	// Handle image deletion
	const handleImageDeleteAsync = useCallback(async (imageName: string) => {
		if (!product) return

		setIsDeletingImage(true)
		try {
			const { data } = await API.Store.Products.deleteImage(product.id, imageName)

			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to delete image', {
					metadata: { productId: product.id, imageName },
					component: 'ManageProductPage',
					action: 'deleteImage',
				})
				return
			}

			notificationService.success('Image deleted successfully')

			// Update product state to remove the deleted image
			setProduct((prev) => {
				if (!prev) return null
				return new Product({
					...prev,
					files: prev.files.filter((f) => f.name !== imageName),
				})
			})
		} catch (error) {
			notificationService.error('An error occurred while deleting the image')
			logger.error('Delete image error', { error, productId: product.id, imageName })
		} finally {
			setIsDeletingImage(false)
		}
	}, [product])

	const handleImageDelete = useCallback((imageName: string) => {
		void handleImageDeleteAsync(imageName)
	}, [handleImageDeleteAsync])

	// Page title and description
	const title = isCreateMode
		? 'Create Product'
		: product?.name || 'Edit Product'

	const description = isCreateMode
		? 'Add a new catalog item to the MedSource Pro store, including pricing, stock, and classification.'
		: 'Update product details, pricing, and inventory to keep the catalog accurate.'

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title={title}
				description={description}
				loading={isLoading}
				actions={
					<Link
						href={Routes.InternalStore.location}
						className="btn btn-ghost gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="hidden sm:inline">Back to Products</span>
						<span className="sm:hidden">Back</span>
					</Link>
				}
			/>

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Form Section */}
				<div className="lg:col-span-2 space-y-6">
					{/* Product Form Card */}
					<Card className="border border-base-300 bg-base-100 shadow-sm">
						<div className="p-4 sm:p-6">
							<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
								{isCreateMode ? (
									<>
										<Package className="h-5 w-5 text-primary" />
										Product Details
									</>
								) : (
									<>
										<Save className="h-5 w-5 text-primary" />
										Edit Details
									</>
								)}
							</h2>
							<ProductForm
								product={isCreateMode ? undefined : product ?? undefined}
								onUpdate={(updated) => setProduct(updated)}
							/>
						</div>
					</Card>

					{/* Image Gallery (Edit Mode Only) */}
					{!isCreateMode && product && (
						<Card className="border border-base-300 bg-base-100 shadow-sm">
							<div className="p-4 sm:p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-lg font-semibold flex items-center gap-2">
										<ImageIcon className="h-5 w-5 text-primary" />
										Product Images
									</h2>
									{product.files && product.files.length > 0 && (
										<Badge variant="info">
											{product.files.length} image{product.files.length !== 1 ? 's' : ''}
										</Badge>
									)}
								</div>
								<ProductImageGallery
									product={product}
									onImageDelete={handleImageDelete}
									isDeleting={isDeletingImage}
								/>
								{/* Future: Add image upload button for edit mode */}
							</div>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Product Info Card (Edit Mode Only) */}
					{!isCreateMode && product && (
						<ProductInfoCard product={product} />
					)}

					{/* Quick Tips Card */}
					<Card className="border border-base-300 bg-base-100 shadow-sm">
						<div className="p-4 sm:p-6">
							<h3 className="font-semibold text-sm uppercase tracking-wide text-base-content/60 mb-3">
								{isCreateMode ? 'Tips for New Products' : 'Editing Tips'}
							</h3>
							<ul className="space-y-2 text-sm text-base-content/70">
								{isCreateMode ? (
									<>
										<li className="flex gap-2">
											<span className="text-primary">•</span>
											Use clear, descriptive product names
										</li>
										<li className="flex gap-2">
											<span className="text-primary">•</span>
											Add multiple high-quality images
										</li>
										<li className="flex gap-2">
											<span className="text-primary">•</span>
											Include SKU for inventory tracking
										</li>
										<li className="flex gap-2">
											<span className="text-primary">•</span>
											Set accurate stock levels
										</li>
										<li className="flex gap-2">
											<span className="text-primary">•</span>
											Assign relevant categories
										</li>
									</>
								) : (
									<>
										<li className="flex gap-2">
											<span className="text-primary">•</span>
											Update stock levels regularly
										</li>
										<li className="flex gap-2">
											<span className="text-primary">•</span>
											Review pricing periodically
										</li>
										<li className="flex gap-2">
											<span className="text-primary">•</span>
											Keep descriptions current
										</li>
										<li className="flex gap-2">
											<span className="text-primary">•</span>
											Replace outdated images
										</li>
									</>
								)}
							</ul>
						</div>
					</Card>

					{/* Help Card */}
					<Card className="border border-base-300 bg-base-100 shadow-sm">
						<div className="p-4 sm:p-6">
							<h3 className="font-semibold text-sm uppercase tracking-wide text-base-content/60 mb-3">
								Need Help?
							</h3>
							<p className="text-sm text-base-content/70 mb-3">
								Products in the catalog are visible to customers in the public store.
								Customers add products to their cart and submit quote requests.
							</p>
							<Link
								href={Routes.Store.location}
								className="text-sm text-primary hover:underline"
							>
								View Public Store →
							</Link>
						</div>
					</Card>
				</div>
			</div>
		</>
	)
}
