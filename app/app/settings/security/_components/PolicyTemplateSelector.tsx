/**
 * PolicyTemplateSelector Component
 *
 * Quick-select buttons for applying pre-configured security policy templates.
 * Templates provide common security postures: Relaxed, Balanced, Strict.
 *
 * @module PolicyTemplateSelector
 */

'use client'

import { useCallback, useState } from 'react'

import { Sparkles, AlertTriangle } from 'lucide-react'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'

import type { PolicyTemplate } from '@_shared'

import { TEMPLATE_INFO } from './SecurityPolicyForm.constants'

// =========================================================================
// TYPES
// =========================================================================

interface PolicyTemplateSelectorProps {
	/** Available templates */
	templates: PolicyTemplate[]
	/** Whether save is in progress */
	isSaving: boolean
	/** Callback to apply a template */
	onApply: (template: PolicyTemplate) => Promise<boolean>
}

// =========================================================================
// COMPONENT
// =========================================================================

export default function PolicyTemplateSelector({
	templates,
	isSaving,
	onApply,
}: PolicyTemplateSelectorProps) {
	const [confirmTemplate, setConfirmTemplate] = useState<PolicyTemplate | null>(null)

	/**
	 * Opens confirmation modal before applying template.
	 */
	const handleTemplateClick = useCallback((template: PolicyTemplate) => {
		setConfirmTemplate(template)
	}, [])

	/**
	 * Applies the template after confirmation.
	 */
	const handleConfirmApply = useCallback(async () => {
		if (confirmTemplate) {
			await onApply(confirmTemplate)
			setConfirmTemplate(null)
		}
	}, [confirmTemplate, onApply])

	/**
	 * Closes the confirmation modal.
	 */
	const handleCancelApply = useCallback(() => {
		setConfirmTemplate(null)
	}, [])

	// Get template info (icon and description)
	const getTemplateInfo = (name: string) => {
		const key = name.toLowerCase() as keyof typeof TEMPLATE_INFO
		return TEMPLATE_INFO[key] ?? { icon: '⚙️', description: 'Custom template' }
	}

	if (templates.length === 0) {
		return null
	}

	return (
		<>
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
				<div className='flex items-center gap-3 mb-4'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10'>
						<Sparkles className='h-5 w-5 text-accent' />
					</div>
					<div>
						<h3 className='text-lg font-semibold text-base-content'>Quick Setup</h3>
						<p className='text-sm text-base-content/60'>
							Apply a pre-configured security policy template
						</p>
					</div>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
					{templates.map((template) => {
						const info = getTemplateInfo(template.name)
						return (
							<button
								key={template.name}
								type='button'
								onClick={() => handleTemplateClick(template)}
								disabled={isSaving}
								className='
									flex flex-col items-center p-4 rounded-lg
									border border-base-300 bg-base-200/50
									hover:bg-base-200 hover:border-primary/30
									transition-colors duration-200
									disabled:opacity-50 disabled:cursor-not-allowed
								'
							>
								<span className='text-2xl mb-2'>{info.icon}</span>
								<span className='font-semibold text-base-content'>{template.displayName}</span>
								<span className='text-xs text-base-content/60 text-center mt-1'>
									{info.description}
								</span>
							</button>
						)
					})}
				</div>
			</Card>

			{/* Confirmation Modal */}
			<Modal
				isOpen={confirmTemplate !== null}
				onClose={handleCancelApply}
				title='Apply Security Template'
				size='sm'
			>
				<div className='space-y-4'>
					<div className='flex items-start gap-3 p-3 rounded-lg bg-warning/10'>
						<AlertTriangle className='h-5 w-5 text-warning shrink-0 mt-0.5' />
						<div className='text-sm'>
							<p className='font-medium text-base-content'>This will overwrite your current settings</p>
							<p className='text-base-content/70 mt-1'>
								Applying the "{confirmTemplate?.displayName}" template will replace all your current
								security policy settings.
							</p>
						</div>
					</div>

					{confirmTemplate && (
						<div className='text-sm text-base-content/80'>
							<p className='font-medium mb-1'>Template Description:</p>
							<p>{confirmTemplate.description}</p>
						</div>
					)}

					<div className='flex gap-3 justify-end pt-2'>
						<Button variant='ghost' onClick={handleCancelApply} disabled={isSaving}>
							Cancel
						</Button>
						<Button variant='primary' onClick={handleConfirmApply} loading={isSaving}>
							Apply Template
						</Button>
					</div>
				</div>
			</Modal>
		</>
	)
}
