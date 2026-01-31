/**
 * Runtime Validation Guards
 *
 * Safe parsing utilities for runtime validation of API responses.
 *
 * @module core/validation/guards
 */

import { logger } from '@_core'
import {
	tenantConfigSchema,
	tenantThemeSchema,
	type TenantConfigFormData,
	type TenantThemeFormData,
} from './validation-schemas'

export interface SafeParseResult<T> {
	success: boolean
	data?: T
	error?: string
}

export function safeParseTenantConfig(
	raw: unknown
): SafeParseResult<TenantConfigFormData> {
	const result = tenantConfigSchema.safeParse(raw)

	if (result.success) {
		return { success: true, data: result.data }
	}

	if (process.env.NODE_ENV === 'development') {
		logger.warn('Invalid tenant config received', {
			errors: result.error.errors,
		})
	}

	return {
		success: false,
		error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
	}
}

export function validateTenantTheme(
	theme: unknown
): TenantThemeFormData | undefined {
	const result = tenantThemeSchema.safeParse(theme)
	return result.success ? result.data : undefined
}
