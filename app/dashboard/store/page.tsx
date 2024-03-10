'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/src/classes/Product'
import { toast } from 'react-toastify'
import Link from 'next/link'
import API from '@/services/api'

const Page = () => {
	const route = useRouter()

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [products, setProducts] = useState<Product[]>([])

	const retrieveProducts = async () => {
		try {
			setIsLoading(true)
			const { data: res } = await API.store.products.getList<Product[]>()

			if (!res.payload || res.statusCode !== 200) {
				toast.error(res.message)
				return
			}
			const productsList = res.payload
			setProducts(productsList)
		} catch (err: any) {
			toast.error(err.response.data.message)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		retrieveProducts()
	}, [])

	return (
		<div className='store-page'>
			<h2>Products</h2>

			{/* Must be a table. IK Style is shit. Tryna get the crud done. */}
			<div className='products-container'>
				{products.map((product) => (
					<div key={product.id} className='product'>
						<h3>{product.name}</h3>
						<p>{product.description}</p>
						<p>${product.price}</p>
						<Link href={`store/${product.id}`}>Edit</Link>
					</div>
				))}
			</div>
			<button className='mt-7' onClick={() => route.push('store/create')}>
				Create Product
			</button>
		</div>
	)
}

export default Page
