'use client'

import React from 'react'
import Image from 'next/image'
import { CartProduct, Product as ProductClass } from '@/src/classes/Product'

import AddCart from '@/public/add-cart.svg'
import ProductSample from '@/public/product-sample.png'

import { useCartStore } from '@/src/stores/store'
import { useRouter } from 'next/navigation'

const Product = ({product}: {product: ProductClass}) => {
	const Store = useCartStore();
	const Route = useRouter();

	return (
		<div className='product-container'>
			<div>
				<Image src={ProductSample} alt="" />
			</div>

			<p>{product.name.toUpperCase()}</p>

			<div className='buttons-container'>
				<button className='transparent-button' onClick={() => Route.push('/products')}>VIEW PRODUCT</button>
				<div className="img-wrapper" onClick={() => Store.addProduct(new CartProduct(product, 1))}>
					<Image src={AddCart} alt="cart" color='red'/>
				</div>
			</div>
		</div>
	)
}

export default Product