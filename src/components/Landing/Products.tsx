import React from 'react'
import Product from './Product'
import { Product as ProductClass } from '@/src/classes/Product'
import API from '@/src/services/api'
import ViewProductClientButton from '@/components/Landing/ViewProductClientButton'

const Products = async () => {
	const res = await API.Store.Products.getLastest()
	const products = res.data?.payload ?? []

	return (
		<section className='products-container'>
			<div className='text-wrapper'>
				<div className='header-container'>
					<h2>OUR</h2>
					<h1 className='responsive-header'>PRODUCTS</h1>
				</div>

				<p className='description'>
					Explore our wide range of medical products, from state-of-the-art equipment to essential supplies.
					Browse through categories such as medical devices, diagnostic tools, laboratory materials, and more.
				</p>
			</div>

			<div className='product-wrapper'>
				{products.map((product: ProductClass) => (
					<Product product={product} key={product.id} />
				))}
			</div>

			<ViewProductClientButton />
		</section>
	)
}

export default Products
