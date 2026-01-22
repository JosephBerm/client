/**
 * AuthModalHeader Component
 * 
 * Header section for the authentication modal.
 * Contains back button (signup view), title, and close button.
 * 
 * @module LoginModal/AuthModalHeader
 */

'use client'

import { X, ArrowLeft } from 'lucide-react'

import Button from '@_components/ui/Button'

import {
	MODAL_TITLES,
	LAYOUT_CLASSES,
	ARIA_LABELS,
} from './LoginModal.constants'

import type { AuthModalHeaderProps } from './LoginModal.types'

/**
 * AuthModalHeader Component
 * 
 * Renders the modal header with navigation and close controls.
 * Shows back button only in signup view.
 * 
 * @param props - Component props
 * @returns Modal header section
 */
export default function AuthModalHeader({
	currentView,
	onSwitchToLogin,
	onClose,
}: AuthModalHeaderProps) {
	return (
		<div className={LAYOUT_CLASSES.HEADER_ROW}>
			{/* Back button - shown in signup and phone views */}
			{currentView === 'signup' || currentView === 'phone' ? (
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={onSwitchToLogin}
					className={LAYOUT_CLASSES.ICON_BUTTON}
					aria-label={ARIA_LABELS.GO_BACK_LOGIN}
				>
					<ArrowLeft size={20} aria-hidden='true' />
				</Button>
			) : (
				<div /> // Spacer for alignment
			)}

			{/* Modal title */}
			<h2 className='text-xl sm:text-2xl font-semibold text-base-content tracking-tight'>
				{MODAL_TITLES[currentView]}
			</h2>

			{/* Close button */}
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={onClose}
				className={LAYOUT_CLASSES.ICON_BUTTON}
				aria-label={ARIA_LABELS.CLOSE_MODAL}
			>
				<X size={20} aria-hidden='true' />
			</Button>
		</div>
	)
}

