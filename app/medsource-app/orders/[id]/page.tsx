'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

import ClientPageLayout from '@_components/layouts/ClientPageLayout'
import Card from '@_components/ui/Card'
import Badge from '@_components/ui/Badge'
import OrderStatusBadge, { OrderStatus as BadgeOrderStatus } from '@_components/common/OrderStatusBadge'
import Order from '@_classes/Order'
import { OrderStatus as DomainOrderStatus } from '@_classes/Enums'
import API from '@_services/api'
import Routes from '@_services/routes'
import { formatCurrency, formatDate } from '@_utils/table-helpers'

export default function OrderDetailsPage() {
	const params = useParams<{ id?: string }>()
	const router = useRouter()
	const orderIdParam = params?.id ?? ''

	const [order, setOrder] = useState<Order | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!orderIdParam) {
			router.back()
			return
		}

		const fetchOrder = async () => {
			try {
				setIsLoading(true)
				const { data } = await API.Orders.get<Order>(Number(orderIdParam))

				if (!data.payload) {
					toast.error(data.message || 'Unable to load order')
					router.push(Routes.Orders.location)
					return
				}

				setOrder(new Order(data.payload))
			} catch (error) {
				console.error(error)
				toast.error('Unable to load order')
				router.push(Routes.Orders.location)
			} finally {
				setIsLoading(false)
			}
		}

		void fetchOrder()
	}, [orderIdParam, router])

	const title = order ? `Order #${order.id ?? ''}` : 'Order Details'
	const orderDate = order?.createdAt ? formatDate(order.createdAt) : '-'

	const subtotal = useMemo(() => {
		if (!order?.products?.length) return 0
		return order.products.reduce((sum, item) => sum + (item.total ?? 0), 0)
	}, [order?.products])

	const outstandingBalance = useMemo(() => {
		if (!order) return 0
		return subtotal + (order.salesTax ?? 0) + (order.shipping ?? 0) - (order.discount ?? 0)
	}, [order, subtotal])

	const statusTimeline: { label: string; status: DomainOrderStatus; complete: boolean }[] = [
		{ label: 'Pending', status: DomainOrderStatus.Pending, complete: (order?.status ?? 0) >= DomainOrderStatus.Pending },
		{
			label: 'Processing',
			status: DomainOrderStatus.Processing,
			complete: (order?.status ?? 0) >= DomainOrderStatus.Processing,
		},
		{ label: 'Shipped', status: DomainOrderStatus.Shipped, complete: (order?.status ?? 0) >= DomainOrderStatus.Shipped },
		{
			label: 'Delivered',
			status: DomainOrderStatus.Delivered,
			complete: (order?.status ?? 0) >= DomainOrderStatus.Delivered,
		},
	]

	const badgeStatus = useMemo(() => {
		switch (order?.status) {
			case DomainOrderStatus.Pending:
				return BadgeOrderStatus.Pending
			case DomainOrderStatus.Processing:
				return BadgeOrderStatus.Processing
			case DomainOrderStatus.Shipped:
				return BadgeOrderStatus.Shipped
			case DomainOrderStatus.Delivered:
				return BadgeOrderStatus.Delivered
			case DomainOrderStatus.Cancelled:
				return BadgeOrderStatus.Cancelled
			default:
				return BadgeOrderStatus.Pending
		}
	}, [order?.status])

	return (
		<ClientPageLayout
			title={title}
			description="Review order line items, customer details, and fulfillment progress."
			maxWidth="full"
			loading={isLoading}
			actions={
				<a className="btn btn-ghost" href={Routes.Orders.location}>
					Back to Orders
				</a>
			}
		>
			{order && (
				<div className="space-y-8">
					<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
						<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<OrderStatusBadge status={badgeStatus} />
								<span className="text-sm text-base-content/60">Created {orderDate}</span>
							</div>

							<div className="mt-6 grid gap-6 md:grid-cols-2">
								<div>
									<h3 className="text-sm font-semibold uppercase text-base-content/60">Customer</h3>
									<p className="mt-2 text-base font-semibold text-base-content">
										{order.customer?.name || 'Unassigned customer'}
									</p>
									<p className="text-sm text-base-content/70">{order.customer?.email || 'No email provided'}</p>
									<p className="text-sm text-base-content/70">{order.customer?.phone || 'No phone provided'}</p>
								</div>
								<div>
									<h3 className="text-sm font-semibold uppercase text-base-content/60">Financial Summary</h3>
									<div className="mt-2 space-y-2 text-sm text-base-content/70">
										<div className="flex items-center justify-between">
											<span>Subtotal</span>
											<span className="font-semibold text-base-content">{formatCurrency(subtotal)}</span>
										</div>
										<div className="flex items-center justify-between">
											<span>Sales Tax</span>
											<span className="font-semibold text-base-content">{formatCurrency(order.salesTax ?? 0)}</span>
										</div>
										<div className="flex items-center justify-between">
											<span>Shipping</span>
											<span className="font-semibold text-base-content">{formatCurrency(order.shipping ?? 0)}</span>
										</div>
										{order.discount ? (
											<div className="flex items-center justify-between">
												<span>Discount</span>
												<span className="font-semibold text-error">-{formatCurrency(order.discount)}</span>
											</div>
										) : null}
										<div className="flex items-center justify-between border-t border-base-200 pt-2">
											<span className="text-base font-semibold text-base-content">Order Total</span>
											<span className="text-base font-semibold text-primary">{formatCurrency(outstandingBalance)}</span>
										</div>
									</div>
								</div>
							</div>
						</Card>

						<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
							<h3 className="text-sm font-semibold uppercase text-base-content/60">Fulfillment Progress</h3>
							<div className="mt-4 space-y-3">
								{statusTimeline.map((step) => (
									<div key={step.status} className="flex items-center gap-3">
										<div
											className={`h-3 w-3 rounded-full ${
												step.complete ? 'bg-primary' : 'bg-base-300'
											}`}
										/>
										<span className={`text-sm ${step.complete ? 'text-base-content' : 'text-base-content/60'}`}>
											{step.label}
										</span>
									</div>
								))}
							</div>

							{order.status === DomainOrderStatus.Cancelled && (
								<div className="mt-4 rounded-lg border border-error/40 bg-error/5 p-3 text-sm text-error">
									This order has been cancelled and will not progress further.
								</div>
							)}

							{order.notes && (
								<div className="mt-6 rounded-xl border border-base-200 bg-base-100 p-4">
									<h4 className="text-sm font-semibold uppercase text-base-content/60">Notes</h4>
									<p className="mt-2 text-sm text-base-content/70">{order.notes}</p>
								</div>
							)}
						</Card>
					</div>

					<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
						<h3 className="text-lg font-semibold text-base-content">Line Items</h3>
						{order.products?.length ? (
							<div className="mt-6 overflow-x-auto">
								<table className="table table-zebra">
									<thead>
										<tr className="text-base-content/70">
											<th className="font-semibold">Product</th>
											<th className="font-semibold text-right">Quantity</th>
											<th className="font-semibold text-right">Unit Price</th>
											<th className="font-semibold text-right">Line Total</th>
											<th className="font-semibold text-right">Tracking</th>
										</tr>
									</thead>
									<tbody>
										{order.products.map((item, index) => (
											<tr key={item.id ?? item.productId ?? index}>
												<td>
													<div className="flex flex-col">
														<span className="font-semibold text-base-content">
															{item.product?.name || 'Product unavailable'}
														</span>
														<span className="text-xs text-base-content/60">
															SKU: {item.product?.sku || item.productId || 'N/A'}
														</span>
													</div>
												</td>
												<td className="text-right text-base-content/80">{item.quantity ?? 0}</td>
												<td className="text-right text-base-content/80">{formatCurrency(item.sellPrice ?? 0)}</td>
												<td className="text-right font-semibold text-base-content">
													{formatCurrency(item.total ?? 0)}
												</td>
												<td className="text-right text-sm text-base-content/60">{item.trackingNumber || '—'}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="mt-6 text-sm text-base-content/70">No products are associated with this order.</p>
						)}
					</Card>

					{order.products?.some((item) => item.transitDetails?.locationDropoff) && (
						<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
							<h3 className="text-lg font-semibold text-base-content">Delivery Details</h3>
							<div className="mt-6 grid gap-4">
								{order.products.map((item, index) => {
									const dropoff = item.transitDetails?.locationDropoff
									if (!dropoff) return null

									return (
										<div key={item.id ?? index} className="rounded-xl border border-base-200 bg-base-100 p-4">
											<div className="flex justify-between text-sm text-base-content/60">
												<span>
													Shipment for{' '}
													<span className="font-semibold text-base-content">
														{item.product?.name || 'Product'}
													</span>
												</span>
												{item.transitDetails?.weight && (
													<span>Weight: {item.transitDetails.weight} lbs</span>
												)}
											</div>
											<p className="mt-2 text-sm text-base-content/70">
												{[dropoff.addressOne, dropoff.city, dropoff.state, dropoff.zipCode, dropoff.country]
													.filter(Boolean)
													.join(', ')}
											</p>
										</div>
									)
								})}
							</div>
						</Card>
					)}
				</div>
			)}
		</ClientPageLayout>
	)
}
