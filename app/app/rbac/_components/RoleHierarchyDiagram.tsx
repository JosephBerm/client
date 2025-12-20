/**
 * RoleHierarchyDiagram Component
 *
 * Visual representation of the role hierarchy.
 * Shows roles as connected nodes with level indicators.
 *
 * @see prd_rbac_management.md - US-RBAC-001
 * @module app/rbac/_components/RoleHierarchyDiagram
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	Shield,
	Users,
	UserCheck,
	Package,
	Crown,
	ChevronDown,
	ChevronUp,
	Lock,
} from 'lucide-react'

import Card from '@_components/ui/Card'

import type { RoleDefinitionDto } from '@_types/rbac-management'

// =========================================================================
// TYPES
// =========================================================================

interface RoleHierarchyDiagramProps {
	roles: RoleDefinitionDto[]
	onRoleClick?: (role: RoleDefinitionDto) => void
}

// =========================================================================
// ROLE ICONS
// =========================================================================

const ROLE_ICONS: Record<number, typeof Shield> = {
	0: Users, // Customer
	100: UserCheck, // SalesRep
	200: Shield, // SalesManager
	300: Package, // FulfillmentCoordinator
	9999999: Crown, // Admin
}

const ROLE_COLORS: Record<number, string> = {
	0: 'from-slate-500 to-slate-600',
	100: 'from-blue-500 to-blue-600',
	200: 'from-purple-500 to-purple-600',
	300: 'from-amber-500 to-amber-600',
	9999999: 'from-rose-500 to-rose-600',
}

const ROLE_BG_COLORS: Record<number, string> = {
	0: 'bg-slate-500/10 border-slate-500/30',
	100: 'bg-blue-500/10 border-blue-500/30',
	200: 'bg-purple-500/10 border-purple-500/30',
	300: 'bg-amber-500/10 border-amber-500/30',
	9999999: 'bg-rose-500/10 border-rose-500/30',
}

// =========================================================================
// COMPONENT
// =========================================================================

export function RoleHierarchyDiagram({ roles, onRoleClick }: RoleHierarchyDiagramProps) {
	const [expandedRole, setExpandedRole] = useState<number | null>(null)

	// Sort roles by level (highest first for visual hierarchy)
	const sortedRoles = [...roles].sort((a, b) => b.level - a.level)

	const toggleRole = (roleId: number) => {
		setExpandedRole((prev) => (prev === roleId ? null : roleId))
	}

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-base-content">Role Hierarchy</h3>
				<p className="text-sm text-base-content/60">
					Higher roles inherit permissions from lower roles
				</p>
			</div>

			<div className="space-y-4">
				{sortedRoles.map((role, index) => {
					const Icon = ROLE_ICONS[role.level] || Shield
					const gradient = ROLE_COLORS[role.level] || 'from-gray-500 to-gray-600'
					const bgColor = ROLE_BG_COLORS[role.level] || 'bg-gray-500/10 border-gray-500/30'
					const isExpanded = expandedRole === role.id
					const isLast = index === sortedRoles.length - 1

					return (
						<div key={role.id} className="relative">
							{/* Connection line */}
							{!isLast && (
								<div className="absolute left-8 top-full h-4 w-0.5 bg-gradient-to-b from-base-content/20 to-transparent" />
							)}

							{/* Role card */}
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className={`relative rounded-xl border p-4 transition-all ${bgColor} ${
									onRoleClick ? 'cursor-pointer hover:shadow-md' : ''
								}`}
								onClick={() => onRoleClick?.(role)}
							>
								<div className="flex items-start justify-between">
									{/* Left side: Icon and info */}
									<div className="flex items-start gap-4">
										{/* Icon */}
										<div
											className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
										>
											<Icon className="h-6 w-6 text-white" />
										</div>

										{/* Info */}
										<div>
											<div className="flex items-center gap-2">
												<h4 className="font-semibold text-base-content">
													{role.displayName}
												</h4>
												{role.isSystemRole && (
													<span className="flex items-center gap-1 rounded-full bg-base-content/10 px-2 py-0.5 text-xs text-base-content/60">
														<Lock className="h-3 w-3" />
														System
													</span>
												)}
											</div>
											<p className="text-sm text-base-content/60">
												Level {role.level.toLocaleString()}
											</p>
											{role.description && (
												<p className="mt-1 text-sm text-base-content/50">
													{role.description}
												</p>
											)}
										</div>
									</div>

									{/* Right side: User count and expand */}
									<div className="flex items-center gap-4">
										{/* User count badge */}
										<div className="text-right">
											<span className="text-2xl font-bold text-base-content">
												{role.userCount}
											</span>
											<p className="text-xs text-base-content/60">
												user{role.userCount !== 1 ? 's' : ''}
											</p>
										</div>

										{/* Expand button */}
										<button
											onClick={(e) => {
												e.stopPropagation()
												toggleRole(role.id)
											}}
											className="rounded-lg p-2 hover:bg-base-content/10 transition-colors"
											aria-label={isExpanded ? 'Collapse permissions' : 'Expand permissions'}
										>
											{isExpanded ? (
												<ChevronUp className="h-5 w-5 text-base-content/60" />
											) : (
												<ChevronDown className="h-5 w-5 text-base-content/60" />
											)}
										</button>
									</div>
								</div>

								{/* Expanded permissions */}
								<AnimatePresence>
									{isExpanded && role.permissions.length > 0 && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.2 }}
											className="overflow-hidden"
										>
											<div className="mt-4 border-t border-base-content/10 pt-4">
												<p className="mb-2 text-xs font-medium uppercase tracking-wider text-base-content/60">
													Permissions ({role.permissions.length})
												</p>
												<div className="flex flex-wrap gap-2">
													{role.permissions.map((permission) => (
														<span
															key={permission}
															className="rounded-md bg-base-content/5 px-2 py-1 text-xs text-base-content/70 font-mono"
														>
															{permission}
														</span>
													))}
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						</div>
					)
				})}
			</div>

			{/* Legend */}
			<div className="mt-6 border-t border-base-content/10 pt-4">
				<p className="mb-2 text-xs font-medium uppercase tracking-wider text-base-content/60">
					Hierarchy Direction
				</p>
				<div className="flex items-center gap-2 text-sm text-base-content/60">
					<Crown className="h-4 w-4" />
					<span>Higher authority</span>
					<span className="mx-2">→</span>
					<Users className="h-4 w-4" />
					<span>Base permissions</span>
				</div>
			</div>
		</Card>
	)
}

export default RoleHierarchyDiagram

