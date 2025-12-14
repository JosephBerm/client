'use client'

/**
 * RBAC Dashboard Page
 * 
 * Admin-only dashboard providing an overview of the Role-Based Access Control system.
 * Displays role statistics, recent activity, and quick actions for managing access.
 * 
 * Features:
 * - Live role distribution statistics from API
 * - Visual role hierarchy cards
 * - Quick actions for common RBAC tasks
 * - Responsive design with proper loading states
 * 
 * @module RBAC Dashboard
 */

import { useState, useEffect } from 'react'

import Link from 'next/link'

import { 
	Shield, 
	Users, 
	Key, 
	Lock, 
	UserCheck, 
	UserX,
	ChevronRight,
	AlertTriangle,
	CheckCircle2,
	TrendingUp,
	RefreshCw,
	Loader2
} from 'lucide-react'

import { Routes } from '@_features/navigation'

import { usePermissions, RoleLevels, API, notificationService } from '@_shared'
import type { RoleDistribution } from '@_shared'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import type { RoleLevel } from '@_types/rbac'

import { InternalPageHeader } from '../_components'

// ============================================================================
// TYPES
// ============================================================================

interface RoleInfo {
	level: RoleLevel
	name: string
	displayName: string
	description: string
	color: string
	bgColor: string
	permissions: number
	icon: React.ReactNode
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

const ROLE_DEFINITIONS: RoleInfo[] = [
	{
		level: RoleLevels.Admin,
		name: 'admin',
		displayName: 'Administrator',
		description: 'Full system access with all permissions. Can manage users, roles, and system settings.',
		color: 'text-error',
		bgColor: 'bg-error/10',
		permissions: 999,
		icon: <Shield className="w-5 h-5" />,
	},
	{
		level: RoleLevels.FulfillmentCoordinator,
		name: 'fulfillment_coordinator',
		displayName: 'Fulfillment Coordinator',
		description: 'Manages order fulfillment, tracking, and vendor coordination.',
		color: 'text-info',
		bgColor: 'bg-info/10',
		permissions: 15,
		icon: <UserCheck className="w-5 h-5" />,
	},
	{
		level: RoleLevels.SalesManager,
		name: 'sales_manager',
		displayName: 'Sales Manager',
		description: 'Oversees sales team, approves quotes, manages team members and analytics.',
		color: 'text-warning',
		bgColor: 'bg-warning/10',
		permissions: 35,
		icon: <TrendingUp className="w-5 h-5" />,
	},
	{
		level: RoleLevels.SalesRep,
		name: 'sales_rep',
		displayName: 'Sales Representative',
		description: 'Handles quotes, orders, and customer relationships for assigned accounts.',
		color: 'text-success',
		bgColor: 'bg-success/10',
		permissions: 25,
		icon: <Users className="w-5 h-5" />,
	},
	{
		level: RoleLevels.Customer,
		name: 'customer',
		displayName: 'Customer',
		description: 'Standard customer access. Can view own orders, quotes, and profile.',
		color: 'text-base-content/70',
		bgColor: 'bg-base-200',
		permissions: 12,
		icon: <UserX className="w-5 h-5" />,
	},
]

// ============================================================================
// COMPONENTS
// ============================================================================

function RoleCard({ role }: { role: RoleInfo }) {
	return (
		<Card className={`${role.bgColor} border-none hover:shadow-lg transition-all duration-200`}>
			<div className="p-5">
				<div className="flex items-start justify-between">
					<div className={`p-2 rounded-lg ${role.bgColor} ${role.color}`}>
						{role.icon}
					</div>
					<div className="text-right">
						<span className={`text-xs font-mono ${role.color}`}>
							Level {role.level}
						</span>
					</div>
				</div>
				<h3 className={`mt-3 font-semibold ${role.color}`}>
					{role.displayName}
				</h3>
				<p className="mt-1 text-sm text-base-content/60 line-clamp-2">
					{role.description}
				</p>
				<div className="mt-3 flex items-center gap-2">
					<Lock className="w-3.5 h-3.5 text-base-content/40" />
					<span className="text-xs text-base-content/50">
						{role.permissions === 999 ? 'All' : role.permissions} permissions
					</span>
				</div>
			</div>
		</Card>
	)
}

function QuickActionCard({
	title,
	description,
	icon,
	href,
	color = 'text-primary',
}: {
	title: string
	description: string
	icon: React.ReactNode
	href: string
	color?: string
}) {
	return (
		<Link href={href}>
			<Card className="hover:shadow-md transition-all duration-200 hover:border-primary/30 cursor-pointer h-full">
				<div className="p-4 flex items-center gap-4">
					<div className={`p-3 rounded-lg bg-base-200 ${color}`}>
						{icon}
					</div>
					<div className="flex-1 min-w-0">
						<h4 className="font-medium text-base-content">{title}</h4>
						<p className="text-sm text-base-content/60 truncate">{description}</p>
					</div>
					<ChevronRight className="w-5 h-5 text-base-content/30" />
				</div>
			</Card>
		</Link>
	)
}

function StatCard({
	label,
	value,
	icon,
	trend,
	color = 'text-primary',
}: {
	label: string
	value: string | number
	icon: React.ReactNode
	trend?: string
	color?: string
}) {
	return (
		<Card className="bg-base-100">
			<div className="p-4">
				<div className="flex items-center justify-between">
					<div className={`p-2 rounded-lg bg-base-200 ${color}`}>
						{icon}
					</div>
					{trend && (
						<span className="text-xs text-success flex items-center gap-1">
							<CheckCircle2 className="w-3 h-3" />
							{trend}
						</span>
					)}
				</div>
				<div className="mt-3">
					<span className="text-2xl font-bold">{value}</span>
					<p className="text-sm text-base-content/60 mt-0.5">{label}</p>
				</div>
			</div>
		</Card>
	)
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function RBACDashboardPage() {
	const { isAdmin } = usePermissions()
	const [roleStats, setRoleStats] = useState<RoleDistribution | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	// Fetch role statistics from API (React Compiler auto-memoizes)
	const fetchStats = async (showNotification = false) => {
		setIsLoading(true)
		try {
			const response = await API.Accounts.getRoleStats()
			if (response.data.statusCode === 200 && response.data.payload) {
				setRoleStats(response.data.payload)
				if (showNotification) {
					notificationService.success('Statistics refreshed', {
						component: 'RBACDashboardPage',
						action: 'fetchStats',
					})
				}
			} else {
				notificationService.error(response.data.message ?? 'Failed to load statistics', {
					component: 'RBACDashboardPage',
					action: 'fetchStats',
				})
			}
		} catch (_err) {
			notificationService.error('Unable to connect to server', {
				component: 'RBACDashboardPage',
				action: 'fetchStats',
			})
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (isAdmin) {
			void fetchStats()
		}
	}, [isAdmin])

	// Calculate derived stats (React Compiler auto-memoizes)
	const derivedStats = {
		totalRoles: 5,
		totalUsers: roleStats?.totalUsers ?? 0,
		activePermissions: 47, // Hardcoded for now
		recentChanges: 0, // Would need audit log API
	}

	// Check if user has access
	if (!isAdmin) {
		return (
			<>
				<InternalPageHeader
					title="Access Denied"
					description="You do not have permission to access this page."
				/>
				<Card className="border-error/30 bg-error/5 p-8">
					<div className="flex flex-col items-center text-center">
						<AlertTriangle className="w-12 h-12 text-error mb-4" />
						<h3 className="text-lg font-semibold text-error">Administrator Access Required</h3>
						<p className="mt-2 text-base-content/70 max-w-md">
							The RBAC Management section is only accessible to administrators.
							Please contact your system administrator if you need access.
						</p>
						<Link href={Routes.Dashboard.location} className="mt-6">
							<Button variant="primary">Return to Dashboard</Button>
						</Link>
					</div>
				</Card>
			</>
		)
	}

	return (
		<>
			<InternalPageHeader
				title="Access Control"
				description="Manage roles, permissions, and user access across the platform"
				actions={
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
						<Button 
							variant="ghost" 
							size="sm"
							leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
							onClick={() => void fetchStats(true)}
							disabled={isLoading}
						>
							Refresh
						</Button>
						<Link href={Routes.Accounts.location} className="w-full sm:w-auto">
							<Button variant="primary" size="sm" leftIcon={<UserCheck className="w-4 h-4" />} className="w-full">
								Manage Users
							</Button>
						</Link>
					</div>
				}
			/>

			{/* Statistics Overview */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<StatCard
					label="Total Roles"
					value={derivedStats.totalRoles}
					icon={<Key className="w-5 h-5" />}
					color="text-primary"
				/>
				<StatCard
					label="Total Users"
					value={isLoading ? '...' : derivedStats.totalUsers}
					icon={<Users className="w-5 h-5" />}
					color="text-success"
				/>
				<StatCard
					label="Permissions"
					value={derivedStats.activePermissions}
					icon={<Lock className="w-5 h-5" />}
					color="text-warning"
				/>
				<StatCard
					label="Recent Changes"
					value={derivedStats.recentChanges}
					icon={<TrendingUp className="w-5 h-5" />}
					trend="This week"
					color="text-info"
				/>
			</div>

			{/* Role Distribution */}
			{roleStats && (
				<Card className="mb-8 bg-linear-to-br from-base-100 to-base-200">
					<div className="p-6">
						<h2 className="text-lg font-semibold mb-4">Role Distribution</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
							<div className="text-center p-4 rounded-lg bg-error/10">
								<div className="text-2xl font-bold text-error">{roleStats.adminCount}</div>
								<div className="text-sm text-base-content/60">Admins</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-warning/10">
								<div className="text-2xl font-bold text-warning">{roleStats.salesManagerCount}</div>
								<div className="text-sm text-base-content/60">Sales Managers</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-info/10">
								<div className="text-2xl font-bold text-info">{roleStats.fulfillmentCoordinatorCount}</div>
								<div className="text-sm text-base-content/60">Fulfillment</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-success/10">
								<div className="text-2xl font-bold text-success">{roleStats.salesRepCount}</div>
								<div className="text-sm text-base-content/60">Sales Reps</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-base-300">
								<div className="text-2xl font-bold text-base-content">{roleStats.customerCount}</div>
								<div className="text-sm text-base-content/60">Customers</div>
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Role Hierarchy */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Role Hierarchy</h2>
					<Link href={Routes.RBAC.roles}>
						<Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
							View All Roles
						</Button>
					</Link>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
					{ROLE_DEFINITIONS.map((role) => (
						<RoleCard key={role.level} role={role} />
					))}
				</div>
			</div>

			{/* Quick Actions */}
			<div>
				<h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<QuickActionCard
						title="Manage Users"
						description="User accounts & role assignments"
						icon={<Users className="w-5 h-5" />}
						href={Routes.Accounts.location}
						color="text-success"
					/>
					<QuickActionCard
						title="Role Definitions"
						description="View role capabilities & restrictions"
						icon={<Key className="w-5 h-5" />}
						href={Routes.RBAC.roles}
						color="text-primary"
					/>
					<QuickActionCard
						title="Permissions Matrix"
						description="Resource permissions by role"
						icon={<Lock className="w-5 h-5" />}
						href={Routes.RBAC.permissions}
						color="text-warning"
					/>
				</div>
			</div>

			{/* Security Notice */}
			<Card className="mt-8 bg-info/5 border-info/20">
				<div className="p-4 flex items-start gap-4">
					<div className="p-2 rounded-lg bg-info/10 text-info">
						<Shield className="w-5 h-5" />
					</div>
					<div>
						<h4 className="font-medium text-info">Role-Based Access Control</h4>
						<p className="mt-1 text-sm text-base-content/70">
							MedSource Pro uses a hierarchical RBAC system where higher-level roles inherit 
							permissions from lower levels. Changes to user roles take effect immediately 
							and are logged for security auditing.
						</p>
					</div>
				</div>
			</Card>
		</>
	)
}

