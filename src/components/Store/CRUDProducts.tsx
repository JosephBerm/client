'use client'
import React, { useEffect } from 'react'
import InputTextBox from '@/components/InputTextBox'
import { HttpService } from '@/src/services/httpService'
import { toast } from 'react-toastify'
import { Product } from '@/src/classes/Product'
import { useParams } from 'next/navigation'
import { get } from 'http'


const CRUDProducts = () => {
    const [productName, setProductName] = React.useState<string>('')
    const [productPrice, setProductPrice] = React.useState<string>('0')
    const [productDescription, setProductDescription] = React.useState<string>('')
    const [sku, setSKU] = React.useState<string>('')

    const params = useParams()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    useEffect(() => {
        if(params?.id != "create") {
            getProduct()
            // Fetch the product from the server
            // and set the state with the product information
        }
    }, [params?.id])

    const getProduct = async () => {
        try {
            setIsLoading(true)
            const response = await HttpService.get<Product>(`/products/${params?.id}`)
            setProductName(response.data?.payload?.name ?? "")
            setProductPrice(response.data?.payload?.price?.toString() ?? "")
            setProductDescription(response.data?.payload?.description ?? "")
            setSKU(response.data?.payload?.sku ?? "")
        }catch(err: any) {
            toast.error(err.response.data.message)
        } finally { 
            setIsLoading(false)
        }
    }

    const createProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Send a POST request to the server
        // with the product information
        // If the product is successfully created,
        // redirect the user to the store page

        // If the product is not successfully created,
        // display an error message to the user
        try {
            setIsLoading(true)
            console.log(":X")
            const response = await HttpService.post<Product | null>('/products', {
                name: productName,
                price: parseInt(productPrice ?? 0),
                description: productDescription,
                sku: sku
            })
            toast.success(response.data.message ?? "ERR?")

            console.log(response)

        }catch(err: any) {
            toast.error(err.response.data.message)
        } finally { 
            setIsLoading(false)
        }
    }

    const updateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Not implemented yet
    }


    return (
        <form className="crudForm" onSubmit={params?.id == "create" ? createProduct : updateProduct}>
            <InputTextBox   label="Product Name"
                            type="text"
                            value={productName}
                            handleChange={(value) => setProductName(value)}
                             />

            <InputTextBox   label="SKU"
                            type="text"
                            value={sku}
                            handleChange={(value) => setSKU(value)}
                             />

            <InputTextBox   label="Product Price"
                            type="text"
                            value={productPrice}
                            handleChange={(value) => setProductPrice(value)}
                             />

            <InputTextBox   label="Product Description" 
                            type="text"
                            value={productDescription}
                            handleChange={(value) => setProductDescription(value)}
                            />

            {/* How are we going to be storing the images? */}
            {/* <InputTextBox   label="Product Image"
                            type="file"
                            value=""
                            handleChange={(value) => console.log(value)}
                            required={true} /> */}

            <button type="submit" disabled={isLoading}>Add Product</button>
        </form>
    )
}

export default CRUDProducts