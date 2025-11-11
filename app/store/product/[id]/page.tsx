// Styles migrated to Tailwind
import API from '@_services/api'
import { redirect } from 'next/navigation'
import React from 'react'
import Image from "next/image"
import { Product } from "@_classes/Product"
// TODO: Migrate ProductDetails components
// import ProductDetails from "@/components/ProductDetails/ProductDetails"
// import ProductDescription from "@/components/ProductDetails/ProductDescription"
// import RelatedProducts from "@/components/ProductDetails/RelatedProducts"

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
				{/* Product Description */}
				<div className="alert alert-info mt-4">
					<span>TODO: Migrate ProductDetails, ProductDescription, and RelatedProducts components</span>
				</div>
			</div>


		</div>
	)
}

export default page