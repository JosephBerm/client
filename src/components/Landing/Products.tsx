import React from 'react'
import Product from './Product'
import {Product as ProductClass} from '@/src/classes/Product'

const Products = () => {
    const product = new ProductClass({
        name: "Amico Economy Manifolds M2-HBXC-08U-N2O"
    })
  return (
    <div className='products-container'>
       <div className="text-wrapper">
            <div className="header-container">
                <h2>OUR</h2>
                <h1 className="responsive-header">PRODUCTS</h1>
            </div>

            <p className='description'>
            Explore our wide range of medical products, from state-of-the-art equipment to essential supplies. Browse through categories such as medical devices, diagnostic tools, laboratory materials, and more.
            </p>
        </div>

        <div className='product-wrapper'>
            <Product product={product}/>
            <Product product={product}/>
            <Product product={product}/>
        </div>
    </div>
  )
}

export default Products