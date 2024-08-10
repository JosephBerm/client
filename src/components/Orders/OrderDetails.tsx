import React, { useEffect, useState, useMemo } from 'react'
import { Product } from '@/classes/Product'
import { useRouter } from 'next/navigation'
import { TableColumn } from '@/interfaces/Table'
import Order, { OrderItem } from '@/classes/Order'
import { useAccountStore } from '@/src/stores/user'
import { AccountRole } from '@/classes/Enums'

import API from '@/services/api'
import Table from '@/common/table'
import InputTextBox from '@/components/InputTextBox'
import InputNumber from '@/components/InputNumber'
import InputDropdown from '@/components/InputDropdown'
import Company from '@/src/classes/Company'
import Routes from '@/services/routes'

import { SubmitOrderRequest } from '@/classes/RequestClasses'
import { toast } from 'react-toastify'
import { OrderStatus } from '@/src/classes/Enums'
import { OrderStatusName } from '@/classes/EnumsTranslations'
import Pill from '@/components/Pill'
import { OrderStatusVariants } from '@/classes/EnumsTranslations'
import { EnumToDropdownValues } from '@/services/utils'
import classNames from 'classnames'
import { GenericSearchFilter } from '@/src/classes/Base/GenericSearchFilter'
import { useParams } from 'next/navigation'

const OrderDetails = () => {
	const route = useRouter()
	const { id: orderId } = useParams()

	const User = useAccountStore((state) => state.User)
	const isAdmin = User.role == AccountRole.Admin
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [product, setProduct] = useState<Product | null>(null)
	const [currentOrder, setCurrentOrder] = useState<Order>(new Order())
	const [salesTaxRate, setSalesTaxRate] = useState<number>(6)
	const [productsList, setProducts] = useState<Product[]>([])
	const [customers, setCustomers] = useState<Company[]>([])

	const hasProductInList = useMemo(() => {
		if (!product) return false
		return currentOrder.products.some((item) => item.product?.id === product.id)
	}, [product, currentOrder.products])

	const updateOrder = async (order: Order | null = null, exitPage = true) => {
		try {
			setIsLoading(true)
			const { data } = await API.Orders.update(order ?? currentOrder)

			if (data.statusCode === 200 && exitPage) {
				route.push(`${Routes.InternalAppRoute}/orders`)
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleProductPropertyChange = (
		orderItem: OrderItem,
		key: 'quantity' | 'sellPrice' | 'buyPrice',
		value: number
	) => {
		setCurrentOrder((prev) => {
			const updatedProducts = prev.products.map((p) => {
				if (p.product?.id === orderItem.product?.id) {
					return Object.assign({}, p, { [key]: value })
				}
				return p
			})
			return Object.assign({}, prev, { products: updatedProducts })
		})
	}

	const handleSelectProduct = (productId: number | string) => {
		const product = productsList.find((p) => p.id == (productId as string))
		if (product) setProduct(product)
	}

	const handleAddingProduct = () => {
		if (!product || hasProductInList) return

		const productToAdd = new OrderItem()
		productToAdd.setProduct(product)
		productToAdd.quantity = 1

		setCurrentOrder((prevState) => {
			const updatedProducts = [...prevState.products, productToAdd]
			return Object.assign({}, prevState, { products: updatedProducts })
		})
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
			const salesTax = updatedProducts.reduce(
				(acc, item) => acc + item.sellPrice * item.quantity * (salesTaxRate / 100),
				0
			)
			const finalTotal = total + salesTax - current.discount + current.shipping

			return Object.assign({}, current, {
				products: updatedProducts,
				total: finalTotal,
				salesTax: salesTax,
			})
		})
	}

	const handleTaxesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const salesTax =
			(parseInt(e.target.value) / 100) *
			currentOrder.products.reduce((acc, item) => acc + item.sellPrice * item.quantity, 0)
		setCurrentOrder((prevState) => Object.assign({}, prevState, { salesTax }))
	}

	const handleSelectCustomer = (customerId: number | string) => {
		const id = Number(customerId)
		if (isNaN(id)) {
			console.error('Invalid customer ID')
			return
		}

		const customer = isAdmin ? customers?.find((c) => c.id === id) : User

		if (customer) {
			setCurrentOrder((prevState) => {
				return Object.assign({}, prevState, {
					customer: customer,
					customerId: customer.id,
				})
			})
		} else {
			console.warn('Customer not found')
		}
	}

	const handleOrderChange = (key: 'shipping' | 'discount') => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value)
		setCurrentOrder((prevState) => Object.assign({}, prevState, { [key]: value }))
	}

	const handleChangeSalesTaxPercentage = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rate = parseInt(e.target.value)
		setSalesTaxRate(rate)
	}

	const getOrder = async () => {
		if (orderId == 'create') return
		try {
			setIsLoading(true)
			const { data } = await API.Orders.get(parseInt(orderId as string))
			if (!data.payload) toast.error(`Order with id #${orderId} not found!`)
			console.log('data', data)
			return data.payload
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const fetchCustomers = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Customers.getAll<Company>()
			if (!data.payload) toast.error('Unable to retrieve the list of available customers...')

			setCustomers(data.payload?.map((customer) => new Company(customer)) ?? [])
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const getProducts = async () => {
		try {
			setIsLoading(true)
			const searchCriteria = new GenericSearchFilter()
			searchCriteria.pageSize = 1000
			const { data } = await API.Store.Products.search(searchCriteria)

			if (!data.payload) toast.error('Unable to retrieve the list of available products...')

			return data.payload
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			const [orderData, productsListResponse] = await Promise.all([
				getOrder(),
				getProducts(),
				isAdmin ? fetchCustomers() : Promise.resolve(),
			])

			setCurrentOrder(new Order(orderData ?? {}))
			setProducts(productsListResponse?.data?.map((x) => new Product(x)) ?? [])
		}

		fetchData()
	}, [isAdmin])

	useEffect(() => {
		const total = currentOrder.products.reduce((acc, item) => acc + item.sellPrice * item.quantity, 0)
		const salesTax = parseFloat((total * (salesTaxRate / 100)).toFixed(2))
		const finalTotal = parseFloat((total + salesTax - currentOrder.discount + currentOrder.shipping).toFixed(2))

		setCurrentOrder((prevState) =>
			Object.assign({}, prevState, {
				total: finalTotal,
				salesTax: salesTax,
			})
		)
	}, [currentOrder.products, salesTaxRate, currentOrder.discount, currentOrder.shipping])

	const columns: TableColumn<OrderItem>[] = [
		{
			name: 'product',
			label: 'Product Name',
			content: (orderItem) => <div className='product-name'>{orderItem.product?.name}</div>,
		},
		{
			key: 'quantity',
			label: 'Quantity',
			content: (orderItem) => (
				<InputNumber
					label=''
					value={orderItem.quantity.toString()}
					handleChange={(e) =>
						handleProductPropertyChange(orderItem, 'quantity', parseInt(e.currentTarget.value))
					}
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
					handleChange={(e) =>
						handleProductPropertyChange(orderItem, 'buyPrice', parseInt(e.currentTarget.value))
					}
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
					handleChange={(e) =>
						handleProductPropertyChange(orderItem, 'sellPrice', parseInt(e.currentTarget.value))
					}
				/>
			),
		},
	]

	const handleSubmitQuote = async () => {
		setIsLoading(true)

		try {
			const updatedOrder = await setOrderStatus(OrderStatus.WaitingCustomerApproval) // Wait for the state update

			await updateOrder(null, false) // Call updateOrder with the updated state
			const request = new SubmitOrderRequest({
				quoteId: currentOrder.id,
				emails: [currentOrder.customer?.email ?? ''],
			})
			const { data } = await API.Orders.submitQuote(request)

			if (data.statusCode === 200) {
				toast.success('Quote submitted successfully')
			} else {
				toast.error('Failed to submit quote')
			}
		} catch (err) {
			console.error(err)
			toast.error('Failed to submit quote')
		} finally {
			setIsLoading(false)
		}
	}

	const handleSubmitInvoice = async () => {
		setIsLoading(true)

		try {
			await updateOrder(null, false) // Call updateOrder with the updated state
			const request = new SubmitOrderRequest({
				quoteId: currentOrder.id,
				emails: [currentOrder.customer?.email ?? ''],
			})
			const { data } = await API.Orders.submitInvoice(request)

			if (data.statusCode === 200) {
				toast.success('Invoice submitted successfully')
			} else {
				toast.error('Failed to submit invoice')
			}
		} catch (err) {
			console.error(err)
			toast.error('Failed to submit invoice')
		} finally {
			setIsLoading(false)
		}
	}

	const setOrderStatus = async (status: OrderStatus, autoSave = false) => {
		// Create a promise to wait for the state update
		const stateUpdatePromise = new Promise<Order>((resolve) => {
			setCurrentOrder((prevState) => {
				const updatedOrder = Object.assign({}, prevState, { status })

				// Resolve the promise with the updated order after the state update
				setTimeout(() => resolve(updatedOrder), 0)
				return updatedOrder
			})
		})

		// Await the completion of the state update
		const updatedOrder = await stateUpdatePromise

		if (autoSave) {
			// Optionally pass the updated order to updateOrder
			await updateOrder(updatedOrder, false)
		}

		// Return the updated order
		return updatedOrder
	}

	// Usage Example
	const filteredOrderStatusList = [
		OrderStatus.WaitingCustomerApproval,
		OrderStatus.Placed,
		OrderStatus.Processing,
		OrderStatus.Shipped,
		OrderStatus.Delivered,
	].map((status) => ({
		id: status,
		name: OrderStatus[status],
	}))

	const handleStatusChange = (value: string | number) => {
		const filtered = filteredOrderStatusList.find((status) => status.id == value)
		if (!filtered) return
		setOrderStatus(filtered.id, true)
	}
	type Variant = 'info' | 'success' | 'error' | 'warning'
	const isOrderPlaced = currentOrder.status >= OrderStatus.Placed
	const deleteColumn: TableColumn<OrderItem> = {
		key: 'delete',
		label: '',
		content: (orderItem) => (
			<button className='delete aligned-to-center' onClick={() => handleProductDeletion(orderItem.product?.id!)}>
				Remove Product
			</button>
		),
	}

	if (!isOrderPlaced) columns.push(deleteColumn)
	else columns.filter((column) => column.key !== deleteColumn.key)

	console.log('currentOrder', currentOrder)
	return (
		<div className='OrderDetails'>
			<section className='general'>
				<div className='order-title'>
					<h3 className='page-title'>Order #{currentOrder.id}</h3>
					<Pill
						text={OrderStatusName[currentOrder.status]}
						variant={OrderStatusVariants[currentOrder.status] as Variant}
					/>
				</div>
				{isAdmin && (
					<InputDropdown<Company>
						options={customers}
						display='name'
						label='Customer'
						value={currentOrder.customerId ?? ''}
						handleChange={handleSelectCustomer}
						placeholder='Select a Customer'
						customClass='customer-selector'
					/>
				)}

				<fieldset className='header-options' disabled={!currentOrder.customerId}>
					{currentOrder.status >= OrderStatus.Placed && (
						<InputDropdown
							options={filteredOrderStatusList}
							display='name'
							label='Order Status'
							value={currentOrder.status}
							handleChange={handleStatusChange}
							placeholder='Change Order Status'
						/>
					)}
					<div className='button-container'>
						{currentOrder.status <= OrderStatus.WaitingCustomerApproval && (
							<button onClick={handleSubmitQuote}>
								{currentOrder.status === OrderStatus.WaitingCustomerApproval
									? 'Re-Submit Quote to Customer'
									: 'Submit Quote to Customer'}
							</button>
						)}

						{currentOrder.status == OrderStatus.Placed && (
							<button onClick={handleSubmitInvoice}>Submit Invoice to customer</button>
							// <button onClick={handleSubmitInvoice}>Generate Invoice</button>
						)}
						{currentOrder.status >= OrderStatus.Placed && (
							<button onClick={handleSubmitInvoice}>Submit Invoice to customer</button>
							// <button onClick={handleSubmitInvoice}>Generate Invoice</button>
						)}
						{currentOrder.status != OrderStatus.Cancelled && (
							<button className='delete' onClick={() => setOrderStatus(OrderStatus.Cancelled, true)}>
								Cancel Order
							</button>
						)}
					</div>
				</fieldset>
			</section>
			<section className='product-details'>
				<span className='section-title'>Product Details</span>
				<fieldset disabled={isOrderPlaced}>
					<Table<OrderItem>
						columns={columns}
						data={currentOrder.products}
						isSortable={false}
						isSearchable={false}
						isPaged={false}
					/>
				</fieldset>

				<div className='add-product-container'>
					<InputDropdown<Product>
						options={productsList}
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
						onClick={handleAddingProduct}
						className='responsive-icon'>
						<span>Add Product</span>
						<i className='fa-solid fa-plus' />
					</button>
				</div>
			</section>
			<section className='purchase-figures'>
				<InputNumber
					disabled={!isAdmin}
					label='Sales Tax %'
					value={salesTaxRate.toString()}
					handleChange={handleChangeSalesTaxPercentage}
				/>

				<InputNumber
					disabled={!isAdmin}
					label='Sales Tax'
					value={currentOrder.salesTax.toString()}
					handleChange={handleTaxesChange}
				/>

				<InputNumber
					disabled={!isAdmin}
					label='Shipping'
					value={currentOrder.shipping.toString()}
					handleChange={handleOrderChange('shipping')}
				/>

				<InputNumber
					disabled={!isAdmin}
					label='Discount'
					value={currentOrder.discount.toString()}
					handleChange={handleOrderChange('discount')}
				/>

				<InputNumber readOnly={!isAdmin} label='Total' value={currentOrder.total.toString()} />
			</section>

			<div className='buttons-container'>
				<button className='error' onClick={() => route.back()}>
					Back
				</button>
				<button onClick={() => updateOrder()}>Save</button>
			</div>
		</div>
	)
}

export default OrderDetails
