import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
	ArrowLeft, 
	ShieldCheck, 
	Truck, 
	Package, 
	Info, 
	FileText, 
	Download, 
	CheckCircle2,
	Mail
} from 'lucide-react'

import PageLayout from '@_components/layouts/PageLayout'
import Badge from '@_components/ui/Badge'
import Breadcrumb, { type BreadcrumbItem } from '@_components/ui/Breadcrumb'
import ProductImageGallery from '@_components/store/ProductImageGallery'
import RelatedProducts from '@_components/store/RelatedProducts'
import { Product } from '@_classes/Product'
import { serializeProduct } from '@_lib/serializers/productSerializer'
import { API } from '@_shared'
import { Routes } from '@_features/navigation'

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

	// Build breadcrumb trail (simple array for public pages)
	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: 'Store', href: Routes.Store.location },
		...(product.category ? [{ label: product.category, href: Routes.Store.location }] : []),
		{ label: product.name, href: `/store/product/${product.id}`, isCurrent: true },
	]

	// Filter for non-image documents (PDFs, Specs, etc.)
	const documents = serializedProduct.files.filter(file => {
		if (!file.name) return false
		const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || 
						file.contentType?.startsWith('image/')
		return !isImage
	})

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
						<div 
							className="animate-elegant-reveal space-y-8"
							style={{ animationDelay: '150ms' }}
						>
							<div className="flex items-center gap-4 border-b border-base-200 pb-4">
								<h2 className="text-2xl font-semibold tracking-tight text-base-content">
									About this item
								</h2>
							</div>
							<div 
								className="prose prose-lg prose-zinc max-w-none text-base-content/80 prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline pl-1"
								dangerouslySetInnerHTML={{ 
									__html: product.description || '<p class="italic text-base-content/60">No detailed description available for this product.</p>' 
								}} 
							/>
						</div>

						{/* Documents & Resources Section */}
						{documents.length > 0 && (
							<div 
								className="animate-elegant-reveal space-y-6"
								style={{ animationDelay: '300ms' }}
							>
								<div className="border-b border-base-200 pb-4">
									<h2 className="text-xl font-semibold tracking-tight text-base-content">
										Technical Resources
									</h2>
								</div>
								<div className="grid gap-4 sm:grid-cols-2">
									{documents.map((doc, index) => (
										<a 
											key={index}
											href={`/api/files/${doc.name}`}
											target="_blank"
											rel="noopener noreferrer"
											className="group relative flex items-center gap-4 rounded-2xl border border-base-200 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
										>
											<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
												<FileText className="h-6 w-6" />
											</div>
											<div className="flex flex-col overflow-hidden">
												<span className="truncate font-medium text-base-content group-hover:text-primary transition-colors">
													{doc.name}
												</span>
												<span className="flex items-center text-xs text-base-content/50">
													<Download className="mr-1.5 h-3 w-3" />
													Download PDF
												</span>
											</div>
										</a>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Right Column: Product Info & Sticky Cart */}
					<div className="relative">
						<div className="sticky top-28 flex flex-col gap-8">
							{/* Header Info - Clean & Spacious */}
							<div className="animate-elegant-reveal space-y-5" style={{ animationDelay: '100ms' }}>
								{product.manufacturer && (
									<p className="text-sm font-bold uppercase tracking-widest text-primary">
										{product.manufacturer}
									</p>
								)}
								
								<h1 className="text-4xl font-bold leading-tight tracking-tight text-base-content sm:text-5xl lg:text-4xl xl:text-5xl">
									{product.name}
								</h1>

								<div className="flex flex-wrap items-center gap-6 text-sm">
									<span className="font-mono tracking-wide text-base-content/60">
										SKU: {product.sku || 'N/A'}
									</span>
									
									{product.stock > 0 ? (
										<div className="flex items-center gap-2 text-success">
											<span className="relative flex h-2.5 w-2.5">
											  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
											  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
											</span>
											<span className="font-medium">In Stock</span>
										</div>
									) : (
										<Badge variant="warning" size="sm" tone="subtle">
											Out of Stock
										</Badge>
									)}
								</div>
							</div>

							{/* Pricing Card - Modern & Floating */}
							<div 
								className="animate-elegant-reveal overflow-hidden rounded-3xl border border-base-200 bg-base-100 p-8 shadow-xl shadow-base-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-base-200/70"
								style={{ animationDelay: '200ms' }}
							>
								<div className="mb-8">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium uppercase tracking-wider text-base-content/40">
												Pricing
											</p>
											<div className="mt-1 flex items-center gap-3">
												<span className="text-3xl font-bold text-base-content">Quote-Based</span>
											</div>
										</div>
										<div className="rounded-full bg-base-200/50 p-2 backdrop-blur-sm">
											<Info className="h-5 w-5 text-base-content/40" />
										</div>
									</div>
									<p className="mt-4 text-sm leading-relaxed text-base-content/60">
										Personalized pricing ensures you get the best market rate for your volume.
									</p>
								</div>

								<div className="space-y-4">
									<Link
										href={Routes.Contact.withProduct(product.id)}
										className="btn btn-primary btn-lg w-full gap-3 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30"
									>
										Request Quote
										<ArrowLeft className="h-5 w-5 rotate-180" />
									</Link>
									<div className="flex items-center justify-center gap-2 text-xs text-base-content/40">
										<CheckCircle2 className="h-3.5 w-3.5" />
										<span>No commitment required</span>
									</div>
								</div>
							</div>

							{/* Trust Signals - Inline & Subtle */}
							<div 
								className="animate-elegant-reveal flex items-center justify-between gap-4 rounded-2xl border border-base-200 bg-base-200/30 px-6 py-4 backdrop-blur-sm"
								style={{ animationDelay: '300ms' }}
							>
								<div className="flex flex-col items-center gap-1.5">
									<ShieldCheck className="h-5 w-5 text-base-content/40" />
									<span className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">Verified</span>
								</div>
								<div className="h-8 w-px bg-base-200" />
								<div className="flex flex-col items-center gap-1.5">
									<Truck className="h-5 w-5 text-base-content/40" />
									<span className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">Fast Ship</span>
								</div>
								<div className="h-8 w-px bg-base-200" />
								<div className="flex flex-col items-center gap-1.5">
									<Package className="h-5 w-5 text-base-content/40" />
									<span className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">Bulk</span>
								</div>
							</div>

							{/* Specs - Minimal Table */}
							<div 
								className="animate-elegant-reveal pt-4"
								style={{ animationDelay: '400ms' }}
							>
								<h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-base-content/40">
									Specifications
								</h3>
								<div className="overflow-hidden rounded-xl border border-base-200 shadow-sm">
									<table className="w-full text-sm">
										<tbody className="divide-y divide-base-200 bg-base-100">
											{product.categories.length > 0 && (
												<tr className="divide-x divide-base-200 transition-colors hover:bg-base-50">
													<td className="w-1/3 bg-base-200/30 px-4 py-3 font-medium text-base-content/60">Category</td>
													<td className="px-4 py-3 text-base-content">
														{product.categories.map(c => c.name).join(', ')}
													</td>
												</tr>
											)}
											<tr className="divide-x divide-base-200 transition-colors hover:bg-base-50">
												<td className="w-1/3 bg-base-200/30 px-4 py-3 font-medium text-base-content/60">Product ID</td>
												<td className="px-4 py-3 font-mono text-base-content/80">
													<span className="truncate">{product.id.substring(0, 20)}...</span>
												</td>
											</tr>
											{product.manufacturer && (
												<tr className="divide-x divide-base-200 transition-colors hover:bg-base-50">
													<td className="w-1/3 bg-base-200/30 px-4 py-3 font-medium text-base-content/60">Manufacturer</td>
													<td className="px-4 py-3 text-base-content">{product.manufacturer}</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
							
							{/* Help Section */}
							<div 
								className="animate-fade-in mt-2 flex items-center justify-center gap-2 text-sm text-base-content/50 transition-colors hover:text-primary"
								style={{ animationDelay: '500ms' }}
							>
								<Mail className="h-4 w-4" />
								<Link href={Routes.Contact.location} className="font-medium">
									Have questions? Contact support
								</Link>
							</div>
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
