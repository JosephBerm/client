import React from 'react'
import Image from 'next/image'
import { Product as ProductClass } from '@/src/classes/Product'

import AddCart from '@/public/add-cart.svg'
import ProductSample from '@/public/product-sample.png'

const Product = ({product}: {product: ProductClass}) => {
  return (
    <div className='product-container'>
        <div>
            <Image src={ProductSample} alt="" />
        </div>

        <p>{product.name.toUpperCase()}</p>

        <div className='buttons-container'>
            <button className='transparent-button'>VIEW PRODUCT</button>
            <Image src={AddCart} alt="cart" color='red'/>
        </div>
    </div>
  )
}

export default Product