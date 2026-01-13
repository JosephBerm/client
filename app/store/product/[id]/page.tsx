import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { cacheTag, cacheLife } from 'next/cache'

import { Routes } from '@_features/navigation'

import { serializeProduct } from '@_lib/serializers/productSerializer'

import { API } from '@_shared'

import { Product } from '@_classes/Product'

import PageLayout from '@_components/layouts/PageLayout'
import {
	ProductDescriptionSection,
	ProductDocumentsSection,
	ProductHeaderInfo,
	ProductPricingWrapper,
	ProductTrustSignals,
	ProductSpecifications,
	ProductHelpSection,
	ProductImageGallery,
	RelatedProducts,
	filterNonImageDocuments,
	buildProductBreadcrumbs,
} from '@_components/store'
import Breadcrumb from '@_components/ui/Breadcrumb'



interface ProductPageParams {
	params: Promise<{
		id: string
	}>
}

/**
 * Product Detail Page
 *
 * Server Component with Cache Components optimization (Next.js 16).
 *
 * **Caching Strategy:**
 * - Uses `use cache` directive for prerendering into static shell
 * - Tagged with `product-{id}` for granular cache invalidation
 * - Cache lifetime: 'hours' (products don't change frequently)
 * - Related products wrapped in Suspense (dynamic content)
 *
 * **Benefits:**
 * - Faster TTFB for frequently accessed products
 * - Reduced API calls (cached responses)
 * - Static HTML shell served instantly
 * - Product updates trigger revalidation via `revalidateTag('product-{id}')`
 *
 * **Revalidation:**
 * When product data changes, call from Server Action:
 * ```ts
 * import { revalidateTag } from 'next/cache'
 * revalidateTag(`product-${productId}`)
 * ```
 *
 * @see https://nextjs.org/docs/app/getting-started/cache-components
 */
export default async function ProductDetailPage({ params }: ProductPageParams) {
	'use cache'

	const { id } = await params

	// Tag for granular cache invalidation
	// Usage: revalidateTag(`product-${id}`) when product data changes
	cacheTag(`product-${id}`, 'products')

	// Products don't change frequently - cache for hours
	// Profile options: 'seconds', 'minutes', 'hours', 'days', 'weeks', 'max'
	cacheLife('hours')

	// Use public cacheable method - does NOT access cookies()
	// Required for 'use cache' compatibility
	const productResponse = await API.Store.Products.getPublicCacheable(id)
	const productPayload = productResponse.data.payload

	if (!productPayload) {
		return redirect(Routes.Store.location)
	}

	const product = new Product(productPayload)
	const serializedProduct = serializeProduct(product)

	// Build breadcrumb trail (DRY: uses Routes constants, no magic strings)
	const breadcrumbItems = buildProductBreadcrumbs(product)

	// Filter for non-image documents (PDFs, Specs, etc.)
	const documents = filterNonImageDocuments(serializedProduct.files)

	return (
		<PageLayout
			maxWidth="xl"
		>
			<div className="pb-24 pt-6 md:pt-10">
				{/* Breadcrumb Navigation */}
				<Breadcrumb items={breadcrumbItems} className="animate-fade-in mb-8" />

				<div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
					{/* Left Column: Gallery & Content */}
					<div className="flex flex-col gap-12">
						{/* Image Gallery - Clean, No Borders */}
						<div className="animate-elegant-reveal overflow-hidden rounded-3xl bg-base-100 ring-1 ring-base-200/50">
							<ProductImageGallery
								product={serializedProduct}
								priority={true}
								showThumbnails={true}
								className="w-full"
							/>
						</div>

						{/* Product Description - Enhanced Typography */}
						<ProductDescriptionSection description={product.description} />

						{/* Documents & Resources Section */}
						<ProductDocumentsSection documents={documents} />
					</div>

					{/* Right Column: Product Info & Sticky Cart */}
					<div className="relative">
						<div className="sticky top-28 flex flex-col gap-8">
							{/* Header Info - Clean & Spacious */}
							<ProductHeaderInfo product={product} />

							{/* Pricing Card - Customer-aware (shows contract pricing for authenticated users) */}
							<ProductPricingWrapper product={product} />

							{/* Trust Signals - Inline & Subtle */}
							<ProductTrustSignals />

							{/* Specs - Minimal Table */}
							<ProductSpecifications product={product} />

							{/* Help Section */}
							<ProductHelpSection />
						</div>
					</div>
				</div>
			</div>

			{/* Related Products Section - Wrapped in Suspense for dynamic loading */}
			<Suspense fallback={
				<div className="py-12">
					<div className="animate-pulse space-y-4">
						<div className="h-8 w-48 bg-base-300 rounded" />
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="h-64 bg-base-300 rounded-2xl" />
							))}
						</div>
					</div>
				</div>
			}>
				<RelatedProducts
					currentProductId={product.id}
					categoryName={product.categories.length > 0 ? product.categories[0].name : product.category}
				/>
			</Suspense>
		</PageLayout>
	)
}
