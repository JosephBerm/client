import { ReactNode } from 'react'
import { FileQuestion } from 'lucide-react'
import Button from '@_components/ui/Button'

interface EmptyStateProps {
	icon?: ReactNode
	title: string
	description?: string
	action?: {
		label: string
		onClick: () => void
	}
}

/**
 * Empty state component for tables, lists, etc.
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
			<div className="text-base-content/30 mb-4">
				{icon || <FileQuestion className="w-16 h-16" />}
			</div>
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			{description && <p className="text-sm text-base-content/70 mb-4 max-w-md">{description}</p>}
			{action && (
				<Button variant="primary" onClick={action.onClick}>
					{action.label}
				</Button>
			)}
		</div>
	)
}


