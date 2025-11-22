'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { notificationService } from '@_shared'

import Card from '@_components/ui/Card'
import { InternalPageHeader } from '../../_components'
import Badge from '@_components/ui/Badge'
import { DataGrid, type ColumnDef } from '@_components/tables'
import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import Order from '@_classes/Order'
import { OrderStatus } from '@_classes/Enums'
import { OrderStatusHelper } from '@_classes/Helpers'
import { logger } from '@_core'
import { API } from '@_shared'
import { Routes } from '@_features/navigation'
import { formatCurrency, formatDate } from '@_shared'

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
				notificationService.error(data.message || 'Unable to load order', {
					metadata: { orderId: orderIdParam },
					component: 'OrderDetailPage',
					action: 'fetchOrder',
				})
				router.push(Routes.Orders.location)
				return
				}

				setOrder(new Order(data.payload))
		} catch (error) {
			notificationService.error('Unable to load order', {
				metadata: { error, orderId: orderIdParam },
				component: 'OrderDetailPage',
				action: 'fetchOrder',
			})
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

	// Status timeline for order progress visualization
	// Uses OrderStatusHelper for DRY compliance - zero magic strings
	const statusTimeline: { label: string; status: OrderStatus; complete: boolean }[] = [
		{
			label: OrderStatusHelper.getDisplay(OrderStatus.Pending),
			status: OrderStatus.Pending,
			complete: (order?.status ?? 0) >= OrderStatus.Pending,
		},
		{
			label: OrderStatusHelper.getDisplay(OrderStatus.Processing),
			status: OrderStatus.Processing,
			complete: (order?.status ?? 0) >= OrderStatus.Processing,
		},
		{
			label: OrderStatusHelper.getDisplay(OrderStatus.Shipped),
			status: OrderStatus.Shipped,
			complete: (order?.status ?? 0) >= OrderStatus.Shipped,
		},
		{
			label: OrderStatusHelper.getDisplay(OrderStatus.Delivered),
			status: OrderStatus.Delivered,
			complete: (order?.status ?? 0) >= OrderStatus.Delivered,
		},
	]

	// No status mapping needed - use OrderStatus directly
	const badgeStatus = order?.status ?? OrderStatus.Pending

	// Column definitions for line items table
	const lineItemColumns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				accessorKey: 'product.name',
				header: 'Product',
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="font-semibold text-base-content">
							{row.original.product?.name || 'Product unavailable'}
						</span>
						<span className="text-xs text-base-content/60">
							SKU: {row.original.product?.sku || row.original.productId || 'N/A'}
						</span>
					</div>
				),
			},
			{
				accessorKey: 'quantity',
				header: 'Quantity',
				cell: ({ row }) => (
					<span className="text-base-content/80">{row.original.quantity ?? 0}</span>
				),
			},
			{
				accessorKey: 'sellPrice',
				header: 'Unit Price',
				cell: ({ row }) => (
					<span className="text-base-content/80">{formatCurrency(row.original.sellPrice ?? 0)}</span>
				),
			},
			{
				accessorKey: 'total',
				header: 'Line Total',
				cell: ({ row }) => (
					<span className="font-semibold text-base-content">
						{formatCurrency(row.original.total ?? 0)}
					</span>
				),
			},
			{
				accessorKey: 'trackingNumber',
				header: 'Tracking',
				cell: ({ row }) => (
					<span className="text-sm text-base-content/60">
						{row.original.trackingNumber || '—'}
					</span>
				),
			},
		],
		[]
	)

	return (
		<>
			<InternalPageHeader
				title={title}
				description="Review order line items, customer details, and fulfillment progress."
				loading={isLoading}
				actions={
					<a className="btn btn-ghost" href={Routes.Orders.location}>
						Back to Orders
					</a>
				}
			/>

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

							{order.status === OrderStatus.Cancelled && (
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
						<h3 className="text-lg font-semibold text-base-content mb-6">Line Items</h3>
						
						<DataGrid
							columns={lineItemColumns}
							data={order.products || []}
							ariaLabel="Order line items"
							enableSorting={true}
							enableFiltering={false}
							enablePagination={false}
							enablePageSize={false}
							emptyMessage="No products are associated with this order."
						/>
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
		</>
	)
}
