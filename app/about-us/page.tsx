import type { Metadata } from 'next'

import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
	title: 'About Us | MedSource Pro',
	description: 'Learn about MedSource Pro, our mission to improve healthcare supply chains, and our commitment to quality and community impact.',
}

export default function AboutPage() {
	return <AboutPageClient />
}
