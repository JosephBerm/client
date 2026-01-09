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
 * - Uses centralized DEFAULT_ROLE_METADATA (DRY principle)
 *
 * @module accounts/RoleSelector
 */

import { Check } from 'lucide-react'

import { DEFAULT_ROLE_METADATA, type RoleMetadataEntry } from '@_shared'

// ============================================================================
// TYPES
// ============================================================================

export interface RoleSelectorProps {
	/** Current role of the user (disabled in selector) */
	currentRole: number
	/** Currently selected role */
	selectedRole: number | null
	/** Callback when a role is selected */
	onSelect: (role: number) => void
}

// Get roles ordered from highest to lowest for this component
const ORDERED_ROLES: RoleMetadataEntry[] = Object.values(DEFAULT_ROLE_METADATA).sort((a, b) => b.level - a.level)

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * RoleSelector Component
 *
 * Renders a list of role options as interactive cards.
 * The current role is shown as disabled.
 */
export default function RoleSelector({ currentRole, selectedRole, onSelect }: RoleSelectorProps) {
	return (
		<div className='space-y-2'>
			{ORDERED_ROLES.map((role) => {
				const isCurrentRole = role.level === currentRole
				const isSelected = role.level === selectedRole

				return (
					<div
						key={role.level}
						role='button'
						tabIndex={isCurrentRole ? -1 : 0}
						onClick={() => !isCurrentRole && onSelect(role.level)}
						onKeyDown={(e) => {
							if (!isCurrentRole && (e.key === 'Enter' || e.key === ' ')) {
								e.preventDefault()
								onSelect(role.level)
							}
						}}
						aria-disabled={isCurrentRole}
						aria-selected={isSelected}
						className={`w-full p-3 rounded-lg border text-left transition-all duration-200
							${
								isCurrentRole
									? 'border-base-300 bg-base-200 cursor-not-allowed opacity-60'
									: isSelected
									? 'border-primary bg-primary/10 cursor-pointer'
									: 'border-base-300 hover:border-primary/50 hover:bg-base-100 cursor-pointer'
							}`}>
						<div className='flex items-center justify-between'>
							<div>
								<span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
									{role.display}
								</span>
								{isCurrentRole && <span className='ml-2 text-xs text-base-content/50'>(Current)</span>}
							</div>
							{isSelected && <Check className='w-5 h-5 text-primary shrink-0' />}
						</div>
					</div>
				)
			})}
		</div>
	)
}
