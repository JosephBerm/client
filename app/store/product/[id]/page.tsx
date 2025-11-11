import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import PageLayout from '@_components/layouts/PageLayout'
import Card from '@_components/ui/Card'
import Badge from '@_components/ui/Badge'
import { Product } from '@_classes/Product'
import API from '@_services/api'
import Routes from '@_services/routes'

interface ProductPageParams {
	params: {
		id: string
	}
}

const imageBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || ''

const formatCurrency = (value: number) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2,
	}).format(Number.isFinite(value) ? value : 0)

export default async function ProductDetailPage({ params }: ProductPageParams) {
	const productResponse = await API.Store.Products.get(params.id)
	const productPayload = productResponse.data.payload

	if (!productPayload) {
		return redirect(Routes.Store.location)
	}

	const product = new Product(productPayload)

	const productImageUrl =
		product.hasImage() && product.files.length > 0
			? `${imageBaseUrl?.replace(/\/api$/, '')}/products/image?productId=${product.id}&image=${
					product.files[0]?.name ?? ''
			  }`
			: null

	return (
		<PageLayout
			title={product.name || 'Product Details'}
			description="Explore specifications, pricing, and availability for this MedSource Pro catalog item."
			maxWidth="xl"
		>
			<div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
				<Card className="border border-base-300 bg-base-100 shadow-sm">
					<div className="flex flex-col gap-6 md:flex-row">
						<div className="flex w-full items-center justify-center md:w-1/2">
							<div className="relative aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-base-200 bg-base-200/60">
								{productImageUrl ? (
									<Image
										src={productImageUrl}
										alt={product.name || 'Product image'}
										fill
										className="object-cover"
										sizes="(min-width: 1024px) 400px, 60vw"
										priority
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center text-base-content/40">
										<span className="text-sm">Image coming soon</span>
									</div>
								)}
							</div>
						</div>

						<div className="flex w-full flex-col justify-between md:w-1/2">
							<div className="space-y-4">
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="primary" size="sm">
										SKU: {product.sku || 'N/A'}
									</Badge>
									{product.manufacturer && (
										<Badge variant="secondary" size="sm">
											{product.manufacturer}
										</Badge>
									)}
								</div>

								<p className="text-3xl font-semibold text-primary">{formatCurrency(product.price)}</p>

								<p className="text-sm text-base-content/70">
									{product.description || 'Detailed product description will be provided by MedSource Pro.'}
								</p>

								<div className="flex flex-wrap gap-2">
									{product.categories.length > 0
										? product.categories.map((category) => (
												<Badge key={category.id} variant="accent" size="sm" outline>
													{category.name}
												</Badge>
										  ))
										: product.category && (
												<Badge variant="accent" size="sm" outline>
													{product.category}
												</Badge>
										  )}
								</div>
							</div>

							<div className="mt-6 flex flex-col gap-3 sm:flex-row">
								<Link
									href={`${Routes.Contact.location}?product=${product.id}`}
									className="btn btn-primary w-full sm:flex-1"
								>
									Request Pricing
								</Link>
								<Link href={Routes.Store.location} className="btn btn-ghost w-full sm:flex-1">
									Back to Catalog
								</Link>
							</div>

							<div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-base-200 bg-base-100 p-4 text-sm text-base-content/70">
								<div>
									<p className="text-xs uppercase text-base-content/50">Stock</p>
									<p className="text-base font-semibold text-base-content">{product.stock ?? 0}</p>
								</div>
								<div>
									<p className="text-xs uppercase text-base-content/50">Product ID</p>
									<p className="text-base font-semibold text-base-content">{product.id}</p>
								</div>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</PageLayout>
	)
}
