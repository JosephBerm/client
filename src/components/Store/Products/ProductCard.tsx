import React, { useEffect } from 'react'
import { IProduct } from '@/classes/Product'
import { CartProduct } from '@/classes/Product'
import { useCartStore } from '@/src/stores/store'
import InputNumber from '@/components/InputNumber'
import API from '@/services/api'
import Image from 'next/image'
import QuantitySelector from '@/components/QuantitySelector'

const ProductCard = ({ product }: { product: IProduct }) => {
	const addProductToCart = useCartStore((state) => state.addProduct)
	const removeProductFromCart = useCartStore((state) => state.removeProduct)

	const [QuantityToAdd, setQuantityToAdd] = React.useState<number>(0)

	const productQuantity = useCartStore((state) => state.Cart.filter((c) => c.product?.id === product.id).length)

	const handleProductQuantity = (quantity: number) => {
		setQuantityToAdd(quantity)
	}
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
{/* 
				<QuantitySelector quantity={QuantityToAdd} handleChange={handleProductQuantity} /> */}
			</div>
		</div>
	)
}

export default ProductCard
