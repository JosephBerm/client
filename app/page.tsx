import ContactUs from '@_components/landing/ContactUs'
import FAQ from '@_components/landing/FAQ'
import Intro from '@_components/landing/Intro'
import Products from '@_components/landing/Products'
import ProductCategoriesCarousel from '@_components/landing/ProductCategoriesCarousel'
import ProductsCarousel from '@_components/landing/ProductsCarousel'
import SalesPitch from '@_components/landing/SalesPitch'
import ScrollIntoViewComponent from '@_components/landing/ScrollIntoViewComponent'

export default function Home() {
	return (
		<div className="flex flex-col gap-16 pb-24">
			<Intro />
			<ProductCategoriesCarousel />
			<ScrollIntoViewComponent />
			<ProductsCarousel />
			<SalesPitch />
			<Products />
			<FAQ />
			<ContactUs />
		</div>
	)
}
