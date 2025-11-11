import Image from 'next/image'
import DoctorsImage from '@/public/LandingImage1.png'

// TODO: Migrate Landing page components
// import Intro from '@/components/Landing/Intro'
// import ProductsCarousel from '@/components/Landing/ProductsCarousel'
// import SalesPitch from '@/components/Landing/SalesPitch'
// import Products from '@/components/Landing/Products'
// import ContactUs from '@/components/Landing/ContactUs'
// import ScrollIntoViewComponent from '@/components/Landing/ScrollIntoViewComponent'
// import FAQ from '@/components/Landing/FAQ'

export default function Home()
{
	return (
		<div className='Home'>
			<div className='landing'>
				<div className='page-header image-container'>
					<Image priority src={DoctorsImage} alt='Doctors Image' width={1920} height={1080} />
				</div>
				<section className='hero-section'>
					<h2 className='page-title'>
						Welcome to <br />
						<strong>Medsource!</strong>
					</h2>
					<div className="alert alert-info mt-4">
						<span>TODO: Migrate Landing page components (Intro, ProductsCarousel, SalesPitch, Products, FAQ, ContactUs)</span>
					</div>
				</section>
			</div>
		</div>
	)
}
