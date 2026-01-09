'use client'

/**
 * RoleSelectionCard Component
 *
 * MAANG-level role selection card with permission preview.
 * Shows detailed role information including key permissions.
 *
 * Features:
 * - Visual hierarchy with icons and colors
 * - Confirmation state for high-privilege roles
 * - Keyboard accessible
 * - Mobile-responsive
 *
 * @module features/accounts/components/RoleSelectionCard
 */

import { User, Briefcase, ChartBar, Package, Shield, Check, AlertTriangle } from 'lucide-react'

import { DEFAULT_ROLE_THRESHOLDS, type RoleMetadataEntry } from '@_shared'

// ============================================================================
// ICON MAPPING - Map role names to icons
// ============================================================================

const ROLE_ICONS: Record<string, typeof User> = {
	customer: User,
	fulfillment_coordinator: Package,
	sales_rep: Briefcase,
	sales_manager: ChartBar,
	admin: Shield,
	super_admin: Shield,
}

// ============================================================================
// TYPES
// ============================================================================

export interface RoleSelectionCardProps {
	role: RoleMetadataEntry
	isSelected: boolean
	isCurrentRole?: boolean
	onSelect: (role: number) => void
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
}: RoleSelectionCardProps) {
	// Map RoleBadgeVariant to COLOR_CLASSES keys (defensive programming)
	const colorKey = role.variant === 'secondary' ? 'default' : role.variant === 'primary' ? 'info' : role.variant
	const colors = COLOR_CLASSES[colorKey as keyof typeof COLOR_CLASSES] ?? COLOR_CLASSES.default

	// Get icon component from role name
	const IconComponent = ROLE_ICONS[role.name] ?? User

	// Check if this is a high-privilege role (Admin or above)
	const requiresConfirmation = role.level >= DEFAULT_ROLE_THRESHOLDS.adminThreshold

	const handleClick = () => {
		if (isCurrentRole) return
		onSelect(role.level)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (isCurrentRole) return
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onSelect(role.level)
		}
	}

	return (
		<div
			role='button'
			tabIndex={isCurrentRole ? -1 : 0}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			aria-disabled={isCurrentRole}
			aria-selected={isSelected}
			className={`
				relative p-4 rounded-xl border-2 text-left transition-all duration-200
				${
					isCurrentRole
						? 'opacity-50 cursor-not-allowed bg-base-200/50 border-base-300'
						: isSelected
						? `${colors.bg} ${colors.selectedBorder} cursor-pointer ring-2 ring-offset-2 ring-offset-base-100`
						: `bg-base-100 border-base-300 hover:border-base-content/30 hover:shadow-md cursor-pointer`
				}
				${isSelected && colorKey === 'warning' ? 'ring-warning/50' : ''}
				${isSelected && colorKey === 'info' ? 'ring-info/50' : ''}
				${isSelected && colorKey === 'default' ? 'ring-base-content/20' : ''}
			`}>
			{/* Selection indicator */}
			{isSelected && (
				<div className={`absolute top-3 right-3 p-1 rounded-full ${colors.bg}`}>
					<Check className={`w-4 h-4 ${colors.icon}`} />
				</div>
			)}

			{/* Main content */}
			<div className='flex items-start gap-3'>
				{/* Icon */}
				<div className={`p-2.5 rounded-lg ${colors.bg}`}>
					<IconComponent className={`w-6 h-6 ${colors.icon}`} />
				</div>

				{/* Text content */}
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-2 flex-wrap'>
						<span className='font-semibold text-base-content'>{role.display}</span>
						{isCurrentRole && <span className='badge badge-sm badge-ghost'>Current</span>}
						{requiresConfirmation && !isCurrentRole && (
							<span className='badge badge-sm badge-warning gap-1'>
								<AlertTriangle className='w-3 h-3' />
								High Access
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
