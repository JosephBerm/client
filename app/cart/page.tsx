'use client'

import "@/styles/cart.css"

import { CartProduct } from '@/src/classes/Product'
import { useCartStore } from '@/src/stores/store'
import React from 'react'

import InputNumber from '@/src/components/InputNumber'
import { FormikProvider, useFormik, Form } from "formik"
import FormInputTextBox from "@/src/components/FormInputTextbox"

class QuoteForm {
    FacilityName: string = "";
    EmailAddress: string = "";
    ContactName: string = "";
    PhoneNumber: string = "";
    TypeOfBusiness: TypeOfBusiness | null = null;
    Comments: string = "";
}

enum TypeOfBusiness {
    Dentist,
    SurgeryCenter,
    Hospital,
    Veterinarian,
    Restaurant,
    Construction, 
    Other
}

const Page = () => {

    const formik = useFormik({
        initialValues: new QuoteForm(),
        onSubmit: values => {
            console.log(values)
        },
    })

    const cartStore = useCartStore(state => state.Cart)
    const setCart = useCartStore(state => state.setCart)
    const deleteProdFromCart = useCartStore(state => state.removeProduct)

    const handleAddProductToCart = (productId: string, value: number) => {
        const existingProduct = cartStore.find((p: CartProduct) => p.product.id === productId);
        
        if (existingProduct && existingProduct.quantity + value <= 0) {
            const productsToSet = cartStore.filter((p: CartProduct) => p.product.id !== productId);
            setCart(productsToSet);
            return
        }

        if (existingProduct) {
            const productsToSet = cartStore.map((p: CartProduct) =>
                p.product.id === productId ? { ...p, quantity: p.quantity + value } : p
            );
            setCart(productsToSet);
        }
    }

    const handleSetProductToCart = (productId: string, value: number) => {
        const existingProduct = cartStore.find((p: CartProduct) => p.product.id === productId);
        
        if (existingProduct && existingProduct.quantity + value <= 0) {
            return
        }

        if (existingProduct) {
            const productsToSet = cartStore.map((p: CartProduct) =>
                p.product.id === productId ? { ...p, quantity: value } : p
            );
            setCart(productsToSet);
        }
    }



    return (
        <div className='page-container' >
            <div className="cart">
                <div style={{position:'relative', width:'100%'}} >
                    <div className="cart-item header">
                        <p>Product Name</p>
                        <p>Quantity</p>
                    </div>
                    {cartStore.map((item, index) => (
                        <div key={index} className="cart-item">
                            <p style={{margin: 0}}>{item.product.name}</p>

                            <div className='flex flex-row mb-2'>
                                {/* <button onClick={() => handleAddProductToCart(item.product.id!, -1)} disabled={item.quantity <= 0} style={{border: 'none'}}>
                                    <i className="fa-solid fa-minus"></i>
                                </button> */}
                                <InputNumber value={item.quantity.toString()} label={""} handleChange={(e: string) => handleSetProductToCart(item.product.id!, parseInt(e))}  />
                                {/* <button onClick={() => handleAddProductToCart(item.product.id!, 1)} style={{border: 'none'}}>
                                    <i className="fa-solid fa-plus"></i>
                                </button> */}
                            </div>
                            
                            <button style={{border: 'none', height: 30, width: 30, padding: 0}} onClick={() => deleteProdFromCart(item)} >
                                <i className='fas fa-trash'></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="quote">
                <FormikProvider value={formik}>
                    <Form onSubmit={formik.handleSubmit} className="FormContainer">
                        <FormInputTextBox label="Facility Name" name="FacilityName" value={formik.values.FacilityName}  />
                        <FormInputTextBox label="Contact Name" name="ContactName" value={formik.values.ContactName} />
                        <FormInputTextBox label="Email Address" name="EmailAddress" value={formik.values.EmailAddress} />
                        <FormInputTextBox label="Phone Number" name="PhoneNumber" value={formik.values.PhoneNumber} />
                        <FormInputTextBox type="textarea" rows={6} label="Comments" name="Comments" value={formik.values.Comments} />

                        <button type="submit" style={{marginTop: 40}}>Submit</button>
                    </Form>
                </FormikProvider>
            </div>
        </div>
    )
}

export default Page