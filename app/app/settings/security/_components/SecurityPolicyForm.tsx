/**
 * SecurityPolicyForm Component
 *
 * Form for editing tenant security policy settings.
 * Organized into sections: MFA, Sessions, Step-Up, Remember Me.
 *
 * **Features:**
 * - Grouped settings by category
 * - Input validation with limits
 * - Checkbox lists for multi-select
 * - Help text for each setting
 * - Immediate feedback on changes
 *
 * @module SecurityPolicyForm
 */

'use client'

import { useState, useCallback, useEffect } from 'react'

import { Shield, Clock, ShieldCheck, KeyRound, Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

import classNames from 'classnames'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import FormInput from '@_components/forms/FormInput'
import FormCheckbox from '@_components/forms/FormCheckbox'
import Select from '@_components/ui/Select'

import type { SecurityPolicyResponse, UpdateSecurityPolicyRequest, MfaRequirementLevel } from '@_shared'

import {
	MFA_REQUIREMENT_OPTIONS,
	ROLE_OPTIONS,
	SENSITIVE_ACTION_OPTIONS,
	FORM_LABELS,
	HELP_TEXT,
	VALIDATION_LIMITS,
} from './SecurityPolicyForm.constants'

// =========================================================================
// TYPES
// =========================================================================

interface SecurityPolicyFormProps {
	/** Current policy data */
	policy: SecurityPolicyResponse
	/** Whether save is in progress */
	isSaving: boolean
	/** Callback to save changes */
	onSave: (updates: UpdateSecurityPolicyRequest) => Promise<boolean>
	/** Callback to reset to defaults */
	onReset: () => Promise<boolean>
}

interface FormState {
	// MFA
	mfaRequirement: MfaRequirementLevel
	mfaRequiredRoles: string[]
	allowTrustedDevices: boolean
	trustedDeviceMaxDays: number
	maxTrustedDevicesPerUser: number

	// Sessions
	sessionIdleTimeoutMinutes: number
	maxSessionAgeHours: number
	maxConcurrentSessions: number

	// Step-Up
	stepUpFreshnessMinutes: number
	stepUpActions: string[]

	// Remember Me
	allowRememberMe: boolean
	rememberMeMaxDays: number
}

// =========================================================================
// HELPER COMPONENTS
// =========================================================================

interface SectionHeaderProps {
	icon: React.ReactNode
	title: string
	description: string
	isExpanded: boolean
	onToggle: () => void
}

function SectionHeader({ icon, title, description, isExpanded, onToggle }: SectionHeaderProps) {
	return (
		<Button
			type='button'
			onClick={onToggle}
			variant='ghost'
			className='flex items-center justify-between w-full text-left h-auto p-0'
			rightIcon={
				isExpanded ? (
					<ChevronUp className='h-5 w-5 text-base-content/50' />
				) : (
					<ChevronDown className='h-5 w-5 text-base-content/50' />
				)
			}
			contentDrivenHeight>
			<div className='flex items-center gap-3'>
				<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>{icon}</div>
				<div>
					<h3 className='text-lg font-semibold text-base-content'>{title}</h3>
					<p className='text-sm text-base-content/60'>{description}</p>
				</div>
			</div>
		</Button>
	)
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export default function SecurityPolicyForm({ policy, isSaving, onSave, onReset }: SecurityPolicyFormProps) {
	// Form state - initialized from policy
	const [formState, setFormState] = useState<FormState>(() => ({
		mfaRequirement: policy.mfaRequirement,
		mfaRequiredRoles: policy.mfaRequiredRoles,
		allowTrustedDevices: policy.allowTrustedDevices,
		trustedDeviceMaxDays: policy.trustedDeviceMaxDays,
		maxTrustedDevicesPerUser: policy.maxTrustedDevicesPerUser,
		sessionIdleTimeoutMinutes: policy.sessionIdleTimeoutMinutes,
		maxSessionAgeHours: policy.maxSessionAgeHours,
		maxConcurrentSessions: policy.maxConcurrentSessions,
		stepUpFreshnessMinutes: policy.stepUpFreshnessMinutes,
		stepUpActions: policy.stepUpActions,
		allowRememberMe: policy.allowRememberMe,
		rememberMeMaxDays: policy.rememberMeMaxDays,
	}))

	// Section expansion state
	const [expandedSections, setExpandedSections] = useState({
		mfa: true,
		sessions: true,
		stepUp: false,
		rememberMe: false,
	})

	// Dirty state for save button
	const [isDirty, setIsDirty] = useState(false)

	// Reset form when policy changes
	useEffect(() => {
		setFormState({
			mfaRequirement: policy.mfaRequirement,
			mfaRequiredRoles: policy.mfaRequiredRoles,
			allowTrustedDevices: policy.allowTrustedDevices,
			trustedDeviceMaxDays: policy.trustedDeviceMaxDays,
			maxTrustedDevicesPerUser: policy.maxTrustedDevicesPerUser,
			sessionIdleTimeoutMinutes: policy.sessionIdleTimeoutMinutes,
			maxSessionAgeHours: policy.maxSessionAgeHours,
			maxConcurrentSessions: policy.maxConcurrentSessions,
			stepUpFreshnessMinutes: policy.stepUpFreshnessMinutes,
			stepUpActions: policy.stepUpActions,
			allowRememberMe: policy.allowRememberMe,
			rememberMeMaxDays: policy.rememberMeMaxDays,
		})
		setIsDirty(false)
	}, [policy])

	// Generic field update handler
	const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
		setFormState((prev) => ({ ...prev, [field]: value }))
		setIsDirty(true)
	}, [])

	// Toggle section expansion
	const toggleSection = useCallback((section: keyof typeof expandedSections) => {
		setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
	}, [])

	// Handle form submission
	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()

			const updates: UpdateSecurityPolicyRequest = {
				mfaRequirement: formState.mfaRequirement,
				mfaRequiredRoles: formState.mfaRequiredRoles,
				allowTrustedDevices: formState.allowTrustedDevices,
				trustedDeviceMaxDays: formState.trustedDeviceMaxDays,
				maxTrustedDevicesPerUser: formState.maxTrustedDevicesPerUser,
				sessionIdleTimeoutMinutes: formState.sessionIdleTimeoutMinutes,
				maxSessionAgeHours: formState.maxSessionAgeHours,
				maxConcurrentSessions: formState.maxConcurrentSessions,
				stepUpFreshnessMinutes: formState.stepUpFreshnessMinutes,
				stepUpActions: formState.stepUpActions,
				allowRememberMe: formState.allowRememberMe,
				rememberMeMaxDays: formState.rememberMeMaxDays,
			}

			const success = await onSave(updates)
			if (success) {
				setIsDirty(false)
			}
		},
		[formState, onSave]
	)

	// Handle reset
	const handleReset = useCallback(async () => {
		const success = await onReset()
		if (success) {
			setIsDirty(false)
		}
	}, [onReset])

	// Toggle array item (for roles and actions)
	const toggleArrayItem = useCallback((field: 'mfaRequiredRoles' | 'stepUpActions', item: string) => {
		setFormState((prev) => {
			const currentArray = prev[field]
			const newArray = currentArray.includes(item)
				? currentArray.filter((i) => i !== item)
				: [...currentArray, item]
			return { ...prev, [field]: newArray }
		})
		setIsDirty(true)
	}, [])

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-6'>
			{/* ============================================================= */}
			{/* MFA SETTINGS */}
			{/* ============================================================= */}
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
				<SectionHeader
					icon={<Shield className='h-5 w-5 text-primary' />}
					title='Multi-Factor Authentication'
					description='Configure MFA requirements for your organization'
					isExpanded={expandedSections.mfa}
					onToggle={() => toggleSection('mfa')}
				/>

				{expandedSections.mfa && (
					<div className='mt-6 space-y-5'>
						{/* MFA Requirement Level */}
						<div>
							<label className='label'>
								<span className='label-text font-medium'>{FORM_LABELS.MFA_REQUIREMENT}</span>
							</label>
							<Select
								value={formState.mfaRequirement}
								onChange={(e) => updateField('mfaRequirement', e.target.value as MfaRequirementLevel)}
								disabled={isSaving}
								options={MFA_REQUIREMENT_OPTIONS.map((option) => ({
									value: option.value,
									label: `${option.label} - ${option.description}`,
								}))}
							/>
							<p className='text-xs text-base-content/60 mt-1'>{HELP_TEXT.MFA_REQUIREMENT}</p>
						</div>

						{/* Roles requiring MFA (only when RoleSpecific) */}
						{formState.mfaRequirement === 'RoleSpecific' && (
							<div>
								<label className='label'>
									<span className='label-text font-medium'>{FORM_LABELS.MFA_REQUIRED_ROLES}</span>
								</label>
								<div className='space-y-2'>
									{ROLE_OPTIONS.map((role) => (
										<FormCheckbox
											key={role.value}
											label={role.label}
											checked={formState.mfaRequiredRoles.includes(role.value)}
											onChange={() => toggleArrayItem('mfaRequiredRoles', role.value)}
											disabled={isSaving}
										/>
									))}
								</div>
								<p className='text-xs text-base-content/60 mt-1'>{HELP_TEXT.MFA_REQUIRED_ROLES}</p>
							</div>
						)}

						{/* Trusted Devices */}
						<div className='divider' />

						<FormCheckbox
							label={FORM_LABELS.ALLOW_TRUSTED_DEVICES}
							checked={formState.allowTrustedDevices}
							onChange={(e) => updateField('allowTrustedDevices', e.target.checked)}
							disabled={isSaving}
						/>
						<p className='text-xs text-base-content/60 -mt-3 ml-6'>{HELP_TEXT.ALLOW_TRUSTED_DEVICES}</p>

						{formState.allowTrustedDevices && (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
								<FormInput
									label={FORM_LABELS.TRUSTED_DEVICE_MAX_DAYS}
									type='number'
									value={formState.trustedDeviceMaxDays}
									onChange={(e) =>
										updateField('trustedDeviceMaxDays', parseInt(e.target.value, 10) || 1)
									}
									min={VALIDATION_LIMITS.MIN_TRUSTED_DEVICE_DAYS}
									max={VALIDATION_LIMITS.MAX_TRUSTED_DEVICE_DAYS}
									disabled={isSaving}
								/>
								<FormInput
									label={FORM_LABELS.MAX_TRUSTED_DEVICES}
									type='number'
									value={formState.maxTrustedDevicesPerUser}
									onChange={(e) =>
										updateField('maxTrustedDevicesPerUser', parseInt(e.target.value, 10) || 1)
									}
									min={VALIDATION_LIMITS.MIN_TRUSTED_DEVICES}
									max={VALIDATION_LIMITS.MAX_TRUSTED_DEVICES}
									disabled={isSaving}
								/>
							</div>
						)}
					</div>
				)}
			</Card>

			{/* ============================================================= */}
			{/* SESSION SETTINGS */}
			{/* ============================================================= */}
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
				<SectionHeader
					icon={<Clock className='h-5 w-5 text-primary' />}
					title='Session Management'
					description='Control session duration and concurrency limits'
					isExpanded={expandedSections.sessions}
					onToggle={() => toggleSection('sessions')}
				/>

				{expandedSections.sessions && (
					<div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div>
							<FormInput
								label={FORM_LABELS.IDLE_TIMEOUT}
								type='number'
								value={formState.sessionIdleTimeoutMinutes}
								onChange={(e) =>
									updateField('sessionIdleTimeoutMinutes', parseInt(e.target.value, 10) || 5)
								}
								min={VALIDATION_LIMITS.MIN_IDLE_TIMEOUT}
								max={VALIDATION_LIMITS.MAX_IDLE_TIMEOUT}
								disabled={isSaving}
							/>
							<p className='text-xs text-base-content/60 mt-1'>{HELP_TEXT.IDLE_TIMEOUT}</p>
						</div>

						<div>
							<FormInput
								label={FORM_LABELS.MAX_SESSION_AGE}
								type='number'
								value={formState.maxSessionAgeHours}
								onChange={(e) => updateField('maxSessionAgeHours', parseInt(e.target.value, 10) || 1)}
								min={VALIDATION_LIMITS.MIN_SESSION_AGE}
								max={VALIDATION_LIMITS.MAX_SESSION_AGE}
								disabled={isSaving}
							/>
							<p className='text-xs text-base-content/60 mt-1'>{HELP_TEXT.MAX_SESSION_AGE}</p>
						</div>

						<div>
							<FormInput
								label={FORM_LABELS.MAX_CONCURRENT_SESSIONS}
								type='number'
								value={formState.maxConcurrentSessions}
								onChange={(e) =>
									updateField('maxConcurrentSessions', parseInt(e.target.value, 10) || 0)
								}
								min={VALIDATION_LIMITS.MIN_CONCURRENT_SESSIONS}
								max={VALIDATION_LIMITS.MAX_CONCURRENT_SESSIONS}
								disabled={isSaving}
							/>
							<p className='text-xs text-base-content/60 mt-1'>{HELP_TEXT.MAX_CONCURRENT_SESSIONS}</p>
						</div>
					</div>
				)}
			</Card>

			{/* ============================================================= */}
			{/* STEP-UP SETTINGS */}
			{/* ============================================================= */}
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
				<SectionHeader
					icon={<ShieldCheck className='h-5 w-5 text-primary' />}
					title='Step-Up Authentication'
					description='Configure which actions require recent MFA verification'
					isExpanded={expandedSections.stepUp}
					onToggle={() => toggleSection('stepUp')}
				/>

				{expandedSections.stepUp && (
					<div className='mt-6 space-y-5'>
						<div className='max-w-xs'>
							<FormInput
								label={FORM_LABELS.STEP_UP_FRESHNESS}
								type='number'
								value={formState.stepUpFreshnessMinutes}
								onChange={(e) =>
									updateField('stepUpFreshnessMinutes', parseInt(e.target.value, 10) || 1)
								}
								min={VALIDATION_LIMITS.MIN_STEP_UP_FRESHNESS}
								max={VALIDATION_LIMITS.MAX_STEP_UP_FRESHNESS}
								disabled={isSaving}
							/>
							<p className='text-xs text-base-content/60 mt-1'>{HELP_TEXT.STEP_UP_FRESHNESS}</p>
						</div>

						<div>
							<label className='label'>
								<span className='label-text font-medium'>{FORM_LABELS.STEP_UP_ACTIONS}</span>
							</label>
							<p className='text-xs text-base-content/60 mb-3'>{HELP_TEXT.STEP_UP_ACTIONS}</p>

							{/* Group actions by category */}
							{['Account Security', 'Administrative', 'Financial', 'Integration'].map((category) => (
								<div
									key={category}
									className='mb-4'>
									<h4 className='text-sm font-medium text-base-content/70 mb-2'>{category}</h4>
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
										{SENSITIVE_ACTION_OPTIONS.filter((a) => a.category === category).map(
											(action) => (
												<FormCheckbox
													key={action.value}
													label={action.label}
													checked={formState.stepUpActions.includes(action.value)}
													onChange={() => toggleArrayItem('stepUpActions', action.value)}
													disabled={isSaving}
												/>
											)
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</Card>

			{/* ============================================================= */}
			{/* REMEMBER ME SETTINGS */}
			{/* ============================================================= */}
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
				<SectionHeader
					icon={<KeyRound className='h-5 w-5 text-primary' />}
					title='Remember Me'
					description='Configure persistent login sessions'
					isExpanded={expandedSections.rememberMe}
					onToggle={() => toggleSection('rememberMe')}
				/>

				{expandedSections.rememberMe && (
					<div className='mt-6 space-y-4'>
						<FormCheckbox
							label={FORM_LABELS.ALLOW_REMEMBER_ME}
							checked={formState.allowRememberMe}
							onChange={(e) => updateField('allowRememberMe', e.target.checked)}
							disabled={isSaving}
						/>
						<p className='text-xs text-base-content/60 -mt-2 ml-6'>{HELP_TEXT.ALLOW_REMEMBER_ME}</p>

						{formState.allowRememberMe && (
							<div className='max-w-xs pl-6'>
								<FormInput
									label={FORM_LABELS.REMEMBER_ME_MAX_DAYS}
									type='number'
									value={formState.rememberMeMaxDays}
									onChange={(e) =>
										updateField('rememberMeMaxDays', parseInt(e.target.value, 10) || 1)
									}
									min={VALIDATION_LIMITS.MIN_REMEMBER_ME_DAYS}
									max={VALIDATION_LIMITS.MAX_REMEMBER_ME_DAYS}
									disabled={isSaving}
								/>
								<p className='text-xs text-base-content/60 mt-1'>{HELP_TEXT.REMEMBER_ME_MAX_DAYS}</p>
							</div>
						)}
					</div>
				)}
			</Card>

			{/* ============================================================= */}
			{/* ACTION BUTTONS */}
			{/* ============================================================= */}
			<div className='flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-base-300'>
				<Button
					type='button'
					variant='ghost'
					onClick={handleReset}
					disabled={isSaving}
					leftIcon={<RotateCcw className='h-4 w-4' />}>
					Reset to Defaults
				</Button>
				<Button
					type='submit'
					variant='primary'
					loading={isSaving}
					disabled={!isDirty || isSaving}
					leftIcon={<Save className='h-4 w-4' />}>
					Save Changes
				</Button>
			</div>
		</form>
	)
}
