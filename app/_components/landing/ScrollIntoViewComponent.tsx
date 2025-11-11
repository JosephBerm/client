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
 */
export default function ScrollIntoViewComponent() {
	return (
		<nav className="sticky top-20 z-20 bg-base-100/95 backdrop-blur">
			<PageContainer className="flex flex-wrap items-center justify-center gap-3 py-4 text-sm md:justify-between md:text-base">
				{SECTIONS.map((section) => (
					<a
						key={section.id}
						href={`#${section.id}`}
						className="rounded-full border border-base-200 px-4 py-2 text-base-content/80 transition hover:border-primary hover:bg-primary/10 hover:text-primary"
					>
						{section.label}
					</a>
				))}
			</PageContainer>
		</nav>
	)
}

