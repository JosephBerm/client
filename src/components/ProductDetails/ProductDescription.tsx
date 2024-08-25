import { Product } from '@/src/classes/Product'
import React from 'react'

const ProductDescription = ({product}:{product:Product}) => {
    return (
        <div className='product-description-container'>
            <h4>Description</h4>

            <p>{product.description}</p>

        </div>
    )
}

export default ProductDescription