'use client'

/**
 * RBAC Roles Page
 *
 * Displays all system roles with their permissions and capabilities.
 * Admin-only page for understanding and managing role definitions.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Database-Driven RBAC
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * All role data is fetched from the database via API.
 * NO hardcoded role definitions - enables white-label customization.
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
	Info,
	Edit,
	Crown,
	Package,
	Loader2,
	AlertCircle,
} from 'lucide-react'

import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../../_components'
import { useRoles } from '../_hooks/useRoles'

import type { Role } from '@_shared/services/api'

// ============================================================================
// ICON & COLOR MAPPING (by role name, not level)
// ============================================================================

/**
 * Maps role names to Lucide icons.
 * Uses role name (from database) for flexibility.
 */
const ROLE_ICON_MAP: Record<string, React.ReactNode> = {
	super_admin: <Crown className="w-6 h-6" />,
	admin: <Shield className="w-6 h-6" />,
	sales_manager: <Key className="w-6 h-6" />,
	sales_rep: <Users className="w-6 h-6" />,
	fulfillment_coordinator: <Package className="w-6 h-6" />,
	customer: <Lock className="w-6 h-6" />,
}

/**
 * Maps role names to color schemes.
 * Fallback provided for custom roles.
 */
const ROLE_COLOR_MAP: Record<string, { color: string; bgColor: string; textColor: string }> = {
	super_admin: {
		color: 'border-warning/30',
		bgColor: 'bg-warning/5',
		textColor: 'text-warning',
	},
	admin: {
		color: 'border-error/30',
		bgColor: 'bg-error/5',
		textColor: 'text-error',
	},
	sales_manager: {
		color: 'border-purple-500/30',
		bgColor: 'bg-purple-500/5',
		textColor: 'text-purple-500',
	},
	sales_rep: {
		color: 'border-success/30',
		bgColor: 'bg-success/5',
		textColor: 'text-success',
	},
	fulfillment_coordinator: {
		color: 'border-info/30',
		bgColor: 'bg-info/5',
		textColor: 'text-info',
	},
	customer: {
		color: 'border-base-300',
		bgColor: 'bg-base-200',
		textColor: 'text-base-content/70',
	},
}

const DEFAULT_COLORS = {
	color: 'border-base-300',
	bgColor: 'bg-base-200',
	textColor: 'text-base-content/70',
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRoleIcon(roleName: string): React.ReactNode {
	return ROLE_ICON_MAP[roleName] ?? <UserCheck className="w-6 h-6" />
}

function getRoleColors(roleName: string) {
	return ROLE_COLOR_MAP[roleName] ?? DEFAULT_COLORS
}

// ============================================================================
// COMPONENTS
// ============================================================================

function RoleCard({ role }: { role: Role }) {
	const colors = getRoleColors(role.name)
	const icon = getRoleIcon(role.name)

	return (
		<Card className={`${colors.color} ${colors.bgColor}`}>
			<div className="p-6">
				{/* Header */}
				<div className="flex items-start gap-4">
					<div className={`p-3 rounded-xl ${colors.bgColor} ${colors.textColor} border ${colors.color}`}>
						{icon}
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-3">
							<h3 className={`text-lg font-semibold ${colors.textColor}`}>
								{role.displayName}
							</h3>
							<span className={`px-2 py-0.5 rounded text-xs font-mono ${colors.bgColor} ${colors.textColor} border ${colors.color}`}>
								Level {role.level.toLocaleString()}
							</span>
							{role.isSystemRole && (
								<span className="px-2 py-0.5 rounded text-xs bg-base-content/10 text-base-content/60 flex items-center gap-1">
									<Lock className="w-3 h-3" />
									System
								</span>
							)}
						</div>
						<p className="mt-1 text-sm text-base-content/60">
							{role.description || 'No description provided'}
						</p>
					</div>
				</div>

				{/* Role Metadata */}
				<div className="mt-4 pt-4 border-t border-base-content/10">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<span className="text-base-content/50 text-xs uppercase tracking-wider">Name</span>
							<p className="font-mono text-base-content/70">{role.name}</p>
						</div>
						<div>
							<span className="text-base-content/50 text-xs uppercase tracking-wider">Level</span>
							<p className="font-mono text-base-content/70">{role.level.toLocaleString()}</p>
						</div>
						<div>
							<span className="text-base-content/50 text-xs uppercase tracking-wider">Created</span>
							<p className="text-base-content/70">
								{new Date(role.createdAt).toLocaleDateString()}
							</p>
						</div>
						<div>
							<span className="text-base-content/50 text-xs uppercase tracking-wider">Updated</span>
							<p className="text-base-content/70">
								{new Date(role.updatedAt).toLocaleDateString()}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Card>
	)
}

function LoadingState() {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
			<p className="text-base-content/60">Loading roles from database...</p>
		</div>
	)
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<Card className="border-error/30 bg-error/5 p-8 text-center">
			<AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
			<h3 className="text-lg font-semibold text-error">Failed to Load Roles</h3>
			<p className="mt-2 text-base-content/70">{message}</p>
			<Button
				variant="outline"
				size="sm"
				onClick={onRetry}
				className="mt-4"
			>
				Try Again
			</Button>
		</Card>
	)
}

function EmptyState() {
	return (
		<Card className="border-warning/30 bg-warning/5 p-8 text-center">
			<Info className="w-12 h-12 text-warning mx-auto mb-4" />
			<h3 className="text-lg font-semibold text-warning">No Roles Found</h3>
			<p className="mt-2 text-base-content/70">
				The RBAC system has no roles configured. Please run the RBAC reset to seed default roles.
			</p>
		</Card>
	)
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function RBACRolesPage() {
	const { isAdmin } = usePermissions()
	const { roles, isLoading, fetchRoles } = useRoles({ autoFetch: true })

	// Sort roles by level (highest first)
	const sortedRoles = [...(roles ?? [])].sort((a, b) => b.level - a.level)

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
				description="System roles fetched from database"
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
						<h4 className="font-medium text-info">Database-Driven Role System</h4>
						<p className="mt-1 text-sm text-base-content/70">
							All roles are fetched from the database and can be customized for white-label deployments.
							Higher-level roles inherit permissions from lower levels. Use the Manage Roles page to
							create, edit, or delete roles.
						</p>
					</div>
				</div>
			</Card>

			{/* Content */}
			{isLoading ? (
				<LoadingState />
			) : !roles || roles.length === 0 ? (
				<EmptyState />
			) : (
				<div className="space-y-6">
					{sortedRoles.map((role) => (
						<RoleCard key={role.id} role={role} />
					))}
				</div>
			)}

			{/* Quick Links */}
			<div className="mt-8 flex flex-wrap gap-4">
				<Link href={Routes.RBAC.rolesManage}>
					<Button variant="primary" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
						Manage Roles
					</Button>
				</Link>
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
