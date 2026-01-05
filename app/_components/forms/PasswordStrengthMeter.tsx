/**
 * PasswordStrengthMeter Component
 *
 * GitHub-style password strength indicator with live requirements checklist.
 * Provides real-time feedback as users type their password.
 *
 * **Features:**
 * - Visual strength bar (5 levels)
 * - Live requirements checklist
 * - Color-coded feedback (DaisyUI tokens)
 * - Matches passwordSchema requirements
 * - Accessible
 * - Theme-aware
 *
 * **Strength Levels:**
 * - empty: No password entered
 * - weak: 1 requirement met
 * - fair: 2-3 requirements met
 * - good: 4 requirements met
 * - strong: All 5 requirements met
 *
 * **Requirements (matching passwordSchema):**
 * - At least 8 characters
 * - Uppercase letter (A-Z)
 * - Lowercase letter (a-z)
 * - Number (0-9)
 * - Special character (!@#$%^&*...)
 *
 * @example
 * ```tsx
 * import PasswordStrengthMeter from '@_components/forms/PasswordStrengthMeter';
 *
 * const watchedPassword = form.watch('newPassword') || '';
 *
 * <FormInput label="New Password" type="password" ... />
 * <PasswordStrengthMeter password={watchedPassword} />
 * ```
 *
 * @module PasswordStrengthMeter
 */

'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import classNames from 'classnames'

// ============================================================================
// TYPES
// ============================================================================

export interface PasswordStrengthMeterProps {
	/** Current password value */
	password: string
	/** Show requirements checklist (default: true) */
	showRequirements?: boolean
	/** Additional CSS classes */
	className?: string
}

type StrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

interface Requirement {
	key: string
	label: string
	regex: RegExp
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Password requirements matching passwordSchema from validation-schemas.ts
 */
const REQUIREMENTS: Requirement[] = [
	{ key: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
	{ key: 'uppercase', label: 'Uppercase letter (A-Z)', regex: /[A-Z]/ },
	{ key: 'lowercase', label: 'Lowercase letter (a-z)', regex: /[a-z]/ },
	{ key: 'number', label: 'Number (0-9)', regex: /[0-9]/ },
	{ key: 'special', label: 'Special character (!@#$...)', regex: /[^a-zA-Z0-9]/ },
]

/**
 * Strength level configuration
 */
const STRENGTH_CONFIG: Record<StrengthLevel, {
	label: string
	barColor: string
	textColor: string
	segments: number
}> = {
	empty: {
		label: '',
		barColor: 'bg-base-300',
		textColor: 'text-base-content/50',
		segments: 0,
	},
	weak: {
		label: 'Weak',
		barColor: 'bg-error',
		textColor: 'text-error',
		segments: 1,
	},
	fair: {
		label: 'Fair',
		barColor: 'bg-warning',
		textColor: 'text-warning',
		segments: 2,
	},
	good: {
		label: 'Good',
		barColor: 'bg-info',
		textColor: 'text-info',
		segments: 3,
	},
	strong: {
		label: 'Strong',
		barColor: 'bg-success',
		textColor: 'text-success',
		segments: 4,
	},
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate password strength based on requirements met
 */
function calculateStrength(password: string): {
	level: StrengthLevel
	met: Set<string>
} {
	if (!password) {
		return { level: 'empty', met: new Set() }
	}

	const met = new Set<string>()
	for (const req of REQUIREMENTS) {
		if (req.regex.test(password)) {
			met.add(req.key)
		}
	}

	const count = met.size

	let level: StrengthLevel
	if (count === 5) {
		level = 'strong'
	} else if (count === 4) {
		level = 'good'
	} else if (count >= 2) {
		level = 'fair'
	} else {
		level = 'weak'
	}

	return { level, met }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * PasswordStrengthMeter Component
 *
 * Displays password strength with visual bar and requirements checklist.
 * Provides real-time feedback as the user types.
 */
export default function PasswordStrengthMeter({
	password,
	showRequirements = true,
	className,
}: PasswordStrengthMeterProps) {
	const { level, met } = useMemo(() => calculateStrength(password), [password])
	const config = STRENGTH_CONFIG[level]

	return (
		<div className={classNames('space-y-3', className)}>
			{/* Strength bar */}
			<div className="space-y-1.5">
				{/* Bar segments */}
				<div className="flex gap-1" role="progressbar" aria-valuenow={config.segments} aria-valuemax={4}>
					{[1, 2, 3, 4].map((segment) => (
						<div
							key={segment}
							className={classNames(
								'h-1.5 flex-1 rounded-full transition-colors duration-200',
								segment <= config.segments ? config.barColor : 'bg-base-300'
							)}
						/>
					))}
				</div>

				{/* Strength label */}
				{level !== 'empty' && (
					<div className="flex items-center justify-between">
						<span className={classNames('text-xs font-medium', config.textColor)}>
							{config.label}
						</span>
						<span className="text-xs text-base-content/50">
							{met.size} of {REQUIREMENTS.length} requirements
						</span>
					</div>
				)}
			</div>

			{/* Requirements checklist */}
			{showRequirements && (
				<ul className="space-y-1.5" aria-label="Password requirements">
					{REQUIREMENTS.map((req) => {
						const isMet = met.has(req.key)
						return (
							<li
								key={req.key}
								className={classNames(
									'flex items-center gap-2 text-xs transition-colors duration-150',
									isMet ? 'text-success' : 'text-base-content/50'
								)}
							>
								{isMet ? (
									<Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
								) : (
									<X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
								)}
								<span>
									{req.label}
									<span className="sr-only">
										{isMet ? ' - met' : ' - not met'}
									</span>
								</span>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
