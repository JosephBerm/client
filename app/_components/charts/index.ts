/**
 * Prometheus Chart System
 *
 * MAANG-grade data visualization built on visx (Airbnb's D3 + React library).
 *
 * Architecture:
 * - Layer 0: D3 utilities (math/calculations) - via visx
 * - Layer 1: visx primitives (React components)
 * - Layer 2: Composition layer (Tooltip, Legend, Axis wrappers)
 * - Layer 3: High-level Prometheus chart components
 *
 * @see Documents/Business/maang-level-charting-solution-prometheus.md
 * @module charts
 */

// Provider
export { ChartProvider, useChartTheme, chartColorPalette, defaultTheme } from './ChartProvider'
export type { ChartTheme } from './ChartProvider'

// Container
export { ChartContainer } from './ChartContainer'
export type { ChartContainerProps } from './ChartContainer'

// Utilities
export * from './utils'

// Hooks
export * from './hooks'

// Components (shared)
export * from './components'

// Charts
export * from './charts'
