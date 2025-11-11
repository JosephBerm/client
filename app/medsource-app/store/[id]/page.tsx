'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

import ClientPageLayout from '@_components/layouts/ClientPageLayout'
import Card from '@_components/ui/Card'
import ProductForm from '@_components/forms/ProductForm'
import { Product } from '@_classes/Product'
import API from '@_services/api'
import Routes from '@_services/routes'

export default function ManageProductPage() {
	const params = useParams<{ id?: string }>()
	const router = useRouter()
	const productId = useMemo(() => params?.id ?? '', [params])
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
					toast.error(data.message || 'Unable to load product')
					router.push(Routes.InternalStore.location)
					return
				}

				setProduct(new Product(data.payload))
			} catch (error) {
				console.error(error)
				toast.error('Unable to load product')
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
		<ClientPageLayout
			title={title}
			description={description}
			maxWidth="lg"
			loading={isLoading}
			actions={
				<a className="btn btn-ghost" href={Routes.InternalStore.location}>
					Back to Store
				</a>
			}
		>
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
				<ProductForm
					product={isCreateMode ? undefined : product ?? undefined}
					onUpdate={(updated) => setProduct(updated)}
				/>
			</Card>
		</ClientPageLayout>
	)
}
