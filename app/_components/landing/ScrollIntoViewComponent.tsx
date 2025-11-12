import PageContainer from '@_components/layouts/PageContainer'

const SECTIONS = [
	{ id: 'hero', label: 'Overview' },
	{ id: 'featured-products', label: 'Featured Products' },
	{ id: 'why-medsource', label: 'Why MedSource' },
	{ id: 'categories', label: 'Categories' },
	{ id: 'faq', label: 'FAQ' },
	{ id: 'contact', label: 'Contact' },
]

/**
 * ScrollIntoViewComponent
 *
 * Provides quick anchor links to the major landing page sections.
 * Sticky to bottom on larger screens, normal positioning on mobile.
 */
export default function ScrollIntoViewComponent() {
	return (
		<nav className="z-20 bg-base-100 md:sticky md:bottom-0 md:shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
			<PageContainer className="flex flex-wrap items-center justify-center gap-3 py-4 text-sm md:flex-nowrap md:justify-between md:gap-2 md:text-base lg:gap-4">
				{SECTIONS.map((section) => (
					<a
						key={section.id}
						href={`#${section.id}`}
						className="flex-shrink-0 rounded-full border border-base-200 px-4 py-2 text-base-content/80 transition hover:border-primary hover:bg-primary/10 hover:text-primary md:flex-1 md:text-center"
					>
						{section.label}
					</a>
				))}
			</PageContainer>
		</nav>
	)
}

