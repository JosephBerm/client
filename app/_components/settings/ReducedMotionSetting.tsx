/**
 * Reduced Motion Setting Component
 * 
 * Provides reduced motion preference toggle functionality for the Settings Modal.
 * Displays a toggle switch for enabling/disabling reduced motion.
 * 
 * **Architecture:**
 * - Integrates with useUserSettingsStore (Church of God pattern)
 * - Reduced motion changes automatically persist via ReducedMotionService
 * - Updates DOM via ReducedMotionService.applyPreference
 * 
 * **Features:**
 * - Toggle switch for reduced motion preference
 * - Type-safe boolean values
 * - Automatic persistence to localStorage
 * - Immediate DOM application
 * - Responsive layout with proper spacing
 * - Respects system preference by default
 * 
 * **Accessibility:**
 * - Proper ARIA labels
 * - Keyboard accessible toggle
 * - Screen reader support
 * 
 * @module ReducedMotionSetting
 */

'use client'

import { useUserSettingsStore } from '@_features/settings'

/**
 * Reduced Motion Setting Component
 * 
 * Provides reduced motion preference toggle within the Settings Modal.
 * 
 * **Usage:**
 * This component is rendered within the Settings Modal's "General" section.
 * It provides a toggle for reduced motion that immediately applies changes.
 * 
 * **Implementation:**
 * - Reads `prefersReducedMotion` from useUserSettingsStore
 * - Calls `setPrefersReducedMotion()` on toggle change
 * - ReducedMotionService handles DOM application and persistence
 * 
 * @returns Reduced motion setting with toggle switch
 */
export default function ReducedMotionSetting() {
	const prefersReducedMotion = useUserSettingsStore((state) => state.prefersReducedMotion)
	const setPrefersReducedMotion = useUserSettingsStore((state) => state.setPrefersReducedMotion)

	const handleToggleChange = (checked: boolean) => {
		setPrefersReducedMotion(checked)
	}

	return (
		<div className="flex items-center justify-between gap-4 py-4 px-4 sm:px-6">
			<div className="flex-1 min-w-0">
				<label className="block text-sm md:text-base font-semibold text-base-content mb-1 md:mb-1.5">
					Reduce Motion
				</label>
				<p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
					Reduce animations and transitions for a simpler experience. Respects your system preference by default.
				</p>
			</div>
			<div className="shrink-0">
				<input
					type="checkbox"
					className="toggle toggle-primary toggle-sm sm:toggle-md"
					checked={prefersReducedMotion}
					onChange={(e) => handleToggleChange(e.target.checked)}
					aria-label="Enable reduced motion"
				/>
			</div>
		</div>
	)
}

