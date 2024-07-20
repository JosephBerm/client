import React, { useEffect } from 'react'
import { IProduct } from '@/classes/Product'
import { CartProduct } from '@/classes/Product'
import { useCartStore } from '@/src/stores/store'
import InputNumber from '@/components/InputNumber'
import API from '@/services/api'
import Image from 'next/image'
import QuantitySelector from '@/components/QuantitySelector'
import Link from 'next/link'
import Routes from '@/services/routes'

const ProductCard = ({ product }: { product: IProduct }) => {
	const addProductToCart = useCartStore((state) => state.addProduct)
	const handleProductQuantity = () => {
		addProductToCart(new CartProduct(product, 1))
	}
	const isProductInCart = useCartStore((state) => state.Cart.some((cartItem) => cartItem.product?.id === product.id))

	return (
		<div className='ProductCard'>
			<div className='image-container'>
				{product.hasImage() ? (
					<Image
						src={`${process.env.API_URL}/products/image?productId=${product.id}&image=${
							product.files[0]?.name ?? ''
						}`}
						width={200}
						height={200}
						style={{ width: 'auto' }}
						alt='Product Image'
					/>
				) : (
					<i className='fa-regular fa-image' />
				)}
			</div>
			<div className='product-details'>
				<h3 className='name'>
					{product.name}
					<br />
					<span className='subheader'>Sold By: {product.provider?.name}</span>
				</h3>
				<p className='description'>{product.description}</p>
				<div className='button-container'>
					<Link href={`${Routes.Product.location}/${product.id}`} className='button'>
						View Product
					</Link>
					<button
						className='add-to-cart transparent'
						onClick={() => handleProductQuantity()}
						disabled={isProductInCart}
						title={isProductInCart ? 'Product added to cart' : ''}>
						{!isProductInCart ? (
							<i className='fa-solid fa-cart-plus' />
						) : (
							<div className='InShoppingCart'>
								<i className='fa-solid fa-cart-shopping' />
								<i className='fa-solid fa-check-double floating' />
							</div>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

export default ProductCard
