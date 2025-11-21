'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { Mail, Phone, Building2, MapPin, PackageSearch } from 'lucide-react'

import Card from '@_components/ui/Card'
import { InternalPageHeader } from '../../_components'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Quote from '@_classes/Quote'
import { QuoteStatus } from '@_classes/Enums'
import { logger } from '@_core'
import { API } from '@_shared'
import { Routes } from '@_features/navigation'

const STATUS_CONFIG: Record<
	QuoteStatus,
	{
		label: string
		variant: 'warning' | 'info'
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
}

export default function QuoteDetailsPage() {
	const params = useParams<{ id?: string }>()
	const router = useRouter()
	const quoteId = params?.id ?? ''

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
					toast.error(data.message || 'Unable to load quote')
					router.back()
					return
				}

				setQuote(new Quote(data.payload))
			} catch (error) {
				logger.error('Failed to load quote', {
					error,
					quoteId,
					component: 'QuoteDetailPage',
				})
				toast.error('Unable to load quote')
				router.back()
			} finally {
				setIsLoading(false)
			}
		}

		void fetchQuote()
	}, [quoteId, router])

	const handleCreateOrder = async () => {
		if (!quoteId) return

		try {
			setIsConverting(true)
			const { data } = await API.Orders.createFromQuote<{ id: string }>(quoteId)

			if (!data.payload) {
				toast.error(data.message || 'Failed to create order from quote')
				return
			}

			toast.success('Order created successfully')
			router.push(`${Routes.Orders.location}/${data.payload.id}`)
		} catch (error) {
			logger.error('Failed to create order from quote', {
				error,
				quoteId,
				component: 'QuoteDetailPage',
			})
			toast.error('Failed to create order from quote')
		} finally {
			setIsConverting(false)
		}
	}

	const contactName = useMemo(() => {
		if (!quote?.name) return 'Quote contact'
		const name = quote.name as any
		return [name.first, name.middle, name.last].filter(Boolean).join(' ') || 'Quote contact'
	}, [quote?.name])

	const createdDate = quote?.createdAt ? new Date(quote.createdAt as any) : null
	const formattedCreatedDate =
		createdDate && !isNaN(createdDate.getTime()) ? format(createdDate, 'PPP') : 'Not available'

	const statusConfig = quote ? STATUS_CONFIG[quote.status] ?? STATUS_CONFIG[QuoteStatus.Unread] : null

	const address = quote?.transitDetails
	const formattedAddress = address
		? [address.addressOne, address.city, address.state, address.zipCode, address.country]
				.filter(Boolean)
				.join(', ')
		: 'No address provided'

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
						<div className="flex items-center gap-3">
							<PackageSearch className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-semibold text-base-content">Requested Products</h3>
						</div>

						{quote.products?.length ? (
							<div className="mt-6 overflow-x-auto">
								<table className="table table-zebra">
									<thead>
										<tr className="text-base-content/70">
											<th className="font-semibold">Product</th>
											<th className="font-semibold">SKU</th>
											<th className="font-semibold text-right">Quantity</th>
										</tr>
									</thead>
									<tbody>
										{quote.products.map((item, index) => {
											const product = item.product as any
											return (
												<tr key={product?.id ?? item.productId ?? index}>
													<td>{product?.name || 'Product pending'}</td>
													<td>{product?.sku || item.productId || '—'}</td>
													<td className="text-right font-semibold">{item.quantity ?? 0}</td>
												</tr>
											)
										})}
									</tbody>
								</table>
							</div>
						) : (
							<p className="mt-6 text-sm text-base-content/70">No products were included in this quote request.</p>
						)}
					</Card>
				</div>
			)}
		</>
	)
}
