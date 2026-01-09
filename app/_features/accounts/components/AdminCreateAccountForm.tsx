'use client'

/**
 * AdminCreateAccountForm Component - MAANG-Level Implementation
 *
 * Admin-only form for creating new user accounts with specified roles.
 * Supports staff account creation, role assignment, and invitation emails.
 *
 * **MAANG Best Practices:**
 * - Uses centralized validation schema (adminCreateAccountSchema from @_core)
 * - Uses centralized password strength utility (checkPasswordStrength from @_shared)
 * - Uses React Hook Form with Zod validation (useZodForm)
 * - Permission preview for role selection
 * - Confirmation step for high-privilege roles (Admin)
 * - Keyboard shortcuts (Ctrl/Cmd+Enter to submit)
 * - Success state with copy-to-clipboard
 * - "Create Another Similar" for batch creation efficiency
 *
 * **RBAC Integration:**
 * - Only accessible by admins (checked by parent component/page)
 * - Uses centralized role constants
 *
 * @module features/accounts/components/AdminCreateAccountForm
 */

import { useState, useEffect, useCallback, useRef } from 'react'

import { useRouter } from 'next/navigation'

import {
	Mail,
	User,
	Shield,
	Key,
	Send,
	CheckCircle2,
	Copy,
	AlertTriangle,
	UserPlus,
	Sparkles,
	Eye,
	EyeOff,
} from 'lucide-react'

import { Routes } from '@_features/navigation'

import { logger, adminCreateAccountSchema, type AdminCreateAccountFormData } from '@_core'

import {
	notificationService,
	API,
	DEFAULT_ROLE_METADATA,
	DEFAULT_ROLE_THRESHOLDS,
	getRoleDisplayName,
	translateError,
	useZodForm,
	useFormSubmit,
	checkPasswordStrength,
	type RoleMetadataEntry,
	type AdminCreateAccountRequest,
	type AdminCreateAccountResponse,
} from '@_shared'

import { RoleLevels } from '@_types/rbac'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import Checkbox from '@_components/ui/Checkbox'
import Input from '@_components/ui/Input'
import Modal from '@_components/ui/Modal'
import FormCheckbox from '@_components/forms/FormCheckbox'

import RoleSelectionCard from './RoleSelectionCard'

// ============================================================================
// TYPES
// ============================================================================

type FormStep = 'form' | 'confirm' | 'success'

/** Extended form data that maps between schema (string role) and UI (number role) */
interface FormDataInternal {
	email: string
	username: string
	firstName: string
	lastName: string
	role: number
	temporaryPassword: string
	sendInvitationEmail: boolean
}

export interface AdminCreateAccountFormProps {
	/** Optional callback after successful account creation */
	onSuccess?: (response: AdminCreateAccountResponse) => void
	/** Optional callback to cancel/go back */
	onCancel?: () => void
}

// ============================================================================
// HELPERS
// ============================================================================

/** Convert role name string to number */
function roleStringToNumber(role: string): number {
	switch (role) {
		case 'Admin':
			return RoleLevels.Admin
		case 'SalesManager':
			return RoleLevels.SalesManager
		case 'SalesRep':
			return RoleLevels.SalesRep
		case 'Customer':
		default:
			return RoleLevels.Customer
	}
}

/** Convert role number to role name string */
function roleNumberToString(role: number): string {
	switch (role) {
		case RoleLevels.Admin:
			return 'Admin'
		case RoleLevels.SalesManager:
			return 'SalesManager'
		case RoleLevels.SalesRep:
			return 'SalesRep'
		case RoleLevels.Customer:
		default:
			return 'Customer'
	}
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminCreateAccountForm({ onSuccess, onCancel }: AdminCreateAccountFormProps) {
	const router = useRouter()

	// Local form state (uses number for role internally)
	const [formData, setFormData] = useState<FormDataInternal>({
		email: '',
		username: '',
		firstName: '',
		lastName: '',
		role: RoleLevels.Customer,
		temporaryPassword: '',
		sendInvitationEmail: true,
	})

	// React Hook Form with Zod validation (for email validation only)
	const form = useZodForm(adminCreateAccountSchema, {
		defaultValues: {
			email: '',
			username: '',
			firstName: '',
			lastName: '',
			role: 'Customer',
			temporaryPassword: '',
			sendInvitationEmail: true,
		},
		mode: 'onChange',
	})

	// Watch form values for UI updates
	const email = form.watch('email')
	const temporaryPassword = form.watch('temporaryPassword')
	const sendInvitation = form.watch('sendInvitationEmail')

	// UI state
	const [step, setStep] = useState<FormStep>('form')
	const [showPassword, setShowPassword] = useState(false)
	const [createdAccount, setCreatedAccount] = useState<AdminCreateAccountResponse | null>(null)
	const [copiedField, setCopiedField] = useState<string | null>(null)
	const [confirmChecked, setConfirmChecked] = useState(false)

	// Derived state
	const isFormValid = form.formState.isValid
	const needsConfirmation = formData.role >= DEFAULT_ROLE_THRESHOLDS.adminThreshold
	const passwordStrength = temporaryPassword ? checkPasswordStrength(temporaryPassword) : null

	// Refs to avoid stale closures in useFormSubmit callback (React 19 best practice)
	const formDataRef = useRef(formData)
	const confirmCheckedRef = useRef(confirmChecked)
	const needsConfirmationRef = useRef(needsConfirmation)
	const emailRef = useRef(email)
	const onSuccessRef = useRef(onSuccess)

	// Keep refs in sync with state
	useEffect(() => {
		formDataRef.current = formData
		confirmCheckedRef.current = confirmChecked
		needsConfirmationRef.current = needsConfirmation
		emailRef.current = email
		onSuccessRef.current = onSuccess
	}, [formData, confirmChecked, needsConfirmation, email, onSuccess])

	// Keyboard shortcut: Ctrl/Cmd+Enter to submit
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
				if (isFormValid && !form.formState.isSubmitting && step === 'form') {
					e.preventDefault()
					handleNext()
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isFormValid, form.formState.isSubmitting, step])

	// Handle role selection
	const handleRoleSelect = useCallback(
		(role: number) => {
			setFormData((prev) => ({ ...prev, role }))
			form.setValue('role', roleNumberToString(role), { shouldValidate: true })
			// Reset confirmation when role changes
			setConfirmChecked(false)
		},
		[form]
	)

	// Handle next step
	const handleNext = () => {
		if (needsConfirmation && step === 'form') {
			setStep('confirm')
		} else {
			void form.handleSubmit(handleFormSubmit)()
		}
	}

	// Form submission callback - uses refs to avoid stale closures
	const submitCallback = useCallback(async (data: AdminCreateAccountFormData) => {
		if (needsConfirmationRef.current && !confirmCheckedRef.current) {
			throw new Error('Please confirm the admin role assignment')
		}

		const request: AdminCreateAccountRequest = {
			email: data.email.trim(),
			username: data.username?.trim() || undefined,
			firstName: data.firstName?.trim() || undefined,
			lastName: data.lastName?.trim() || undefined,
			role: formDataRef.current.role,
			temporaryPassword: data.temporaryPassword?.trim() || undefined,
			sendInvitationEmail: data.sendInvitationEmail,
		}

		return API.Accounts.adminCreate(request)
	}, [])

	// Success handler callback
	const handleSubmitSuccess = useCallback((result: AdminCreateAccountResponse | null) => {
		// API returns ApiResponse<T> with payload, message, statusCode
		const data = result as unknown as {
			statusCode: number
			payload: AdminCreateAccountResponse
			message?: string
		}
		if (data.statusCode === 200 && data.payload) {
			setCreatedAccount(data.payload)
			setStep('success')
			onSuccessRef.current?.(data.payload)
		} else {
			// Translate backend message keys to user-friendly messages
			const errorMessage = data.message
			const isPasswordError = errorMessage?.toLowerCase().includes('password')
			const fallbackMessage = isPasswordError
				? 'Password does not meet security requirements. Please ensure it has at least 8 characters, includes uppercase and lowercase letters, a number, and a special character.'
				: 'Failed to create account. Please try again.'

			notificationService.error(translateError(errorMessage, fallbackMessage), {
				component: 'AdminCreateAccountForm',
				action: 'create',
			})
		}
	}, [])

	// Form submission with useFormSubmit hook
	const { submit, isSubmitting } = useFormSubmit(submitCallback, {
		successMessage: `Account created successfully for ${emailRef.current}`,
		errorMessage: 'Failed to create account',
		componentName: 'AdminCreateAccountForm',
		actionName: 'create',
		onSuccess: handleSubmitSuccess,
		onError: (error) => {
			logger.error('Admin account creation error', { error })
		},
	})

	// Form submit handler
	const handleFormSubmit = useCallback(
		async (data: AdminCreateAccountFormData) => {
			await submit(data)
		},
		[submit]
	)

	// Handle copy to clipboard
	const handleCopy = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopiedField(field)
			setTimeout(() => setCopiedField(null), 2000)
			notificationService.info('Copied to clipboard')
		} catch {
			notificationService.error('Failed to copy')
		}
	}

	// Handle cancel
	const handleCancel = () => {
		if (onCancel) {
			onCancel()
		} else {
			router.push(Routes.Accounts.location)
		}
	}

	// Handle create another (same role for efficiency)
	const handleCreateAnotherSimilar = () => {
		const previousRole = formData.role
		form.reset({
			email: '',
			username: '',
			firstName: '',
			lastName: '',
			role: roleNumberToString(previousRole),
			temporaryPassword: '',
			sendInvitationEmail: true,
		})
		setFormData((prev) => ({
			...prev,
			email: '',
			username: '',
			firstName: '',
			lastName: '',
			temporaryPassword: '',
			sendInvitationEmail: true,
		}))
		setCreatedAccount(null)
		setConfirmChecked(false)
		setStep('form')
		notificationService.info(`Creating another ${getRoleDisplayName(previousRole)}`)
	}

	// Handle create another (fresh)
	const handleCreateAnother = () => {
		form.reset({
			email: '',
			username: '',
			firstName: '',
			lastName: '',
			role: 'Customer',
			temporaryPassword: '',
			sendInvitationEmail: true,
		})
		setFormData({
			email: '',
			username: '',
			firstName: '',
			lastName: '',
			role: RoleLevels.Customer,
			temporaryPassword: '',
			sendInvitationEmail: true,
		})
		setCreatedAccount(null)
		setConfirmChecked(false)
		setStep('form')
	}

	// Generate random password
	const handleGeneratePassword = () => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
		let password = ''
		// Ensure at least one of each type
		password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
		password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
		password += '0123456789'[Math.floor(Math.random() * 10)]
		password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
		// Fill rest
		for (let i = 4; i < 12; i++) {
			password += chars[Math.floor(Math.random() * chars.length)]
		}
		// Shuffle
		const shuffled = password
			.split('')
			.sort(() => Math.random() - 0.5)
			.join('')
		form.setValue('temporaryPassword', shuffled, { shouldValidate: true })
		setShowPassword(true)
		notificationService.info('Password generated')
	}

	// ========================================================================
	// RENDER: SUCCESS STATE
	// ========================================================================
	if (step === 'success' && createdAccount) {
		const roleMetadata = DEFAULT_ROLE_METADATA[createdAccount.account.roleLevel as keyof typeof DEFAULT_ROLE_METADATA]

		return (
			<Card className='border border-success/30 bg-success/5 p-6'>
				<div className='flex items-start gap-4'>
					<div className='rounded-full bg-success/10 p-3'>
						<CheckCircle2 className='h-8 w-8 text-success' />
					</div>
					<div className='flex-1 space-y-4'>
						<div>
							<h2 className='text-xl font-semibold text-base-content'>Account Created Successfully</h2>
							<p className='mt-1 text-base-content/70'>
								The account has been created and is ready to use.
							</p>
						</div>

						{/* Account Details */}
						<div className='grid gap-3 rounded-lg border border-base-300 bg-base-100 p-4'>
							<div className='flex items-center justify-between'>
								<span className='text-sm text-base-content/60'>Email</span>
								<div className='flex items-center gap-2'>
									<span className='font-medium'>{createdAccount.account.email}</span>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => handleCopy(createdAccount.account.email ?? '', 'email')}
										className='h-7 w-7 p-0'>
										{copiedField === 'email' ? (
											<CheckCircle2 className='h-4 w-4 text-success' />
										) : (
											<Copy className='h-4 w-4' />
										)}
									</Button>
								</div>
							</div>

							<div className='flex items-center justify-between'>
								<span className='text-sm text-base-content/60'>Username</span>
								<span className='font-medium'>{createdAccount.account.username}</span>
							</div>

							<div className='flex items-center justify-between'>
								<span className='text-sm text-base-content/60'>Role</span>
								<div className='flex items-center gap-2'>
									<span className='font-medium'>{roleMetadata?.display ?? 'Unknown'}</span>
								</div>
							</div>

							{createdAccount.temporaryPassword && (
								<div className='flex items-center justify-between rounded border border-warning/20 bg-warning/10 p-2'>
									<div>
										<span className='text-sm text-base-content/60'>Temporary Password</span>
										<p className='font-mono font-medium'>{createdAccount.temporaryPassword}</p>
									</div>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => handleCopy(createdAccount.temporaryPassword!, 'password')}
										className='h-7 w-7 p-0'>
										{copiedField === 'password' ? (
											<CheckCircle2 className='h-4 w-4 text-success' />
										) : (
											<Copy className='h-4 w-4' />
										)}
									</Button>
								</div>
							)}

							<div className='flex items-center justify-between'>
								<span className='text-sm text-base-content/60'>Invitation Email</span>
								<span
									className={
										createdAccount.invitationEmailSent ? 'text-success' : 'text-base-content/50'
									}>
									{createdAccount.invitationEmailSent ? '✓ Sent' : 'Not sent'}
								</span>
							</div>
						</div>

						{createdAccount.temporaryPassword && (
							<div className='flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/10 p-3'>
								<AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-warning' />
								<p className='text-sm text-base-content/80'>
									<strong>Important:</strong> Copy the temporary password now. It will not be shown
									again. Share it securely with the user.
								</p>
							</div>
						)}

						{/* Actions */}
						<div className='flex flex-wrap gap-3 pt-2'>
							<Button
								variant='primary'
								onClick={handleCreateAnotherSimilar}>
								<UserPlus className='mr-2 h-4 w-4' />
								Create Another {roleMetadata?.display}
							</Button>
							<Button
								variant='secondary'
								onClick={handleCreateAnother}>
								<Sparkles className='mr-2 h-4 w-4' />
								New Account Type
							</Button>
							<Button
								variant='ghost'
								onClick={() => router.push(Routes.Accounts.detail(createdAccount.account.id ?? ''))}>
								View Account
							</Button>
							<Button
								variant='ghost'
								onClick={() => router.push(Routes.Accounts.location)}>
								Back to Accounts
							</Button>
						</div>
					</div>
				</div>
			</Card>
		)
	}

	// ========================================================================
	// RENDER: CONFIRMATION MODAL (for Admin role)
	// ========================================================================
	const confirmationModal = (
		<Modal
			isOpen={step === 'confirm'}
			onClose={() => setStep('form')}
			title='Confirm Administrator Access'
			size='md'>
			<div className='space-y-4'>
				<div className='flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 p-4'>
					<AlertTriangle className='mt-0.5 h-6 w-6 shrink-0 text-error' />
					<div>
						<h3 className='font-semibold text-base-content'>High-Privilege Role Warning</h3>
						<p className='mt-1 text-sm text-base-content/70'>
							You are about to create an <strong>Administrator</strong> account. This role has{' '}
							<strong>unrestricted access</strong> to the entire system, including:
						</p>
						<ul className='mt-2 space-y-1 text-sm text-base-content/70'>
							<li>• Full access to all user data</li>
							<li>• Ability to modify or delete any entity</li>
							<li>• User role management (including creating other admins)</li>
							<li>• System configuration access</li>
						</ul>
					</div>
				</div>

				<div className='rounded-lg border border-base-300 bg-base-200/50 p-3'>
					<p className='text-sm text-base-content/70'>
						Creating admin for: <strong>{email}</strong>
					</p>
				</div>

				<div className='rounded-lg border border-base-300 p-3 transition-colors hover:bg-base-200/50'>
					<Checkbox
						checked={confirmChecked}
						onChange={(e) => setConfirmChecked(e.target.checked)}
						label='I confirm this user should have Administrator access'
						helperText='I understand the security implications of this action.'
						className='checkbox-error'
					/>
				</div>

				<div className='flex justify-end gap-3 pt-2'>
					<Button
						variant='ghost'
						onClick={() => setStep('form')}>
						Go Back
					</Button>
					<Button
						variant='error'
						onClick={() => void form.handleSubmit(handleFormSubmit)()}
						disabled={!confirmChecked}
						loading={isSubmitting}
						leftIcon={<Shield className='h-4 w-4' />}>
						Create Administrator
					</Button>
				</div>
			</div>
		</Modal>
	)

	// ========================================================================
	// RENDER: FORM STATE
	// ========================================================================
	return (
		<>
			{confirmationModal}

			<div className='space-y-6'>
				{/* Email & Username */}
				<Card className='border border-base-300 p-6'>
					<div className='mb-6 flex items-center gap-3'>
						<div className='rounded-lg bg-primary/10 p-2.5'>
							<Mail className='h-5 w-5 text-primary' />
						</div>
						<div>
							<h2 className='text-lg font-semibold'>Account Information</h2>
							<p className='text-sm text-base-content/60'>
								Email is required. Username defaults to email if not provided.
							</p>
						</div>
					</div>

					<div className='grid gap-4 sm:grid-cols-2'>
						<div className='space-y-1'>
							<label
								htmlFor='admin-create-email'
								className='text-sm font-medium text-base-content'>
								Email Address <span className='text-error'>*</span>
							</label>
							<Input
								id='admin-create-email'
								type='email'
								{...form.register('email')}
								placeholder='user@example.com'
								leftIcon={<Mail className='h-4 w-4' />}
								error={!!form.formState.errors.email}
								errorMessage={form.formState.errors.email?.message}
								required
							/>
						</div>
						<div className='space-y-1'>
							<label
								htmlFor='admin-create-username'
								className='text-sm font-medium text-base-content'>
								Username (optional)
							</label>
							<Input
								id='admin-create-username'
								{...form.register('username')}
								placeholder='Defaults to email'
								leftIcon={<User className='h-4 w-4' />}
								helperText='If empty, email will be used as username'
								error={!!form.formState.errors.username}
								errorMessage={form.formState.errors.username?.message}
							/>
						</div>
					</div>

					<div className='mt-4 grid gap-4 sm:grid-cols-2'>
						<div className='space-y-1'>
							<label
								htmlFor='admin-create-firstname'
								className='text-sm font-medium text-base-content'>
								First Name (optional)
							</label>
							<Input
								id='admin-create-firstname'
								{...form.register('firstName')}
								placeholder='John'
								error={!!form.formState.errors.firstName}
								errorMessage={form.formState.errors.firstName?.message}
							/>
						</div>
						<div className='space-y-1'>
							<label
								htmlFor='admin-create-lastname'
								className='text-sm font-medium text-base-content'>
								Last Name (optional)
							</label>
							<Input
								id='admin-create-lastname'
								{...form.register('lastName')}
								placeholder='Doe'
								error={!!form.formState.errors.lastName}
								errorMessage={form.formState.errors.lastName?.message}
							/>
						</div>
					</div>
				</Card>

				{/* Role Selection */}
				<Card className='border border-base-300 p-6'>
					<div className='mb-6 flex items-center gap-3'>
						<div className='rounded-lg bg-secondary/10 p-2.5'>
							<Shield className='h-5 w-5 text-secondary' />
						</div>
						<div>
							<h2 className='text-lg font-semibold'>Role Assignment</h2>
							<p className='text-sm text-base-content/60'>
								Select the role for this account. Click to expand and view permissions.
							</p>
						</div>
					</div>

					<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
						{Object.values(DEFAULT_ROLE_METADATA).map((role: RoleMetadataEntry) => (
							<RoleSelectionCard
								key={role.level}
								role={role}
								isSelected={formData.role === role.level}
								onSelect={handleRoleSelect}
							/>
						))}
					</div>
				</Card>

				{/* Password & Invitation */}
				<Card className='border border-base-300 p-6'>
					<div className='mb-6 flex items-center gap-3'>
						<div className='rounded-lg bg-accent/10 p-2.5'>
							<Key className='h-5 w-5 text-accent' />
						</div>
						<div>
							<h2 className='text-lg font-semibold'>Password & Invitation</h2>
							<p className='text-sm text-base-content/60'>
								Set a temporary password or let the system generate one.
							</p>
						</div>
					</div>

					<div className='space-y-4'>
						<div className='flex gap-2'>
							<div className='flex-1 space-y-1'>
								<label
									htmlFor='admin-create-password'
									className='text-sm font-medium text-base-content'>
									Temporary Password (optional)
								</label>
								<Input
									id='admin-create-password'
									type={showPassword ? 'text' : 'password'}
									{...form.register('temporaryPassword')}
									placeholder='Leave empty to auto-generate'
									leftIcon={<Key className='h-4 w-4' />}
									error={!!form.formState.errors.temporaryPassword}
									errorMessage={form.formState.errors.temporaryPassword?.message}
									rightElement={
										<Button
											variant='ghost'
											size='sm'
											onClick={() => setShowPassword(!showPassword)}
											className='h-6 w-6 p-0'
											aria-label={showPassword ? 'Hide password' : 'Show password'}>
											{showPassword ? (
												<EyeOff className='h-4 w-4 text-base-content/50' />
											) : (
												<Eye className='h-4 w-4 text-base-content/50' />
											)}
										</Button>
									}
								/>
							</div>
							<div className='flex items-end'>
								<Button
									variant='secondary'
									size='sm'
									onClick={handleGeneratePassword}
									className='h-10'>
									<Sparkles className='mr-1 h-4 w-4' />
									Generate
								</Button>
							</div>
						</div>

						{passwordStrength && (
							<div className='flex items-center gap-2 text-sm'>
								<span className='text-base-content/60'>Password strength:</span>
								<span className={passwordStrength.color}>{passwordStrength.label}</span>
								<div className='flex gap-1'>
									{[1, 2, 3, 4, 5, 6].map((i) => (
										<div
											key={i}
											className={`h-1 w-4 rounded ${
												i <= passwordStrength.score
													? passwordStrength.score <= 2
														? 'bg-error'
														: passwordStrength.score <= 4
														? 'bg-warning'
														: 'bg-success'
													: 'bg-base-300'
											}`}
										/>
									))}
								</div>
							</div>
						)}

						{!temporaryPassword && (
							<p className='text-xs text-base-content/50'>
								If empty, a secure password will be generated automatically
							</p>
						)}

						<div className='rounded-lg border border-base-300 p-3 transition-colors hover:bg-base-200/50'>
							<FormCheckbox
								{...form.register('sendInvitationEmail')}
								label='Send Invitation Email'
								helperText='User will receive an email with login instructions and temporary password'
							/>
						</div>
					</div>
				</Card>

				{/* Actions */}
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<p className='text-xs text-base-content/50'>
						<kbd className='kbd kbd-xs'>⌘</kbd> + <kbd className='kbd kbd-xs'>Enter</kbd> to submit
					</p>
					<div className='flex flex-wrap gap-3'>
						<Button
							variant='ghost'
							onClick={handleCancel}
							disabled={isSubmitting}>
							Cancel
						</Button>
						<Button
							variant={needsConfirmation ? 'accent' : 'primary'}
							onClick={handleNext}
							loading={isSubmitting}
							disabled={!isFormValid}
							leftIcon={<UserPlus className='h-4 w-4' />}>
							{needsConfirmation ? 'Review & Create' : 'Create Account'}
						</Button>
					</div>
				</div>
			</div>
		</>
	)
}
