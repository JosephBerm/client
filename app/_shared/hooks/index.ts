/**
 * Shared Hooks - Barrel Export
 * 
 * Reusable React hooks used across multiple features.
 * 
 * @module shared/hooks
 */

export { useDebounce } from './useDebounce'
export { useMediaQuery } from './useMediaQuery'
export { useModal } from './useModal'
export { useFocusTrap } from './useFocusTrap'
export { useAccordion } from './useAccordion'
export { useScrollSpy } from './useScrollSpy'
export type { UseScrollSpyOptions, UseScrollSpyReturn } from './useScrollSpy'
export { useKeyboardNavigation } from './useKeyboardNavigation'
export type { UseKeyboardNavigationOptions, UseKeyboardNavigationReturn } from './useKeyboardNavigation'
export { useElementRefs } from './useElementRefs'
export { useZodForm } from './useZodForm'
export { useFormSubmit } from './useFormSubmit'
export { useServerTable } from './useServerTable'
export * from './useAdvancedLazyLoad'
export { useSectionMetrics } from './useSectionMetrics'
export type { UseSectionMetricsOptions, UseSectionMetricsReturn, SectionMetric } from './useSectionMetrics'
export { useScrollProgress } from './useScrollProgress'
export type { UseScrollProgressOptions, UseScrollProgressReturn } from './useScrollProgress'

