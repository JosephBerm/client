import { Product as ProductClass } from '@/src/classes/Product'
import Product from '@/src/components/Landing/Product'
import API from '@/src/services/api'
import React from 'react'

const RelatedProducts = async () => {
    const products = async () => {
        try {
            const res = await API.Store.Products.getLastest(3)
            return res.data?.payload ?? []
        } catch(err) {
            console.error(err)
            return []
        }
    }
    const prods = await products()
    return (
        <section className='products-container component'>
            <div className='section-container'>
                <h2 className='section-title'>
                    Related Products
                </h2>
                <div className='product-wrapper'>
                    {prods.map((product: ProductClass) => (
                        <Product product={product} key={product.id} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default RelatedProducts