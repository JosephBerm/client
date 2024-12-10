'use client'

import React, { useEffect } from 'react'
import Product from './Product'
import { Product as ProductClass } from '@/classes/Product'
import Home from '@/classes/Home'
import API from '@/src/services/api'
import ViewProductClientButton from '@/components/Landing/ViewProductClientButton'

const Products = () => {
	const [products, setProducts] = React.useState<ProductClass[]>([])
	useEffect(() => {
		const getProducts = async () => {
			const res = await API.Store.Products.getLastest()
			if (res.status !== 200 && Array.isArray(res.data?.payload)) {
				const products = res.data.payload.map((product) => new ProductClass(product)) ?? []
				setProducts(products)
			}
		}
		getProducts()
	}, [])

	return (
		<section className='products-container'>
			<div className='section-container'>
				<h2 className='section-title'>
					OUR <br />
					<strong>PRODUCTS</strong>
				</h2>
				<p className='description'>{Home.Products.description}</p>
				<div className='product-wrapper'>
					{products.map((product: ProductClass) => (
						<Product product={product} key={product.id} />
					))}
				</div>
			</div>
			<ViewProductClientButton />
		</section>
	)
}

export default Products
