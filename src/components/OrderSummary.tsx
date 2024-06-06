import React from 'react'
import Order, { OrderItem } from '@/classes/Order'
import { format } from 'date-fns'

type OrderSummaryProps = {
	order: Order
}
function OrderSummary({ order }: OrderSummaryProps) {
	const getTrackingDetails = (orderItem: OrderItem) => {
		return (
			<div className='transit-details' key={orderItem.id}>
				<div className='origin'>{orderItem.transitDetails.locationOrigin}</div>
				<div className='tracking-line' />
				<div className='dropoff'>{orderItem.transitDetails.locationDropoff}</div>

				<div className='product-info'>
					<div className='product-name'>
						<span>{orderItem.product?.name}</span>
					</div>

					<div className='date-requested'>
						<span className='detail'>Start Time & Date</span>
						{format(new Date(order.createdAt), 'MM/dd/yyyy')}
					</div>
				</div>

				<div className='product-dimensions'>
					<div className='detail'>
						<span className='title'>Weight</span>
						<span>{orderItem.transitDetails.weight}</span>
					</div>
					<div className='detail'>
						<span className='title'>Dimensions</span>
						<span>{orderItem.transitDetails.dimensions?.toString()}</span>
					</div>
					<div className='detail'>
						<span className='title'>Quantity</span>
						<span>{orderItem.quantity}</span>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='OrderSummary'>
			<h3 className='order-number'>Order # {order.id}</h3>
			{order.products.map((product) => getTrackingDetails(product))}
		</div>
	)
}

export default OrderSummary
