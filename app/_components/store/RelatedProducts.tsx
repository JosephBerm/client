'use client'

import { useEffect, useState, useMemo } from 'react'

import Link from 'next/link'

import { ArrowRight } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { PRODUCT_API_INCLUDES } from '@_features/store'

import { logger } from '@_core'

import { API } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { Product } from '@_classes/Product'

import ProductCard from '@_components/store/ProductCard'
import ProductCardSkeleton from '@_components/store/ProductCardSkeleton'
import Button from '@_components/ui/Button'





interface RelatedProductsProps {
	currentProductId: string
	categoryName?: string
}

const RELATED_PRODUCTS_COUNT = 4

/**
 * Calculate optimal grid classes based on item count
 * Reuses the FAANG-pattern grid logic for consistency
 */
const getOptimalGridClasses = (itemCount: number): { grid: string; maxWidth: string } => {
	const mobileCols = 'grid-cols-1'
	let tabletCols = 'md:grid-cols-2'
	let desktopCols = 'xl:grid-cols-4'
	let maxWidth = 'max-w-7xl'

	if (itemCount === 1) {
		tabletCols = 'md:grid-cols-1'
		desktopCols = 'xl:grid-cols-1'
		maxWidth = 'max-w-md'
	} else if (itemCount === 2) {
		tabletCols = 'md:grid-cols-2'
		desktopCols = 'xl:grid-cols-2'
		maxWidth = 'max-w-4xl'
	} else if (itemCount === 3) {
		tabletCols = 'md:grid-cols-2'
		desktopCols = 'xl:grid-cols-3'
		maxWidth = 'max-w-6xl'
	} else {
		tabletCols = 'md:grid-cols-2'
		desktopCols = 'xl:grid-cols-4'
		maxWidth = 'max-w-7xl'
	}

	return {
		grid: `${mobileCols} ${tabletCols} ${desktopCols}`,
		maxWidth,
	}
}

export default function RelatedProducts({ currentProductId, categoryName }: RelatedProductsProps) {
	const [products, setProducts] = useState<Product[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchRelatedProducts = async () => {
			setIsLoading(true)
			try {
				const criteria = new GenericSearchFilter({
					page: 1,
					pageSize: RELATED_PRODUCTS_COUNT + 1, // Fetch one extra in case we get the current product
					includes: [...PRODUCT_API_INCLUDES],
					sortBy: 'createdAt',
					sortOrder: 'desc',
				})

				if (categoryName) {
					// Try to filter by category if backend supports it
					// If not, it will just return latest products (fallback behavior)
					criteria.add('category', categoryName)
				}

				const { data } = await API.Store.Products.searchPublic(criteria)

				if (data.payload?.data) {
					const fetchedProducts = data.payload.data
						.map((p: Partial<Product>) => new Product(p))
						.filter((p: Product) => p.id !== currentProductId)
						.slice(0, RELATED_PRODUCTS_COUNT)
					
					setProducts(fetchedProducts)
				}
			} catch (err) {
				logger.error('RelatedProducts - Error fetching products', { error: err })
			} finally {
				setIsLoading(false)
			}
		}

		void fetchRelatedProducts()
	}, [currentProductId, categoryName])

	const gridConfig = useMemo(() => {
		if (isLoading) {
			return {
				gridClasses: 'grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
				maxWidth: 'max-w-7xl',
			}
		}
		const config = getOptimalGridClasses(products.length)
		return {
			gridClasses: `grid gap-6 ${config.grid}`,
			maxWidth: config.maxWidth,
		}
	}, [products.length, isLoading])

	if (!isLoading && products.length === 0) {
		return null
	}

	return (
		<section className="border-t border-base-200 bg-base-50 py-16 lg:py-24">
			<div className="container mx-auto p-4 md:p-8 max-w-7xl">
				<div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<h2 className="text-2xl font-bold text-base-content md:text-3xl">
							You might also like
						</h2>
						<p className="mt-2 text-base-content/60">
							Complementary products and popular alternatives
						</p>
					</div>
					<Link href={Routes.Store.location}>
						<Button variant="ghost" rightIcon={<ArrowRight className="h-4 w-4" />}>
							View Catalog
						</Button>
					</Link>
				</div>

				{isLoading ? (
					<div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
						<ProductCardSkeleton count={4} />
					</div>
				) : (
					<div className={`${gridConfig.gridClasses} ${gridConfig.maxWidth} mx-auto`}>
						{products.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	)
}

