/**
 * Form Footer Component
 * 
 * Reusable footer for modals with Cancel and Save buttons.
 * 
 * @module RBAC FormFooter
 */

import { Save, Loader2 } from 'lucide-react'
import Button from '@_components/ui/Button'

interface FormFooterProps {
	onCancel: () => void
	onSave: () => void
	isSaving: boolean
	saveLabel?: string
	cancelLabel?: string
}

export default function FormFooter({
	onCancel,
	onSave,
	isSaving,
	saveLabel = 'Save',
	cancelLabel = 'Cancel',
}: FormFooterProps) {
	return (
		<div className="flex justify-end gap-2 pt-4">
			<Button variant="ghost" onClick={onCancel}>
				{cancelLabel}
			</Button>
			<Button
				variant="primary"
				onClick={onSave}
				disabled={isSaving}
				leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
			>
				{isSaving ? 'Saving...' : saveLabel}
			</Button>
		</div>
	)
}
