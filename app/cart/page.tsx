'use client'
import { useCartStore } from '@/src/stores/store'
import React from 'react'

const Page = () => {

    const cartStore = useCartStore(state => state.Cart)

    return (
        <div style={{marginTop: 100}}>
            <h1>Cart</h1>
            <div>
                {cartStore.map((item, index) => (
                    <div key={index}>
                        <h3>{item.product.name}</h3>
                        <p>Quantity: {item.quantity}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Page