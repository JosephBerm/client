/**
 * Form Footer Component
 *
 * Reusable footer for modals with Cancel and Save buttons.
 * Supports both onClick handler and native form submission.
 *
 * @module RBAC FormFooter
 */

import { Save, Loader2 } from 'lucide-react'
import Button from '@_components/ui/Button'

interface FormFooterProps {
	onCancel: () => void
	/** Click handler for save button. If not provided, button acts as submit. */
	onSave?: () => void
	isSaving: boolean
	saveLabel?: string
	cancelLabel?: string
	/** If true, save button will be type="submit" for form integration */
	isSubmitButton?: boolean
	/** Additional validation to disable save button */
	isDisabled?: boolean
}

export default function FormFooter({
	onCancel,
	onSave,
	isSaving,
	saveLabel = 'Save',
	cancelLabel = 'Cancel',
	isSubmitButton = true,
	isDisabled = false,
}: FormFooterProps) {
	return (
		<div className="flex justify-end gap-2 pt-4 border-t border-base-300 mt-4">
			<Button variant="ghost" onClick={onCancel} type="button">
				{cancelLabel}
			</Button>
			<Button
				variant="primary"
				type={isSubmitButton ? 'submit' : 'button'}
				onClick={isSubmitButton ? undefined : onSave}
				disabled={isSaving || isDisabled}
				leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
			>
				{isSaving ? 'Saving...' : saveLabel}
			</Button>
		</div>
	)
}
