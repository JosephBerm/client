'use client'

/**
 * RBAC Roles Page
 * 
 * Displays all system roles with their permissions and capabilities.
 * Admin-only page for understanding and managing role definitions.
 * 
 * @module RBAC Roles
 */

import Link from 'next/link'

import { 
	Shield, 
	Users, 
	Key, 
	Lock, 
	UserCheck,
	ChevronLeft,
	Check,
	X,
	Info
} from 'lucide-react'

import { Routes } from '@_features/navigation'

import { usePermissions, RoleLevels } from '@_shared/hooks/usePermissions'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import type { RoleLevel } from '@_types/rbac'

import { InternalPageHeader } from '../../_components'

// ============================================================================
// TYPES
// ============================================================================

interface RoleDefinition {
	level: RoleLevel
	name: string
	displayName: string
	description: string
	color: string
	bgColor: string
	textColor: string
	icon: React.ReactNode
	capabilities: string[]
	restrictions: string[]
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

const ROLE_DEFINITIONS: RoleDefinition[] = [
	{
		level: RoleLevels.Admin,
		name: 'admin',
		displayName: 'Administrator',
		description: 'Full system access with unrestricted permissions across all resources and actions.',
		color: 'border-error/30',
		bgColor: 'bg-error/5',
		textColor: 'text-error',
		icon: <Shield className="w-6 h-6" />,
		capabilities: [
			'Full access to all resources',
			'Delete quotes, orders, and users',
			'Manage system settings',
			'Create and modify products',
			'Access all analytics',
			'Manage vendors and providers',
			'Assign roles to any user',
		],
		restrictions: [
			'No restrictions - full system access',
		],
	},
	{
		level: RoleLevels.FulfillmentCoordinator,
		name: 'fulfillment_coordinator',
		displayName: 'Fulfillment Coordinator',
		description: 'Specialized role for managing order fulfillment, shipping logistics, and vendor coordination.',
		color: 'border-info/30',
		bgColor: 'bg-info/5',
		textColor: 'text-info',
		icon: <UserCheck className="w-6 h-6" />,
		capabilities: [
			'View and update all orders',
			'Confirm payments',
			'Update tracking information',
			'Read vendor information',
			'Update vendor details',
			'View products',
		],
		restrictions: [
			'Cannot delete orders or quotes',
			'Cannot manage user roles',
			'No access to analytics',
			'Cannot create vendors',
			'Limited customer access',
		],
	},
	{
		level: RoleLevels.SalesManager,
		name: 'sales_manager',
		displayName: 'Sales Manager',
		description: 'Oversees sales team operations with access to team data, approvals, and analytics.',
		color: 'border-warning/30',
		bgColor: 'bg-warning/5',
		textColor: 'text-warning',
		icon: <Key className="w-6 h-6" />,
		capabilities: [
			'View all quotes and orders',
			'Approve quotes',
			'Assign quotes to team members',
			'View team analytics',
			'Export analytics data',
			'Create user accounts',
			'View and update team members',
			'Access all customers',
		],
		restrictions: [
			'Cannot delete quotes or orders',
			'Cannot modify products',
			'Cannot manage vendors',
			'Limited to team user management',
			'No system settings access',
		],
	},
	{
		level: RoleLevels.SalesRep,
		name: 'sales_rep',
		displayName: 'Sales Representative',
		description: 'Handles assigned customer relationships, quotes, and orders.',
		color: 'border-success/30',
		bgColor: 'bg-success/5',
		textColor: 'text-success',
		icon: <Users className="w-6 h-6" />,
		capabilities: [
			'View own and assigned quotes',
			'Update assigned quotes',
			'View own and assigned orders',
			'Create orders from quotes',
			'Confirm payments',
			'Update tracking info',
			'Create and manage assigned customers',
			'View own analytics',
			'Read vendor information',
		],
		restrictions: [
			'Cannot approve quotes',
			'Cannot view team or all resources',
			'No delete permissions',
			'Cannot manage other users',
			'No analytics export',
		],
	},
	{
		level: RoleLevels.Customer,
		name: 'customer',
		displayName: 'Customer',
		description: 'Standard customer account with access to own resources and basic functionality.',
		color: 'border-base-300',
		bgColor: 'bg-base-200',
		textColor: 'text-base-content/70',
		icon: <Lock className="w-6 h-6" />,
		capabilities: [
			'View own quotes and orders',
			'Create quote requests',
			'Update own profile',
			'View products',
			'Read system settings',
		],
		restrictions: [
			'Cannot view other users\' resources',
			'Cannot delete any resources',
			'No admin access',
			'Cannot view vendors',
			'No analytics access',
		],
	},
]

// ============================================================================
// COMPONENTS
// ============================================================================

function RoleCard({ role }: { role: RoleDefinition }) {
	return (
		<Card className={`${role.color} ${role.bgColor}`}>
			<div className="p-6">
				{/* Header */}
				<div className="flex items-start gap-4">
					<div className={`p-3 rounded-xl ${role.bgColor} ${role.textColor} border ${role.color}`}>
						{role.icon}
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-3">
							<h3 className={`text-lg font-semibold ${role.textColor}`}>
								{role.displayName}
							</h3>
							<span className={`px-2 py-0.5 rounded text-xs font-mono ${role.bgColor} ${role.textColor} border ${role.color}`}>
								Level {role.level}
							</span>
						</div>
						<p className="mt-1 text-sm text-base-content/60">
							{role.description}
						</p>
					</div>
				</div>

				{/* Capabilities & Restrictions */}
				<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Capabilities */}
					<div>
						<h4 className="text-sm font-medium text-base-content/80 flex items-center gap-2 mb-3">
							<Check className="w-4 h-4 text-success" />
							Capabilities
						</h4>
						<ul className="space-y-2">
							{role.capabilities.map((cap, i) => (
								<li key={i} className="flex items-start gap-2 text-sm text-base-content/70">
									<Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
									<span>{cap}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Restrictions */}
					<div>
						<h4 className="text-sm font-medium text-base-content/80 flex items-center gap-2 mb-3">
							<X className="w-4 h-4 text-error" />
							Restrictions
						</h4>
						<ul className="space-y-2">
							{role.restrictions.map((res, i) => (
								<li key={i} className="flex items-start gap-2 text-sm text-base-content/70">
									<X className="w-4 h-4 text-error shrink-0 mt-0.5" />
									<span>{res}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</Card>
	)
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function RBACRolesPage() {
	const { isAdmin } = usePermissions()

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
				title="Role Definitions"
				description="System roles, capabilities, and access restrictions"
				actions={
					<Link href={Routes.RBAC.location}>
						<Button variant="ghost" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
							Back to RBAC
						</Button>
					</Link>
				}
			/>

			{/* Info Banner */}
			<Card className="mb-6 bg-info/5 border-info/20">
				<div className="p-4 flex items-start gap-3">
					<Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
					<div>
						<h4 className="font-medium text-info">Hierarchical Role System</h4>
						<p className="mt-1 text-sm text-base-content/70">
							Roles in MedSource Pro follow a hierarchical structure where higher-level roles 
							automatically inherit all permissions from lower levels. The Administrator role 
							has full system access, while Customer has the most restricted access.
						</p>
					</div>
				</div>
			</Card>

			{/* Role Cards */}
			<div className="space-y-6">
				{ROLE_DEFINITIONS.map((role) => (
					<RoleCard key={role.level} role={role} />
				))}
			</div>

			{/* Quick Links */}
			<div className="mt-8 flex flex-wrap gap-4">
				<Link href={Routes.RBAC.permissions}>
					<Button variant="outline" size="sm" leftIcon={<Lock className="w-4 h-4" />}>
						View Permissions Matrix
					</Button>
				</Link>
				<Link href={Routes.Accounts.location}>
					<Button variant="outline" size="sm" leftIcon={<Users className="w-4 h-4" />}>
						Manage Users
					</Button>
				</Link>
			</div>
		</>
	)
}

