/**
 * RichDataGrid Utilities Barrel Export
 *
 * @module Utils
 */

export {
	createRichColumnHelper,
	textColumn,
	numberColumn,
	dateColumn,
	selectColumn,
} from './columnHelper'

export type { RichColumnDefWithAccessor, RichColumnDefWithFn, RichColumnDefDisplay } from './columnHelper'

// ============================================================================
// EXPORT TYPES (Lightweight - Safe for Static Import)
// ============================================================================
// These are type-only exports with zero runtime cost.
// Safe to import statically without bundling heavy libraries.

export { ExportFormat, ExportScope } from './exportTypes'

export type {
	ExportConfig,
	ExportResult,
	ExportColumnConfig,
	ExportDataFn,
	QuickExportFn,
	FormatExportFn,
	ExportUtilsModule,
} from './exportTypes'

// ============================================================================
// EXPORT IMPLEMENTATIONS (Heavy - Use Dynamic Import)
// ============================================================================
// IMPORTANT: Do NOT statically import these functions!
// They pull in ~1.2MB of dependencies (ExcelJS, jsPDF, papaparse).
//
// Use dynamic import instead:
//   const { quickExport } = await import('@_components/tables/RichDataGrid/utils/exportUtils')
//
// The implementation functions are NOT re-exported from this barrel to
// prevent accidental static imports that would increase bundle size.
// Import directly from './exportUtils' only via dynamic import().

