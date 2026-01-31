import { DAISY_UI_THEME_NAMES } from '@_core/validation'

import { TENANT_THEME_CACHE_KEY, TENANT_THEME_CACHE_MAX_AGE_MS } from '../constants/tenantTheme'

type TenantThemeCachePayload = {
	themeName: string
	tenantIdentifier?: string
	host: string
	updatedAt: number
}

export function serializeTenantThemeCache(payload: TenantThemeCachePayload): string {
	return JSON.stringify(payload)
}

export function parseTenantThemeCache(raw: string | null | undefined): TenantThemeCachePayload | null {
	if (!raw) {
		return null
	}

	try {
		const parsed = JSON.parse(raw) as Partial<TenantThemeCachePayload>
		if (
			typeof parsed.themeName !== 'string' ||
			!(DAISY_UI_THEME_NAMES as readonly string[]).includes(parsed.themeName) ||
			typeof parsed.host !== 'string' ||
			typeof parsed.updatedAt !== 'number'
		) {
			return null
		}
		return parsed as TenantThemeCachePayload
	} catch {
		return null
	}
}

export function isTenantThemeCacheValid(payload: TenantThemeCachePayload, host: string): boolean {
	if (payload.host !== host) {
		return false
	}

	return Date.now() - payload.updatedAt < TENANT_THEME_CACHE_MAX_AGE_MS
}

export function getTenantThemeCacheKey(): string {
	return TENANT_THEME_CACHE_KEY
}

export function getTenantThemeCacheMaxAgeMs(): number {
	return TENANT_THEME_CACHE_MAX_AGE_MS
}
