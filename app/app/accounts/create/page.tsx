/**
 * Admin Account Creation Page
 * 
 * Admin-only page for creating new user accounts with specified roles.
 * Bypasses the normal registration flow for staff account creation.
 * 
 * **Features:**
 * - Role selection (all RBAC roles)
 * - Optional temporary password
 * - Invitation email toggle
 * - Success state with copy-to-clipboard
 * 
 * **RBAC:**
 * - Admin-only access (enforced by usePermissions hook)
 * - Falls back to accounts list for non-admins
 * 
 * @module app/accounts/create
 */

'use client'

import { useRouter } from 'next/navigation'

import { ShieldAlert, ArrowLeft } from 'lucide-react'

import { AdminCreateAccountForm } from '@_features/accounts'
import { Routes } from '@_features/navigation'

import { usePermissions } from '@_shared'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../../_components'

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function AdminCreateAccountPage() {
	const router = useRouter()
	const { isAdmin, isLoading } = usePermissions()

	// Show loading state
	if (isLoading) {
		return (
			<>
				<InternalPageHeader
					title="Create Account"
					description="Loading..."
					loading
				/>
				<Card className="p-8">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-base-300 rounded w-1/3" />
						<div className="h-32 bg-base-300 rounded" />
						<div className="h-32 bg-base-300 rounded" />
					</div>
				</Card>
			</>
		)
	}

	// Non-admin access denied
	if (!isAdmin) {
		return (
			<>
				<InternalPageHeader
					title="Access Denied"
					description="You don't have permission to access this page"
				/>
				<Card className="p-8 text-center border border-error/30 bg-error/5">
					<div className="flex flex-col items-center gap-4">
						<div className="p-4 rounded-full bg-error/10">
							<ShieldAlert className="w-12 h-12 text-error" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-base-content">
								Admin Access Required
							</h2>
							<p className="text-base-content/70 mt-2 max-w-md mx-auto">
								Only administrators can create new accounts.
								If you need to create an account, please contact your system administrator.
							</p>
						</div>
						<Button
							variant="primary"
							onClick={() => router.push(Routes.Accounts.location)}
							leftIcon={<ArrowLeft className="w-4 h-4" />}
						>
							Back to Accounts
						</Button>
					</div>
				</Card>
			</>
		)
	}

	// Admin view
	return (
		<>
			<InternalPageHeader
				title="Create Account"
				description="Create a new user account with specified role and permissions"
				actions={
					<Button
						variant="ghost"
						onClick={() => router.push(Routes.Accounts.location)}
						leftIcon={<ArrowLeft className="w-4 h-4" />}
					>
						Back to Accounts
					</Button>
				}
			/>

			<AdminCreateAccountForm />
		</>
	)
}

