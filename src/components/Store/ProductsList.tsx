import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { PagedResult } from '@/src/classes/Base/PagedResult'
import { Product } from '@/classes/Product'
import { toast } from 'react-toastify'
import API from '@/services/api'

import ProductCard from '@/components/Store/Products/ProductCard'
import IsBusyLoading from '@/components/isBusyLoading'
import debounce from 'lodash/debounce'
import InputTextBox from '@/components/InputTextBox'
import { GenericSearchFilter } from '@/src/classes/Base/GenericSearchFilter'
import { isEmpty } from 'lodash'

function ProductsList() {
	const [products, setProducts] = useState<Product[]>([])
	const [pagedData, setPagedData] = useState<PagedResult<Product>>(new PagedResult<Product>({
		pageSize: 10
	}))
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [hasMore, setHasMore] = useState<boolean>(true)
	const [searchText, setSearchText] = useState<string>('')
	const observer = useRef<IntersectionObserver | null>(null)

	const retrieveProducts = async ( replace: boolean = false) => {
		try {
			setIsLoading(true)
			const searchCriteria = new GenericSearchFilter()

			if (!isEmpty(searchText)) {
				searchCriteria.add("Name", searchText)
			}
			//searchCriteria.add("CategorieIds", "11")
			const { data: res } = await API.Store.Products.searchPublic(searchCriteria)

			if (!res.payload || res.statusCode !== 200) {
				setHasMore(false)
				return toast.error(res.message)
			}
			const newListOfProducts = res.payload.data.map((p) => new Product(p))
			setProducts(newListOfProducts)

			setHasMore(res.payload.data.length > 0)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		// Set a timeout to retrieve products after a delay
		const timeout = setTimeout(() => {
		  retrieveProducts();
		}, 1000);
	  
		// Cleanup function to clear the timeout on unmount or before the next effect runs
		return () => {
		  clearTimeout(timeout);
		};
	  }, [searchText]); // Only run this effect when isSearching changes

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
