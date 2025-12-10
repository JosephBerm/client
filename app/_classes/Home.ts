/**
 * Home Page Static Content Class
 * 
 * Contains all static content and copy for the MedSource Pro public homepage.
 * Centralized content management for hero section, sales pitch, product highlights,
 * and frequently asked questions (FAQs).
 * 
 * **Sections:**
 * - **HeroSection**: Main headline and call-to-action
 * - **CarouselProducts**: Featured product names for carousel
 * - **SalesPitch**: Company value proposition and qualities
 * - **Products**: Product catalog description
 * - **FAQs**: Frequently asked questions with answers
 * 
 * **Benefits:**
 * - Centralized content management
 * - Easy content updates without touching JSX
 * - Type-safe FAQ structure
 * - Consistent messaging across pages
 * 
 * @example
 * ```typescript
 * import Home from '@_classes/Home';
 * 
 * // Hero Section
 * <section className="hero">
 *   <h1>{Home.HeroSection.description}</h1>
 *   <p>{Home.HeroSection.paragraph}</p>
 * </section>
 * 
 * // Product Carousel
 * {Home.CarouselProducts.map((product, index) => (
 *   <div key={index} className="carousel-item">
 *     <h3>{product}</h3>
 *   </div>
 * ))}
 * 
 * // Company Qualities
 * {Home.SalesPitch.companyQualities.map((quality, index) => (
 *   <Card key={index} title={quality.title}>
 *     {quality.description}
 *   </Card>
 * ))}
 * 
 * // FAQs Section
 * {Home.FAQs.questions.map((faq, index) => (
 *   <Accordion key={index}>
 *     <AccordionHeader>{faq.question}</AccordionHeader>
 *     <AccordionBody>{faq.answer}</AccordionBody>
 *   </Accordion>
 * ))}
 * ```
 * 
 * @module Home
 */

/**
 * Home Class
 * 
 * Static content repository for homepage sections.
 * All content is defined as static properties for easy access throughout the application.
 */
export default class Home {
	/**
	 * Hero Section Content
	 * 
	 * Main headline and supporting paragraph for the homepage hero.
	 * First content visitors see when landing on the site.
	 */
	public static HeroSection = {
		/** Main headline describing company value proposition */
		description: 'Quality medical supply solutions within reach.',
		/** Supporting paragraph explaining the process */
		paragraph:
			'Request a quote by consulting our extensive catalog of medical products through a quick and easy process.',
	}

	/**
	 * Carousel Product Names
	 * 
	 * Featured product names to display in homepage carousel.
	 * Highlights key product categories and offerings across medical gas systems,
	 * respiratory care, surgical supplies, diagnostics, PPE, and facility essentials.
	 */
	public static CarouselProducts = [
		'Medical Gas Regulators',
		'Oxygen Flowmeters',
		'Tri-Gas Adaptors',
		'Respiratory Masks',
		'Infusion Pumps',
		'Surgical Instruments',
		'Diagnostic Equipment',
		'Medical Tents',
		'PPE Supplies',
		'Laboratory Consumables',
		'Monitoring Devices',
	]

	/**
	 * Sales Pitch Section
	 * 
	 * Company value proposition with description and three key qualities.
	 * Communicates brand promise and differentiators to potential customers.
	 */
	public static SalesPitch = {
		/** Main company description and mission statement */
		description: `At Medsource Pro, we're dedicated to delivering excellence in every aspect of our service. From premium-quality medical products to personalized support, we're here to empower healthcare professionals like you.`,
		/** Array of three company qualities (title + description) */
		companyQualities: [
			{
				title: 'Tailored Solutions',
				description:
					'Our comprehensive product and service catalog is carefully curated to meet the diverse needs of hospitals, clinics, and medical facilities. Whatever your requirements, we have the solution for you.',
			},
			{
				title: 'Premium-Quality Products',
				description:
					'We source only the highest quality medical supplies and equipment to ensure reliability and effectiveness in patient care.',
			},
			{
				title: 'Trusted Partnership',
				description:
					'Let us be your trusted partner on your journey to creating a healthier world. With Medsource Pro by your side, you can count on exceptional service, reliable products, and unwavering support.',
			},
		],
	}

	/**
	 * Products Section
	 * 
	 * Description of product catalog for products page or section.
	 * Encourages browsing and highlights product diversity.
	 */
	public static Products = {
		/** Product catalog description */
		description:
			'Explore our wide range of medical products, from state-of-the-art equipment to essential supplies. Browse through categories such as medical devices, diagnostic tools, laboratory materials, and more.',
	}

	/**
	 * Frequently Asked Questions (FAQs)
	 * 
	 * Common questions about medical gas systems, installations, certifications, and services.
	 * Provides transparency and educates potential customers about compliance and capabilities.
	 */
	public static FAQs = {
		/** FAQ section introduction */
		description:
			"Find answers to frequently asked questions about our products, ordering process, shipping policies, and more. If you have a question, chances are it's answered here. If not, feel free to reach out to us directly.",
		/** Array of FAQ objects with questions and answers */
		questions: [
			{
				question: 'Does Medsource Pro do medical gas installs?',
				answer: 'Yes, Medsource Pro has various partnerships with a number of medical gas installation contractors. Each sub contractor employees qualifying ASSE 6010 Medical Gas Installers ready to meet your needs.',
			},
			{
				question: 'What is a medical gas certification?',
				answer: 'A Medical Gas Certification (Also called a medical gas verification) is an NFPA required inspection and approval of newly installed medical gas delivery systems. All newly in installed medical gas pipeline and equipment must be certified by an ASSE 6030 before use.',
			},
			{
				question: 'What are the requirements for medical gas system inspections?',
				answer: 'Per NFPA guidelines, it is a requirement for any facilities using medical grade gases for the purpose of human consumption to have their gas delivery systems inspected by and ASSE 6040. Read more about Medical Gas Inspections Here.',
			},
			{
				question: 'Does Medsource Pro provide Medical Gas Inspections?',
				answer: 'Yes, Medsource Pro provides annual medical gas inspections. We provide discounts on Annual Inspections when you sign multi year contracts.',
			},
			{
				question: 'How to get certified as a medical gas installer?',
				answer: 'The Plumbing and Mechanical Systems Board issues medical gas piping certification to medical gas system installers who possess valid certification from the National Inspection Testing Certification Corporation or NITC. Certification from other organizations may be considered with approval of the board.',
			},
			{
				question: 'Can Medsource Pro adapt fittings for different medical gases?',
				answer: 'Yes, we can adapt any fittings to the desired hosing for any medical grade gas. High pressure gases such as Nitrogen can also be accommodated.',
			},
		] as FAQ[],
	}
}

/**
 * FAQ Interface
 * 
 * Type definition for FAQ objects.
 * Ensures consistent structure for all FAQ entries.
 */
export interface FAQ {
	/** The question being asked */
	question: string
	/** The answer to the question */
	answer: string
}
