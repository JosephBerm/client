export default class Home {
	public static HeroSection = {
		description: 'Quality medical supply solutions within reach.',
		paragraph:
			'Request a quote by consulting our extensive catalog of medical products through a quick and easy process.',
	}
	public static CarouselProducts = ['Medical Tent', 'Regulators', 'KN45 Mask', 'Flowmeters', 'Tri-Gas Adaptor']

	public static SalesPitch = {
		description:
			'At Medsource Pro, we’re dedicated to delivering excellence in every aspect of our service. From premium-quality medical products to personalized support, we’re here to empower healthcare professionals like you.',
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

	public static Products = {
		description:
			'Explore our wide range of medical products, from state-of-the-art equipment to essential supplies. Browse through categories such as medical devices, diagnostic tools, laboratory materials, and more.',
	}
	public static FAQs = {
		description:
			"Find answers to frequently asked questions about our products, ordering process, shipping policies, and more. If you have a question, chances are it's answered here. If not, feel free to reach out to us directly.",
		questions: [
			{
				question: 'Does MTS do medical gas installs?',
				answer: 'Yes, MTS has various partnerships with a number of medical gas installation contractors. Each sub contractor employees qualifying ASSE 6010 Medical Gas Installers ready to meet your needs.',
			},
			{
				question: 'What is a medical gas certification?',
				answer: 'A Medical Gas Certification (Also called a medical gas verification) is an NFPA required inspection and approval of newly installed medical gas delivery systems. All newly in installed medical gas pipeline and equipment must be certified by an ASSE 6030 before use.',
			},
			{
				question: 'Does MTS do medical gas installs?',
				answer: 'Per NFPA guidelines, it is a requirement for any facilities using medical grade gases for the purpose of human consumption to have their gas delivery systems inspected by and ASSE 6040. Read more about Medical Gas Inspections Here.',
			},
			{
				question: 'Does MTS provide Medical Gas Inspections?',
				answer: 'Yes, MTS provides annual medical gas inspections. We provide discounts on Annual Inspections when you sign multi year contracts.',
			},
			{
				question: 'How to get certified as a medical gas installer?',
				answer: 'The Plumbing and Mechanical Systems Board issues medical gas piping certification to medical gas system installers who possess valid certification from the National Inspection Testing Certification Corporation or NITC. Certification from other organizations may be considered with approval of the board.',
			},
			{
				question: 'Does MTS do medical gas installs?',
				answer: 'Yes, we can adapt any fittings to the desired hosing for any medical grade gas. High pressure gases such as Nitrogen can also be accommodated.',
			},
		] as FAQ[],
	}
}

export interface FAQ {
	question: string
	answer: string
}
