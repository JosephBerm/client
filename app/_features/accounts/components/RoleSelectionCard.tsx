'use client'

/**
 * RoleSelectionCard Component
 * 
 * MAANG-level role selection card with permission preview.
 * Shows detailed role information including key permissions.
 * 
 * Features:
 * - Visual hierarchy with icons and colors
 * - Permission preview on hover/expand
 * - Confirmation state for high-privilege roles
 * - Keyboard accessible
 * - Mobile-responsive
 * 
 * @module features/accounts/components/RoleSelectionCard
 */

import { useState } from 'react'

import {
	User,
	Briefcase,
	ChartBar,
	Package,
	Shield,
	Check,
	ChevronDown,
	AlertTriangle,
} from 'lucide-react'

import { type RoleOption, roleRequiresConfirmation } from '@_shared'

import { AccountRole, type AccountRoleType } from '@_classes/Enums'

// ============================================================================
// ICON MAPPING
// ============================================================================

const LUCIDE_ICONS = {
	User,
	Briefcase,
	ChartBar,
	Package,
	Shield,
} as const

// ============================================================================
// TYPES
// ============================================================================

export interface RoleSelectionCardProps {
	role: RoleOption
	isSelected: boolean
	isCurrentRole?: boolean
	onSelect: (role: AccountRoleType) => void
	showPermissions?: boolean
}

// ============================================================================
// COLOR MAPPINGS
// ============================================================================

const COLOR_CLASSES = {
	default: {
		bg: 'bg-base-200',
		border: 'border-base-300',
		selectedBorder: 'border-base-content',
		icon: 'text-base-content/70',
		badge: 'badge-ghost',
	},
	info: {
		bg: 'bg-info/5',
		border: 'border-info/20',
		selectedBorder: 'border-info',
		icon: 'text-info',
		badge: 'badge-info',
	},
	success: {
		bg: 'bg-success/5',
		border: 'border-success/20',
		selectedBorder: 'border-success',
		icon: 'text-success',
		badge: 'badge-success',
	},
	warning: {
		bg: 'bg-warning/5',
		border: 'border-warning/20',
		selectedBorder: 'border-warning',
		icon: 'text-warning',
		badge: 'badge-warning',
	},
	error: {
		bg: 'bg-error/5',
		border: 'border-error/20',
		selectedBorder: 'border-error',
		icon: 'text-error',
		badge: 'badge-error',
	},
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function RoleSelectionCard({
	role,
	isSelected,
	isCurrentRole = false,
	onSelect,
	showPermissions = true,
}: RoleSelectionCardProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	
	// Map RoleBadgeVariant to COLOR_CLASSES keys (defensive programming)
	const colorKey = role.color === 'secondary' ? 'default' : role.color === 'primary' ? 'info' : role.color
	const colors = COLOR_CLASSES[colorKey as keyof typeof COLOR_CLASSES] ?? COLOR_CLASSES.default
	
	// Handle optional lucideIcon (defensive programming)
	const IconComponent = role.lucideIcon && role.lucideIcon in LUCIDE_ICONS 
		? LUCIDE_ICONS[role.lucideIcon as keyof typeof LUCIDE_ICONS]
		: LUCIDE_ICONS.User
	
	const requiresConfirmation = roleRequiresConfirmation(role.value)

	const handleClick = () => {
		if (isCurrentRole) return
		onSelect(role.value as AccountRoleType)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (isCurrentRole) return
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onSelect(role.value as AccountRoleType)
		}
	}

	const toggleExpand = (e: React.MouseEvent) => {
		e.stopPropagation()
		setIsExpanded(!isExpanded)
	}

	return (
		<div
			role="button"
			tabIndex={isCurrentRole ? -1 : 0}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			aria-disabled={isCurrentRole}
			aria-selected={isSelected}
			className={`
				relative p-4 rounded-xl border-2 text-left transition-all duration-200
				${isCurrentRole 
					? 'opacity-50 cursor-not-allowed bg-base-200/50 border-base-300' 
					: isSelected
						? `${colors.bg} ${colors.selectedBorder} cursor-pointer ring-2 ring-offset-2 ring-offset-base-100`
						: `bg-base-100 border-base-300 hover:border-base-content/30 hover:shadow-md cursor-pointer`
				}
				${isSelected && colorKey === 'warning' ? 'ring-warning/50' : ''}
				${isSelected && colorKey === 'info' ? 'ring-info/50' : ''}
				${isSelected && colorKey === 'default' ? 'ring-base-content/20' : ''}
			`}
		>
			{/* Selection indicator */}
			{isSelected && (
				<div className={`absolute top-3 right-3 p-1 rounded-full ${colors.bg}`}>
					<Check className={`w-4 h-4 ${colors.icon}`} />
				</div>
			)}

			{/* Main content */}
			<div className="flex items-start gap-3">
				{/* Icon */}
				<div className={`p-2.5 rounded-lg ${colors.bg}`}>
					<IconComponent className={`w-6 h-6 ${colors.icon}`} />
				</div>

				{/* Text content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-semibold text-base-content">
							{role.label}
						</span>
						{isCurrentRole && (
							<span className="badge badge-sm badge-ghost">Current</span>
						)}
						{requiresConfirmation && !isCurrentRole && (
							<span className="badge badge-sm badge-warning gap-1">
								<AlertTriangle className="w-3 h-3" />
								High Access
							</span>
						)}
					</div>
					<p className="text-sm text-base-content/60 mt-1">
						{role.description}
					</p>
				</div>
			</div>

			{/* Permissions preview (expandable) */}
    {showPermissions && role.keyPermissions && role.keyPermissions.length > 0 && (
				<div className="mt-3 pt-3 border-t border-base-300/50">
					<button
						type="button"
						onClick={toggleExpand}
						className="flex items-center gap-1 text-xs text-base-content/50 hover:text-base-content/70 transition-colors"
					>
						<ChevronDown 
							className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
						/>
       {isExpanded ? 'Hide' : 'View'} permissions ({role.keyPermissions?.length ?? 0})
					</button>
					
					{isExpanded && (
						<ul className="mt-2 space-y-1">
        {role.keyPermissions?.map((permission: string, idx: number) => (
								<li 
									key={idx}
									className="flex items-center gap-2 text-xs text-base-content/70"
								>
									<span className={`w-1.5 h-1.5 rounded-full ${colors.icon} opacity-60`} />
									{permission}
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	)
}

