'use client'

import '@/styles/pages/store.css'
import React, { useEffect, useState, useMemo } from 'react'

import ProductsCategory, { sanitizeCategoriesList } from '@/classes/ProductsCategory'
import { Product } from '@/classes/Product'
import TreeSelect from '@/components/TreeSelect'
import ProductsList from '@/components/Store/ProductsList'
import { GenericSearchFilter } from '@/classes/Base/GenericSearchFilter'
import { isEmpty } from 'lodash'
import API from '@/services/api'
import { toast } from 'react-toastify'
import debounce from 'lodash/debounce'
import { PagedResult } from '@/classes/Base/PagedResult'

const Page = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [hasMore, setHasMore] = useState<boolean>(true)

	const [products, setProducts] = useState<Product[]>([])
	const [searchCriteria, setSearchCriteria] = useState<GenericSearchFilter>(
		new GenericSearchFilter({ pageSize: 50, includes: ['Files', 'Provider'] })
	)
	const [selectedCategories, setSelectedCategories] = useState<ProductsCategory[]>([])
	const [categories, setCategories] = useState<ProductsCategory[]>([])
	const [searchText, setSearchText] = useState<string>('')
	const [productsResult, setProductsResult] = useState<PagedResult<Product>>(new PagedResult<Product>())

	const hasMoreProducts = useMemo(() => productsResult.pageSize < productsResult.total, [productsResult])

	const fetchCategories = async (): Promise<ProductsCategory[]> => {
		try {
			const { data: response } = await API.Store.Products.getAllCategories()

			if (!response.payload || response.statusCode !== 200) {
				toast.error(response.message)
				return []
			}
			const sanitizedCategories: ProductsCategory[] = sanitizeCategoriesList(response.payload)
			setIsLoading(false)
			setCategories(sanitizedCategories)

			return sanitizedCategories
		} catch (err: any) {
			toast.error(err.message)
			return []
		}
	}

	const retrieveProducts = async (criteria: GenericSearchFilter): Promise<Product[]> => {
		try {
			setIsLoading(true)
			if (!isEmpty(searchText) && searchText.length > 2) {
				criteria.add('Name', searchText)
			} else {
				criteria.clear('Name')
			}

			if (selectedCategories.length > 0) {
				const categoryIds = selectedCategories.map((cat) => cat.id).join('|')
				criteria.add('CategorieIds', categoryIds)
			} else {
				criteria.clear('CategorieIds')
			}

			//criteria.add("CategorieIds", "11")
			const { data: res } = await API.Store.Products.searchPublic(criteria)

			if (!res.payload || res.statusCode !== 200) {
				setHasMore(false)
				toast.error(res.message)
				return []
			}
			const newListOfProducts = res.payload.data.map((p) => new Product(p))
			setHasMore(res.payload.data.length > 0)
			setProducts(newListOfProducts)
			setProductsResult(res.payload)
			setIsLoading(false)

			return newListOfProducts
		} catch (err: any) {
			toast.error(err.message)
			return []
		}
	}
	const handleCategorySelection = (toggledCategory: ProductsCategory) => {
		setSelectedCategories((prevSelectedItems) => {
			const alreadySelected = prevSelectedItems.some((item) => item.id === toggledCategory.id)

			if (alreadySelected) {
				// If unselecting, remove the parent and all its children
				const filteredItems = prevSelectedItems.filter((item) => {
					const isChild = item.parentCategoryId === toggledCategory.id
					const isParent = item.id === toggledCategory.id
					return !isChild && !isParent
				})
				return filteredItems
			} else {
				// If selecting, remove the parent's children and add the parent
				const filteredItems = prevSelectedItems.filter((item) => item.parentCategoryId !== toggledCategory.id)
				return [...filteredItems, toggledCategory]
			}
		})
	}

	useEffect(() => {
		fetchCategories()
	}, [])

	useEffect(() => {
		const debouncedTime = setTimeout(async () => {
			retrieveProducts(searchCriteria)
		}, 300)

		return () => clearTimeout(debouncedTime)
	}, [searchText, selectedCategories])

	const setSearch = () => {
		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			pageSize: searchCriteria.pageSize + 25,
		})
		setSearchCriteria(updatedCriteria)
		retrieveProducts(updatedCriteria)
	}
	const handleSearchQuery = (searchQuery: string) => {
		setSearchText(searchQuery)
	}
	return (
		<div className='Store'>
			<h2 className='page-title'>
				<strong>Store</strong>
			</h2>
			<div className='CategoriesMenu'>
				<TreeSelect<ProductsCategory>
					list={categories}
					label='name'
					childKey='subCategories'
					onItemSelected={handleCategorySelection}
				/>
			</div>
			<ProductsList
				list={products}
				searchText={searchText}
				onSearch={handleSearchQuery}
				hasMoreProducts={hasMoreProducts}
				getMoreProducts={setSearch}
			/>
		</div>
	)
}

export default Page
