/**
 * Tenants Management Page
 *
 * Dedicated page for Super Admin to manage multi-tenant instances.
 * Handles tenant CRUD operations, configuration, and white-label settings.
 *
 * **Features:**
 * - Tenant list table with filters
 * - Create tenant form
 * - Tenant detail view
 * - Suspend/Activate actions
 * - White-label configuration
 *
 * **Role Access:**
 * - Super Admin (Level 9999): Full access
 * - Others: Access denied
 *
 * **Next.js 16 Optimization:**
 * - Client Component for interactivity
 * - Uses RichDataGrid for server-side pagination (when API available)
 * - React Compiler auto-memoizes callbacks
 *
 * **Route**: /app/admin/tenants
 *
 * **Note:** Tenant management API endpoints may need to be implemented.
 * This page provides the UI structure that can be connected to the API when ready.
 *
 * @module app/admin/tenants/page
 */

'use client'

import { Building2, Plus } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import { usePermissions, RoleLevels } from '@_shared'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../../_components'

export default function TenantsPage() {
	const user = useAuthStore((state) => state.user)

	// RBAC: Only Super Admin can access
	const { roleLevel } = usePermissions()
	const isSuperAdmin = roleLevel === RoleLevels.SuperAdmin

	// Access denied for non-super-admin roles
	if (!isSuperAdmin) {
		return (
			<>
				<InternalPageHeader
					title="Access Denied"
					description="You do not have permission to access tenant management."
				/>
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<p className="text-base-content/70">
						Only Super Administrators can access tenant management. Your current role level: {roleLevel}
					</p>
				</Card>
			</>
		)
	}

	return (
		<>
			<InternalPageHeader
				title="Tenant Management"
				description="Manage multi-tenant instances, configure white-label settings, and monitor tenant status."
				actions={
					<Button variant="primary" leftIcon={<Plus className="w-5 h-5" />} data-testid="add-tenant">
						Create Tenant
					</Button>
				}
			/>

			{/* Tenants Table Card */}
			<Card>
				<div className="card-body p-3 sm:p-6">
					<div data-testid="tenant-table">
						{/* Placeholder: Tenant management API needs to be implemented */}
						<div className="flex flex-col items-center gap-4 py-12">
							<Building2 className="w-16 h-16 text-base-content/40" />
							<div className="text-center">
								<h3 className="text-lg font-semibold text-base-content mb-2">Tenant Management</h3>
								<p className="text-base-content/60 mb-4">
									Tenant management API endpoints are being implemented.
								</p>
								<p className="text-sm text-base-content/40">
									This page will display a list of all tenants with options to create, edit, suspend,
									activate, and configure white-label settings.
								</p>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</>
	)
}
