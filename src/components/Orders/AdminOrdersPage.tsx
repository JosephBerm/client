import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Product } from '@/classes/Product'
import { useRouter } from 'next/navigation'
import { TableColumn } from '@/interfaces/Table'
import Order, { OrderItem } from '@/classes/Order'

import API from '@/services/api'
import Table from '@/common/table'
import InputTextBox from '@/components/InputTextBox'
import InputNumber from '@/components/InputNumber'
import InputDropdown from '@/components/InputDropdown'
import Company from '@/src/classes/Company'
import Routes from '@/services/routes'

interface OrdersProps {
	order: Order
	products: Product[]
	customers: Company[]
}

const OrdersPage = ({ order, products, customers }: OrdersProps) => {
	const route = useRouter()

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [product, setProduct] = useState<Product | null>(null)
	const [currentOrder, setCurrentOrder] = useState<Order>(order)
	const [salesTaxRate, setSalesTaxRate] = useState<number>(6)

	const hasProductInList = useMemo(() => {
		if (!product) return false
		return currentOrder.products.some((item) => item.product?.id === product.id)
	}, [product, currentOrder.products])

	const updateOrder = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Orders.update(currentOrder)

			if (data.statusCode === 200) {
				route.push(`${Routes.InternalAppRoute}/orders`)
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleQuantityChange = (orderItem: OrderItem, quantity: number) => {
		setCurrentOrder((prev) => {
			const updatedProducts = prev.products.map((p) => {
				if (p.product?.id === orderItem.product?.id) {
					return { ...p, quantity }
				}
				return p
			})
			return { ...prev, products: updatedProducts }
		})
	}

	const handlePriceChange = (orderItem: OrderItem, price: number) => {
		setCurrentOrder((prev) => {
			const updatedProducts = prev.products.map((p) => {
				if (p.product?.id === orderItem.product?.id) {
					return { ...p, sellPrice: price }
				}
				return p
			})
			return { ...prev, products: updatedProducts }
		})
	}

	const handleBuyPriceChange = (orderItem: OrderItem, price: number) => {
		setCurrentOrder((prev) => {
			const updatedProducts = prev.products.map((p) => {
				if (p.product?.id === orderItem.product?.id) {
					return { ...p, buyPrice: price }
				}
				return p
			})
			return { ...prev, products: updatedProducts }
		})
	}

	const handleSelectProduct = (productId: number | string) => {
		const product = products.find((p) => p.id == (productId as string))
		if (product) setProduct(product)
	}

	const handleAddingProduct = () => {
		if (!product) return

		if (hasProductInList) {
			return
		}

		const productToAdd = new OrderItem()
		productToAdd.setProduct(product)
		productToAdd.quantity = 1

		setCurrentOrder((prevState) => ({
			...prevState,
			products: [...prevState.products, productToAdd],
		}))
	}

	const getSelectedProducts = (): Product[] => {
		return currentOrder.products
			.filter((product) => !!product.product)
			.map((orderItem) => orderItem.product as Product)
	}

	const handleProductDeletion = (productId: string) => {
		setCurrentOrder((current) => {
			const updatedProducts = current.products.filter((p) => p.product?.id !== productId)
			const total = updatedProducts.reduce((acc, item) => acc + item.sellPrice * item.quantity, 0)
			const salesTax = updatedProducts.reduce((acc, item) => acc + ((item.sellPrice * item.quantity) * (salesTaxRate / 100)), 0)

			return {
				...current,
				products: updatedProducts,
				total: total + salesTax - current.discount + current.shipping,
				salesTax,
			}
		})
	}

	const handleTaxesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrentOrder((prev) => {
			const salesTax = (parseInt(e.target.value) / 100) * prev.products.reduce((acc, item) => acc + (item.sellPrice * item.quantity), 0)
			return {
				...prev,
				salesTax,
			}
		})
	}

	const handleSelectCustomer = (customerId: number | string) => {
		const customer = customers.find((c) => c.id == (customerId as number))

		if (customer) {
			setCurrentOrder((prevState) => ({
				...prevState,
				customer: customer,
				customerId: customer.id,
			}))
		}
	}

	const handleChangeSalesTaxPercentage = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rate = parseInt(e.target.value)
		setSalesTaxRate(rate)
	}

	useEffect(() => {
		const total = currentOrder.products.reduce((acc, item) => acc + item.sellPrice * item.quantity, 0)
		const salesTax = parseFloat((total * (salesTaxRate / 100)).toFixed(2))
		const finalTotal = parseFloat((total + salesTax - currentOrder.discount + currentOrder.shipping).toFixed(2))

		setCurrentOrder(prev => ({
			...prev,
			total: finalTotal,
			salesTax,
		}))
	}, [currentOrder.products, salesTaxRate, currentOrder.discount, currentOrder.shipping])

	const columns: TableColumn<OrderItem>[] = [
		{
			key: 'product',
			label: 'Product Name',
			content: (orderItem) => <span>{orderItem.product?.name}</span>,
		},
		{
			key: 'quantity',
			label: 'Quantity',
			content: (orderItem) => (
				<InputNumber
					label=''
					value={orderItem.quantity.toString()}
					handleChange={(e) => handleQuantityChange(orderItem, parseInt(e.currentTarget.value))}
				/>
			),
		},
		{
			key: 'buyPrice',
			label: 'Buy Price',
			content: (orderItem) => (
				<InputNumber
					label=''
					value={orderItem.buyPrice.toString()}
					handleChange={(e) => handleBuyPriceChange(orderItem, parseInt(e.currentTarget.value))}
				/>
			),
		},
		{
			key: 'sellPrice',
			label: 'Sell Price',
			content: (orderItem) => (
				<InputNumber
					label=''
					value={orderItem.sellPrice.toString()}
					handleChange={(e) => handlePriceChange(orderItem, parseInt(e.currentTarget.value))}
				/>
			),
		},
		{
			key: 'delete',
			label: 'Delete',
			content: (orderItem) => (
				<button className='delete' onClick={() => handleProductDeletion(orderItem.product?.id!)}>Delete</button>
			),
		},
	]

	return (
		<div className='orders-page'>
			<h3 className='page-title'>Order Details</h3>

			<InputDropdown<Company>
				options={customers}
				display='name'
				label='Customer'
				value={currentOrder.customer?.id ?? ''}
				handleChange={handleSelectCustomer}
				placeholder='Select a Customer'
				customClass='primary'
			/>

			<Table<OrderItem>
				columns={columns}
				data={currentOrder.products}
				isSortable={false}
				isSearchable={false}
				isPaged={false}
			/>

			<div>
				<InputNumber 
					label='Sales Tax %' 
					value={salesTaxRate.toString()} 
					handleChange={handleChangeSalesTaxPercentage} 
				/>

				<InputNumber 
					label="Sales Tax" 
					value={currentOrder.salesTax.toString()} 
					handleChange={handleTaxesChange} 
				/>
			</div>

			<InputNumber 
				label='Shipping' 
				value={currentOrder.shipping.toString()} 
				handleChange={(e) => setCurrentOrder((prev) => ({ ...prev, shipping: parseInt(e.target.value) }))} 
			/>

			<InputNumber 
				label='Discount' 
				value={currentOrder.discount.toString()} 
				handleChange={(e) => setCurrentOrder((prev) => ({ ...prev, discount: parseInt(e.target.value) }))} 
			/>

			<InputNumber label='Total' value={currentOrder.total.toString()} disabled={true} />


			<div className='add-product-container'>
				<InputDropdown<Product>
					options={products}
					display='name'
					label='Add Product To Order'
					value={product?.id ?? ''}
					handleChange={handleSelectProduct}
					placeholder='Select a Product'
					customClass='primary'
					filterIfSelected={getSelectedProducts}
				/>
				<button
					disabled={!product || hasProductInList}
					onClick={() => handleAddingProduct()}
					className='responsive-icon'>
					<span>Add Product</span>
					<i className='fa-solid fa-plus' />
				</button>
			</div>

			<div className='buttons-container'>
				<button className='error' onClick={() => route.back()}>
					Back
				</button>
				<button onClick={updateOrder}>Save</button>
			</div>
		</div>
	)
}

export default OrdersPage
