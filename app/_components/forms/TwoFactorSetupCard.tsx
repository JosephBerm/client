/**
 * TwoFactorSetupCard Component
 *
 * Comprehensive 2FA enrollment component following MAANG-level best practices.
 * Provides TOTP setup with QR code, manual secret entry, and backup codes display.
 * Integrates with backend MFA endpoints (PLAN_2FA.md implementation).
 *
 * **Features:**
 * - TOTP setup flow with QR code generation
 * - Manual secret entry for authenticator apps
 * - Code verification with Zod validation
 * - Backup codes display and copy functionality
 * - Disable MFA with step-up authentication
 * - Loading states and error handling
 * - Accessible UI with proper ARIA attributes
 *
 * **Security:**
 * - Requires valid TOTP code to enable MFA
 * - Backup codes shown only once (user must save)
 * - Disable requires password + optional MFA code
 * - Follows NIST SP 800-63B guidelines
 *
 * **Architecture:**
 * - Uses useFormSubmit hook for DRY API calls
 * - Integrates with API.Accounts.Mfa namespace
 * - Uses base components (Button, FormInput, Modal)
 * - Mobile-first responsive design
 *
 * @example
 * ```tsx
 * import TwoFactorSetupCard from '@_components/forms/TwoFactorSetupCard';
 *
 * function SecuritySettings() {
 *   return (
 *     <TwoFactorSetupCard
 *       isMfaEnabled={user.mfaEnabled}
 *       onStatusChange={() => refetchUser()}
 *     />
 *   );
 * }
 * ```
 *
 * @module TwoFactorSetupCard
 */

'use client'

import { useCallback, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { QrCode, Shield, Key, Copy, Check, Smartphone, AlertTriangle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { logger } from '@_core'

import { useFormSubmit, API, notificationService, useCopyToClipboard } from '@_shared'

import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'

import FormInput from './FormInput'
import OneTimeCodeInput from './OneTimeCodeInput'

// ============================================================================
// CONSTANTS (DRY - No magic strings)
// ============================================================================

const mfaConstants = {
	componentName: 'TwoFactorSetupCard',
	totpCodeLength: 6,
	backupCodeCount: 10,
} as const

const mfaMessages = {
	// Setup flow
	setupTitle: 'Set Up Two-Factor Authentication',
	setupDescription: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
	manualEntryLabel: 'Manual Entry Secret',
	manualEntryHelp: "Can't scan? Enter this secret manually in your authenticator app",
	verifyCodeLabel: 'Verification Code',
	verifyCodePlaceholder: 'Enter 6-digit code',
	verifyCodeHelp: 'Enter the 6-digit code from your authenticator app',

	// Backup codes
	backupCodesTitle: 'Save Your Backup Codes',
	backupCodesWarning: 'Store these codes in a safe place. Each code can only be used once.',
	backupCodesSaved: 'Backup codes copied to clipboard',

	// Disable flow
	disableTitle: 'Disable Two-Factor Authentication',
	disableWarning: 'This will remove an extra layer of security from your account.',
	disablePasswordLabel: 'Current Password',
	disableCodeLabel: 'Authentication Code (Optional)',

	// Status
	enabledStatus: 'Enabled',
	disabledStatus: 'Not Configured',

	// Success/Error messages
	setupSuccess: 'Two-factor authentication enabled successfully',
	disableSuccess: 'Two-factor authentication disabled',
	setupError: 'Failed to set up two-factor authentication',
	disableError: 'Failed to disable two-factor authentication',

	// Button labels
	btnEnable: 'Enable 2FA',
	btnDisable: 'Disable 2FA',
	btnVerify: 'Verify & Enable',
	btnCancel: 'Cancel',
	btnCopySecret: 'Copy Secret',
	btnCopyCodes: 'Copy All Codes',
	btnDone: 'Done',
	btnConfirmDisable: 'Confirm Disable',
} as const

const mfaErrors = {
	codeRequired: 'Verification code is required',
	codeLength: `Code must be ${mfaConstants.totpCodeLength} digits`,
	codeNumeric: 'Code must contain only numbers',
	passwordRequired: 'Password is required',
} as const

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const verifyCodeSchema = z.object({
	code: z
		.string()
		.min(1, mfaErrors.codeRequired)
		.length(mfaConstants.totpCodeLength, mfaErrors.codeLength)
		.regex(/^\d+$/, mfaErrors.codeNumeric),
})

const disableMfaSchema = z.object({
	password: z.string().min(1, mfaErrors.passwordRequired),
	mfaCode: z.string().optional(),
})

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>
type DisableMfaFormData = z.infer<typeof disableMfaSchema>

// ============================================================================
// TYPES
// ============================================================================

interface TwoFactorSetupCardProps {
	/** Whether MFA is currently enabled for the user */
	isMfaEnabled: boolean
	/** Callback when MFA status changes (for parent state sync) */
	onStatusChange?: () => void | Promise<void>
}

type SetupStep = 'idle' | 'scanning' | 'backup-codes' | 'disable-confirm'

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TwoFactorSetupCard Component
 *
 * Handles the complete 2FA enrollment and management flow.
 */
export default function TwoFactorSetupCard({ isMfaEnabled, onStatusChange }: TwoFactorSetupCardProps) {
	// ========================================================================
	// STATE
	// ========================================================================

	const [setupStep, setSetupStep] = useState<SetupStep>('idle')
	const [qrUri, setQrUri] = useState<string>('')
	const [secret, setSecret] = useState<string>('')
	const [backupCodes, setBackupCodes] = useState<string[]>([])
	const [isStartingSetup, setIsStartingSetup] = useState(false)

	const [secretCopied, copyToClipboard] = useCopyToClipboard()
	const [backupCodesCopied, copyBackupCodes] = useCopyToClipboard()

	// ========================================================================
	// FORMS
	// ========================================================================

	const verifyForm = useForm<VerifyCodeFormData>({
		resolver: zodResolver(verifyCodeSchema),
		defaultValues: { code: '' },
	})

	const disableForm = useForm<DisableMfaFormData>({
		resolver: zodResolver(disableMfaSchema),
		defaultValues: { password: '', mfaCode: '' },
	})

	// ========================================================================
	// API HANDLERS
	// ========================================================================

	const { submit: submitVerify, isSubmitting: isVerifying } = useFormSubmit(
		async (data: VerifyCodeFormData) => API.Accounts.Mfa.confirmTotpSetup(data.code),
		{
			successMessage: mfaMessages.setupSuccess,
			errorMessage: mfaMessages.setupError,
			componentName: mfaConstants.componentName,
			actionName: 'confirmTotpSetup',
			onSuccess: async (result) => {
				if (result?.backupCodes) {
					setBackupCodes(result.backupCodes)
					setSetupStep('backup-codes')
				}
				await onStatusChange?.()
			},
		}
	)

	const { submit: submitDisable, isSubmitting: isDisabling } = useFormSubmit(
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Empty string should become undefined
		async (data: DisableMfaFormData) => API.Accounts.Mfa.disable(data.password, data.mfaCode || undefined),
		{
			successMessage: mfaMessages.disableSuccess,
			errorMessage: mfaMessages.disableError,
			componentName: mfaConstants.componentName,
			actionName: 'disable',
			onSuccess: async () => {
				setSetupStep('idle')
				disableForm.reset()
				await onStatusChange?.()
			},
		}
	)

	// ========================================================================
	// HANDLERS
	// ========================================================================

	/**
	 * Starts the TOTP setup flow by fetching QR code from backend.
	 */
	const handleStartSetup = useCallback(async () => {
		setIsStartingSetup(true)
		try {
			const response = await API.Accounts.Mfa.startTotpSetup()

			if (response.data.statusCode === 200 && response.data.payload) {
				setQrUri(response.data.payload.otpAuthUri)
				setSecret(response.data.payload.secret)
				setSetupStep('scanning')
			} else {
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Fallback for empty string too
				notificationService.error(response.data.message || mfaMessages.setupError, {
					component: mfaConstants.componentName,
					action: 'startTotpSetup',
				})
			}
		} catch (error) {
			logger.error('Failed to start TOTP setup', {
				component: mfaConstants.componentName,
				action: 'handleStartSetup',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
			notificationService.error(mfaMessages.setupError, {
				component: mfaConstants.componentName,
				action: 'startTotpSetup',
			})
		} finally {
			setIsStartingSetup(false)
		}
	}, [])

	/**
	 * Handles verify form submission.
	 */
	const handleVerifySubmit = useCallback(
		(data: VerifyCodeFormData): void => {
			void submitVerify(data).catch((error) => {
				logger.error('Unhandled verify submission error', {
					error,
					component: mfaConstants.componentName,
					action: 'handleVerifySubmit',
				})
			})
		},
		[submitVerify]
	)

	/**
	 * Handles disable form submission.
	 */
	const handleDisableSubmit = useCallback(
		(data: DisableMfaFormData): void => {
			void submitDisable(data).catch((error) => {
				logger.error('Unhandled disable submission error', {
					error,
					component: mfaConstants.componentName,
					action: 'handleDisableSubmit',
				})
			})
		},
		[submitDisable]
	)

	/**
	 * Form onSubmit handler for verify form.
	 */
	const onVerifyFormSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			const submitHandler = verifyForm.handleSubmit(handleVerifySubmit)
			const result = submitHandler(e)
			if (result instanceof Promise) {
				void result.catch((error) => {
					logger.error('Unhandled form submission error', {
						error,
						component: mfaConstants.componentName,
						action: 'onVerifyFormSubmit',
					})
				})
			}
		},
		[verifyForm, handleVerifySubmit]
	)

	/**
	 * Form onSubmit handler for disable form.
	 */
	const onDisableFormSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			const submitHandler = disableForm.handleSubmit(handleDisableSubmit)
			const result = submitHandler(e)
			if (result instanceof Promise) {
				void result.catch((error) => {
					logger.error('Unhandled form submission error', {
						error,
						component: mfaConstants.componentName,
						action: 'onDisableFormSubmit',
					})
				})
			}
		},
		[disableForm, handleDisableSubmit]
	)

	/**
	 * Copies secret to clipboard.
	 */
	const handleCopySecret = useCallback(() => {
		void copyToClipboard(secret)
	}, [copyToClipboard, secret])

	/**
	 * Copies all backup codes to clipboard.
	 */
	const handleCopyBackupCodes = useCallback(() => {
		void copyBackupCodes(backupCodes.join('\n'))
		notificationService.success(mfaMessages.backupCodesSaved, {
			component: mfaConstants.componentName,
			action: 'copyBackupCodes',
		})
	}, [copyBackupCodes, backupCodes])

	/**
	 * Closes setup flow and resets state.
	 */
	const handleCancel = useCallback(() => {
		setSetupStep('idle')
		setQrUri('')
		setSecret('')
		setBackupCodes([])
		verifyForm.reset()
		disableForm.reset()
	}, [verifyForm, disableForm])

	/**
	 * Completes setup after viewing backup codes.
	 */
	const handleDone = useCallback(() => {
		handleCancel()
	}, [handleCancel])

	// ========================================================================
	// RENDER: STATUS DISPLAY (When idle)
	// ========================================================================

	if (setupStep === 'idle') {
		return (
			<div className='space-y-4'>
				{/* Status indicator */}
				<div className='flex items-center justify-between p-4 rounded-lg bg-base-200/50'>
					<div className='flex items-center gap-3'>
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-lg ${
								isMfaEnabled ? 'bg-success/10' : 'bg-warning/10'
							}`}>
							<Shield className={`h-5 w-5 ${isMfaEnabled ? 'text-success' : 'text-warning'}`} />
						</div>
						<div>
							<h3 className='font-medium text-base-content'>Two-Factor Authentication</h3>
							<p className={`text-sm ${isMfaEnabled ? 'text-success' : 'text-base-content/60'}`}>
								{isMfaEnabled ? mfaMessages.enabledStatus : mfaMessages.disabledStatus}
							</p>
						</div>
					</div>

					<Button
						variant={isMfaEnabled ? 'error' : 'primary'}
						size='sm'
						onClick={isMfaEnabled ? () => setSetupStep('disable-confirm') : handleStartSetup}
						loading={isStartingSetup}
						disabled={isStartingSetup}>
						{isMfaEnabled ? mfaMessages.btnDisable : mfaMessages.btnEnable}
					</Button>
				</div>

				{/* Info text */}
				{!isMfaEnabled && (
					<p className='text-sm text-base-content/60'>
						Add an extra layer of security to your account by requiring a verification code from your
						authenticator app when signing in.
					</p>
				)}
			</div>
		)
	}

	// ========================================================================
	// RENDER: SETUP MODAL (QR Code + Verify)
	// ========================================================================

	if (setupStep === 'scanning') {
		return (
			<Modal
				isOpen={true}
				onClose={handleCancel}
				title={mfaMessages.setupTitle}
				size='md'
				closeOnOverlayClick={false}>
				<div className='space-y-6'>
					{/* Step 1: QR Code */}
					<div className='text-center space-y-6'>
						<p className='text-sm text-base-content/70'>{mfaMessages.setupDescription}</p>

						{/* QR Code Display - MAANG-level visual polish */}
						<div className='flex justify-center'>
							<div className='relative group'>
								<div className='absolute -inset-1 bg-linear-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200'></div>
								<div className='relative p-4 bg-white rounded-xl shadow-lg ring-1 ring-base-content/5'>
									{qrUri ? (
										<QRCodeSVG
											value={qrUri}
											size={192}
											level='M'
											marginSize={0}
											className='w-48 h-48'
										/>
									) : (
										<div className='w-48 h-48 flex items-center justify-center bg-base-200 rounded'>
											<QrCode className='h-12 w-12 text-base-content/30' />
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Manual entry secret - Monospace & Grouped */}
						<div className='mt-4 p-4 bg-base-200/50 rounded-lg border border-base-200'>
							<p className='text-xs text-base-content/60 mb-3 font-medium uppercase tracking-wider'>
								{mfaMessages.manualEntryHelp}
							</p>
							<div className='flex flex-col items-center gap-3'>
								<code className='px-4 py-2 bg-base-100 rounded-lg text-lg font-mono font-bold text-primary tracking-widest shadow-sm ring-1 ring-base-content/5'>
									{secret.match(/.{1,4}/g)?.join(' ') ?? secret}
								</code>
								<Button
									variant='ghost'
									size='sm'
									onClick={handleCopySecret}
									leftIcon={
										secretCopied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />
									}
									className='text-xs'>
									{secretCopied ? 'Copied' : mfaMessages.btnCopySecret}
								</Button>
							</div>
						</div>
					</div>

					{/* Step 2: Verify Code */}
					<form
						onSubmit={onVerifyFormSubmit}
						className='space-y-6'>
						<div className='space-y-4'>
							<div className='flex items-center justify-center gap-2 text-base-content/80'>
								<Smartphone className='h-4 w-4' />
								<span className='text-sm font-medium'>{mfaMessages.verifyCodeHelp}</span>
							</div>

							<OneTimeCodeInput
								value={verifyForm.watch('code')}
								onChange={(val) => {
									verifyForm.setValue('code', val, { shouldValidate: true })
									if (val.length === 6) {
										void verifyForm.handleSubmit(handleVerifySubmit)()
									}
								}}
								onComplete={(code) => {
									verifyForm.setValue('code', code, { shouldValidate: true })
									void verifyForm.handleSubmit(handleVerifySubmit)()
								}}
								error={!!verifyForm.formState.errors.code}
								disabled={isVerifying}
								autoFocus // eslint-disable-line jsx-a11y/no-autofocus -- Intentional: Focus OTP for faster entry
							/>

							{verifyForm.formState.errors.code && (
								<p className='text-error text-sm text-center font-medium animate-pulse'>
									{verifyForm.formState.errors.code.message}
								</p>
							)}
						</div>

						<div className='flex gap-3 justify-end pt-2 border-t border-base-200 mt-6'>
							<Button
								type='button'
								variant='ghost'
								onClick={handleCancel}
								disabled={isVerifying}>
								{mfaMessages.btnCancel}
							</Button>
							<Button
								type='submit'
								variant='primary'
								loading={isVerifying}
								disabled={isVerifying || verifyForm.watch('code').length !== 6}
								leftIcon={<Shield className='h-4 w-4' />}>
								{mfaMessages.btnVerify}
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		)
	}

	// ========================================================================
	// RENDER: BACKUP CODES MODAL
	// ========================================================================

	if (setupStep === 'backup-codes') {
		return (
			<Modal
				isOpen={true}
				onClose={handleDone}
				title={mfaMessages.backupCodesTitle}
				size='md'
				closeOnOverlayClick={false}
				closeOnEscape={false}>
				<div className='space-y-6'>
					{/* Warning */}
					<div className='flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg'>
						<AlertTriangle className='h-5 w-5 text-warning mt-0.5 shrink-0' />
						<p className='text-sm text-base-content'>{mfaMessages.backupCodesWarning}</p>
					</div>

					{/* Backup codes grid */}
					<div className='grid grid-cols-2 gap-2 p-4 bg-base-200/50 rounded-lg font-mono text-sm'>
						{backupCodes.map((code, index) => (
							<div
								key={index}
								className='flex items-center gap-2 p-2 bg-base-100 rounded'>
								<Key className='h-4 w-4 text-base-content/40 shrink-0' />
								<span className='text-base-content'>{code}</span>
							</div>
						))}
					</div>

					{/* Actions */}
					<div className='flex gap-3 justify-end'>
						<Button
							variant='outline'
							onClick={handleCopyBackupCodes}
							leftIcon={backupCodesCopied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}>
							{backupCodesCopied ? 'Copied!' : mfaMessages.btnCopyCodes}
						</Button>
						<Button
							variant='primary'
							onClick={handleDone}>
							{mfaMessages.btnDone}
						</Button>
					</div>
				</div>
			</Modal>
		)
	}

	// ========================================================================
	// RENDER: DISABLE CONFIRMATION MODAL
	// ========================================================================

	if (setupStep === 'disable-confirm') {
		return (
			<Modal
				isOpen={true}
				onClose={handleCancel}
				title={mfaMessages.disableTitle}
				size='sm'>
				<div className='space-y-6'>
					{/* Warning */}
					<div className='flex items-start gap-3 p-4 bg-error/10 border border-error/30 rounded-lg'>
						<AlertTriangle className='h-5 w-5 text-error mt-0.5 shrink-0' />
						<p className='text-sm text-base-content'>{mfaMessages.disableWarning}</p>
					</div>

					{/* Disable form */}
					<form
						onSubmit={onDisableFormSubmit}
						className='space-y-4'>
						<FormInput
							label={mfaMessages.disablePasswordLabel}
							type='password'
							autoComplete='current-password'
							{...disableForm.register('password')}
							error={disableForm.formState.errors.password}
							disabled={isDisabling}
						/>

						<FormInput
							label={mfaMessages.disableCodeLabel}
							type='text'
							inputMode='numeric'
							pattern='[0-9]*'
							autoComplete='one-time-code'
							placeholder='000000'
							maxLength={mfaConstants.totpCodeLength}
							{...disableForm.register('mfaCode')}
							error={disableForm.formState.errors.mfaCode}
							disabled={isDisabling}
							helperText='Enter your authenticator code for additional verification'
						/>

						<div className='flex gap-3 justify-end pt-2'>
							<Button
								type='button'
								variant='ghost'
								onClick={handleCancel}
								disabled={isDisabling}>
								{mfaMessages.btnCancel}
							</Button>
							<Button
								type='submit'
								variant='error'
								loading={isDisabling}
								disabled={isDisabling}>
								{mfaMessages.btnConfirmDisable}
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		)
	}

	return null
}
