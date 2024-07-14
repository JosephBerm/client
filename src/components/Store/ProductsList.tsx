import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Product } from '@/classes/Product'
import { toast } from 'react-toastify'
import API from '@/services/api'

import ProductCard from '@/components/Store/Products/ProductCard'
import IsBusyLoading from '@/components/isBusyLoading'
import debounce from 'lodash/debounce'
import InputTextBox from '@/components/InputTextBox'
import { PagedData } from '@/classes/PagedData'

function ProductsList() {
	const [products, setProducts] = useState<Product[]>([])
	const [pagedData, setPagedData] = useState<PagedData>(new PagedData())
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isSearching, setIsSearching] = useState<boolean>(false)
	const [hasMore, setHasMore] = useState<boolean>(true)
	const [searchText, setSearchText] = useState<string>('')
	const observer = useRef<IntersectionObserver | null>(null)

	const retrieveProducts = async (pagedData: PagedData, replace: boolean = false) => {
		try {
			setIsLoading(true)
			const { data: res } = await API.Store.Products.getList<Product[]>(pagedData)

			if (!res.payload || res.statusCode !== 200) {
				setHasMore(false)
				return toast.error(res.message)
			}
			const newListOfProducts = res.payload.map((p) => new Product(p))
			setProducts((prev) => (replace ? newListOfProducts : [...prev, ...newListOfProducts]))

			setHasMore(res.payload.length > 0)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
			setIsSearching(false)
		}
	}

	useEffect(() => {
		retrieveProducts(pagedData, isSearching)
	}, [pagedData])

	const lastProductElementRef = useCallback(
		(node: HTMLDivElement) => {
			if (isLoading) return
			if (observer.current) observer.current.disconnect()
			observer.current = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting && hasMore) {
						setPagedData((prevPagedData) => ({
							...prevPagedData,
							page: prevPagedData.page + 1,
						}))
					}
				},
				{
					root: null, // viewport
					rootMargin: '2500px',
					threshold: 0.0, // when 100% of the target is visible
				}
			)
			if (node) observer.current.observe(node)
		},
		[isLoading, hasMore]
	)

	// Debounce the API call
	const debouncedRetrieveProducts = useMemo(() => debounce(retrieveProducts, 300), [])

	const handleSearch = (searchQuery: string) => {
		setIsSearching(true)

		if (searchQuery.length > 3) {
			setPagedData((prevPagedData) => ({
				...prevPagedData,
				page: 1,
				searchQuery: searchQuery,
			}))
		} else {
			setPagedData((prevPagedData) => ({
				...prevPagedData,
				page: 1,
				searchQuery: '',
			}))
		}
		setSearchText(searchQuery)
	}

	useEffect(() => {
		return () => {
			// Cancel the debounce on unmount
			debouncedRetrieveProducts.cancel()
		}
	}, [debouncedRetrieveProducts])

	return (
		<div className='ProductsList'>
			<InputTextBox
				placeholder='Search Products'
				type='text'
				value={searchText}
				icon='fa-solid fa-magnifying-glass'
				handleChange={(e) => handleSearch(e.currentTarget.value)}
			/>

			<div className='products-container'>
				{products.map((product, index) => {
					if (products.length === index + 1) {
						return (
							<div ref={lastProductElementRef} key={index}>
								<ProductCard product={product} />
							</div>
						)
					} else {
						return <ProductCard key={index} product={product} />
					}
				})}
			</div>
			<IsBusyLoading isBusy={isLoading} />
		</div>
	)
}

export default ProductsList
