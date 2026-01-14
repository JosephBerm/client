/**
 * StepUpModal Component
 *
 * Modal for step-up MFA verification when accessing sensitive actions.
 * This modal is triggered by the step-up handler when the backend returns
 * a 403 response with X-StepUp-Required headers.
 *
 * **Features:**
 * - 6-digit TOTP code input (reuses OneTimeCodeInput)
 * - Context message explaining why verification is needed
 * - Auto-submit on code completion
 * - Error handling with clear messages
 * - Mobile-first responsive design
 * - Theme-aware (DaisyUI)
 *
 * **DRY Pattern:**
 * - Reuses Modal component for base modal functionality
 * - Reuses OneTimeCodeInput for code entry
 * - Reuses Button component for actions
 * - Follows MfaChallengeForm patterns
 *
 * @module StepUpModal
 */

'use client'

import { useState, useCallback, useEffect } from 'react'

import { ShieldCheck } from 'lucide-react'

import Modal from '@_components/ui/Modal'
import OneTimeCodeInput from '@_components/forms/OneTimeCodeInput'
import Button from '@_components/ui/Button'

import { HttpService, resolveStepUp, rejectStepUp } from '@_shared'

import { getActionMessage } from '@_shared/services/stepUpHandler.constants'

import {
	STEP_UP_MODAL_TEXT,
	STEP_UP_ERRORS,
	STEP_UP_API,
	STEP_UP_LAYOUT,
	STEP_UP_ANIMATION,
} from './StepUpModal.constants'

import type { StepUpRequiredEvent } from '@_shared/services/stepUpHandler'

// =========================================================================
// TYPES
// =========================================================================

interface StepUpModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Callback when modal should close */
	onClose: () => void
	/** Step-up event details (action, reason, message) */
	event: StepUpRequiredEvent | null
}

interface StepUpVerifyResponse {
	accessToken: string
	expiresAt: string
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * StepUpModal Component
 *
 * Displays when a sensitive action requires MFA re-verification.
 * On successful verification, resolves the pending step-up promise
 * with a fresh access token for request retry.
 *
 * @param props - Modal props
 * @returns Step-up verification modal
 */
export default function StepUpModal({ isOpen, onClose, event }: StepUpModalProps) {
	const [code, setCode] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Clear state when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			setCode('')
			setError(null)
			setIsLoading(false)
		}
	}, [isOpen])

	// Auto-clear error after delay
	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => setError(null), STEP_UP_ANIMATION.ERROR_CLEAR_DELAY)
			return () => clearTimeout(timer)
		}
	}, [error])

	/**
	 * Handles cancel action.
	 * Rejects the pending step-up promise and closes modal.
	 */
	const handleCancel = useCallback(() => {
		rejectStepUp('User cancelled step-up verification')
		setCode('')
		setError(null)
		onClose()
	}, [onClose])

	/**
	 * Handles form submission.
	 * Verifies the TOTP code with the backend.
	 */
	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault()

			if (code.length !== STEP_UP_ANIMATION.CODE_LENGTH) {
				setError(STEP_UP_ERRORS.CODE_REQUIRED)
				return
			}

			setIsLoading(true)
			setError(null)

			try {
				const response = await HttpService.post<StepUpVerifyResponse>(STEP_UP_API.VERIFY, {
					code,
				})

				if (response.data.statusCode === 200 && response.data.payload?.accessToken) {
					// Success - resolve the pending step-up with fresh token
					resolveStepUp(response.data.payload.accessToken)
					setCode('')
					onClose()
				} else {
					// API returned error
					const errorMessage = response.data.message ?? STEP_UP_ERRORS.VERIFICATION_FAILED
					setError(errorMessage)
					setCode('')
				}
			} catch {
				// Network or unexpected error
				setError(STEP_UP_ERRORS.NETWORK_ERROR)
				setCode('')
			} finally {
				setIsLoading(false)
			}
		},
		[code, onClose]
	)

	/**
	 * Handles code completion (auto-submit).
	 */
	const handleCodeComplete = useCallback(
		(completedCode: string) => {
			setCode(completedCode)
			// Auto-submit after a brief delay for UX
			setTimeout(() => {
				void handleSubmit()
			}, 100)
		},
		[handleSubmit]
	)

	// Get context message for the action
	const actionMessage = event?.message ?? getActionMessage(event?.action ?? '')

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			title={STEP_UP_MODAL_TEXT.TITLE}
			size='sm'
			closeOnOverlayClick={false}
			closeOnEscape={!isLoading}
		>
			<form onSubmit={handleSubmit} className={STEP_UP_LAYOUT.FORM_SPACING}>
				{/* Security Icon */}
				<div className='flex justify-center'>
					<div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
						<ShieldCheck className='w-8 h-8 text-primary' />
					</div>
				</div>

				{/* Context Message */}
				<p className={STEP_UP_LAYOUT.DESCRIPTION}>{actionMessage}</p>

				{/* Code Input */}
				<div className='w-full'>
					<label className='label'>
						<span className='label-text'>{STEP_UP_MODAL_TEXT.CODE_LABEL}</span>
					</label>
					<OneTimeCodeInput
						value={code}
						onChange={setCode}
						onComplete={handleCodeComplete}
						error={!!error}
						disabled={isLoading}
						autoFocus
						className='mb-2'
					/>
					<p className='text-xs text-base-content/60 text-center mt-2'>
						{STEP_UP_MODAL_TEXT.CODE_HELP_TEXT}
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className={STEP_UP_LAYOUT.ERROR_MESSAGE} role='alert'>
						{error}
					</div>
				)}

				{/* Action Buttons */}
				<div className={STEP_UP_LAYOUT.BUTTON_CONTAINER}>
					<Button
						type='submit'
						variant='primary'
						size='md'
						loading={isLoading}
						disabled={code.length !== STEP_UP_ANIMATION.CODE_LENGTH || isLoading}
						className={STEP_UP_LAYOUT.PRIMARY_BUTTON}
					>
						{isLoading ? STEP_UP_MODAL_TEXT.VERIFYING_BUTTON : STEP_UP_MODAL_TEXT.VERIFY_BUTTON}
					</Button>

					<Button
						type='button'
						variant='ghost'
						size='sm'
						onClick={handleCancel}
						disabled={isLoading}
					>
						{STEP_UP_MODAL_TEXT.CANCEL_BUTTON}
					</Button>
				</div>
			</form>
		</Modal>
	)
}
