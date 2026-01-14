/**
 * MfaChallengeForm Component
 *
 * MFA challenge form for TOTP code entry during login.
 * Displays after successful password validation when MFA is enabled.
 *
 * **Features:**
 * - 6-digit TOTP code input
 * - "Remember this device" checkbox (uses FormCheckbox)
 * - Recovery code option toggle
 * - Generic error messages (defensive UX)
 * - Mobile-first responsive design
 * - Theme-aware (DaisyUI)
 *
 * @module LoginModal/MfaChallengeForm
 */

'use client'

import { useState, useCallback } from 'react'

import FormInput from '@_components/forms/FormInput'
import FormCheckbox from '@_components/forms/FormCheckbox'
import OneTimeCodeInput from '@_components/forms/OneTimeCodeInput'
import Button from '@_components/ui/Button'

import { BUTTON_LABELS, FIELD_LABELS, FIELD_PLACEHOLDERS, LAYOUT_CLASSES, ERROR_MESSAGES } from './LoginModal.constants'

import type { MfaChallengeFormProps } from './LoginModal.types'

/**
 * MfaChallengeForm Component
 *
 * Renders the MFA challenge form with TOTP code input.
 * Follows the same patterns as LoginForm for consistency.
 *
 * @param props - Component props
 * @returns MFA challenge form section
 */
export default function MfaChallengeForm({
	challengeId,
	expiresAt,
	onVerify,
	onCancel,
	isLoading,
	error,
}: MfaChallengeFormProps) {
	const [code, setCode] = useState('')
	const [rememberDevice, setRememberDevice] = useState(false)
	const [showRecoveryCode, setShowRecoveryCode] = useState(false)

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault()

			// Validate code length
			if (code.length !== 6 && !showRecoveryCode) {
				return
			}

			if (showRecoveryCode && code.length === 0) {
				return
			}

			// Fire and forget - the promise is handled in the hook
			void onVerify(code, rememberDevice, showRecoveryCode)
		},
		[code, rememberDevice, showRecoveryCode, onVerify]
	)

	const handleCodeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value

			if (showRecoveryCode) {
				// Recovery codes can contain letters and numbers
				setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
			} else {
				// TOTP codes are numeric only, max 6 digits
				const numericValue = value.replace(/\D/g, '').slice(0, 6)
				setCode(numericValue)
			}
		},
		[showRecoveryCode]
	)

	const handleToggleRecoveryCode = useCallback(() => {
		setShowRecoveryCode((prev) => !prev)
		setCode('')
	}, [])

	const isExpired = expiresAt < new Date()
	const isValidCode = showRecoveryCode ? code.length > 0 : code.length === 6

	return (
		<form
			onSubmit={handleSubmit}
			className={LAYOUT_CLASSES.FORM_SPACING}>
			{/* Code Input */}
			<div className='transition-all duration-300 ease-out flex justify-center'>
				{showRecoveryCode ? (
					<FormInput
						label={FIELD_LABELS.MFA_RECOVERY_CODE}
						type='text'
						autoComplete='off'
						value={code}
						onChange={handleCodeChange}
						placeholder={FIELD_PLACEHOLDERS.MFA_RECOVERY_CODE}
						className='text-center text-xl tracking-widest font-mono'
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
						disabled={isExpired || isLoading}
					/>
				) : (
					<div className="w-full">
						<label className="label">
							<span className="label-text">{FIELD_LABELS.MFA_CODE}</span>
						</label>
						<OneTimeCodeInput
							value={code}
							onChange={setCode}
							onComplete={(val) => {
								setCode(val)
								void onVerify(val, rememberDevice, false)
							}}
							error={!!error}
							disabled={isExpired || isLoading}
							autoFocus
							className="mb-2"
						/>
					</div>
				)}
			</div>

			{/* Error Message */}
			{error && (
				<div
					className='text-error text-sm text-center'
					role='alert'>
					{error}
				</div>
			)}

			{/* Expired Message */}
			{isExpired && (
				<div
					className='text-warning text-sm text-center'
					role='alert'>
					{ERROR_MESSAGES.MFA_SESSION_EXPIRED}
				</div>
			)}

			{/* Remember Device Checkbox - only for TOTP, not recovery codes */}
			{!showRecoveryCode && (
				<FormCheckbox
					label={FIELD_LABELS.MFA_REMEMBER_DEVICE}
					checked={rememberDevice}
					onChange={(e) => setRememberDevice(e.target.checked)}
					disabled={isExpired || isLoading}
				/>
			)}

			{/* Action Buttons */}
			<div className={LAYOUT_CLASSES.BUTTON_CONTAINER}>
				{/* Verify Button */}
				<Button
					type='submit'
					variant='primary'
					size='md'
					loading={isLoading}
					disabled={!isValidCode || isExpired || isLoading}
					className={LAYOUT_CLASSES.PRIMARY_BUTTON}>
					{BUTTON_LABELS.VERIFY}
				</Button>

				{/* Toggle Recovery Code */}
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={handleToggleRecoveryCode}
					className={LAYOUT_CLASSES.LINK_BUTTON}
					disabled={isExpired || isLoading}>
					{showRecoveryCode ? BUTTON_LABELS.USE_AUTHENTICATOR : BUTTON_LABELS.USE_RECOVERY_CODE}
				</Button>

				{/* Cancel Button */}
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={onCancel}
					className={LAYOUT_CLASSES.LINK_BUTTON}
					disabled={isLoading}>
					{BUTTON_LABELS.CANCEL}
				</Button>
			</div>
		</form>
	)
}
