'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notificationService, useRouteParam } from '@_shared'

import Card from '@_components/ui/Card'
import { InternalPageHeader } from '../../_components'
import ProductForm from '@_components/forms/ProductForm'
import { Product } from '@_classes/Product'
import { logger } from '@_core'
import { API } from '@_shared'
import { Routes } from '@_features/navigation'

export default function ManageProductPage() {
	const router = useRouter()
	const productId = useRouteParam('id')
	const isCreateMode = productId === 'create'

	const [product, setProduct] = useState<Product | null>(null)
	const [isLoading, setIsLoading] = useState(!isCreateMode)

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
					component: 'ProductDetailPage',
					action: 'fetchProduct',
				})
				router.push(Routes.InternalStore.location)
				return
				}

				setProduct(new Product(data.payload))
		} catch (error) {
			notificationService.error('Unable to load product', {
				metadata: { error, productId },
				component: 'ProductDetailPage',
				action: 'fetchProduct',
			})
			router.push(Routes.InternalStore.location)
			} finally {
				setIsLoading(false)
			}
		}

		void fetchProduct()
	}, [isCreateMode, productId, router])

	const title = isCreateMode ? 'Create Product' : product?.name || 'Edit Product'
	const description = isCreateMode
		? 'Add a new catalog item to the MedSource Pro store, including pricing, stock, and classification.'
		: 'Update product details, pricing, and inventory to keep the catalog accurate.'

	return (
		<>
			<InternalPageHeader
				title={title}
				description={description}
				loading={isLoading}
				actions={
					<a className="btn btn-ghost" href={Routes.InternalStore.location}>
						Back to Store
					</a>
				}
			/>

			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
				<ProductForm
					product={isCreateMode ? undefined : product ?? undefined}
					onUpdate={(updated) => setProduct(updated)}
				/>
			</Card>
		</>
	)
}
