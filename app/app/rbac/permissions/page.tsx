'use client'

/**
 * RBAC Permissions Matrix Page
 * 
 * Displays a comprehensive matrix of all permissions by role.
 * Allows admins to understand which roles have access to which resources and actions.
 * 
 * @module RBAC Permissions
 */

import { useState } from 'react'
import Link from 'next/link'
import { 
	Shield, 
	ChevronLeft,
	Check,
	X,
	Filter,
	Info,
	Edit
} from 'lucide-react'

import { Routes } from '@_features/navigation'
import { usePermissions, RoleLevels, Resources, Actions, Contexts } from '@_shared'
import { RoleDisplayNames, type RoleLevel, type Resource, type Action, type Context } from '@_types/rbac'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../../_components'

// ============================================================================
// TYPES
// ============================================================================

interface PermissionEntry {
	resource: Resource
	action: Action
	context?: Context
	description: string
}

type RolePermissionMap = Record<string, boolean>

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

const ALL_PERMISSIONS: PermissionEntry[] = [
	// Quotes
	{ resource: Resources.Quotes, action: Actions.Read, context: Contexts.Own, description: 'View own quotes' },
	{ resource: Resources.Quotes, action: Actions.Read, context: Contexts.Assigned, description: 'View assigned quotes' },
	{ resource: Resources.Quotes, action: Actions.Read, context: Contexts.Team, description: 'View team quotes' },
	{ resource: Resources.Quotes, action: Actions.Read, context: Contexts.All, description: 'View all quotes' },
	{ resource: Resources.Quotes, action: Actions.Create, description: 'Create quotes' },
	{ resource: Resources.Quotes, action: Actions.Update, context: Contexts.Own, description: 'Update own quotes' },
	{ resource: Resources.Quotes, action: Actions.Update, context: Contexts.Assigned, description: 'Update assigned quotes' },
	{ resource: Resources.Quotes, action: Actions.Update, context: Contexts.All, description: 'Update all quotes' },
	{ resource: Resources.Quotes, action: Actions.Approve, description: 'Approve quotes' },
	{ resource: Resources.Quotes, action: Actions.Assign, description: 'Assign quotes' },
	{ resource: Resources.Quotes, action: Actions.Delete, description: 'Delete quotes' },
	
	// Orders
	{ resource: Resources.Orders, action: Actions.Read, context: Contexts.Own, description: 'View own orders' },
	{ resource: Resources.Orders, action: Actions.Read, context: Contexts.Assigned, description: 'View assigned orders' },
	{ resource: Resources.Orders, action: Actions.Read, context: Contexts.Team, description: 'View team orders' },
	{ resource: Resources.Orders, action: Actions.Read, context: Contexts.All, description: 'View all orders' },
	{ resource: Resources.Orders, action: Actions.Create, description: 'Create orders' },
	{ resource: Resources.Orders, action: Actions.Update, context: Contexts.Own, description: 'Update own orders' },
	{ resource: Resources.Orders, action: Actions.Update, context: Contexts.Assigned, description: 'Update assigned orders' },
	{ resource: Resources.Orders, action: Actions.Update, context: Contexts.All, description: 'Update all orders' },
	{ resource: Resources.Orders, action: Actions.Approve, description: 'Approve orders' },
	{ resource: Resources.Orders, action: Actions.ConfirmPayment, description: 'Confirm payment' },
	{ resource: Resources.Orders, action: Actions.UpdateTracking, description: 'Update tracking' },
	{ resource: Resources.Orders, action: Actions.Delete, description: 'Delete orders' },
	
	// Products
	{ resource: Resources.Products, action: Actions.Read, description: 'View products' },
	{ resource: Resources.Products, action: Actions.Create, description: 'Create products' },
	{ resource: Resources.Products, action: Actions.Update, description: 'Update products' },
	{ resource: Resources.Products, action: Actions.Delete, description: 'Delete products' },
	
	// Customers
	{ resource: Resources.Customers, action: Actions.Read, context: Contexts.Own, description: 'View own profile' },
	{ resource: Resources.Customers, action: Actions.Read, context: Contexts.Assigned, description: 'View assigned customers' },
	{ resource: Resources.Customers, action: Actions.Read, context: Contexts.Team, description: 'View team customers' },
	{ resource: Resources.Customers, action: Actions.Read, context: Contexts.All, description: 'View all customers' },
	{ resource: Resources.Customers, action: Actions.Create, description: 'Create customers' },
	{ resource: Resources.Customers, action: Actions.Update, context: Contexts.Own, description: 'Update own profile' },
	{ resource: Resources.Customers, action: Actions.Update, context: Contexts.Assigned, description: 'Update assigned customers' },
	{ resource: Resources.Customers, action: Actions.Update, context: Contexts.All, description: 'Update all customers' },
	{ resource: Resources.Customers, action: Actions.Delete, description: 'Delete customers' },
	
	// Vendors
	{ resource: Resources.Vendors, action: Actions.Read, description: 'View vendors' },
	{ resource: Resources.Vendors, action: Actions.Create, description: 'Create vendors' },
	{ resource: Resources.Vendors, action: Actions.Update, description: 'Update vendors' },
	{ resource: Resources.Vendors, action: Actions.Delete, description: 'Delete vendors' },
	
	// Analytics
	{ resource: Resources.Analytics, action: Actions.Read, context: Contexts.Own, description: 'View own analytics' },
	{ resource: Resources.Analytics, action: Actions.Read, context: Contexts.Team, description: 'View team analytics' },
	{ resource: Resources.Analytics, action: Actions.Read, context: Contexts.All, description: 'View all analytics' },
	{ resource: Resources.Analytics, action: Actions.Export, description: 'Export analytics' },
	
	// Users
	{ resource: Resources.Users, action: Actions.Read, context: Contexts.Own, description: 'View own user' },
	{ resource: Resources.Users, action: Actions.Read, context: Contexts.Team, description: 'View team users' },
	{ resource: Resources.Users, action: Actions.Read, context: Contexts.All, description: 'View all users' },
	{ resource: Resources.Users, action: Actions.Create, description: 'Create users' },
	{ resource: Resources.Users, action: Actions.Update, context: Contexts.Own, description: 'Update own user' },
	{ resource: Resources.Users, action: Actions.Update, context: Contexts.Team, description: 'Update team users' },
	{ resource: Resources.Users, action: Actions.Update, context: Contexts.All, description: 'Update all users' },
	{ resource: Resources.Users, action: Actions.Delete, description: 'Delete users' },
	
	// Settings
	{ resource: Resources.Settings, action: Actions.Read, description: 'View settings' },
	{ resource: Resources.Settings, action: Actions.Update, description: 'Update settings' },
	{ resource: Resources.Settings, action: Actions.Manage, description: 'Manage settings' },
]

const ROLES: { level: RoleLevel; name: string; color: string }[] = [
	{ level: RoleLevels.Admin, name: 'Admin', color: 'text-error' },
	{ level: RoleLevels.FulfillmentCoordinator, name: 'Fulfillment', color: 'text-info' },
	{ level: RoleLevels.SalesManager, name: 'Manager', color: 'text-warning' },
	{ level: RoleLevels.SalesRep, name: 'SalesRep', color: 'text-success' },
	{ level: RoleLevels.Customer, name: 'Customer', color: 'text-base-content/70' },
]

// ============================================================================
// PERMISSION CHECK LOGIC
// ============================================================================

function hasRolePermission(
	roleLevel: RoleLevel,
	resource: Resource,
	action: Action,
	context?: Context
): boolean {
	// Admin has all permissions
	if (roleLevel >= RoleLevels.Admin) return true

	// Customer permissions
	const customerPerms = [
		`${Resources.Quotes}:${Actions.Read}:${Contexts.Own}`,
		`${Resources.Quotes}:${Actions.Create}`,
		`${Resources.Quotes}:${Actions.Update}:${Contexts.Own}`,
		`${Resources.Orders}:${Actions.Read}:${Contexts.Own}`,
		`${Resources.Orders}:${Actions.Update}:${Contexts.Own}`,
		`${Resources.Products}:${Actions.Read}`,
		`${Resources.Customers}:${Actions.Read}:${Contexts.Own}`,
		`${Resources.Customers}:${Actions.Update}:${Contexts.Own}`,
		`${Resources.Users}:${Actions.Read}:${Contexts.Own}`,
		`${Resources.Users}:${Actions.Update}:${Contexts.Own}`,
		`${Resources.Settings}:${Actions.Read}`,
	]

	// SalesRep permissions
	const salesRepPerms = [
		...customerPerms,
		`${Resources.Quotes}:${Actions.Read}:${Contexts.Assigned}`,
		`${Resources.Quotes}:${Actions.Update}:${Contexts.Assigned}`,
		`${Resources.Orders}:${Actions.Read}:${Contexts.Assigned}`,
		`${Resources.Orders}:${Actions.Create}`,
		`${Resources.Orders}:${Actions.Update}:${Contexts.Assigned}`,
		`${Resources.Orders}:${Actions.ConfirmPayment}`,
		`${Resources.Orders}:${Actions.UpdateTracking}`,
		`${Resources.Customers}:${Actions.Read}:${Contexts.Assigned}`,
		`${Resources.Customers}:${Actions.Create}`,
		`${Resources.Customers}:${Actions.Update}:${Contexts.Assigned}`,
		`${Resources.Vendors}:${Actions.Read}`,
		`${Resources.Analytics}:${Actions.Read}:${Contexts.Own}`,
	]

	// SalesManager permissions
	const salesManagerPerms = [
		...salesRepPerms,
		`${Resources.Quotes}:${Actions.Read}:${Contexts.Team}`,
		`${Resources.Quotes}:${Actions.Read}:${Contexts.All}`,
		`${Resources.Quotes}:${Actions.Update}:${Contexts.All}`,
		`${Resources.Quotes}:${Actions.Approve}`,
		`${Resources.Quotes}:${Actions.Assign}`,
		`${Resources.Orders}:${Actions.Read}:${Contexts.Team}`,
		`${Resources.Orders}:${Actions.Read}:${Contexts.All}`,
		`${Resources.Orders}:${Actions.Update}:${Contexts.All}`,
		`${Resources.Orders}:${Actions.Approve}`,
		`${Resources.Customers}:${Actions.Read}:${Contexts.Team}`,
		`${Resources.Customers}:${Actions.Read}:${Contexts.All}`,
		`${Resources.Customers}:${Actions.Update}:${Contexts.All}`,
		`${Resources.Analytics}:${Actions.Read}:${Contexts.Team}`,
		`${Resources.Analytics}:${Actions.Export}`,
		`${Resources.Users}:${Actions.Read}:${Contexts.Team}`,
		`${Resources.Users}:${Actions.Create}`,
		`${Resources.Users}:${Actions.Update}:${Contexts.Team}`,
	]

	// FulfillmentCoordinator permissions
	const fulfillmentPerms = [
		`${Resources.Orders}:${Actions.Read}:${Contexts.Own}`,
		`${Resources.Orders}:${Actions.Read}:${Contexts.Assigned}`,
		`${Resources.Orders}:${Actions.Read}:${Contexts.All}`,
		`${Resources.Orders}:${Actions.Update}:${Contexts.Own}`,
		`${Resources.Orders}:${Actions.Update}:${Contexts.Assigned}`,
		`${Resources.Orders}:${Actions.Update}:${Contexts.All}`,
		`${Resources.Orders}:${Actions.ConfirmPayment}`,
		`${Resources.Orders}:${Actions.UpdateTracking}`,
		`${Resources.Products}:${Actions.Read}`,
		`${Resources.Vendors}:${Actions.Read}`,
		`${Resources.Vendors}:${Actions.Update}`,
		`${Resources.Users}:${Actions.Read}:${Contexts.Own}`,
		`${Resources.Users}:${Actions.Update}:${Contexts.Own}`,
	]

	const permKey = context ? `${resource}:${action}:${context}` : `${resource}:${action}`

	if (roleLevel >= RoleLevels.FulfillmentCoordinator) {
		if (fulfillmentPerms.includes(permKey)) return true
	}

	if (roleLevel >= RoleLevels.SalesManager) {
		if (salesManagerPerms.includes(permKey)) return true
	}

	if (roleLevel >= RoleLevels.SalesRep) {
		if (salesRepPerms.includes(permKey)) return true
	}

	if (roleLevel >= RoleLevels.Customer) {
		if (customerPerms.includes(permKey)) return true
	}

	return false
}

// ============================================================================
// COMPONENTS
// ============================================================================

function PermissionCell({ hasPermission }: { hasPermission: boolean }) {
	return (
		<td className="text-center p-2">
			{hasPermission ? (
				<Check className="w-4 h-4 text-success mx-auto" />
			) : (
				<X className="w-4 h-4 text-base-content/20 mx-auto" />
			)}
		</td>
	)
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function RBACPermissionsPage() {
	const { isAdmin } = usePermissions()
	const [selectedResource, setSelectedResource] = useState<Resource | 'all'>('all')

	// Filter permissions by selected resource (React Compiler auto-memoizes)
	const filteredPermissions = selectedResource === 'all' 
		? ALL_PERMISSIONS 
		: ALL_PERMISSIONS.filter((p) => p.resource === selectedResource)

	// Group permissions by resource (React Compiler auto-memoizes)
	const groupedPermissions: Record<string, PermissionEntry[]> = {}
	filteredPermissions.forEach((perm) => {
		if (!groupedPermissions[perm.resource]) {
			groupedPermissions[perm.resource] = []
		}
		groupedPermissions[perm.resource].push(perm)
	})

	const resources = Object.values(Resources)

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
				description="Complete overview of permissions by role"
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

			{/* Filter */}
			<div className="mb-6 flex items-center gap-4">
				<Filter className="w-4 h-4 text-base-content/50" />
				<span className="text-sm text-base-content/60">Filter by resource:</span>
				<select
					value={selectedResource}
					onChange={(e) => setSelectedResource(e.target.value as Resource | 'all')}
					className="select select-bordered select-sm"
				>
					<option value="all">All Resources</option>
					{resources.map((resource) => (
						<option key={resource} value={resource}>
							{resource.charAt(0).toUpperCase() + resource.slice(1)}
						</option>
					))}
				</select>
			</div>

			{/* Info Banner */}
			<Card className="mb-6 bg-info/5 border-info/20">
				<div className="p-4 flex items-start gap-3">
					<Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
					<div>
						<h4 className="font-medium text-info">Permission Legend</h4>
						<p className="mt-1 text-sm text-base-content/70">
							<Check className="w-4 h-4 text-success inline mr-1" /> = Permission granted
							<X className="w-4 h-4 text-base-content/20 inline ml-4 mr-1" /> = Permission denied
						</p>
					</div>
				</div>
			</Card>

			{/* Permission Matrix */}
			{Object.entries(groupedPermissions).map(([resource, permissions]) => (
				<Card key={resource} className="mb-6 overflow-hidden">
					<div className="p-4 bg-base-200 border-b border-base-300">
						<h3 className="font-semibold capitalize">{resource}</h3>
					</div>
					<div className="overflow-x-auto">
						<table className="table table-sm w-full">
							<thead>
								<tr className="bg-base-100">
									<th className="min-w-[200px]">Permission</th>
									{ROLES.map((role) => (
										<th key={role.level} className={`text-center ${role.color} min-w-[80px]`}>
											{role.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{permissions.map((perm, idx) => {
									const permKey = perm.context 
										? `${perm.resource}:${perm.action}:${perm.context}`
										: `${perm.resource}:${perm.action}`
									
									return (
										<tr key={permKey} className={idx % 2 === 0 ? 'bg-base-100' : 'bg-base-50'}>
											<td className="py-3">
												<div>
													<span className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
														{perm.action}
														{perm.context && `:${perm.context}`}
													</span>
													<p className="text-sm text-base-content/60 mt-1">
														{perm.description}
													</p>
												</div>
											</td>
											{ROLES.map((role) => (
												<PermissionCell
													key={role.level}
													hasPermission={hasRolePermission(role.level, perm.resource, perm.action, perm.context)}
												/>
											))}
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</Card>
			))}
		</>
	)
}

