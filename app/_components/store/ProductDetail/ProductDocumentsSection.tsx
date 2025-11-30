/**
 * Product Documents Section Component
 * 
 * Displays technical resources and downloadable documents (PDFs, Specs, etc.).
 * Server component - no client-side interactivity needed.
 * 
 * @module ProductDetail/ProductDocumentsSection
 */

import { FileText, Download } from 'lucide-react'

import type { SerializedProduct } from '@_lib/serializers/productSerializer'

import { ANIMATION_DELAYS, DOCUMENT_LABELS, SECTION_LABELS } from './ProductDetail.constants'

export interface ProductDocumentsSectionProps {
	/** Array of document files (non-image files) */
	documents: SerializedProduct['files']
}

/**
 * Product Documents Section
 * 
 * Renders downloadable documents in a grid layout with hover effects.
 * Only renders if documents array is not empty.
 */
export default function ProductDocumentsSection({
	documents,
}: ProductDocumentsSectionProps) {
	if (documents.length === 0) {
		return null
	}

	return (
		<div
			className="animate-elegant-reveal space-y-6"
			style={{ animationDelay: ANIMATION_DELAYS.DOCUMENTS }}
		>
			<div className="border-b border-base-200 pb-4">
				<h2 className="text-xl font-semibold tracking-tight text-base-content">
					{SECTION_LABELS.TECHNICAL_RESOURCES}
				</h2>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{documents.map((doc) => {
					// Use doc.name as key (stable identifier) or fallback to index if name is missing
					// FAANG best practice: Use stable, unique identifiers for keys
					const key = doc.name ?? `doc-${doc.id ?? Math.random()}`
					return (
						<a
							key={key}
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
									{DOCUMENT_LABELS.DOWNLOAD_PDF}
								</span>
							</div>
						</a>
					)
				})}
			</div>
		</div>
	)
}

