/**
 * StepUpListener Component
 *
 * Global component that listens for step-up authentication events and
 * displays the StepUpModal when verification is required.
 *
 * MAANG-Level Pattern:
 * - Placed in root layout to catch all step-up events
 * - Manages modal state based on events
 * - Connects event system to modal UI
 * - Follows AccountStatusListener pattern exactly
 *
 * **Architecture:**
 * - httpService detects 403 + X-StepUp-Required → dispatches event
 * - StepUpListener subscribes to events → shows StepUpModal
 * - StepUpModal resolves/rejects promise → httpService retries or fails
 *
 * @module StepUpListener
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

import { subscribeToStepUpRequired, type StepUpRequiredEvent } from '@_shared'

import StepUpModal from './StepUpModal'

/**
 * StepUpListener Component
 *
 * Listens for step-up authentication events dispatched by HttpService
 * and displays the verification modal.
 *
 * Should be placed in the root layout to ensure it's always mounted.
 */
export default function StepUpListener(): React.ReactNode {
	const [isOpen, setIsOpen] = useState(false)
	const [event, setEvent] = useState<StepUpRequiredEvent | null>(null)

	/**
	 * Handles step-up required events.
	 * Opens the modal with the event details.
	 */
	const handleStepUpRequired = useCallback((stepUpEvent: StepUpRequiredEvent) => {
		setEvent(stepUpEvent)
		setIsOpen(true)
	}, [])

	/**
	 * Handles modal close.
	 * Clears state when modal is dismissed.
	 */
	const handleClose = useCallback(() => {
		setIsOpen(false)
		// Clear event after animation completes
		setTimeout(() => setEvent(null), 300)
	}, [])

	// Subscribe to step-up events
	useEffect(() => {
		const unsubscribe = subscribeToStepUpRequired(handleStepUpRequired)

		return () => {
			unsubscribe()
		}
	}, [handleStepUpRequired])

	return <StepUpModal isOpen={isOpen} onClose={handleClose} event={event} />
}
