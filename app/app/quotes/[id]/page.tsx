'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Mail, Phone, Building2, MapPin, PackageSearch } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { formatDate } from '@_lib/dates'

import { notificationService, useRouteParam , API } from '@_shared'

import { QuoteStatus } from '@_classes/Enums'
import Quote from '@_classes/Quote'

import { DataGrid, type ColumnDef } from '@_components/tables'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../../_components'





const STATUS_CONFIG: Record<
	QuoteStatus,
	{
		label: string
		variant: 'warning' | 'info' | 'success' | 'error'
		description: string
	}
> = {
	[QuoteStatus.Unread]: {
		label: 'Unread',
		variant: 'warning',
		description: 'Awaiting review',
	},
	[QuoteStatus.Read]: {
		label: 'Reviewed',
		variant: 'info',
		description: 'Reviewed by staff',
	},
	[QuoteStatus.Approved]: {
		label: 'Approved',
		variant: 'success',
		description: 'Quote approved and sent',
	},
	[QuoteStatus.Converted]: {
		label: 'Converted',
		variant: 'success',
		description: 'Converted to order',
	},
	[QuoteStatus.Rejected]: {
		label: 'Rejected',
		variant: 'error',
		description: 'Quote declined',
	},
	[QuoteStatus.Expired]: {
		label: 'Expired',
		variant: 'warning',
		description: 'Quote validity expired',
	},
}

export default function QuoteDetailsPage() {
	const router = useRouter()
	const quoteId = useRouteParam('id')

	const [quote, setQuote] = useState<Quote | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isConverting, setIsConverting] = useState(false)

	useEffect(() => {
		if (!quoteId) {
			router.back()
			return
		}

		const fetchQuote = async () => {
			try {
				setIsLoading(true)
				const { data } = await API.Quotes.get<Quote>(quoteId)

			if (!data.payload) {
				notificationService.error(data.message || 'Unable to load quote', {
					metadata: { quoteId },
					component: 'QuoteDetailPage',
					action: 'fetchQuote',
				})
				router.back()
				return
				}

				setQuote(new Quote(data.payload))
		} catch (error) {
			notificationService.error('Unable to load quote', {
				metadata: { error, quoteId },
				component: 'QuoteDetailPage',
				action: 'fetchQuote',
			})
			router.back()
			} finally {
				setIsLoading(false)
			}
		}

		void fetchQuote()
	}, [quoteId, router])

	// Async create order handler
	const handleCreateOrderAsync = async () => {
		if (!quoteId) {return}

		try {
			setIsConverting(true)
			const { data } = await API.Orders.createFromQuote<{ id: string }>(quoteId)

		if (!data.payload) {
			notificationService.error(data.message || 'Failed to create order from quote', {
				metadata: { quoteId },
				component: 'QuoteDetailPage',
				action: 'convertToOrder',
			})
			return
		}

		notificationService.success('Order created successfully', {
			metadata: { quoteId, orderId: data.payload.id },
			component: 'QuoteDetailPage',
			action: 'convertToOrder',
		})
		router.push(Routes.Orders.detail(data.payload.id))
	} catch (error) {
		notificationService.error('Failed to create order from quote', {
			metadata: { error, quoteId },
			component: 'QuoteDetailPage',
			action: 'convertToOrder',
		})
		} finally {
			setIsConverting(false)
		}
	}

	/**
	 * Wrapper for create order to handle promise in onClick handler.
	 * FAANG Pattern: Non-async wrapper for async event handlers.
	 */
	const handleCreateOrder = () => {
		void handleCreateOrderAsync().catch((error) => {
			// Error already handled in handleCreateOrderAsync, but catch any unhandled rejections
			logger.error('Unhandled create order error', {
				error,
				quoteId,
				component: 'QuoteDetailPage',
				action: 'handleCreateOrder',
			})
		})
	}

	// Contact name (React Compiler auto-memoizes)
	const contactName = (() => {
		if (!quote?.name) return 'Quote contact'
		const name = quote.name as any
		return [name.first, name.middle, name.last].filter(Boolean).join(' ') || 'Quote contact'
	})()

	// Created date is already parsed in Quote class constructor
	const formattedCreatedDate = formatDate(quote?.createdAt, 'long')

	const statusConfig = quote ? STATUS_CONFIG[quote.status] ?? STATUS_CONFIG[QuoteStatus.Unread] : null

	const address = quote?.transitDetails
	const formattedAddress = address
		? [address.addressOne, address.city, address.state, address.zipCode, address.country]
				.filter(Boolean)
				.join(', ')
		: 'No address provided'

	// Column definitions for products table (React Compiler auto-memoizes)
	const productColumns: ColumnDef<any>[] = [
		{
			accessorKey: 'product.name',
			header: 'Product',
			cell: ({ row }) => {
				const {product} = row.original
				return product?.name || 'Product pending'
			},
		},
		{
			accessorKey: 'product.sku',
			header: 'SKU',
			cell: ({ row }) => {
				const {product} = row.original
				return product?.sku || row.original.productId || '—'
			},
		},
		{
			accessorKey: 'quantity',
			header: 'Quantity',
			cell: ({ row }) => (
				<span className="font-semibold">{row.original.quantity ?? 0}</span>
			),
		},
	]

	return (
		<>
			<InternalPageHeader
				title={quote ? `Quote ${quote.id}` : 'Quote Details'}
				description="Review quote request details and convert to an order when ready."
				loading={isLoading}
				actions={
					<Button variant="ghost" onClick={() => router.back()}>
						Back
					</Button>
				}
			/>

			{quote && (
				<div className="space-y-8">
					<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
						<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
							<div className="flex flex-wrap items-center gap-3">
								{statusConfig && (
									<Badge variant={statusConfig.variant} size="sm">
										{statusConfig.label}
									</Badge>
								)}
								<span className="text-xs uppercase tracking-wide text-base-content/60">
									Requested {formattedCreatedDate}
								</span>
							</div>

							<h2 className="mt-4 text-2xl font-semibold text-base-content">{contactName}</h2>
							<p className="mt-2 text-sm text-base-content/70">{quote.description || 'No description provided.'}</p>

							<div className="mt-6 grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-base-content/80">
										<Mail className="h-4 w-4" />
										<a href={`mailto:${quote.emailAddress}`} className="link link-primary">
											{quote.emailAddress || 'No email provided'}
										</a>
									</div>
									<div className="flex items-center gap-2 text-base-content/80">
										<Phone className="h-4 w-4" />
										<a href={`tel:${quote.phoneNumber}`} className="link link-primary">
											{quote.phoneNumber || 'No phone provided'}
										</a>
									</div>
									<div className="flex items-center gap-2 text-base-content/80">
										<Building2 className="h-4 w-4" />
										<span>{quote.companyName || 'No company specified'}</span>
									</div>
									<div className="flex items-start gap-2 text-base-content/80">
										<MapPin className="mt-1 h-4 w-4 shrink-0" />
										<span>{formattedAddress}</span>
									</div>
								</div>

								{statusConfig && (
									<div className="rounded-xl border border-base-200 bg-base-100 p-4">
										<h3 className="text-sm font-semibold uppercase text-base-content/60">Status</h3>
										<p className="mt-2 text-lg font-semibold text-base-content">{statusConfig.label}</p>
										<p className="text-sm text-base-content/70">{statusConfig.description}</p>
									</div>
								)}
							</div>
						</Card>

						<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
							<h3 className="text-lg font-semibold text-base-content">Actions</h3>
							<p className="mt-2 text-sm text-base-content/70">
								Convert this quote to a new order. You will be redirected to the order detail page once the order
								is created.
							</p>
							<div className="mt-6 flex flex-col gap-3">
								<Button
									variant="primary"
									loading={isConverting}
									disabled={isConverting}
									onClick={handleCreateOrder}
								>
									Convert to Order
								</Button>
								<Button variant="ghost" onClick={() => router.push(Routes.Quotes.location)}>
									Back to Quotes
								</Button>
							</div>
						</Card>
					</div>

					<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
						<div className="flex items-center gap-3 mb-6">
							<PackageSearch className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-semibold text-base-content">Requested Products</h3>
						</div>

						<DataGrid
							columns={productColumns}
							data={quote.products || []}
							ariaLabel="Quote requested products"
							enableSorting={true}
							enableFiltering={false}
							enablePagination={false}
							enablePageSize={false}
							emptyMessage="No products were included in this quote request."
						/>
					</Card>
				</div>
			)}
		</>
	)
}
