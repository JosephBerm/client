'use client'

/**
 * RoleSelector Component
 * 
 * Enhanced role selector with visual feedback for role assignment.
 * Shows current role as disabled, selected role as highlighted.
 * 
 * Features:
 * - Visual role cards with descriptions
 * - Keyboard accessible
 * - Current role indication
 * - Selection state feedback
 * - Uses centralized ROLE_OPTIONS (DRY principle)
 * 
 * @module accounts/RoleSelector
 */

import { Check } from 'lucide-react'

import { ROLE_OPTIONS, getRolesByLevelDescending, type RoleOption } from '@_shared'

import { AccountRole, type AccountRoleType } from '@_classes/Enums'

// ============================================================================
// TYPES
// ============================================================================

export interface RoleSelectorProps {
	/** Current role of the user (disabled in selector) */
	currentRole: number
	/** Currently selected role */
	selectedRole: AccountRoleType | null
	/** Callback when a role is selected */
	onSelect: (role: AccountRoleType) => void
}

// Re-export for backwards compatibility
export { ROLE_OPTIONS, type RoleOption }

// Get roles ordered from highest to lowest for this component
const ORDERED_ROLES = getRolesByLevelDescending()

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * RoleSelector Component
 * 
 * Renders a list of role options as interactive cards.
 * The current role is shown as disabled.
 */
export default function RoleSelector({
	currentRole,
	selectedRole,
	onSelect,
}: RoleSelectorProps) {
	return (
		<div className="space-y-2">
			{ORDERED_ROLES.map((option) => {
				const isCurrentRole = option.value === currentRole
				const isSelected = option.value === selectedRole

				return (
					<div
						key={option.value}
						role="button"
						tabIndex={isCurrentRole ? -1 : 0}
						onClick={() => !isCurrentRole && onSelect(option.value as AccountRoleType)}
						onKeyDown={(e) => {
							if (!isCurrentRole && (e.key === 'Enter' || e.key === ' ')) {
								e.preventDefault()
								onSelect(option.value as AccountRoleType)
							}
						}}
						aria-disabled={isCurrentRole}
						aria-selected={isSelected}
						className={`w-full p-3 rounded-lg border text-left transition-all duration-200
							${isCurrentRole 
								? 'border-base-300 bg-base-200 cursor-not-allowed opacity-60' 
								: isSelected
									? 'border-primary bg-primary/10 cursor-pointer'
									: 'border-base-300 hover:border-primary/50 hover:bg-base-100 cursor-pointer'
							}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
									{option.label}
								</span>
								{isCurrentRole && (
									<span className="ml-2 text-xs text-base-content/50">(Current)</span>
								)}
								<p className="text-sm text-base-content/60 mt-0.5">
									{option.description}
								</p>
							</div>
							{isSelected && (
								<Check className="w-5 h-5 text-primary shrink-0" />
							)}
						</div>
					</div>
				)
			})}
		</div>
	)
}

