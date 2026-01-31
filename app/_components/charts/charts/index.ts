/**
 * Chart Components (High-Level Layer)
 *
 * Production-ready chart components built on visx.
 *
 * @module charts/charts
 */

export { AreaChart } from './AreaChart'
export type { AreaChartProps, AreaChartDataPoint } from './AreaChart'

export { BarChart } from './BarChart'
export type { BarChartProps, BarChartDataPoint } from './BarChart'

export { LineChart } from './LineChart'
export type { LineChartProps, LineChartDataPoint, LineChartSeries } from './LineChart'

export { SparkLine, SparkLineWithChange } from './SparkLine'
export type { SparkLineProps, SparkLineDataPoint } from './SparkLine'

export { FunnelChart, FunnelChartHorizontal } from './FunnelChart'
export type { FunnelChartProps, FunnelStage } from './FunnelChart'

export { DonutChart } from './DonutChart'
export type { DonutChartProps, DonutSegment } from './DonutChart'

export { WaterfallChart } from './WaterfallChart'
export type { WaterfallChartProps, WaterfallStep } from './WaterfallChart'

export { ComboChart } from './ComboChart'
export type { ComboChartProps, ComboChartDataPoint } from './ComboChart'
