/**
 * Password Strength Utility
 *
 * Centralized password strength checking utility aligned with
 * the passwordSchema validation rules from @_core.
 *
 * **Scoring Criteria (aligned with passwordSchema):**
 * - Length >= 8 characters (minimum requirement)
 * - Length >= 12 characters (stronger)
 * - Contains uppercase letter (A-Z)
 * - Contains lowercase letter (a-z)
 * - Contains number (0-9)
 * - Contains special character (!@#$%^&*, etc.)
 *
 * **Score Ranges:**
 * - 0-2: Weak (red)
 * - 3-4: Moderate (yellow/warning)
 * - 5-6: Strong (green/success)
 *
 * @module shared/utils/passwordStrength
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of password strength check
 */
export interface PasswordStrengthResult {
	/** Numeric score from 0-6 */
	score: number
	/** Human-readable strength label */
	label: 'Weak' | 'Moderate' | 'Strong'
	/** CSS color class for UI display */
	color: 'text-error' | 'text-warning' | 'text-success'
	/** Badge variant for DaisyUI components */
	variant: 'error' | 'warning' | 'success'
	/** Individual criteria met */
	criteria: PasswordCriteria
	/** Percentage for progress bars (0-100) */
	percentage: number
}

/**
 * Individual password criteria checks
 */
export interface PasswordCriteria {
	minLength: boolean
	strongLength: boolean
	hasUppercase: boolean
	hasLowercase: boolean
	hasNumber: boolean
	hasSpecialChar: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Minimum password length (aligned with passwordSchema)
 */
export const PASSWORD_MIN_LENGTH = 8

/**
 * Strong password length threshold
 */
export const PASSWORD_STRONG_LENGTH = 12

/**
 * Maximum possible score
 */
const MAX_SCORE = 6

// ============================================================================
// IMPLEMENTATION
// ============================================================================

/**
 * Check individual password criteria
 *
 * @param password - Password to check
 * @returns Object with boolean flags for each criterion
 */
export function checkPasswordCriteria(password: string): PasswordCriteria {
	return {
		minLength: password.length >= PASSWORD_MIN_LENGTH,
		strongLength: password.length >= PASSWORD_STRONG_LENGTH,
		hasUppercase: /[A-Z]/.test(password),
		hasLowercase: /[a-z]/.test(password),
		hasNumber: /[0-9]/.test(password),
		hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
	}
}

/**
 * Calculate password strength score and metadata
 *
 * This function provides a comprehensive password strength assessment
 * that is aligned with the Zod passwordSchema validation rules.
 *
 * @param password - Password to evaluate
 * @returns PasswordStrengthResult with score, label, color, and criteria
 *
 * @example
 * ```typescript
 * const result = checkPasswordStrength('SecurePass123!')
 * // result.score = 6
 * // result.label = 'Strong'
 * // result.color = 'text-success'
 * // result.percentage = 100
 * ```
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
	if (!password) {
		return {
			score: 0,
			label: 'Weak',
			color: 'text-error',
			variant: 'error',
			criteria: {
				minLength: false,
				strongLength: false,
				hasUppercase: false,
				hasLowercase: false,
				hasNumber: false,
				hasSpecialChar: false,
			},
			percentage: 0,
		}
	}

	const criteria = checkPasswordCriteria(password)

	// Calculate score based on criteria met
	let score = 0
	if (criteria.minLength) score++
	if (criteria.strongLength) score++
	if (criteria.hasUppercase) score++
	if (criteria.hasLowercase) score++
	if (criteria.hasNumber) score++
	if (criteria.hasSpecialChar) score++

	// Determine label and color based on score
	let label: PasswordStrengthResult['label']
	let color: PasswordStrengthResult['color']
	let variant: PasswordStrengthResult['variant']

	if (score <= 2) {
		label = 'Weak'
		color = 'text-error'
		variant = 'error'
	} else if (score <= 4) {
		label = 'Moderate'
		color = 'text-warning'
		variant = 'warning'
	} else {
		label = 'Strong'
		color = 'text-success'
		variant = 'success'
	}

	return {
		score,
		label,
		color,
		variant,
		criteria,
		percentage: Math.round((score / MAX_SCORE) * 100),
	}
}

/**
 * Check if password meets minimum requirements
 *
 * Aligned with passwordSchema validation - returns true if password
 * would pass Zod validation (all required criteria met).
 *
 * @param password - Password to validate
 * @returns true if password meets all minimum requirements
 */
export function isPasswordValid(password: string): boolean {
	const criteria = checkPasswordCriteria(password)
	return (
		criteria.minLength &&
		criteria.hasUppercase &&
		criteria.hasLowercase &&
		criteria.hasNumber &&
		criteria.hasSpecialChar
	)
}

/**
 * Get human-readable list of unmet password requirements
 *
 * Useful for displaying feedback to users about what's missing.
 *
 * @param password - Password to check
 * @returns Array of requirement strings that are not met
 *
 * @example
 * ```typescript
 * const missing = getUnmetRequirements('password')
 * // ['At least one uppercase letter', 'At least one number', 'At least one special character']
 * ```
 */
export function getUnmetRequirements(password: string): string[] {
	const criteria = checkPasswordCriteria(password)
	const unmet: string[] = []

	if (!criteria.minLength) {
		unmet.push(`At least ${PASSWORD_MIN_LENGTH} characters`)
	}
	if (!criteria.hasUppercase) {
		unmet.push('At least one uppercase letter')
	}
	if (!criteria.hasLowercase) {
		unmet.push('At least one lowercase letter')
	}
	if (!criteria.hasNumber) {
		unmet.push('At least one number')
	}
	if (!criteria.hasSpecialChar) {
		unmet.push('At least one special character')
	}

	return unmet
}
