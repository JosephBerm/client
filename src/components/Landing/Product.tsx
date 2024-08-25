'use client'

import React from 'react'
import Image from 'next/image'
import { CartProduct, Product as ProductClass } from '@/src/classes/Product'

import AddCart from '@/public/add-cart.svg'
import ProductSample from '@/public/product-sample.png'

import { useCartStore } from '@/src/stores/store'
import { useRouter } from 'next/navigation'

const Product = ({ product }: { product: ProductClass }) => {
	const Store = useCartStore()
	const Route = useRouter()

	return (
		<div className='Product'>
			<Image src={ProductSample} alt='' className='preview' />

			<p className='name'>{product.name.toUpperCase()}</p>

			<div className='buttons-container'>
				<button className='transparent action' onClick={() => Route.push('/store')}>
					VIEW PRODUCT
				</button>
				<div
					className='icon-wrapper'
					onClick={() => Store.addProduct(new CartProduct({ product, quantity: 1 }))}
					// disabled={Store.isInCart(product.id)}
					>
						<Image src={AddCart} alt='cart' color='red' />
						{/* {Store.isInCart(product.id) && <i className='fas fa-check-circle' />} */}
						{/* {!Store.isInCart(product.id) && <Image src={AddCart} alt='cart' color='red' />} */}
					
				</div>
			</div>
		</div>
	)
}

export default Product
