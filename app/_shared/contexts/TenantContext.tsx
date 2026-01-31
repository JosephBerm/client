'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCookie } from 'cookies-next'

import { type TenantConfigFormData } from '@_core/validation'

import { TENANT_CUSTOM_CSS_STYLE_ID } from '../constants/tenantTheme'
import { TenantApi } from '../services/api/tenant.api'
import { safeJsonParse } from '../utils/jsonUtils'
import { applyTenantCustomCss, updateFavicon } from '../utils/tenantDomUtils'
import { applyTenantThemeToRoot, mergeTenantTheme, parseTenantThemeOverrides } from '../utils/tenantTheme'
import { getTenantThemeCacheKey, serializeTenantThemeCache } from '../utils/tenantThemeCache'

/**
 * Tenant configuration from backend API (App Router)
 */
type TenantConfig = TenantConfigFormData

interface TenantContextValue {
	tenant: TenantConfig | null
	isLoading: boolean
	error: Error | null
	uiConfig?: TenantUiConfig
	refreshTenant: () => Promise<void>
}

const TENANT_QUERY_KEY = ['tenant', 'config'] as const
const TENANT_STATUS_REFRESH_INTERVAL_MS = 5 * 60 * 1000

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

interface TenantUiConfig {
	pages?: Record<string, unknown>
	enabledComponents?: string[]
	enabledFeatures?: string[]
	theme?: unknown
	customCss?: string
}

function readCookieValue(value: unknown): string | undefined {
	if (typeof value === 'string') {
		return value
	}

	if (Array.isArray(value)) {
		return value.find((entry) => typeof entry === 'string')
	}

	return undefined
}

function parseUiConfig(raw?: TenantConfig['uiConfig']): TenantUiConfig | undefined {
	if (!raw) {
		return undefined
	}

	return {
		pages: safeJsonParse<Record<string, unknown>>(raw.pages),
		enabledComponents: safeJsonParse<string[]>(raw.enabledComponents),
		enabledFeatures: safeJsonParse<string[]>(raw.enabledFeatures),
		theme: safeJsonParse<unknown>(raw.theme),
		customCss: raw.customCss,
	}
}

async function fetchTenantConfig(signal?: AbortSignal): Promise<TenantConfig> {
	const tenantData = await TenantApi.getConfigPublic({ signal })

	const cookieIdentifier = readCookieValue(getCookie('tenant-identifier'))
	if (cookieIdentifier && tenantData.identifier !== cookieIdentifier) {
		throw new Error('Tenant mismatch detected')
	}

	if (tenantData.status !== 'Active') {
		throw new Error(`Tenant is ${tenantData.status.toLowerCase()}`)
	}

	return tenantData
}

/**
 * Tenant Provider - Loads tenant configuration and applies theming
 */
export function TenantProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient()
	const [tenantScope, setTenantScope] = useState(() =>
		typeof window === 'undefined' ? 'unknown' : window.location.hostname,
	)

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [...TENANT_QUERY_KEY, tenantScope] as const,
		queryFn: async ({ signal }) => fetchTenantConfig(signal),
		enabled: tenantScope !== 'unknown',
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 2,
		retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
		refetchInterval: TENANT_STATUS_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
	})

	const tenant = data ?? null

	// Keep useMemo for error to ensure stable reference for context value
	const resolvedError = useMemo(
		() => (error instanceof Error ? error : error ? new Error('Failed to load tenant') : null),
		[error],
	)

	// React 19: Let compiler optimize simple derivations
	const uiConfig = parseUiConfig(tenant?.uiConfig)
	const themeOverrides = parseTenantThemeOverrides(tenant?.uiConfig)
	const resolvedTenant = tenant ? mergeTenantTheme(tenant, themeOverrides) : null

	// useCallback for stable function reference (not useMemo - that's for values)
	const refreshTenant = useCallback(async () => {
		await refetch()
	}, [refetch])

	useEffect(() => {
		if (!resolvedTenant) {
			return
		}

		const frame = window.requestAnimationFrame(() => {
			applyTenantThemeToRoot(document.documentElement, resolvedTenant)

			if (resolvedTenant.faviconUrl) {
				updateFavicon(resolvedTenant.faviconUrl)
			}

			if (resolvedTenant.name) {
				document.title = `${resolvedTenant.name} - Medical Supply Platform`
			}

			// Cache tenant theme for pre-hydration init (prevents FOUC on reload)
			if (resolvedTenant.themeName) {
				try {
					const cachePayload = {
						themeName: resolvedTenant.themeName,
						tenantIdentifier: resolvedTenant.identifier,
						host: window.location.hostname,
						updatedAt: Date.now(),
					}
					localStorage.setItem(getTenantThemeCacheKey(), serializeTenantThemeCache(cachePayload))
				} catch {
					// Non-fatal: localStorage may be unavailable (privacy mode)
				}
			}
		})

		return () => window.cancelAnimationFrame(frame)
	}, [resolvedTenant])

	useEffect(() => {
		if (!resolvedTenant) {
			return
		}

		// Business logic: Only Enterprise tier gets custom CSS
		const customCss = resolvedTenant.tier === 'Enterprise' ? uiConfig?.customCss : undefined
		applyTenantCustomCss(customCss, TENANT_CUSTOM_CSS_STYLE_ID)
	}, [resolvedTenant, uiConfig?.customCss])

	useEffect(() => {
		const handleFocus = () => {
			if (document.visibilityState !== 'visible') {
				return
			}

			setTenantScope(window.location.hostname)
		}

		window.addEventListener('focus', handleFocus)
		document.addEventListener('visibilitychange', handleFocus)

		return () => {
			window.removeEventListener('focus', handleFocus)
			document.removeEventListener('visibilitychange', handleFocus)
		}
	}, [])

	useEffect(() => {
		const cookieIdentifier = readCookieValue(getCookie('tenant-identifier'))
		if (tenant && cookieIdentifier && tenant.identifier !== cookieIdentifier) {
			queryClient.removeQueries({ queryKey: TENANT_QUERY_KEY })
		}
	}, [queryClient, tenant])

	const contextValue = useMemo(
		() => ({
			tenant: resolvedTenant,
			isLoading,
			error: resolvedError,
			uiConfig,
			refreshTenant,
		}),
		[resolvedTenant, isLoading, resolvedError, uiConfig, refreshTenant],
	)

	return <TenantContext.Provider value={contextValue}>{children}</TenantContext.Provider>
}

/**
 * Hook to access tenant context
 */
export function useTenant() {
	const context = useContext(TenantContext)
	if (!context) {
		throw new Error('useTenant must be used within TenantProvider')
	}
	return context
}
