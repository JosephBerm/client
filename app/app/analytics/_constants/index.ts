/**
 * Analytics Constants Barrel Export
 *
 * Configuration constants for the analytics dashboard.
 * This barrel file is for EXTERNAL CONSUMERS ONLY.
 *
 * **IMPORTANT - Circular Dependency Prevention:**
 * Code WITHIN this folder should NOT import from this index.
 * Instead, use direct imports to the specific module files.
 *
 * **Architecture:**
 * - Constants defined outside components (per React docs best practices)
 * - Readonly types to prevent accidental mutation
 * - Extends core @_lib/dates presets with analytics-specific options
 *
 * @see @_lib/dates for core date constants
 * @module analytics/constants
 */

export {
	TIME_RANGE_PRESETS,
	TIME_RANGE_LABELS,
	DEFAULT_TIME_RANGE,
	type TimeRangeOption,
} from './timeRangePresets'
