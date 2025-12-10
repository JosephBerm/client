import { redirect } from 'next/navigation'

import { Routes } from '@_features/navigation'

import { serializeProduct } from '@_lib/serializers/productSerializer'

import { API } from '@_shared'

import { Product } from '@_classes/Product'

import PageLayout from '@_components/layouts/PageLayout'
import {
	ProductDescriptionSection,
	ProductDocumentsSection,
	ProductHeaderInfo,
	ProductPricingCard,
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

export default async function ProductDetailPage({ params }: ProductPageParams) {
	const { id } = await params
	
	const productResponse = await API.Store.Products.get(id)
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

							{/* Pricing Card - Modern & Floating */}
							<ProductPricingCard product={product} />

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

			{/* Related Products Section */}
			<RelatedProducts 
				currentProductId={product.id} 
				categoryName={product.categories.length > 0 ? product.categories[0].name : product.category} 
			/>
		</PageLayout>
	)
}
