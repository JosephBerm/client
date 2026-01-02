'use client'

/**
 * AdminCreateAccountForm Component - MAANG-Level Implementation
 * 
 * Admin-only form for creating new user accounts with specified roles.
 * Supports staff account creation, role assignment, and invitation emails.
 * 
 * **MAANG Best Practices:**
 * - Uses centralized ROLE_OPTIONS (DRY principle)
 * - Permission preview for role selection
 * - Confirmation step for high-privilege roles (Admin)
 * - Keyboard shortcuts (Ctrl/Cmd+Enter to submit)
 * - Comprehensive validation with clear feedback
 * - Success state with copy-to-clipboard
 * - "Create Another Similar" for batch creation efficiency
 * 
 * **RBAC Integration:**
 * - Only accessible by admins (checked by parent component/page)
 * - Uses centralized role constants
 * 
 * @module features/accounts/components/AdminCreateAccountForm
 */

import { useState, useEffect, useCallback } from 'react'

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

import { logger } from '@_core'

import { 
	notificationService, 
	API,
	ROLE_OPTIONS,
	getRoleOption,
	roleRequiresConfirmation,
	translateError,
	type AdminCreateAccountRequest,
	type AdminCreateAccountResponse,
} from '@_shared'

import { AccountRole, type AccountRoleType } from '@_classes/Enums'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import Input from '@_components/ui/Input'
import Modal from '@_components/ui/Modal'

import RoleSelectionCard from './RoleSelectionCard'

// ============================================================================
// TYPES
// ============================================================================

type FormStep = 'form' | 'confirm' | 'success'

export interface AdminCreateAccountFormProps {
	/** Optional callback after successful account creation */
	onSuccess?: (response: AdminCreateAccountResponse) => void
	/** Optional callback to cancel/go back */
	onCancel?: () => void
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Email validation regex (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Password strength checker
 */
function checkPasswordStrength(password: string): {
	score: number
	label: string
	color: string
} {
	let score = 0
	if (password.length >= 8) score++
	if (password.length >= 12) score++
	if (/[A-Z]/.test(password)) score++
	if (/[a-z]/.test(password)) score++
	if (/[0-9]/.test(password)) score++
	if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++

	if (score <= 2) return { score, label: 'Weak', color: 'text-error' }
	if (score <= 4) return { score, label: 'Moderate', color: 'text-warning' }
	return { score, label: 'Strong', color: 'text-success' }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminCreateAccountForm({
	onSuccess,
	onCancel,
}: AdminCreateAccountFormProps) {
	const router = useRouter()

	// Form state
	const [email, setEmail] = useState('')
	const [username, setUsername] = useState('')
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [selectedRole, setSelectedRole] = useState<AccountRoleType>(AccountRole.Customer)
	const [temporaryPassword, setTemporaryPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [sendInvitation, setSendInvitation] = useState(true)
	
	// UI state
	const [step, setStep] = useState<FormStep>('form')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [createdAccount, setCreatedAccount] = useState<AdminCreateAccountResponse | null>(null)
	const [copiedField, setCopiedField] = useState<string | null>(null)
	const [confirmChecked, setConfirmChecked] = useState(false)

	// Form validation
	const isEmailValid = EMAIL_REGEX.test(email)
	const isFormValid = email.trim() !== '' && isEmailValid
	const needsConfirmation = roleRequiresConfirmation(selectedRole)
	const passwordStrength = temporaryPassword ? checkPasswordStrength(temporaryPassword) : null

	// Keyboard shortcut: Ctrl/Cmd+Enter to submit
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
				if (isFormValid && !isSubmitting && step === 'form') {
					e.preventDefault()
					handleNext()
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isFormValid, isSubmitting, step])

	// Handle role selection
	const handleRoleSelect = useCallback((role: AccountRoleType) => {
		setSelectedRole(role)
		// Reset confirmation when role changes
		setConfirmChecked(false)
	}, [])

	// Handle next step
	const handleNext = () => {
		if (needsConfirmation && step === 'form') {
			setStep('confirm')
		} else {
			void handleSubmit()
		}
	}

	// Handle form submission
	const handleSubmit = async () => {
		if (!isFormValid || isSubmitting) return
		if (needsConfirmation && !confirmChecked) {
			notificationService.warning('Please confirm the admin role assignment')
			return
		}

		setIsSubmitting(true)
		try {
			const request: AdminCreateAccountRequest = {
				email: email.trim(),
				username: username.trim() || undefined,
				firstName: firstName.trim() || undefined,
				lastName: lastName.trim() || undefined,
				role: selectedRole,
				temporaryPassword: temporaryPassword.trim() || undefined,
				sendInvitationEmail: sendInvitation,
			}

			const { data } = await API.Accounts.adminCreate(request)

			// API returns ApiResponse<T> with payload, message, statusCode
			if (data.statusCode === 200 && data.payload) {
				setCreatedAccount(data.payload)
				setStep('success')
				notificationService.success(
					`Account created successfully for ${email}`,
					{ component: 'AdminCreateAccountForm', action: 'create' }
				)
				onSuccess?.(data.payload)
			} else {
				// Translate backend message keys to user-friendly messages
				// Provide helpful fallback for password errors
				const errorMessage = data.message
				const isPasswordError = errorMessage?.toLowerCase().includes('password')
				const fallbackMessage = isPasswordError
					? 'Password does not meet security requirements. Please ensure it has at least 8 characters, includes uppercase and lowercase letters, a number, and a special character.'
					: 'Failed to create account. Please try again.'
				
				notificationService.error(
					translateError(errorMessage, fallbackMessage),
					{ component: 'AdminCreateAccountForm', action: 'create' }
				)
			}
		} catch (error) {
			logger.error('Admin account creation error', { error })
			notificationService.error(
				'An error occurred while creating the account',
				{ component: 'AdminCreateAccountForm', action: 'create' }
			)
		} finally {
			setIsSubmitting(false)
		}
	}

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
		const previousRole = selectedRole
		setEmail('')
		setUsername('')
		setFirstName('')
		setLastName('')
		setTemporaryPassword('')
		setSendInvitation(true)
		setCreatedAccount(null)
		setConfirmChecked(false)
		setStep('form')
		// Keep the same role for batch creation efficiency
		setSelectedRole(previousRole)
		notificationService.info(`Creating another ${getRoleOption(previousRole)?.label ?? 'account'}`)
	}

	// Handle create another (fresh)
	const handleCreateAnother = () => {
		setEmail('')
		setUsername('')
		setFirstName('')
		setLastName('')
		setSelectedRole(AccountRole.Customer)
		setTemporaryPassword('')
		setSendInvitation(true)
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
		setTemporaryPassword(password.split('').sort(() => Math.random() - 0.5).join(''))
		setShowPassword(true)
		notificationService.info('Password generated')
	}

	// ========================================================================
	// RENDER: SUCCESS STATE
	// ========================================================================
	if (step === 'success' && createdAccount) {
		const roleOption = getRoleOption(createdAccount.account.role as AccountRoleType)
		
		return (
			<Card className="border border-success/30 bg-success/5 p-6">
				<div className="flex items-start gap-4">
					<div className="p-3 rounded-full bg-success/10">
						<CheckCircle2 className="w-8 h-8 text-success" />
					</div>
					<div className="flex-1 space-y-4">
						<div>
							<h2 className="text-xl font-semibold text-base-content">
								Account Created Successfully
							</h2>
							<p className="text-base-content/70 mt-1">
								The account has been created and is ready to use.
							</p>
						</div>

						{/* Account Details */}
						<div className="grid gap-3 p-4 rounded-lg bg-base-100 border border-base-300">
							<div className="flex items-center justify-between">
								<span className="text-sm text-base-content/60">Email</span>
								<div className="flex items-center gap-2">
									<span className="font-medium">{createdAccount.account.email}</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleCopy(createdAccount.account.email ?? '', 'email')}
										className="h-7 w-7 p-0"
									>
										{copiedField === 'email' ? (
											<CheckCircle2 className="w-4 h-4 text-success" />
										) : (
											<Copy className="w-4 h-4" />
										)}
									</Button>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-sm text-base-content/60">Username</span>
								<span className="font-medium">{createdAccount.account.username}</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-sm text-base-content/60">Role</span>
								<div className="flex items-center gap-2">
									<span className="text-lg">{roleOption?.icon}</span>
									<span className="font-medium">{roleOption?.label ?? 'Unknown'}</span>
								</div>
							</div>

							{createdAccount.temporaryPassword && (
								<div className="flex items-center justify-between p-2 rounded bg-warning/10 border border-warning/20">
									<div>
										<span className="text-sm text-base-content/60">Temporary Password</span>
										<p className="font-mono font-medium">{createdAccount.temporaryPassword}</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleCopy(createdAccount.temporaryPassword!, 'password')}
										className="h-7 w-7 p-0"
									>
										{copiedField === 'password' ? (
											<CheckCircle2 className="w-4 h-4 text-success" />
										) : (
											<Copy className="w-4 h-4" />
										)}
									</Button>
								</div>
							)}

							<div className="flex items-center justify-between">
								<span className="text-sm text-base-content/60">Invitation Email</span>
								<span className={createdAccount.invitationEmailSent ? 'text-success' : 'text-base-content/50'}>
									{createdAccount.invitationEmailSent ? '✓ Sent' : 'Not sent'}
								</span>
							</div>
						</div>

						{createdAccount.temporaryPassword && (
							<div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
								<AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
								<p className="text-sm text-base-content/80">
									<strong>Important:</strong> Copy the temporary password now.
									It will not be shown again. Share it securely with the user.
								</p>
							</div>
						)}

						{/* Actions */}
						<div className="flex flex-wrap gap-3 pt-2">
							<Button variant="primary" onClick={handleCreateAnotherSimilar}>
								<UserPlus className="w-4 h-4 mr-2" />
								Create Another {roleOption?.label}
							</Button>
							<Button variant="secondary" onClick={handleCreateAnother}>
								<Sparkles className="w-4 h-4 mr-2" />
								New Account Type
							</Button>
							<Button 
								variant="ghost" 
								onClick={() => router.push(Routes.Accounts.detail(createdAccount.account.id ?? ''))}
							>
								View Account
							</Button>
							<Button variant="ghost" onClick={() => router.push(Routes.Accounts.location)}>
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
			title="Confirm Administrator Access"
			size="md"
		>
			<div className="space-y-4">
				<div className="flex items-start gap-3 p-4 rounded-lg bg-error/10 border border-error/20">
					<AlertTriangle className="w-6 h-6 text-error shrink-0 mt-0.5" />
					<div>
						<h3 className="font-semibold text-base-content">
							High-Privilege Role Warning
						</h3>
						<p className="text-sm text-base-content/70 mt-1">
							You are about to create an <strong>Administrator</strong> account.
							This role has <strong>unrestricted access</strong> to the entire system, including:
						</p>
						<ul className="mt-2 space-y-1 text-sm text-base-content/70">
							<li>• Full access to all user data</li>
							<li>• Ability to modify or delete any entity</li>
							<li>• User role management (including creating other admins)</li>
							<li>• System configuration access</li>
						</ul>
					</div>
				</div>

				<div className="p-3 rounded-lg bg-base-200/50 border border-base-300">
					<p className="text-sm text-base-content/70">
						Creating admin for: <strong>{email}</strong>
					</p>
				</div>

				<label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-base-300 hover:bg-base-200/50 transition-colors">
					<input
						type="checkbox"
						checked={confirmChecked}
						onChange={(e) => setConfirmChecked(e.target.checked)}
						className="checkbox checkbox-error mt-0.5"
					/>
					<div>
						<span className="font-medium text-base-content">
							I confirm this user should have Administrator access
						</span>
						<p className="text-sm text-base-content/60 mt-0.5">
							I understand the security implications of this action.
						</p>
					</div>
				</label>

				<div className="flex gap-3 justify-end pt-2">
					<Button variant="ghost" onClick={() => setStep('form')}>
						Go Back
					</Button>
					<Button
						variant="error"
						onClick={() => void handleSubmit()}
						disabled={!confirmChecked}
						loading={isSubmitting}
						leftIcon={<Shield className="w-4 h-4" />}
					>
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
			
			<div className="space-y-6">
				{/* Email & Username */}
				<Card className="p-6 border border-base-300">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2.5 rounded-lg bg-primary/10">
							<Mail className="w-5 h-5 text-primary" />
						</div>
						<div>
							<h2 className="text-lg font-semibold">Account Information</h2>
							<p className="text-sm text-base-content/60">
								Email is required. Username defaults to email if not provided.
							</p>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1">
							<label className="text-sm font-medium text-base-content">Email Address <span className="text-error">*</span></label>
							<Input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="user@example.com"
								leftIcon={<Mail className="w-4 h-4" />}
								error={email.length > 0 && !isEmailValid}
								errorMessage="Please enter a valid email address"
								required
							/>
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-base-content">Username (optional)</label>
							<Input
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Defaults to email"
								leftIcon={<User className="w-4 h-4" />}
								helperText="If empty, email will be used as username"
							/>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 mt-4">
						<div className="space-y-1">
							<label className="text-sm font-medium text-base-content">First Name (optional)</label>
							<Input
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="John"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-base-content">Last Name (optional)</label>
							<Input
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder="Doe"
							/>
						</div>
					</div>
				</Card>

				{/* Role Selection */}
				<Card className="p-6 border border-base-300">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2.5 rounded-lg bg-secondary/10">
							<Shield className="w-5 h-5 text-secondary" />
						</div>
						<div>
							<h2 className="text-lg font-semibold">Role Assignment</h2>
							<p className="text-sm text-base-content/60">
								Select the role for this account. Click to expand and view permissions.
							</p>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{ROLE_OPTIONS.map((role) => (
							<RoleSelectionCard
								key={role.value}
								role={role}
								isSelected={selectedRole === role.value}
								onSelect={handleRoleSelect}
								showPermissions
							/>
						))}
					</div>
				</Card>

				{/* Password & Invitation */}
				<Card className="p-6 border border-base-300">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2.5 rounded-lg bg-accent/10">
							<Key className="w-5 h-5 text-accent" />
						</div>
						<div>
							<h2 className="text-lg font-semibold">Password & Invitation</h2>
							<p className="text-sm text-base-content/60">
								Set a temporary password or let the system generate one.
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex gap-2">
							<div className="flex-1 space-y-1">
								<label className="text-sm font-medium text-base-content">Temporary Password (optional)</label>
								<Input
									type={showPassword ? 'text' : 'password'}
									value={temporaryPassword}
									onChange={(e) => setTemporaryPassword(e.target.value)}
									placeholder="Leave empty to auto-generate"
									leftIcon={<Key className="w-4 h-4" />}
									rightElement={
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="p-1 hover:bg-base-200 rounded"
										>
											{showPassword ? (
												<EyeOff className="w-4 h-4 text-base-content/50" />
											) : (
												<Eye className="w-4 h-4 text-base-content/50" />
											)}
										</button>
									}
								/>
							</div>
							<div className="flex items-end">
								<Button
									variant="secondary"
									size="sm"
									onClick={handleGeneratePassword}
									className="h-10"
								>
									<Sparkles className="w-4 h-4 mr-1" />
									Generate
								</Button>
							</div>
						</div>

						{passwordStrength && (
							<div className="flex items-center gap-2 text-sm">
								<span className="text-base-content/60">Password strength:</span>
								<span className={passwordStrength.color}>{passwordStrength.label}</span>
								<div className="flex gap-1">
									{[1, 2, 3, 4, 5, 6].map((i) => (
										<div
											key={i}
											className={`w-4 h-1 rounded ${
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
							<p className="text-xs text-base-content/50">
								If empty, a secure password will be generated automatically
							</p>
						)}

						<label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-base-300 hover:bg-base-200/50 transition-colors">
							<input
								type="checkbox"
								checked={sendInvitation}
								onChange={(e) => setSendInvitation(e.target.checked)}
								className="checkbox checkbox-primary"
							/>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<Send className="w-4 h-4 text-primary" />
									<span className="font-medium">Send Invitation Email</span>
								</div>
								<p className="text-sm text-base-content/60 mt-0.5">
									User will receive an email with login instructions and temporary password
								</p>
							</div>
						</label>
					</div>
				</Card>

				{/* Actions */}
				<div className="flex flex-wrap items-center gap-3 justify-between">
					<p className="text-xs text-base-content/50">
						<kbd className="kbd kbd-xs">⌘</kbd> + <kbd className="kbd kbd-xs">Enter</kbd> to submit
					</p>
					<div className="flex flex-wrap gap-3">
						<Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button
							variant={needsConfirmation ? 'accent' : 'primary'}
							onClick={handleNext}
							loading={isSubmitting}
							disabled={!isFormValid}
							leftIcon={<UserPlus className="w-4 h-4" />}
						>
							{needsConfirmation ? 'Review & Create' : 'Create Account'}
						</Button>
					</div>
				</div>
			</div>
		</>
	)
}
