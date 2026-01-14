/**
 * Security Settings Page
 *
 * Admin page for managing tenant security policy settings.
 * Provides configuration for MFA, sessions, step-up authentication, and more.
 *
 * **Features (MAANG-Level):**
 * - Comprehensive security policy configuration
 * - Quick setup with policy templates
 * - Real-time validation
 * - Optimistic UI updates
 * - Admin-only access
 *
 * **Sections:**
 * - MFA Requirements: Control who must enable MFA
 * - Session Management: Configure timeouts and limits
 * - Step-Up Authentication: Define sensitive actions requiring re-verification
 * - Remember Me: Control persistent login sessions
 *
 * **Authorization:**
 * - Requires Admin role
 * - Modifying policy may trigger step-up authentication
 *
 * @module app/settings/security
 */

'use client'

import { ShieldAlert, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import TipItem from '@_components/ui/TipItem'

import { InternalPageHeader } from '../../_components'

import { useSecurityPolicy } from './_hooks'
import { SecurityPolicyForm, PolicyTemplateSelector } from './_components'

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================

export default function SecuritySettingsPage() {
	const { policy, templates, isLoading, isSaving, error, refetch, updatePolicy, resetPolicy, applyTemplate } =
		useSecurityPolicy()

	// =========================================================================
	// LOADING STATE
	// =========================================================================

	if (isLoading) {
		return (
			<>
				<InternalPageHeader
					title='Security Settings'
					description='Configure security policies for your organization'
				/>
				<Card className='border border-base-300 bg-base-100 p-12 shadow-sm'>
					<div className='flex flex-col items-center justify-center'>
						<Loader2 className='h-8 w-8 text-primary animate-spin mb-4' />
						<p className='text-base-content/60'>Loading security policy...</p>
					</div>
				</Card>
			</>
		)
	}

	// =========================================================================
	// ERROR STATE
	// =========================================================================

	if (error || !policy) {
		return (
			<>
				<InternalPageHeader
					title='Security Settings'
					description='Configure security policies for your organization'
				/>
				<Card className='border border-error/30 bg-error/5 p-6 shadow-sm'>
					<div className='flex items-start gap-4'>
						<AlertCircle className='h-6 w-6 text-error shrink-0 mt-0.5' />
						<div className='flex-1'>
							<h3 className='font-semibold text-error'>Failed to Load Security Policy</h3>
							<p className='text-sm text-base-content/70 mt-1'>
								{error ?? 'An unexpected error occurred while loading the security policy.'}
							</p>
							<Button
								variant='outline'
								size='sm'
								onClick={refetch}
								leftIcon={<RefreshCw className='h-4 w-4' />}
								className='mt-4'
							>
								Try Again
							</Button>
						</div>
					</div>
				</Card>
			</>
		)
	}

	// =========================================================================
	// MAIN RENDER
	// =========================================================================

	return (
		<>
			<InternalPageHeader
				title='Security Settings'
				description='Configure security policies for your organization'
			/>

			<div className='grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
				{/* Main Content */}
				<div className='space-y-6'>
					{/* Quick Setup Templates */}
					<PolicyTemplateSelector templates={templates} isSaving={isSaving} onApply={applyTemplate} />

					{/* Security Policy Form */}
					<SecurityPolicyForm
						policy={policy}
						isSaving={isSaving}
						onSave={updatePolicy}
						onReset={resetPolicy}
					/>
				</div>

				{/* Sidebar */}
				<div className='space-y-4'>
					{/* Security Tips Card */}
					<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
						<div className='flex items-center gap-3 mb-4'>
							<ShieldAlert className='h-5 w-5 text-primary' />
							<h3 className='text-lg font-semibold text-base-content'>Security Best Practices</h3>
						</div>
						<div className='space-y-3'>
							<TipItem
								icon={<ShieldAlert />}
								text='Require MFA for all admin accounts to protect sensitive operations'
							/>
							<TipItem
								icon={<ShieldAlert />}
								text='Use step-up authentication for financial and user management actions'
							/>
							<TipItem
								icon={<ShieldAlert />}
								text='Set reasonable session timeouts based on your security requirements'
							/>
							<TipItem
								icon={<ShieldAlert />}
								text='Limit concurrent sessions to prevent unauthorized access'
							/>
							<TipItem
								icon={<ShieldAlert />}
								text='Review audit logs regularly to detect suspicious activity'
							/>
						</div>
					</Card>

					{/* Policy Overview Card */}
					<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
						<h3 className='text-lg font-semibold text-base-content mb-4'>Current Policy Summary</h3>
						<div className='space-y-3 text-sm'>
							<div className='flex items-center justify-between'>
								<span className='text-base-content/70'>MFA Requirement</span>
								<span className='font-medium text-base-content'>{policy.mfaRequirement}</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-base-content/70'>Idle Timeout</span>
								<span className='font-medium text-base-content'>
									{policy.sessionIdleTimeoutMinutes} min
								</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-base-content/70'>Max Session Age</span>
								<span className='font-medium text-base-content'>{policy.maxSessionAgeHours} hrs</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-base-content/70'>Step-Up Freshness</span>
								<span className='font-medium text-base-content'>
									{policy.stepUpFreshnessMinutes} min
								</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-base-content/70'>Trusted Devices</span>
								<span className='font-medium text-base-content'>
									{policy.allowTrustedDevices ? 'Enabled' : 'Disabled'}
								</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-base-content/70'>Remember Me</span>
								<span className='font-medium text-base-content'>
									{policy.allowRememberMe ? 'Enabled' : 'Disabled'}
								</span>
							</div>
						</div>
					</Card>

					{/* Last Modified Info */}
					<Card className='border border-base-300 bg-base-100 p-4 shadow-sm'>
						<p className='text-xs text-base-content/50'>
							Last modified:{' '}
							{policy.modifiedAt
								? new Date(policy.modifiedAt).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})
								: 'Never'}
						</p>
					</Card>
				</div>
			</div>
		</>
	)
}
