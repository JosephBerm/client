'use client'

/**
 * Role Form Modal Component - MAANG-Level Enterprise Implementation
 *
 * Production-ready role creation/editing modal following industry best practices from:
 * - AWS IAM: Immutable identifiers, predefined levels, system role protection
 * - Google Cloud IAM: Clear separation of ID vs display name
 * - Okta: Level presets with visual hierarchy representation
 * - Azure AD: Badge colors for visual differentiation
 * - Microsoft Entra ID: Built-in roles are read-only
 *
 * **Features:**
 * - Zod schema validation with real-time feedback
 * - Level presets with visual hierarchy representation
 * - Live identifier preview with auto-generation
 * - Badge variant selector for UI theming
 * - System role protection (read-only for platform roles)
 * - Conflict detection for duplicate levels
 * - Character counts and validation hints
 * - Full accessibility (ARIA, keyboard navigation)
 * - Theme-aware styling via DaisyUI
 *
 * **MAANG Patterns:**
 * - Immutable identifiers after creation (AWS IAM pattern)
 * - Predefined role templates with custom override
 * - Visual level hierarchy with existing roles context
 * - Progressive disclosure (advanced options collapsed)
 *
 * @module RBAC RoleFormModal
 */

import { useEffect, useState } from 'react'
import {
	Shield,
	Lock,
	AlertTriangle,
	Info,
	ChevronDown,
	ChevronUp,
	Sparkles,
	Users,
	Crown,
	Briefcase,
	UserCheck,
	Building2,
} from 'lucide-react'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@_shared/services/api'
import { roleSchema, type RoleFormData } from '@_core'
import { useZodForm } from '@_shared'
import { DEFAULT_ROLE_THRESHOLDS, getRoleBadgeVariant } from '@_shared/constants/rbac-defaults'
import Modal from '@_components/ui/Modal'
import Input from '@_components/ui/Input'
import Textarea from '@_components/ui/Textarea'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import FormFooter from './FormFooter'

// ============================================================================
// TYPES
// ============================================================================

interface RoleFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (request: CreateRoleRequest | UpdateRoleRequest) => Promise<void>
	role?: Role | null
	isSaving: boolean
	/** Existing roles for conflict detection */
	existingRoles?: Role[]
}

/** Level preset for quick selection */
interface LevelPreset {
	level: number
	name: string
	description: string
	icon: React.ReactNode
	suggestedBadge: BadgeVariant
}

/** Badge variant options */
type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'neutral'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Predefined level presets based on common B2B e-commerce patterns.
 * These are suggestions - users can enter custom levels.
 */
const LEVEL_PRESETS: LevelPreset[] = [
	{
		level: DEFAULT_ROLE_THRESHOLDS.customerLevel,
		name: 'Customer',
		description: 'External users, buyers, clients',
		icon: <Users className="h-4 w-4" />,
		suggestedBadge: 'info',
	},
	{
		level: DEFAULT_ROLE_THRESHOLDS.fulfillmentCoordinatorThreshold,
		name: 'Operations',
		description: 'Warehouse, fulfillment, logistics',
		icon: <Building2 className="h-4 w-4" />,
		suggestedBadge: 'secondary',
	},
	{
		level: DEFAULT_ROLE_THRESHOLDS.salesRepThreshold,
		name: 'Sales',
		description: 'Sales representatives, account managers',
		icon: <Briefcase className="h-4 w-4" />,
		suggestedBadge: 'secondary',
	},
	{
		level: DEFAULT_ROLE_THRESHOLDS.salesManagerThreshold,
		name: 'Management',
		description: 'Team leads, supervisors, managers',
		icon: <UserCheck className="h-4 w-4" />,
		suggestedBadge: 'accent',
	},
	{
		level: DEFAULT_ROLE_THRESHOLDS.adminThreshold,
		name: 'Administrator',
		description: 'System administrators, full access',
		icon: <Crown className="h-4 w-4" />,
		suggestedBadge: 'primary',
	},
]

/** Badge variant options for role theming */
const BADGE_VARIANTS: { value: BadgeVariant; label: string; description: string }[] = [
	{ value: 'primary', label: 'Primary', description: 'Main brand color - admin roles' },
	{ value: 'secondary', label: 'Secondary', description: 'Neutral - staff roles' },
	{ value: 'accent', label: 'Accent', description: 'Highlight - special roles' },
	{ value: 'info', label: 'Info', description: 'Blue - customer/external roles' },
	{ value: 'success', label: 'Success', description: 'Green - approved/active' },
	{ value: 'warning', label: 'Warning', description: 'Yellow - elevated access' },
	{ value: 'error', label: 'Error', description: 'Red - restricted/sensitive' },
	{ value: 'neutral', label: 'Neutral', description: 'Gray - default styling' },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts display name to a valid role identifier (slug).
 * AWS IAM pattern: lowercase_snake_case
 */
function generateRoleSlug(displayName: string): string {
	return displayName
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s]/g, '') // Remove special chars
		.replace(/\s+/g, '_') // Spaces to underscores
		.replace(/_+/g, '_') // No consecutive underscores
		.replace(/^_|_$/g, '') // No leading/trailing underscores
}

/**
 * Maps a badge variant string to the Badge component variant type.
 */
function mapBadgeVariant(variant: string): 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'neutral' {
	const validVariants = ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error', 'neutral']
	return validVariants.includes(variant) ? variant as BadgeVariant : 'neutral'
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function RoleFormModal({
	isOpen,
	onClose,
	onSave,
	role,
	isSaving,
	existingRoles = [],
}: RoleFormModalProps) {
	// Form state with Zod validation
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors, isValid },
	} = useZodForm(roleSchema, {
		mode: 'onChange',
		defaultValues: {
			name: '',
			displayName: '',
			level: DEFAULT_ROLE_THRESHOLDS.customerLevel,
			description: '',
			badgeVariant: 'neutral',
			isActive: true,
		},
	})

	// Watch form values for live preview
	const watchedValues = watch()
	const watchedDisplayName = watch('displayName')
	const watchedLevel = watch('level')
	const watchedBadgeVariant = watch('badgeVariant')

	// UI state
	const [showAdvanced, setShowAdvanced] = useState(false)
	const [autoGenerateSlug, setAutoGenerateSlug] = useState(true)

	// Derived state
	const isSystemRole = role?.isSystemRole ?? false
	const isEditing = !!role

	// Safely handle level value (could be NaN if input is cleared)
	const safeWatchedLevel = Number.isFinite(watchedLevel) ? watchedLevel : 0

	// Check for level conflicts
	const levelConflict = existingRoles.find(
		(r) => r.level === safeWatchedLevel && r.id !== role?.id
	)

	// Reset form when modal opens/closes or role changes
	useEffect(() => {
		if (isOpen) {
			if (role) {
				reset({
					name: role.name,
					displayName: role.displayName,
					level: role.level,
					description: role.description || '',
					badgeVariant: 'neutral', // Default since backend doesn't have this field yet
					isActive: true,
				})
				setAutoGenerateSlug(false) // Don't auto-generate when editing
			} else {
				reset({
					name: '',
					displayName: '',
					level: DEFAULT_ROLE_THRESHOLDS.customerLevel,
					description: '',
					badgeVariant: 'neutral',
					isActive: true,
				})
				setAutoGenerateSlug(true)
			}
			setShowAdvanced(false)
		}
	}, [isOpen, role, reset])

	// Auto-generate slug from display name (only for new roles)
	useEffect(() => {
		if (!isEditing && autoGenerateSlug && watchedDisplayName) {
			const slug = generateRoleSlug(watchedDisplayName)
			if (slug) {
				setValue('name', slug, { shouldValidate: true })
			}
		}
	}, [watchedDisplayName, isEditing, autoGenerateSlug, setValue])

	// Form submission handler
	const onSubmit = async (data: RoleFormData) => {
		// System roles preserve their isSystemRole status
		// New roles are always non-system (isSystemRole: false)
		const request: CreateRoleRequest | UpdateRoleRequest = {
			name: data.name,
			displayName: data.displayName,
			level: data.level,
			description: data.description || undefined,
			isSystemRole: isEditing ? role!.isSystemRole : false,
		}

		await onSave(request)
	}

	// Handle level preset selection
	const handlePresetSelect = (preset: LevelPreset) => {
		setValue('level', preset.level, { shouldValidate: true })
		setValue('badgeVariant', preset.suggestedBadge, { shouldValidate: true })
	}

	// Determine which preset is closest to current level
	const getClosestPreset = (level: number): LevelPreset | undefined => {
		return LEVEL_PRESETS.reduce((closest, preset) => {
			if (!closest) return preset
			const closestDiff = Math.abs(closest.level - level)
			const presetDiff = Math.abs(preset.level - level)
			return presetDiff < closestDiff ? preset : closest
		}, undefined as LevelPreset | undefined)
	}

	const closestPreset = getClosestPreset(safeWatchedLevel || 1000)
	const modalTitle = isEditing ? 'Edit Role' : 'Create Role'

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
				{/* System Role Banner - Read-only warning */}
				{isSystemRole && (
					<div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
						<div className="flex items-start gap-3">
							<Shield className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
							<div>
								<div className="flex items-center gap-2 mb-1">
									<span className="font-semibold text-warning">System Role</span>
									<Badge variant="warning" tone="subtle" size="xs">
										Protected
									</Badge>
								</div>
								<p className="text-sm text-warning/80">
									This is a platform-managed role. Only the display name and description can be
									modified. The role name and level are locked for system stability.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* ================================================================ */}
				{/* SECTION 1: Identity */}
				{/* ================================================================ */}
				<fieldset className="space-y-4">
					<legend className="text-sm font-medium text-base-content/70 mb-2 flex items-center gap-2">
						<Info className="h-4 w-4" />
						Identity
					</legend>

					{/* Display Name */}
					<div>
						<label htmlFor="displayName" className="label">
							<span className="label-text font-medium">Display Name</span>
							<span className="label-text-alt text-base-content/50">
								{(watchedValues.displayName?.length || 0)}/100
							</span>
						</label>
						<Input
							id="displayName"
							{...register('displayName')}
							placeholder="e.g., Regional Sales Manager"
							error={!!errors.displayName}
							errorMessage={errors.displayName?.message}
							autoFocus={!isEditing}
						/>
						<p className="text-xs text-base-content/50 mt-1">
							Human-readable name shown in the UI and user assignments.
						</p>
					</div>

					{/* Role Identifier (Name) */}
					<div>
						<label htmlFor="name" className="label">
							<span className="label-text font-medium flex items-center gap-2">
								Role Identifier
								{isSystemRole && <Lock className="h-3 w-3 text-base-content/40" />}
							</span>
							{!isEditing && autoGenerateSlug && (
								<span className="label-text-alt flex items-center gap-1 text-info">
									<Sparkles className="h-3 w-3" />
									Auto-generated
								</span>
							)}
						</label>
						<div className="flex gap-2">
							<Input
								id="name"
								{...register('name')}
								placeholder="regional_sales_manager"
								disabled={isSystemRole || (isEditing && !isSystemRole)}
								error={!!errors.name}
								errorMessage={errors.name?.message}
								className={
									isSystemRole || isEditing ? 'opacity-60 cursor-not-allowed font-mono' : 'font-mono'
								}
								wrapperClassName="flex-1"
								onFocus={() => setAutoGenerateSlug(false)}
							/>
							{!isEditing && !autoGenerateSlug && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => {
										setAutoGenerateSlug(true)
										if (watchedDisplayName) {
											setValue('name', generateRoleSlug(watchedDisplayName), {
												shouldValidate: true,
											})
										}
									}}
									className="shrink-0"
								>
									<Sparkles className="h-4 w-4" />
								</Button>
							)}
						</div>
						{!isEditing && (
							<p className="text-xs text-base-content/50 mt-1">
								Immutable identifier (lowercase_snake_case). Cannot be changed after creation.
							</p>
						)}
						{isEditing && !isSystemRole && (
							<p className="text-xs text-base-content/50 mt-1">
								Identifier is locked after creation for data integrity.
							</p>
						)}
					</div>
				</fieldset>

				{/* ================================================================ */}
				{/* SECTION 2: Access Level */}
				{/* ================================================================ */}
				<fieldset className="space-y-4">
					<legend className="text-sm font-medium text-base-content/70 mb-2 flex items-center gap-2">
						<Crown className="h-4 w-4" />
						Access Level
					</legend>

					{/* Level Presets - Mobile-first: 2 cols on mobile, 3 on sm, 5 on md+ */}
					{!isSystemRole && (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
							{LEVEL_PRESETS.map((preset) => {
								const isSelected = safeWatchedLevel === preset.level
								const isNearby =
									!isSelected &&
									Math.abs(safeWatchedLevel - preset.level) < 500 &&
									closestPreset?.level === preset.level

								return (
									<button
										key={preset.level}
										type="button"
										onClick={() => handlePresetSelect(preset)}
										className={`
											flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg border-2 transition-all
											${
												isSelected
													? 'border-primary bg-primary/10 text-primary'
													: isNearby
														? 'border-primary/30 bg-primary/5'
														: 'border-base-300 hover:border-primary/50 hover:bg-base-200'
											}
										`}
									>
										<span
											className={`${isSelected ? 'text-primary' : 'text-base-content/60'}`}
										>
											{preset.icon}
										</span>
										<span className="text-xs font-medium truncate w-full text-center">
											{preset.name}
										</span>
										<span className="text-[10px] text-base-content/50">{preset.level}</span>
									</button>
								)
							})}
						</div>
					)}

					{/* Custom Level Input */}
					<div>
						<label htmlFor="level" className="label">
							<span className="label-text font-medium flex items-center gap-2">
								Level Value
								{isSystemRole && <Lock className="h-3 w-3 text-base-content/40" />}
							</span>
							{closestPreset && safeWatchedLevel !== closestPreset.level && (
								<span className="label-text-alt text-base-content/50">
									Near: {closestPreset.name} ({closestPreset.level})
								</span>
							)}
						</label>
						<Input
							id="level"
							type="number"
							{...register('level', { valueAsNumber: true })}
							placeholder="1000"
							disabled={isSystemRole}
							error={!!errors.level || !!levelConflict}
							errorMessage={
								errors.level?.message ||
								(levelConflict
									? `Level ${safeWatchedLevel} is already used by "${levelConflict.displayName}"`
									: undefined)
							}
							className={isSystemRole ? 'opacity-60 cursor-not-allowed' : ''}
						/>
						<p className="text-xs text-base-content/50 mt-1">
							Higher levels have more access. Range: 1-9999. Level 9999 is reserved for Super Admin.
						</p>
					</div>

					{/* Level Warning for High Access */}
					{!isEditing && safeWatchedLevel >= DEFAULT_ROLE_THRESHOLDS.adminThreshold && (
						<div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
							<div className="flex items-start gap-2">
								<AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
								<p className="text-sm text-warning/80">
									Level {safeWatchedLevel}+ grants administrative access. Users with this role will have
									elevated privileges. Ensure this is intended.
								</p>
							</div>
						</div>
					)}

					{/* Visual Hierarchy Indicator */}
					{existingRoles.length > 0 && (
						<div className="bg-base-200/50 rounded-lg p-3">
							<p className="text-xs font-medium text-base-content/60 mb-2">
								Position in Role Hierarchy
							</p>
							<div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-1">
								{(() => {
									const sortedRoles = [...existingRoles].sort((a, b) => a.level - b.level)
									const maxLevel = sortedRoles[sortedRoles.length - 1]?.level ?? 0
									const isNewRoleAtEnd = !isEditing && safeWatchedLevel > maxLevel

									return (
										<>
											{sortedRoles.map((r, idx, arr) => {
												const isCurrentLevel = r.level === safeWatchedLevel && r.id !== role?.id
												const isBetween =
													idx > 0 &&
													arr[idx - 1].level < safeWatchedLevel &&
													r.level > safeWatchedLevel

												return (
													<div key={r.id} className="flex items-center gap-1">
														{isBetween && role?.id !== r.id && (
															<>
																<Badge
																	variant={mapBadgeVariant(watchedBadgeVariant || 'primary')}
																	tone="solid"
																	size="xs"
																>
																	NEW
																</Badge>
																<span className="text-base-content/30">→</span>
															</>
														)}
														<Badge
															variant={
																isCurrentLevel
																	? 'error'
																	: mapBadgeVariant(getRoleBadgeVariant(r.level))
															}
															tone={r.id === role?.id ? 'solid' : 'subtle'}
															size="xs"
														>
															{r.displayName}
														</Badge>
														{idx < arr.length - 1 && (
															<span className="text-base-content/30">→</span>
														)}
													</div>
												)
											})}
											{/* Show NEW badge at end if level is higher than all existing */}
											{isNewRoleAtEnd && (
												<>
													<span className="text-base-content/30">→</span>
													<Badge
														variant={mapBadgeVariant(watchedBadgeVariant || 'primary')}
														tone="solid"
														size="xs"
													>
														NEW ({safeWatchedLevel})
													</Badge>
												</>
											)}
										</>
									)
								})()}
							</div>
						</div>
					)}
				</fieldset>

				{/* ================================================================ */}
				{/* SECTION 3: Advanced Options (Collapsible) */}
				{/* ================================================================ */}
				<div className="border border-base-300 rounded-lg overflow-hidden">
					<button
						type="button"
						onClick={() => setShowAdvanced(!showAdvanced)}
						className="w-full flex items-center justify-between p-3 hover:bg-base-200/50 transition-colors"
					>
						<span className="text-sm font-medium text-base-content/70">Advanced Options</span>
						{showAdvanced ? (
							<ChevronUp className="h-4 w-4 text-base-content/50" />
						) : (
							<ChevronDown className="h-4 w-4 text-base-content/50" />
						)}
					</button>

					{showAdvanced && (
						<div className="p-4 border-t border-base-300 space-y-4">
							{/* Badge Variant Selector - Mobile-first: 2 cols on mobile, 4 on sm+ */}
							<div>
								<label className="label">
									<span className="label-text font-medium">Badge Color</span>
									<Badge
										variant={mapBadgeVariant(watchedBadgeVariant || 'neutral')}
										tone="solid"
										size="sm"
									>
										Preview
									</Badge>
								</label>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
									{BADGE_VARIANTS.map((variant) => (
										<button
											key={variant.value}
											type="button"
											onClick={() =>
												setValue('badgeVariant', variant.value, { shouldValidate: true })
											}
											className={`
												flex flex-col items-center gap-1 p-2 rounded-lg border transition-all
												${
													watchedBadgeVariant === variant.value
														? 'border-primary bg-primary/10'
														: 'border-base-300 hover:border-primary/50'
												}
											`}
										>
											<Badge variant={variant.value} tone="solid" size="xs">
												{variant.label}
											</Badge>
											<span className="text-[10px] text-base-content/50 text-center">
												{variant.description.split(' - ')[0]}
											</span>
										</button>
									))}
								</div>
								<p className="text-xs text-base-content/50 mt-2">
									Color used for role badges and visual indicators throughout the UI.
								</p>
							</div>

							{/* Description */}
							<div>
								<label htmlFor="description" className="label">
									<span className="label-text font-medium">Description</span>
									<span className="label-text-alt text-base-content/50">
										{(watchedValues.description?.length || 0)}/500
									</span>
								</label>
								<Textarea
									id="description"
									{...register('description')}
									placeholder="Describe the purpose and responsibilities of this role..."
									rows={3}
									error={!!errors.description}
									errorMessage={errors.description?.message}
								/>
								<p className="text-xs text-base-content/50 mt-1">
									Internal documentation for administrators. Not shown to end users.
								</p>
							</div>
						</div>
					)}
				</div>

				{/* ================================================================ */}
				{/* Form Footer */}
				{/* ================================================================ */}
				<FormFooter
					onCancel={onClose}
					isSaving={isSaving}
					saveLabel={isEditing ? 'Update Role' : 'Create Role'}
					isSubmitButton
					isDisabled={!isValid || !!levelConflict}
				/>
			</form>
		</Modal>
	)
}
