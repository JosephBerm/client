'use client'
// import { Product } from '@/src/classes/Product'
// import API from '@/src/services/api'
import React, { useEffect } from 'react'
// import { toast } from 'react-toastify'
import ProductCard from '@/src/components/Store/Products/ProductCard'
import '@/styles/pages/store.css'
import IsBusyLoading from '@/src/components/isBusyLoading'

const Page = () => {
	// const [isLoading, setIsLoading] = React.useState<boolean>(false)
	// const [products, setProducts] = React.useState<Product[]>([])

	// const retrieveProducts = async () => {
	// 	try {
	// 		setIsLoading(true)
	// 		const { data: res } = await API.Store.Products.getList<Product[]>()

	// 		if (!res.payload || res.statusCode !== 200) {
	// 			return toast.error(res.message)
	// 		}
	// 		setProducts(res.payload.map((p) => new Product(p)))
	// 	} catch (err: any) {
	// 		toast.error(err.message)
	// 	} finally {
	// 		setIsLoading(false)
	// 	}
	// }

	// useEffect(() => {
	// 	retrieveProducts()
	// }, [])

	return (
		<div className='Store'>
			<h2 className='page-title'>
				<strong>Store</strong>
			</h2>
			<p className='description'> Coming Soon!</p>
			{/* <IsBusyLoading isBusy={isLoading} />
			{!isLoading && (
				<div className='products-container'>
					{products.map((product, index) => (
						<ProductCard key={index} product={product} />
					))}
				</div>
			)} */}
		</div>
	)
}

export default Page
