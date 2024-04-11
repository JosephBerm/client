'use client'
import Order, { OrderItem } from '@/src/classes/Order'
import { Product } from '@/src/classes/Product'
import InputTextBox from '@/src/components/InputTextBox'
import IsBusyLoading from '@/src/components/isBusyLoading'
import API from '@/src/services/api'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface props {
    order: Order,
    products: Product[]
}

const OrdersPage = (props: props) => {
	const params = useParams()
	const route = useRouter()
	const [order, setOrder] = useState<Order>(props.order)
	const [products, setProducts]  = useState<Product[]>(props.products)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [product, setProduct] = useState<Product | null>(null)

	const updateOrder = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Orders.update(order)

			if (data.statusCode == 200) {
				route.push('/dashboard/orders')
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}
	const handleQuantityChange = (orderItem: OrderItem, quantity: number) =>{
		setOrder((prev) => {
			const newOrder: Order = JSON.parse(JSON.stringify(prev));
			
			const index = newOrder.products.findIndex((p) => {
				return p.product?.id === orderItem.product?.id;
			});
			if (index >= 0) {
				newOrder.products[index].quantity = quantity
			}

			return newOrder
		})
	}
	const handlePriceChange = (orderItem: OrderItem, price: number) =>{
		setOrder((prev) => {
			const newOrder: Order = JSON.parse(JSON.stringify(prev));
			
			const index = newOrder.products.findIndex((p) => {
				return p.product?.id === orderItem.product?.id;
			});
			if (index >= 0) {
				newOrder.products[index].sellPrice = price
			}

			return newOrder
		})
	}
	const handleSelectProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const productId = e.target.value;
		const product = products.find((p) => p.id == productId);
		setProduct(product || null)
	}
    
    const renderProductRows = () => {
        return (
            <tbody className='table-dark'>
                {order.products.map((orderItem, index) => {
                    return (
                        <tr key={orderItem.product?.id || index}>
                            <td>{orderItem.product?.name} </td>
                            <td>
                                <InputTextBox 
                                    label="" 
                                    type="number" 
                                    value={orderItem.quantity.toString()} 
                                    handleChange={(e:string) => handleQuantityChange(orderItem, parseInt(e))} 
                                />
                            </td>
    
                            <td>
                                <InputTextBox 
                                    label="" 
                                    type="number" 
                                    value={orderItem.sellPrice.toString()} 
                                    handleChange={(e:string) => handlePriceChange(orderItem, parseFloat(e))} 
                                />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        )
    }

    return (
        <div className='EditQuoteForm'>
            <h4 style={{marginBottom: 25}}>Order Details</h4>
            <div>
                <select onChange={handleSelectProduct}>
                    <option disabled value="">Select a product</option>
                    {products.map((product, index) => (
                        <option key ={index}  value={product.id}>{product.name}</option>
                    ))}
                </select>
                <button>Add Product</button>
            </div>
         
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                {renderProductRows()}
            </table>
        
            <div style={{marginTop: 50, display:'flex', gap: 25}}>
                <button onClick={() => route.back()}>Back</button>
                <button  onClick={updateOrder}>Save</button>
            </div>
        </div>
    )
	
}

export default OrdersPage
