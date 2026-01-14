/**
 * Step-Up Authentication Handler
 *
 * Handles step-up MFA verification scenarios when backend requires
 * re-verification for sensitive actions. This is triggered when:
 * - User attempts a sensitive action (password change, role modification, etc.)
 * - MFA verification has expired or never occurred
 * - Policy requires higher assurance level than current session
 *
 * MAANG-Level Pattern:
 * - Backend validates MFA freshness on protected endpoints via StepUpHandler
 * - Returns 403 with X-StepUp-Required headers
 * - Frontend detects this, shows MFA modal, and retries request with fresh token
 *
 * Architecture follows accountStatusHandler.ts pattern exactly:
 * - Event-driven (CustomEvent dispatch/subscribe)
 * - Promise-based for async flow control
 * - SSR-safe with typeof window checks
 *
 * @module stepUpHandler
 */

'use client'

import { logger } from '@_core'

import {
	STEP_UP_REQUIRED_HEADER,
	STEP_UP_ACTION_HEADER,
	STEP_UP_REASON_HEADER,
	STEP_UP_EVENT,
	getActionMessage,
	type SensitiveAction,
	type StepUpReason,
} from './stepUpHandler.constants'

// =========================================================================
// TYPES
// =========================================================================

/**
 * Step-up required event payload.
 * Contains all information needed to show the MFA modal and retry the request.
 */
export interface StepUpRequiredEvent {
	/** The sensitive action that triggered step-up (e.g., 'CHANGE_PASSWORD') */
	action: SensitiveAction | string
	/** Why step-up is required (e.g., 'mfa_stale', 'no_mfa') */
	reason: StepUpReason | string
	/** Human-readable message for the user */
	message: string
}

/**
 * Pending step-up state for promise-based flow control.
 */
interface PendingStepUp {
	resolve: (token: string) => void
	reject: (error: Error) => void
	event: StepUpRequiredEvent
}

// =========================================================================
// MODULE STATE
// =========================================================================

/** Current pending step-up verification (only one at a time) */
let pendingStepUp: PendingStepUp | null = null

// =========================================================================
// EVENT-BASED STEP-UP FLOW
// =========================================================================

/**
 * Dispatches a step-up required event.
 * This will be caught by StepUpListener and trigger the MFA modal.
 *
 * @param event - The step-up event details
 */
export function dispatchStepUpRequired(event: StepUpRequiredEvent): void {
	if (typeof window === 'undefined') return

	const customEvent = new CustomEvent(STEP_UP_EVENT, { detail: event })
	window.dispatchEvent(customEvent)

	logger.info('Step-up authentication required', {
		action: event.action,
		reason: event.reason,
		component: 'StepUpHandler',
	})
}

/**
 * Subscribes to step-up required events.
 *
 * @param handler - Function to call when step-up is required
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToStepUpRequired(handler: (event: StepUpRequiredEvent) => void): () => void {
	if (typeof window === 'undefined') return () => {}

	const listener = (event: Event) => {
		const customEvent = event as CustomEvent<StepUpRequiredEvent>
		handler(customEvent.detail)
	}

	window.addEventListener(STEP_UP_EVENT, listener)
	return () => window.removeEventListener(STEP_UP_EVENT, listener)
}

// =========================================================================
// PROMISE-BASED FLOW CONTROL
// =========================================================================

/**
 * Waits for step-up verification to complete.
 * Returns a Promise that resolves with the fresh access token or rejects on cancel.
 *
 * This is called by httpService after detecting a step-up required response.
 * The Promise is resolved/rejected by the StepUpModal when user completes/cancels.
 *
 * @returns Promise resolving to fresh access token, or rejecting on cancel
 */
export function waitForStepUpCompletion(): Promise<string> {
	return new Promise((resolve, reject) => {
		// If there's already a pending step-up, reject the new one
		if (pendingStepUp) {
			reject(new Error('Step-up verification already in progress'))
			return
		}

		// Store the promise callbacks for later resolution
		pendingStepUp = {
			resolve,
			reject,
			event: { action: '', reason: '', message: '' }, // Will be filled by dispatcher
		}
	})
}

/**
 * Resolves the pending step-up with a fresh access token.
 * Called by StepUpModal after successful MFA verification.
 *
 * @param token - The fresh access token from step-up verification
 */
export function resolveStepUp(token: string): void {
	if (pendingStepUp) {
		pendingStepUp.resolve(token)
		pendingStepUp = null

		logger.debug('Step-up verification completed successfully', {
			component: 'StepUpHandler',
		})
	}
}

/**
 * Rejects the pending step-up (user cancelled or error).
 * Called by StepUpModal when user cancels or verification fails.
 *
 * @param error - Optional error message
 */
export function rejectStepUp(error?: string): void {
	if (pendingStepUp) {
		pendingStepUp.reject(new Error(error ?? 'Step-up verification cancelled'))
		pendingStepUp = null

		logger.debug('Step-up verification cancelled or failed', {
			error,
			component: 'StepUpHandler',
		})
	}
}

/**
 * Checks if there's a pending step-up verification.
 */
export function hasPendingStepUp(): boolean {
	return pendingStepUp !== null
}

// =========================================================================
// RESPONSE CHECKING
// =========================================================================

/**
 * Checks if a fetch response indicates step-up authentication is required.
 * Call this after receiving a 403 response.
 *
 * @param response - The fetch Response object
 * @returns True if this is a step-up required response (and event was dispatched)
 */
export function checkAndHandleStepUpRequired(response: Response): boolean {
	// Only check 403 responses
	if (response.status !== 403) return false

	const stepUpRequired = response.headers.get(STEP_UP_REQUIRED_HEADER)

	if (stepUpRequired !== 'true') return false

	// Extract step-up details from headers
	const action = response.headers.get(STEP_UP_ACTION_HEADER) ?? 'UNKNOWN'
	const reason = response.headers.get(STEP_UP_REASON_HEADER) ?? 'unknown'

	// Create event with user-friendly message
	const event: StepUpRequiredEvent = {
		action,
		reason,
		message: getActionMessage(action),
	}

	// Update pending step-up with event details (if waiting)
	if (pendingStepUp) {
		pendingStepUp.event = event
	}

	// Dispatch event for UI to show modal
	dispatchStepUpRequired(event)

	return true
}

/**
 * Initiates step-up verification flow.
 * This combines checking the response and waiting for completion.
 *
 * @param response - The 403 response from the server
 * @returns Promise resolving to fresh token, or null if not a step-up response
 */
export async function initiateStepUp(response: Response): Promise<string | null> {
	if (!checkAndHandleStepUpRequired(response)) {
		return null
	}

	try {
		const token = await waitForStepUpCompletion()
		return token
	} catch {
		// User cancelled or verification failed
		return null
	}
}
