"use client"
import { CartProduct, Product } from '@/src/classes/Product'
import React from 'react'
import Pill from '@/components/Pill'
import InputTextBox from '@/components/InputTextBox'
import { useCartStore } from '@/src/stores/store'

const ProductDetails = ({product}:{product:Product}) => {
    const [actualProduct, setActualProduct] = React.useState(new Product(product))
    const [email, setEmail]  = React.useState('')
    const Cart = useCartStore()
    return (
        <div className='product-details-container'>
            <Pill text="Limited Stock" variant='info' />
            <h3>{actualProduct.name}</h3>
            <p>{actualProduct.description}</p>

            <div className='contact'>
                <span id="title">Not the product you are looking for?</span>
                <div className='form'>
                    <InputTextBox placeholder='Email Address' className='input' value={email} type="email"/>
                    <button className='transparent action button'>Contact me</button>
                </div>
                <p>* Leave your email here, we will be contacting you to help you find what you are looking for. </p>
            </div>

            <button id="add-to-cart" onClick={() => Cart.addProduct(new CartProduct({ product, quantity: 1 }))} disabled={Cart.isInCart(product.id)}>
                {Cart.isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}

            </button>
        </div>
    )
}

export default ProductDetails