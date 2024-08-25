import "@/styles/pages/productdetails.css"
import API from '@/src/services/api'
import { redirect, useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from "next/image"
import { Product } from "@/src/classes/Product"
import ProductDetails from "@/src/components/ProductDetails/ProductDetails"
import ProductDescription from "@/src/components/ProductDetails/ProductDescription"

const page = async ({params, searchParams}: {params: Record<string, string>, searchParams: Record<string, string>}) => {

	const fetchProduct = async () => {
		try {
			const { data } = await API.Store.Products.get(params.id as string)
			return data?.payload;
		} catch(err) {
			console.error(err)
			return null
		}
	}

	const productResult = await fetchProduct();
	if(!productResult) return redirect('/store')
	const product = new Product(productResult)
  
	return (
		<div className="product-details-page">
			<div className="image-description-container">
				{/* IMAGE */}
				<div className='image-container'>
					{product.hasImage() ? (
						<Image
							src={`${process.env.API_URL}/products/image?productId=${product.id}&image=${
								product.files[0]?.name ?? ''
							}`}
							width={500}
							height={500}
							style={{ width: 'auto' }}
							alt='Product Image'
						/>
					) : (
						<i className='fa-regular fa-image' />
					)}
				</div>
				{/* Product Descrption */}
				<ProductDetails product={productResult} />
			</div>

			<ProductDescription product={productResult}/>


		</div>
	)
}

export default page