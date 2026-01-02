'use client'

/**
 * RBAC Permissions Matrix Page
 *
 * Displays a comprehensive matrix of all permissions by role.
 * All data is fetched from the database via API.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Database-Driven RBAC
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * NO hardcoded role levels or permissions.
 * All data comes from:
 * - GET /api/rbac/overview (roles, permissions, matrix)
 *
 * @module RBAC Permissions
 */

import Link from 'next/link'
import {
	Shield,
	ChevronLeft,
	Info,
	Edit,
	Loader2,
	AlertCircle,
} from 'lucide-react'

import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../../_components'
import { PermissionMatrix, useRBACManagement } from '../_components'

// ============================================================================
// COMPONENTS
// ============================================================================

function LoadingState() {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
			<p className="text-base-content/60">Loading permission matrix from database...</p>
		</div>
	)
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<Card className="border-error/30 bg-error/5 p-8 text-center">
			<AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
			<h3 className="text-lg font-semibold text-error">Failed to Load Permissions</h3>
			<p className="mt-2 text-base-content/70">{message}</p>
			<Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
				Try Again
			</Button>
		</Card>
	)
}

function EmptyState() {
	return (
		<Card className="border-warning/30 bg-warning/5 p-8 text-center">
			<Info className="w-12 h-12 text-warning mx-auto mb-4" />
			<h3 className="text-lg font-semibold text-warning">No Permissions Found</h3>
			<p className="mt-2 text-base-content/70">
				The RBAC system has no permissions configured. Please run the RBAC reset to seed default permissions.
			</p>
		</Card>
	)
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function RBACPermissionsPage() {
	const { isAdmin } = usePermissions()
	const {
		overview,
		matrix,
		isLoadingOverview,
		overviewError,
		refreshOverview,
	} = useRBACManagement()

	if (!isAdmin) {
		return (
			<>
				<InternalPageHeader
					title="Access Denied"
					description="Administrator access required."
				/>
				<Card className="border-error/30 bg-error/5 p-8 text-center">
					<Shield className="w-12 h-12 text-error mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-error">Access Restricted</h3>
					<p className="mt-2 text-base-content/70">
						This page is only accessible to administrators.
					</p>
				</Card>
			</>
		)
	}

	return (
		<>
			<InternalPageHeader
				title="Permission Matrix"
				description="Complete overview of permissions by role (from database)"
				loading={isLoadingOverview}
				actions={
					<div className="flex items-center gap-2">
						<Link href={Routes.RBAC.permissionsManage}>
							<Button variant="primary" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
								Manage Permissions
							</Button>
						</Link>
						<Link href={Routes.RBAC.location}>
							<Button variant="ghost" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
								Back to RBAC
							</Button>
						</Link>
					</div>
				}
			/>

			{/* Info Banner */}
			<Card className="mb-6 bg-info/5 border-info/20">
				<div className="p-4 flex items-start gap-3">
					<Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
					<div>
						<h4 className="font-medium text-info">Database-Driven Permissions</h4>
						<p className="mt-1 text-sm text-base-content/70">
							All permissions and role assignments are fetched from the database.
							This enables white-label deployments to customize roles and permissions
							without code changes.
						</p>
					</div>
				</div>
			</Card>

			{/* Content */}
			{isLoadingOverview ? (
				<LoadingState />
			) : overviewError ? (
				<ErrorState message={overviewError} onRetry={refreshOverview} />
			) : !matrix || matrix.length === 0 ? (
				<EmptyState />
			) : (
				<PermissionMatrix
					matrix={matrix}
					roles={overview?.roles ?? []}
					canEdit={false}
				/>
			)}
		</>
	)
}
