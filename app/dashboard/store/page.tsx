'use client'

import React from 'react'
import CRUDProducts from '../../../src/components/Store/CRUDProducts'
import { useRouter, } from 'next/navigation'
import { Product } from '@/src/classes/Product';
import { HttpService } from '@/src/services/httpService';
import { toast } from 'react-toastify';
import InputTextBox from '@/components/InputTextBox'
import Link from 'next/link';


const page = () => {
    const route = useRouter()

    

    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [products, setProducts] = React.useState<Product[]>([])

	const retrieveProducts = async () => {
        try {
            setIsLoading(true)
            const response = await HttpService.get<Product[]>('/products')
            setProducts(response.data.payload ?? [])
        }catch(err: any) {
            toast.error(err.response.data.message)
        } finally { 
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
		console.log("SDASDASDASDASDSAD")
        retrieveProducts()
    }, [])

    return (
        <div className='store-page'>
            <h2>Products</h2>
            <button onClick={() => route.push("store/create")}>Create Product</button>

            {/* Must be a table. IK Style is shit. Tryna get the crud done. */}
            <div className="products-container">
                {products.map((product) => (
                    <div key={product.id} className="product">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>${product.price}</p>
                        <Link href={`store/${product.id}`} > Edit</Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default page