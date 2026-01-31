'use client'

import { useMemo, type ReactNode } from 'react'

import { useTenant } from '@_shared'

import { ChartProvider } from './ChartProvider'

interface TenantChartProviderProps {
	children: ReactNode
}

/**
 * Binds tenant theme settings to ChartProvider.
 * Merge order is preserved in ChartProvider (default -> tenant -> local).
 */
export default function TenantChartProvider({ children }: TenantChartProviderProps) {
	const { tenant } = useTenant()

	const paletteOverride = useMemo(() => {
		if (tenant?.chartPalette && tenant.chartPalette.length > 0) {
			return tenant.chartPalette
		}
		return undefined
	}, [tenant?.chartPalette])

	return <ChartProvider colorPalette={paletteOverride}>{children}</ChartProvider>
}
