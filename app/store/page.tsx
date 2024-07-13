'use client'
import { Product } from '@/src/classes/Product'
import API from '@/src/services/api'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'
import ProductCard from '@/src/components/Store/Products/ProductCard'
import '@/styles/pages/store.css'
import IsBusyLoading from '@/src/components/isBusyLoading'
import debounce from 'lodash/debounce'

const Page = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [products, setProducts] = useState<Product[]>([])
	const [page, setPage] = useState<number>(1)
	const [hasMore, setHasMore] = useState<boolean>(true)
	const observer = useRef<IntersectionObserver | null>(null)

	const retrieveProducts = async (page: number) => {
		try {
			setIsLoading(true)
			const { data: res } = await API.Store.Products.getList<Product[]>({ page, pageSize: 50 })

			if (!res.payload || res.statusCode !== 200) {
				setHasMore(false)
				return toast.error(res.message)
			}

			setProducts((prev) => [...prev, ...res.payload!.map((p) => new Product(p))])

			setHasMore(res.payload.length > 0)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		retrieveProducts(page)
	}, [page])

	const lastProductElementRef = useCallback(
		(node: HTMLDivElement) => {
			if (isLoading) return
			if (observer.current) observer.current.disconnect()
			observer.current = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting && hasMore) {
						setPage((prevPage) => prevPage + 1)
					}
				},
				{
					root: null, // viewport
					rootMargin: '0px',
					threshold: 1.0, // when 100% of the target is visible
				}
			)
			if (node) observer.current.observe(node)
		},
		[isLoading, hasMore]
	)

	// Debounce the API call
	const debouncedRetrieveProducts = useMemo(() => debounce(retrieveProducts, 300), [])

	useEffect(() => {
		return () => {
			// Cancel the debounce on unmount
			debouncedRetrieveProducts.cancel()
		}
	}, [debouncedRetrieveProducts])

	return (
		<div className='Store'>
			<h2 className='page-title'>
				<strong>Store</strong>
			</h2>
			<IsBusyLoading isBusy={isLoading} />
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
		</div>
	)
}

export default Page
