'use client'
import { Product } from '@/src/classes/Product'
import API from '@/src/services/api'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import ProductCard from '@/src/components/Store/Products/ProductCard'
import '@/styles/publicstore.css'


const Page = () => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
	const [products, setProducts] = React.useState<Product[]>([])

	const retrieveProducts = async () => {
		try {
			setIsLoading(true)
			const { data: res } = await API.store.products.getList<Product[]>()

			if (!res.payload || res.statusCode !== 200) {
				return toast.error(res.message)
			}
			setProducts(res.payload)
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
    <div style={{marginTop: 100}}>
        <h2>Products</h2>
        <div>
            {products.map((product, index) => (
                <ProductCard
                    key={index}
                    product={product}
                />
            ))}
        </div>
    </div>
  )
}

export default Page