/**
 * useChartValueFormatter Hook
 *
 * Centralized value formatting for charts.
 * Keeps formatting logic DRY across chart components.
 *
 * @module charts/hooks/useChartValueFormatter
 */

import { useCallback } from 'react'

import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters'

export type ChartValueType = 'currency' | 'number' | 'percent'

/**
 * Returns a formatter for the selected value type.
 */
export function useChartValueFormatter(valueType: ChartValueType = 'number') {
	return useCallback(
		(value: number): string => {
			switch (valueType) {
				case 'currency':
					return formatCurrency(value)
				case 'percent':
					return formatPercent(value)
				default:
					return formatNumber(value)
			}
		},
		[valueType]
	)
}
