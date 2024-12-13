import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Product } from '@/classes/Product'
import API from '@/services/api'

import ProductCard from '@/components/Store/Products/ProductCard'
import InputTextBox from '@/components/InputTextBox'

type ProductsListProps = {
	list: Product[]
	searchText: string
	onSearch: (searchQuery: string) => void
	hasMoreProducts: boolean
	getMoreProducts: () => void
}
function ProductsList({ list: products, searchText, onSearch, hasMoreProducts, getMoreProducts }: ProductsListProps) {
	const observer = useRef<IntersectionObserver | null>(null)

	const lastProductElementRef = useCallback(
		(node: HTMLDivElement) => {
			if (observer.current) observer.current.disconnect()
			observer.current = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting && hasMoreProducts) {
						getMoreProducts()
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[hasMoreProducts, products]
	)

	const handleSearch = (searchQuery: string) => {
		onSearch(searchQuery)
	}

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
		</div>
	)
}

export default ProductsList
