'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import ClientPageLayout from '@_components/layouts/ClientPageLayout'
import Button from '@_components/ui/Button'
import ProductsCategory, { sanitizeCategoriesList } from '@_classes/ProductsCategory'
import { Product } from '@_classes/Product'
import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { PagedResult } from '@_classes/Base/PagedResult'
import API from '@_services/api'

type RetrievalOverrides = {
	search?: string
	categories?: ProductsCategory[]
}

interface FlattenedCategory {
	category: ProductsCategory
	depth: number
}

const INITIAL_FILTER = () => new GenericSearchFilter({ pageSize: 50, includes: ['Files', 'Provider'] })

const formatCurrency = (value: number) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2,
	}).format(Number.isFinite(value) ? value : 0)

const StorePageContent = () => {
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<ProductsCategory[]>([])
	const [selectedCategories, setSelectedCategories] = useState<ProductsCategory[]>([])
	const [searchText, setSearchText] = useState('')
	const [searchCriteria, setSearchCriteria] = useState<GenericSearchFilter>(INITIAL_FILTER)
	const [productsResult, setProductsResult] = useState<PagedResult<Product>>(new PagedResult<Product>())
	const [isLoading, setIsLoading] = useState(false)
	const [hasLoaded, setHasLoaded] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const router = useRouter()
	const searchParams = useSearchParams()

	const flattenedCategories = useMemo<FlattenedCategory[]>(() => {
		const flattened: FlattenedCategory[] = []

		const traverse = (items: ProductsCategory[], depth = 0) => {
			items.forEach((item) => {
				flattened.push({ category: item, depth })
				if (item.subCategories?.length) {
					traverse(item.subCategories, depth + 1)
				}
			})
		}

		traverse(categories)

		return flattened
	}, [categories])

	const hasMoreProducts = productsResult.hasNext
	const totalResults = productsResult.total || products.length
	const displayedCount = products.length
	const isFiltered = selectedCategories.length > 0 || searchText.trim().length > 0
	const firstLoad = !hasLoaded && isLoading
	const isSearchTooShort = searchText.length > 0 && searchText.length < 3

	const fetchCategories = async () => {
		try {
			const { data } = await API.Store.Products.getAllCategories()

			if (!data.payload || data.statusCode !== 200) {
				toast.error(data.message ?? 'Unable to load categories')
				return []
			}

			const categoryInstances = data.payload.map(
				(category: Partial<ProductsCategory>) => new ProductsCategory(category)
			)
			const sanitized = sanitizeCategoriesList(categoryInstances)
			setCategories(sanitized)
			return sanitized
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unable to load categories'
			toast.error(message)
			return []
		}
	}

	const retrieveProducts = async (
		criteria: GenericSearchFilter,
		overrides?: RetrievalOverrides
	): Promise<Product[]> => {
		const searchValue = overrides?.search ?? searchText
		const categoriesValue = overrides?.categories ?? selectedCategories

		setIsLoading(true)
		setError(null)

		try {
			if (!isEmpty(searchValue) && searchValue.length > 2) {
				criteria.add('Name', searchValue)
			} else {
				criteria.clear('Name')
			}

			if (categoriesValue.length > 0) {
				const categoryIds = categoriesValue.map((cat) => String(cat.id)).join('|')
				criteria.add('CategorieIds', categoryIds)
			} else {
				criteria.clear('CategorieIds')
			}

			const { data } = await API.Store.Products.searchPublic(criteria)

			if (!data.payload || data.statusCode !== 200) {
				const message = data.message ?? 'Unable to fetch products'
				toast.error(message)
				setProducts([])
				setProductsResult(new PagedResult<Product>())
				setError(message)
				return []
			}

			const payload = data.payload
			const nextProducts = payload.data.map((product) => new Product(product))
			setProducts(nextProducts)
			setProductsResult(new PagedResult<Product>(payload))
			return nextProducts
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unable to fetch products'
			toast.error(message)
			setProducts([])
			setProductsResult(new PagedResult<Product>())
			setError(message)
			return []
		} finally {
			setIsLoading(false)
			setHasLoaded(true)
		}
	}

	const handleCategorySelection = (toggledCategory: ProductsCategory) => {
		setSelectedCategories((previous) => {
			const alreadySelected = previous.some((item) => item.id === toggledCategory.id)

			if (alreadySelected) {
				return previous.filter((item) => {
					const isChild = item.parentCategoryId === toggledCategory.id
					const isParent = item.id === toggledCategory.id
					return !isChild && !isParent
				})
			}

			const filteredItems = previous.filter((item) => item.parentCategoryId !== toggledCategory.id)
			return [...filteredItems, toggledCategory]
		})
	}

	const handleSearchQuery = (event: ChangeEvent<HTMLInputElement>) => {
		setSearchText(event.target.value)
	}

	const loadMoreProducts = () => {
		if (isLoading || !hasMoreProducts) return

		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			pageSize: searchCriteria.pageSize + 25,
		})

		setSearchCriteria(updatedCriteria)
		void retrieveProducts(updatedCriteria)
	}

	const clearFilters = () => {
		if (!isFiltered) return

		const resetFilter = INITIAL_FILTER()
		setSearchText('')
		setSelectedCategories([])
		setSearchCriteria(resetFilter)
		void retrieveProducts(resetFilter, { search: '', categories: [] })
	}

	useEffect(() => {
		void fetchCategories()
	}, [])

	useEffect(() => {
		const querySearchText = searchParams.get('search')
		if (querySearchText) {
			setSearchText(querySearchText)

			const params = new URLSearchParams(searchParams.toString())
			params.delete('search')
			const newQuery = params.toString()
			router.replace(`/store${newQuery ? `?${newQuery}` : ''}`)
		}
	}, [router, searchParams])

	useEffect(() => {
		const timer = setTimeout(() => {
			void retrieveProducts(searchCriteria)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchText, selectedCategories])

	return (
		<ClientPageLayout
			title="Store Catalog"
			description="Browse MedSource Pro products and filter by category to find the supplies you need."
			loading={firstLoad}
			maxWidth="full"
			actions={
				<Button variant="ghost" onClick={clearFilters} disabled={!isFiltered || isLoading}>
					Reset Filters
				</Button>
			}
		>
			<div className="space-y-8">
				{error && (
					<div className="alert alert-error">
						<span>{error}</span>
					</div>
				)}

				{isLoading && hasLoaded && (
					<div className="alert alert-info flex items-center gap-2">
						<span className="loading loading-spinner loading-sm" aria-hidden="true"></span>
						<span>Updating results&hellip;</span>
					</div>
				)}

				<section className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
					<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<label className="form-control w-full md:max-w-xl">
							<span className="label-text text-sm font-medium text-base-content">Search products</span>
							<input
								type="text"
								value={searchText}
								onChange={handleSearchQuery}
								className="input input-bordered mt-1"
								placeholder="Search products (min 3 characters)"
							/>
							<span className="label-text-alt text-xs text-base-content/60">
								Search applies automatically after a short pause.
							</span>
						</label>
						<div className="text-sm text-base-content/70">
							<p>
								Showing <span className="font-semibold text-base-content">{displayedCount}</span> of{' '}
								<span className="font-semibold text-base-content">{totalResults}</span> products
							</p>
							{isSearchTooShort && (
								<p className="mt-1 text-xs text-warning">
									Enter at least 3 characters to apply a text search.
								</p>
							)}
						</div>
					</div>
				</section>

				<section className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<h3 className="text-base font-semibold text-base-content">Categories</h3>
						<span className="text-xs text-base-content/60">{selectedCategories.length} selected</span>
					</div>

					{flattenedCategories.length === 0 ? (
						<p className="mt-4 text-sm text-base-content/70">Categories load automatically once available.</p>
					) : (
						<div className="mt-4 space-y-2">
							{flattenedCategories.map(({ category, depth }) => {
								const isSelectedCategory = selectedCategories.some((item) => item.id === category.id)

								return (
									<div key={category.id} style={{ paddingLeft: depth * 16 }}>
										<button
											type="button"
											onClick={() => handleCategorySelection(category)}
											className={`rounded-full border px-3 py-1 text-sm transition-colors ${
												isSelectedCategory
													? 'border-primary bg-primary text-primary-content'
													: 'border-base-300 bg-base-100 text-base-content hover:border-primary hover:text-primary'
											}`}
										>
											{category.name ?? 'Untitled category'}
										</button>
									</div>
								)
							})}
						</div>
					)}

					<div className="alert alert-info mt-6">
						<span>
							TODO: Migrate TreeSelect and ProductsList components into the modern store experience.
						</span>
					</div>
				</section>

				<section className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<h3 className="text-base font-semibold text-base-content">Products</h3>
						{hasMoreProducts && (
							<p className="text-xs text-base-content/60">
								Load more results to view additional products ({productsResult.totalPages} pages total).
							</p>
						)}
					</div>

					{products.length === 0 ? (
						<div className="mt-6 rounded-lg border border-dashed border-base-300 p-6 text-center text-sm text-base-content/70">
							No products match the current filters. Adjust your filters or reset them to see more results.
						</div>
					) : (
						<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{products.map((product) => (
								<div
									key={product.id}
									className="rounded-lg border border-base-200 bg-base-100 p-4 shadow-sm transition-shadow hover:shadow-md"
								>
									<h4 className="text-base font-semibold text-base-content">{product.name || 'Unnamed product'}</h4>
									<p className="mt-1 text-sm text-base-content/70">
										{product.manufacturer || 'Manufacturer pending'}
									</p>
									<p className="mt-3 text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
									<p className="mt-2 text-xs text-base-content/60">
										SKU: {product.sku || 'N/A'} · Stock: {product.stock}
									</p>
									<p className="mt-3 text-xs text-base-content/60">
										Categories:{' '}
										{product.categories.length
											? product.categories
													.map((category) => category.name)
													.filter(Boolean)
													.join(', ')
											: 'Not tagged'}
									</p>
								</div>
							))}
						</div>
					)}

					{hasMoreProducts && (
						<div className="mt-6 flex justify-center">
							<Button variant="primary" onClick={loadMoreProducts} disabled={isLoading}>
								Load More Results
							</Button>
						</div>
					)}
				</section>
			</div>
		</ClientPageLayout>
	)
}

const StorePageFallback = () => (
	<ClientPageLayout
		title="Store Catalog"
		description="Browse MedSource Pro products and filter by category to find the supplies you need."
		loading
		maxWidth="full"
		actions={
			<Button variant="ghost" disabled>
				Reset Filters
			</Button>
		}
	>
		<div className="flex justify-center py-16">
			<span className="loading loading-spinner loading-lg text-primary" aria-hidden="true"></span>
		</div>
	</ClientPageLayout>
)

const Page = () => (
	<Suspense fallback={<StorePageFallback />}>
		<StorePageContent />
	</Suspense>
)

export default Page

