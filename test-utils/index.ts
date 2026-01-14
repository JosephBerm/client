/**
 * Test Utilities Index
 *
 * Central export point for all test utilities.
 * Makes importing test utilities more convenient.
 */

export { renderWithProviders, userEvent } from './renderWithProviders'
export type { RenderOptions } from '@testing-library/react'
export {
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
	fireEvent,
	within,
	act,
	cleanup,
} from '@testing-library/react'

export { ProductBuilder, CartItemBuilder, QuoteFormDataBuilder, NameBuilder, AddressBuilder } from './testDataBuilders'

export {
	TEST_DATE_RANGES,
	TIME_RANGE_PRESETS,
	QuotePipelineBuilder,
	RevenueDataBuilder,
	RevenueSeriesBuilder,
	SalesRepPerformanceBuilder,
	TeamPerformanceBuilder,
	AnalyticsSummaryBuilder,
	createMockSummaryResponse,
	createMockErrorResponse,
	createMockTeamResponse,
	createMockRevenueResponse,
	calculateExpectedConversionRate,
	calculateExpectedGrowthPercent,
} from './analyticsTestBuilders'
export type {
	AnalyticsSummary,
	SalesRepPerformance,
	RevenueData,
	QuotePipelineData,
	DateRange,
	TimeRangePreset,
} from '@_types/analytics.types'
