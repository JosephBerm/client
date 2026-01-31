import { validateTenantTheme, type TenantConfigFormData, type TenantThemeFormData } from '@_core/validation'
import { safeJsonParse } from './jsonUtils'

const MAX_CHART_SERIES = 12
const BASE_TOKENS = ['--p', '--s', '--a', '--su', '--wa', '--er', '--in', '--bc', '--b1', '--b2', '--b3'] as const
const LEGACY_TOKENS = [
	'--color-primary',
	'--color-secondary',
	'--color-accent',
	'--color-primary-light',
	'--color-primary-dark',
] as const

export function parseTenantThemeOverrides(
	uiConfig?: TenantConfigFormData['uiConfig'],
): TenantThemeFormData | undefined {
	if (!uiConfig?.theme) {
		return undefined
	}

	const parsed = safeJsonParse<unknown>(uiConfig.theme)
	if (!parsed) {
		return undefined
	}

	return validateTenantTheme(parsed)
}

export function mergeTenantTheme(tenant: TenantConfigFormData, overrides?: TenantThemeFormData): TenantConfigFormData {
	if (!overrides) {
		return tenant
	}

	const sanitizedOverrides = Object.fromEntries(
		Object.entries(overrides).filter(([, value]) => value !== undefined),
	) as Partial<TenantConfigFormData>

	return {
		...tenant,
		...sanitizedOverrides,
	}
}

export function buildTenantThemeTokens(tenant: TenantConfigFormData): Record<string, string> {
	const tokens: Record<string, string> = {}

	// Backend omits null fields (WhenWritingNull), so fields are string | undefined
	const setToken = (key: string, value?: string) => {
		if (value) {
			tokens[key] = value
		}
	}

	// DaisyUI theme tokens
	setToken('--p', tenant.primaryColor)
	setToken('--s', tenant.secondaryColor)
	setToken('--a', tenant.accentColor)
	setToken('--su', tenant.successColor)
	setToken('--wa', tenant.warningColor)
	setToken('--er', tenant.errorColor)
	setToken('--in', tenant.infoColor)
	setToken('--bc', tenant.baseContentColor)
	setToken('--b1', tenant.base100Color)
	setToken('--b2', tenant.base200Color)
	setToken('--b3', tenant.base300Color)

	// Legacy CSS variables (backward compatibility)
	setToken('--color-primary', tenant.primaryColor)
	setToken('--color-secondary', tenant.secondaryColor)
	setToken('--color-accent', tenant.accentColor)

	if (tenant.primaryColor) {
		const { light, dark } = generateColorVariations(tenant.primaryColor)
		setToken('--color-primary-light', light)
		setToken('--color-primary-dark', dark)
	}

	// Chart overrides
	if (tenant.chartPalette && tenant.chartPalette.length > 0) {
		tenant.chartPalette.slice(0, MAX_CHART_SERIES).forEach((color, index) => {
			setToken(`--chart-series-${index + 1}`, color)
		})
	}

	if (typeof tenant.chartGridOpacity === 'number') {
		setToken('--chart-grid-opacity', `${tenant.chartGridOpacity}`)
	}

	if (typeof tenant.chartAxisOpacity === 'number') {
		setToken('--chart-axis-opacity', `${tenant.chartAxisOpacity}`)
	}

	return tokens
}

export function buildTenantThemeStyle(tenant: TenantConfigFormData): string {
	const tokens = buildTenantThemeTokens(tenant)
	const entries = Object.entries(tokens)

	if (entries.length === 0) {
		return ''
	}

	const declarations = entries.map(([key, value]) => `${key}:${value};`).join('')
	return `:root{${declarations}}`
}

export function applyTenantThemeToRoot(root: HTMLElement, tenant: TenantConfigFormData) {
	clearTenantChartOverrides(root)

	clearTenantThemeTokens(root)

	const tokens = buildTenantThemeTokens(tenant)
	Object.entries(tokens).forEach(([key, value]) => {
		root.style.setProperty(key, value)
	})

	if (tenant.themeName) {
		root.setAttribute('data-theme', tenant.themeName)
		root.setAttribute('data-tenant-theme', tenant.themeName)
	} else {
		root.removeAttribute('data-tenant-theme')
	}
}

export function clearTenantChartOverrides(root: HTMLElement) {
	for (let index = 1; index <= MAX_CHART_SERIES; index += 1) {
		root.style.removeProperty(`--chart-series-${index}`)
	}
	root.style.removeProperty('--chart-grid-opacity')
	root.style.removeProperty('--chart-axis-opacity')
}

function clearTenantThemeTokens(root: HTMLElement) {
	BASE_TOKENS.forEach((token) => {
		root.style.removeProperty(token)
	})
	LEGACY_TOKENS.forEach((token) => {
		root.style.removeProperty(token)
	})
}

function generateColorVariations(hexColor: string): { light: string; dark: string } {
	const r = parseInt(hexColor.slice(1, 3), 16)
	const g = parseInt(hexColor.slice(3, 5), 16)
	const b = parseInt(hexColor.slice(5, 7), 16)

	const max = Math.max(r, g, b) / 255
	const min = Math.min(r, g, b) / 255
	const l = (max + min) / 2

	let h = 0
	let s = 0

	if (max !== min) {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case r / 255:
				h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6
				break
			case g / 255:
				h = ((b / 255 - r / 255) / d + 2) / 6
				break
			case b / 255:
				h = ((r / 255 - g / 255) / d + 4) / 6
				break
		}
	}

	const light = hslToHex(h, s, Math.min(l + 0.2, 0.95))
	const dark = hslToHex(h, s, Math.max(l - 0.2, 0.05))

	return { light, dark }
}

function hslToHex(h: number, s: number, l: number): string {
	const hue2rgb = (p: number, q: number, t: number) => {
		let adjusted = t

		if (adjusted < 0) {
			adjusted += 1
		}
		if (adjusted > 1) {
			adjusted -= 1
		}
		if (adjusted < 1 / 6) {
			return p + (q - p) * 6 * adjusted
		}
		if (adjusted < 1 / 2) {
			return q
		}
		if (adjusted < 2 / 3) {
			return p + (q - p) * (2 / 3 - adjusted) * 6
		}
		return p
	}

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s
	const p = 2 * l - q

	const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255)
	const g = Math.round(hue2rgb(p, q, h) * 255)
	const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255)

	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
