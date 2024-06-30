import React from 'react'
import Product from './Product'
import { Product as ProductClass } from '@/classes/Product'
import Home from '@/classes/Home'
import API from '@/src/services/api'
import ViewProductClientButton from '@/components/Landing/ViewProductClientButton'

const Products = async () => {
	const res = await API.Store.Products.getLastest()
	const products = res.data?.payload ?? []

	return (
		<section className='products-container'>
			<div className='section-container'>
				<div className='text-wrapper'>
					<h2 className='section-title'>
						OUR <br />
						<strong>PRODUCTS</strong>
					</h2>
					<p className='description'>{Home.Products.description}</p>
				</div>
				<div className='product-wrapper'>
					{products.map((product: ProductClass) => (
						<Product product={product} key={product.id} />
					))}
				</div>
				<ViewProductClientButton />
			</div>
		</section>
	)
}

export default Products
